-- Add discharge-specific enhancements
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS discharge_readiness BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS expected_discharge_date DATE,
  ADD COLUMN IF NOT EXISTS discharge_planning_notes TEXT;

-- Add discharge checklist table
CREATE TABLE IF NOT EXISTS discharge_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  medication_reconciliation BOOLEAN DEFAULT false,
  followup_appointments BOOLEAN DEFAULT false,
  patient_education BOOLEAN DEFAULT false,
  equipment_needs BOOLEAN DEFAULT false,
  transportation_arranged BOOLEAN DEFAULT false,
  family_notified BOOLEAN DEFAULT false,
  documents_prepared BOOLEAN DEFAULT false,
  insurance_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add discharge medications tracking
CREATE TABLE IF NOT EXISTS discharge_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discharge_id UUID REFERENCES discharges(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100),
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add discharge follow-up appointments
CREATE TABLE IF NOT EXISTS discharge_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discharge_id UUID REFERENCES discharges(id) ON DELETE CASCADE,
  appointment_type VARCHAR(100) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  scheduled_date DATE,
  contact_info TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance discharges table
ALTER TABLE discharges
  ADD COLUMN IF NOT EXISTS readmission_risk VARCHAR(20) CHECK (readmission_risk IN ('Low', 'Medium', 'High')),
  ADD COLUMN IF NOT EXISTS discharge_type VARCHAR(50) CHECK (discharge_type IN ('Routine', 'Against Medical Advice', 'Transfer', 'Deceased')),
  ADD COLUMN IF NOT EXISTS social_worker_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pharmacy_review BOOLEAN DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discharge_checklists_patient_id ON discharge_checklists(patient_id);
CREATE INDEX IF NOT EXISTS idx_discharge_medications_discharge_id ON discharge_medications(discharge_id);
CREATE INDEX IF NOT EXISTS idx_discharge_followups_discharge_id ON discharge_followups(discharge_id);
CREATE INDEX IF NOT EXISTS idx_patients_expected_discharge_date ON patients(expected_discharge_date) WHERE discharge_readiness = true;

-- Add trigger for discharge checklist updates
CREATE OR REPLACE FUNCTION update_discharge_readiness()
RETURNS TRIGGER AS $$
BEGIN
  -- Update patient's discharge readiness if all checklist items are complete
  IF NEW.medication_reconciliation AND 
     NEW.followup_appointments AND 
     NEW.patient_education AND 
     NEW.equipment_needs AND 
     NEW.transportation_arranged AND 
     NEW.family_notified AND 
     NEW.documents_prepared AND 
     NEW.insurance_verified THEN
    
    UPDATE patients 
    SET discharge_readiness = true 
    WHERE id = NEW.patient_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_discharge_readiness
  AFTER UPDATE ON discharge_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_discharge_readiness();

-- Add function to handle discharge status updates
CREATE OR REPLACE FUNCTION handle_discharge_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When a discharge record is created, update patient status
  UPDATE patients 
  SET 
    status = 'Discharged',
    updated_at = NOW()
  WHERE id = NEW.patient_id;
  
  -- Update any active medications to completed
  UPDATE medications 
  SET 
    status = 'Completed',
    end_date = NEW.discharge_date,
    updated_at = NOW()
  WHERE 
    patient_id = NEW.patient_id 
    AND status = 'Active';
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_discharge_status
  AFTER INSERT ON discharges
  FOR EACH ROW
  EXECUTE FUNCTION handle_discharge_status();

-- Add RLS policies
ALTER TABLE discharge_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE discharge_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE discharge_followups ENABLE ROW LEVEL SECURITY;

-- Policies for discharge checklists
CREATE POLICY "Users can view discharge checklists"
  ON discharge_checklists FOR SELECT
  USING (true);

CREATE POLICY "Users can create discharge checklists"
  ON discharge_checklists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update discharge checklists"
  ON discharge_checklists FOR UPDATE
  USING (true);

-- Policies for discharge medications
CREATE POLICY "Users can view discharge medications"
  ON discharge_medications FOR SELECT
  USING (true);

CREATE POLICY "Users can create discharge medications"
  ON discharge_medications FOR INSERT
  WITH CHECK (true);

-- Policies for discharge followups
CREATE POLICY "Users can view discharge followups"
  ON discharge_followups FOR SELECT
  USING (true);

CREATE POLICY "Users can create discharge followups"
  ON discharge_followups FOR INSERT
  WITH CHECK (true);

-- Add function to create discharge notification
CREATE OR REPLACE FUNCTION create_discharge_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    type,
    message,
    severity,
    user_id,
    patient_id,
    created_at
  )
  SELECT
    'discharge',
    CASE 
      WHEN NEW.discharge_type = 'Against Medical Advice' 
        THEN 'Patient ' || p.name || ' discharged against medical advice'
      WHEN NEW.discharge_type = 'Deceased'
        THEN 'Patient ' || p.name || ' deceased'
      ELSE 'Patient ' || p.name || ' discharged'
    END,
    CASE 
      WHEN NEW.discharge_type IN ('Against Medical Advice', 'Deceased') THEN 'warning'
      ELSE 'info'
    END,
    p.attending_physician_id,
    NEW.patient_id,
    NOW()
  FROM patients p
  WHERE p.id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_discharge_notification
  AFTER INSERT ON discharges
  FOR EACH ROW
  EXECUTE FUNCTION create_discharge_notification();

-- Add function to track readmissions
CREATE OR REPLACE FUNCTION track_readmission()
RETURNS TRIGGER AS $$
DECLARE
  last_discharge_date TIMESTAMPTZ;
BEGIN
  -- Check if patient was discharged within last 30 days
  SELECT discharge_date 
  INTO last_discharge_date
  FROM discharges
  WHERE patient_id = NEW.id
  ORDER BY discharge_date DESC
  LIMIT 1;
  
  IF last_discharge_date IS NOT NULL AND 
     last_discharge_date > NOW() - INTERVAL '30 days' THEN
    -- Create readmission notification
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
      'Patient readmitted within 30 days of last discharge',
      'warning',
      NEW.attending_physician_id,
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_readmission
  AFTER INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION track_readmission();