export interface Patient {
  id: string;
  name: string;
  personal_code: string;
  status: string;
  attending_physician_id: string;
  admission_date: string;
}

export interface Statistics {
  totalPatients: number;
  criticalPatients: number;
  stablePatients: number;
  newAdmissions: number;
}

export interface Notification {
  id: string;
  type: 'status' | 'lab' | 'medication';
  message: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
}