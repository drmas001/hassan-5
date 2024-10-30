export interface ReportMetrics {
  totalPatients: number;
  criticalCases: number;
  medicationsGiven: number;
  labTests: number;
  averageStayDuration: number;
  bedOccupancyRate: number;
  readmissionRate: number;
  mortalityRate: number;
}

export interface ReportActivities {
  patientStatusDistribution: Array<{ name: string; value: number }>;
  dailyActivities: Array<{ name: string; value: number }>;
  topProcedures: Array<{ name: string; count: number }>;
  commonDiagnoses: Array<{ name: string; count: number }>;
}

export interface ComparisonData {
  previousPeriod: ReportMetrics;
  changes: {
    totalPatients: number;
    criticalCases: number;
    averageStayDuration: number;
    bedOccupancyRate: number;
    readmissionRate: number;
    mortalityRate: number;
  };
}

export interface ReportData {
  metrics: ReportMetrics;
  activities: ReportActivities;
  comparison?: ComparisonData;
}