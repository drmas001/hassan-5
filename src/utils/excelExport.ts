import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { ReportData } from '../types/reports';

export function generateExcel(data: ReportData, dateRange: { startDate: Date; endDate: Date }) {
  const workbook = XLSX.utils.book_new();
  const dateFormat = 'MMM dd, yyyy';

  // Summary Sheet
  const summaryData = [
    ['ICU Performance Report'],
    [`Period: ${format(dateRange.startDate, dateFormat)} - ${format(dateRange.endDate, dateFormat)}`],
    [],
    ['Key Metrics'],
    ['Metric', 'Value'],
    ['Total Patients', data.metrics.totalPatients],
    ['Critical Cases', data.metrics.criticalCases],
    ['Average Stay Duration', `${data.metrics.averageStayDuration.toFixed(1)} days`],
    ['Bed Occupancy Rate', `${(data.metrics.bedOccupancyRate * 100).toFixed(1)}%`],
    ['Readmission Rate', `${(data.metrics.readmissionRate * 100).toFixed(1)}%`],
    ['Mortality Rate', `${(data.metrics.mortalityRate * 100).toFixed(1)}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Procedures Sheet
  const proceduresData = [
    ['Top Procedures'],
    ['Procedure', 'Count'],
    ...data.activities.topProcedures.map((proc) => [proc.name, proc.count]),
  ];

  const proceduresSheet = XLSX.utils.aoa_to_sheet(proceduresData);
  XLSX.utils.book_append_sheet(workbook, proceduresSheet, 'Procedures');

  // Diagnoses Sheet
  const diagnosesData = [
    ['Common Diagnoses'],
    ['Diagnosis', 'Count'],
    ...data.activities.commonDiagnoses.map((diag) => [diag.name, diag.count]),
  ];

  const diagnosesSheet = XLSX.utils.aoa_to_sheet(diagnosesData);
  XLSX.utils.book_append_sheet(workbook, diagnosesSheet, 'Diagnoses');

  // Daily Activities Sheet
  const activitiesData = [
    ['Daily Activities'],
    ['Activity', 'Count'],
    ...data.activities.dailyActivities.map((activity) => [activity.name, activity.value]),
  ];

  const activitiesSheet = XLSX.utils.aoa_to_sheet(activitiesData);
  XLSX.utils.book_append_sheet(workbook, activitiesSheet, 'Activities');

  // Comparative Analysis Sheet
  if (data.comparison) {
    const comparisonData = [
      ['Comparative Analysis'],
      ['Metric', 'Current Period', 'Previous Period', 'Change (%)'],
      [
        'Total Patients',
        data.metrics.totalPatients,
        data.comparison.previousPeriod.totalPatients,
        data.comparison.changes.totalPatients,
      ],
      [
        'Critical Cases',
        data.metrics.criticalCases,
        data.comparison.previousPeriod.criticalCases,
        data.comparison.changes.criticalCases,
      ],
      [
        'Average Stay Duration',
        data.metrics.averageStayDuration,
        data.comparison.previousPeriod.averageStayDuration,
        data.comparison.changes.averageStayDuration,
      ],
    ];

    const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData);
    XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Comparison');
  }

  // Save the Excel file
  XLSX.writeFile(workbook, `ICU-Report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}