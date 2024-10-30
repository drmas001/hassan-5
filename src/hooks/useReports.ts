import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ReportMetrics {
  totalPatients: number;
  criticalCases: number;
  medicationsGiven: number;
  labTests: number;
  averageStayDuration: number;
  bedOccupancyRate: number;
  readmissionRate: number;
  mortalityRate: number;
}

interface ReportActivities {
  patientStatusDistribution: Array<{ name: string; value: number }>;
  dailyActivities: Array<{ name: string; value: number }>;
  topProcedures: Array<{ name: string; count: number }>;
  commonDiagnoses: Array<{ name: string; count: number }>;
}

export function useReports(dateRange: DateRange) {
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalPatients: 0,
    criticalCases: 0,
    medicationsGiven: 0,
    labTests: 0,
    averageStayDuration: 0,
    bedOccupancyRate: 0,
    readmissionRate: 0,
    mortalityRate: 0,
  });

  const [activities, setActivities] = useState<ReportActivities>({
    patientStatusDistribution: [],
    dailyActivities: [],
    topProcedures: [],
    commonDiagnoses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [
          patientsResponse,
          medicationsResponse,
          labResultsResponse,
          dischargesResponse,
          vitalsResponse
        ] = await Promise.all([
          // Patients data
          supabase
            .from('patients')
            .select('*')
            .gte('admission_date', dateRange.startDate.toISOString())
            .lte('admission_date', dateRange.endDate.toISOString()),

          // Medications data
          supabase
            .from('medications')
            .select('*')
            .gte('created_at', dateRange.startDate.toISOString())
            .lte('created_at', dateRange.endDate.toISOString()),

          // Lab results data
          supabase
            .from('lab_results')
            .select('*')
            .gte('created_at', dateRange.startDate.toISOString())
            .lte('created_at', dateRange.endDate.toISOString()),

          // Discharges data
          supabase
            .from('discharges')
            .select('*')
            .gte('discharge_date', dateRange.startDate.toISOString())
            .lte('discharge_date', dateRange.endDate.toISOString()),

          // Vitals data for procedures
          supabase
            .from('vitals')
            .select('*')
            .gte('created_at', dateRange.startDate.toISOString())
            .lte('created_at', dateRange.endDate.toISOString())
        ]);

        if (patientsResponse.error) throw patientsResponse.error;
        if (medicationsResponse.error) throw medicationsResponse.error;
        if (labResultsResponse.error) throw labResultsResponse.error;
        if (dischargesResponse.error) throw dischargesResponse.error;
        if (vitalsResponse.error) throw vitalsResponse.error;

        const patients = patientsResponse.data || [];
        const medications = medicationsResponse.data || [];
        const labResults = labResultsResponse.data || [];
        const discharges = dischargesResponse.data || [];
        const vitals = vitalsResponse.data || [];

        // Calculate patient status distribution
        const statusDistribution = patients.reduce((acc, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Calculate daily activities
        const today = new Date();
        const admissionsToday = patients.filter(p => 
          format(new Date(p.admission_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        ).length;

        const dischargesToday = discharges.filter(d =>
          format(new Date(d.discharge_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        ).length;

        const labTestsToday = labResults.filter(l =>
          format(new Date(l.created_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        ).length;

        const medicationsToday = medications.filter(m =>
          format(new Date(m.created_at), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        ).length;

        // Calculate common diagnoses
        const diagnosesCount = patients.reduce((acc, curr) => {
          acc[curr.diagnosis] = (acc[curr.diagnosis] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedDiagnoses = Object.entries(diagnosesCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        // Calculate bed occupancy rate
        const totalBeds = 50; // Assuming 50 beds in the ICU
        const occupiedBeds = patients.filter(p => p.status !== 'Discharged').length;
        const bedOccupancyRate = occupiedBeds / totalBeds;

        // Calculate mortality rate
        const deceasedDischarges = discharges.filter(d => d.discharge_condition === 'Deceased').length;
        const mortalityRate = deceasedDischarges / (discharges.length || 1);

        // Calculate readmission rate (patients admitted more than once in the period)
        const patientAdmissions = patients.reduce((acc, curr) => {
          acc[curr.mrn] = (acc[curr.mrn] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const readmissions = Object.values(patientAdmissions).filter(count => count > 1).length;
        const readmissionRate = readmissions / (patients.length || 1);

        // Calculate average stay duration
        const stayDurations = discharges.map(d => {
          const patient = patients.find(p => p.id === d.patient_id);
          if (!patient) return 0;
          return (new Date(d.discharge_date).getTime() - new Date(patient.admission_date).getTime()) / (1000 * 60 * 60 * 24);
        });

        const averageStayDuration = stayDurations.length
          ? stayDurations.reduce((a, b) => a + b, 0) / stayDurations.length
          : 0;

        // Update metrics
        setMetrics({
          totalPatients: patients.length,
          criticalCases: statusDistribution['Critical'] || 0,
          medicationsGiven: medications.length,
          labTests: labResults.length,
          averageStayDuration,
          bedOccupancyRate,
          readmissionRate,
          mortalityRate,
        });

        // Update activities
        setActivities({
          patientStatusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({
            name,
            value,
          })),
          dailyActivities: [
            { name: 'Admissions', value: admissionsToday },
            { name: 'Discharges', value: dischargesToday },
            { name: 'Lab Tests', value: labTestsToday },
            { name: 'Medications', value: medicationsToday },
          ],
          topProcedures: [
            { name: 'Vital Signs', count: vitals.length },
            { name: 'Lab Tests', count: labResults.length },
            { name: 'Medication Administration', count: medications.length },
            { name: 'Patient Assessment', count: patients.length },
            { name: 'Discharge Planning', count: discharges.length },
          ],
          commonDiagnoses: sortedDiagnoses,
        });
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch report data'));
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, [dateRange]);

  return { metrics, activities, loading, error };
}