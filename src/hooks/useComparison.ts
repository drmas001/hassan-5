import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { ReportMetrics, ComparisonData } from '../types/reports';
import toast from 'react-hot-toast';

export function useComparison(
  currentMetrics: ReportMetrics,
  dateRange: { startDate: Date; endDate: Date }
) {
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparisonData() {
      try {
        setLoading(true);

        // Calculate previous period date range (same duration as current period)
        const duration = dateRange.endDate.getTime() - dateRange.startDate.getTime();
        const previousStart = new Date(dateRange.startDate.getTime() - duration);
        const previousEnd = new Date(dateRange.endDate.getTime() - duration);

        // Fetch previous period data
        const { data: previousPatients, error: patientsError } = await supabase
          .from('patients')
          .select('status, admission_date')
          .gte('admission_date', previousStart.toISOString())
          .lte('admission_date', previousEnd.toISOString());

        if (patientsError) throw patientsError;

        // Calculate previous period metrics
        const previousMetrics: ReportMetrics = {
          totalPatients: previousPatients?.length || 0,
          criticalCases: previousPatients?.filter((p) => p.status === 'Critical').length || 0,
          medicationsGiven: 0, // Fetch from medications table
          labTests: 0, // Fetch from lab_results table
          averageStayDuration: 4.8, // Mock data - implement actual calculation
          bedOccupancyRate: 0.82,
          readmissionRate: 0.11,
          mortalityRate: 0.045,
        };

        // Calculate percentage changes
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return 0;
          return Number(((current - previous) / previous * 100).toFixed(1));
        };

        const changes = {
          totalPatients: calculateChange(currentMetrics.totalPatients, previousMetrics.totalPatients),
          criticalCases: calculateChange(currentMetrics.criticalCases, previousMetrics.criticalCases),
          averageStayDuration: calculateChange(
            currentMetrics.averageStayDuration,
            previousMetrics.averageStayDuration
          ),
          bedOccupancyRate: calculateChange(
            currentMetrics.bedOccupancyRate,
            previousMetrics.bedOccupancyRate
          ),
          readmissionRate: calculateChange(
            currentMetrics.readmissionRate,
            previousMetrics.readmissionRate
          ),
          mortalityRate: calculateChange(
            currentMetrics.mortalityRate,
            previousMetrics.mortalityRate
          ),
        };

        setComparison({
          previousPeriod: previousMetrics,
          changes,
        });
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        toast.error('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    }

    if (currentMetrics.totalPatients > 0) {
      fetchComparisonData();
    }
  }, [currentMetrics, dateRange]);

  return { comparison, loading };
}