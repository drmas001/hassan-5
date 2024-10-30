-- Add session tracking
ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN last_activity TIMESTAMPTZ;

-- Add notification preferences
ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true, "critical_only": false}'::jsonb;

-- Add read/unread status to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_patients_status_updated_at ON patients(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_attending_physician ON patients(attending_physician_id);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Add function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Add function to automatically hide discharged patients after 48 hours
CREATE OR REPLACE FUNCTION update_discharged_patients_visibility()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE patients
  SET visible = false
  WHERE status = 'Discharged'
    AND updated_at < NOW() - INTERVAL '48 hours'
    AND visible = true;
END;
$$;

-- Add visible column to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- Add function to create status change notification
CREATE OR REPLACE FUNCTION create_status_change_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (
      type,
      message,
      severity,
      user_id,
      patient_id,
      created_at
    )
    VALUES (
      'status',
      CONCAT('Patient ', NEW.name, ' status changed to ', NEW.status),
      CASE 
        WHEN NEW.status = 'Critical' THEN 'critical'
        WHEN NEW.status = 'Discharged' THEN 'info'
        ELSE 'info'
      END,
      NEW.attending_physician_id,
      NEW.id,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS on_patient_status_change ON patients;
CREATE TRIGGER on_patient_status_change
  AFTER UPDATE OF status ON patients
  FOR EACH ROW
  EXECUTE FUNCTION create_status_change_notification();

-- Add function to create critical vitals notification
CREATE OR REPLACE FUNCTION create_critical_vitals_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    NEW.heart_rate > 120 OR 
    NEW.heart_rate < 60 OR 
    NEW.oxygen_saturation < 90 OR 
    NEW.temperature > 38.5
  ) THEN
    INSERT INTO notifications (
      type,
      message,
      severity,
      user_id,
      patient_id,
      created_at
    )
    SELECT
      'status',
      CONCAT('Critical vitals detected for patient ', p.name),
      'critical',
      p.attending_physician_id,
      NEW.patient_id,
      NOW()
    FROM patients p
    WHERE p.id = NEW.patient_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for critical vitals
DROP TRIGGER IF EXISTS on_critical_vitals ON vitals;
CREATE TRIGGER on_critical_vitals
  AFTER INSERT ON vitals
  FOR EACH ROW
  EXECUTE FUNCTION create_critical_vitals_notification();

-- Add scheduled task to run cleanup functions (requires pg_cron extension)
-- Note: This needs to be run by a superuser
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('0 0 * * *', $$
--   SELECT cleanup_old_notifications();
--   SELECT update_discharged_patients_visibility();
-- $$);

-- Update existing tables with new columns for tracking
ALTER TABLE medications ADD COLUMN IF NOT EXISTS last_administered TIMESTAMPTZ;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS next_due TIMESTAMPTZ;

-- Add function to create medication due notification
CREATE OR REPLACE FUNCTION create_medication_due_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.next_due IS NOT NULL AND NEW.status = 'Active' THEN
    INSERT INTO notifications (
      type,
      message,
      severity,
      user_id,
      patient_id,
      created_at
    )
    SELECT
      'medication',
      CONCAT('Medication ', NEW.name, ' due for patient ', p.name),
      'warning',
      p.attending_physician_id,
      NEW.patient_id,
      NOW()
    FROM patients p
    WHERE p.id = NEW.patient_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for medication due notifications
DROP TRIGGER IF EXISTS on_medication_due ON medications;
CREATE TRIGGER on_medication_due
  AFTER INSERT OR UPDATE OF next_due ON medications
  FOR EACH ROW
  EXECUTE FUNCTION create_medication_due_notification();

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_medications_next_due ON medications(next_due)
  WHERE status = 'Active';
CREATE INDEX IF NOT EXISTS idx_patients_visible ON patients(visible);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);

-- Update RLS policies for better security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Add policies for patients
CREATE POLICY "Users can view all patients"
  ON patients FOR SELECT
  USING (visible = true);

CREATE POLICY "Users can update their assigned patients"
  ON patients FOR UPDATE
  USING (attending_physician_id = auth.uid());

-- Add policies for medications
CREATE POLICY "Users can view all medications"
  ON medications FOR SELECT
  USING (true);

CREATE POLICY "Users can update active medications"
  ON medications FOR UPDATE
  USING (status = 'Active');

-- Add policies for vitals
CREATE POLICY "Users can view all vitals"
  ON vitals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert vitals"
  ON vitals FOR INSERT
  WITH CHECK (true);

-- Add policies for lab results
CREATE POLICY "Users can view all lab results"
  ON lab_results FOR SELECT
  USING (true);

CREATE POLICY "Users can insert lab results"
  ON lab_results FOR INSERT
  WITH CHECK (true);