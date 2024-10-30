import React, { useState } from 'react';
import { FileText, Calendar, Users, Activity, Pill, TestTube, Download } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { ReportMetrics } from './ReportMetrics';
import { ReportChart } from './ReportChart';
import { useReports } from '../hooks/useReports';
import { LoadingSpinner } from './LoadingSpinner';
import { generatePDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';

type DateRange = {
  startDate: Date;
  endDate: Date;
};

export function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  const { metrics, activities, loading, error } = useReports(dateRange);

  const handleExportPDF = () => {
    try {
      generatePDF({
        metrics,
        activities,
        dateRange,
      });
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Failed to load reports</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-500" />
          <h2 className="ml-2 text-xl font-semibold text-gray-900">Reports</h2>
        </div>
        <div className="flex items-center space-x-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalPatients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Cases</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.criticalCases}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Pill className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Medications Given</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.medicationsGiven}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TestTube className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lab Tests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.labTests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Status Distribution</h3>
          <ReportChart
            data={activities.patientStatusDistribution}
            type="pie"
            colors={['#22c55e', '#ef4444', '#3b82f6']}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activities</h3>
          <ReportChart
            data={activities.dailyActivities}
            type="bar"
            colors={['#3b82f6']}
          />
        </div>
      </div>

      {/* Detailed Metrics */}
      <ReportMetrics metrics={metrics} activities={activities} />
    </div>
  );
}