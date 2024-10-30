-- Create stored procedures for table creation
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Doctor', 'Nurse', 'Admin')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_patients_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    diagnosis TEXT NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    admission_date TIMESTAMPTZ DEFAULT NOW(),
    history TEXT NOT NULL,
    examination TEXT NOT NULL,
    notes TEXT,
    attending_physician_id UUID REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('Stable', 'Critical', 'Discharged')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_vitals_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    heart_rate INTEGER CHECK (heart_rate >= 0 AND heart_rate <= 300),
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,1) CHECK (temperature >= 30 AND temperature <= 45),
    oxygen_saturation INTEGER CHECK (oxygen_saturation >= 0 AND oxygen_saturation <= 100),
    respiratory_rate INTEGER CHECK (respiratory_rate >= 0 AND respiratory_rate <= 100),
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_medications_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    route VARCHAR(50) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    status VARCHAR(20) CHECK (status IN ('Active', 'Discontinued', 'Completed')) NOT NULL,
    prescribed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_lab_results_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    result TEXT NOT NULL,
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('Normal', 'Abnormal', 'Critical')) NOT NULL,
    ordered_by UUID REFERENCES users(id),
    resulted_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_discharges_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS discharges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    discharge_date TIMESTAMPTZ NOT NULL,
    discharge_diagnosis TEXT NOT NULL,
    discharge_summary TEXT NOT NULL,
    discharge_medications TEXT,
    follow_up_instructions TEXT,
    discharge_condition VARCHAR(20) CHECK (discharge_condition IN ('Improved', 'Stable', 'Deteriorated', 'Deceased')) NOT NULL,
    discharged_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_notifications_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) CHECK (type IN ('status', 'lab', 'medication', 'discharge')) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'critical')) NOT NULL,
    user_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES patients(id),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;