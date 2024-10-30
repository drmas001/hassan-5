-- Drop existing procedures table if it exists
DROP TABLE IF EXISTS procedures CASCADE;

-- Create procedures table with correct foreign key relationships
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  performer_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  complications TEXT,
  outcome VARCHAR(50) CHECK (outcome IN ('Successful', 'Partially Successful', 'Unsuccessful', 'Abandoned')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_procedures_patient_id ON procedures(patient_id);
CREATE INDEX idx_procedures_performer_id ON procedures(performer_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_procedures_updated_at
    BEFORE UPDATE ON procedures
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();