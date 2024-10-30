import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ReportData {
  metrics: {
    totalPatients: number;
    criticalCases: number;
    medicationsGiven: number;
    labTests: number;
    averageStayDuration: number;
    bedOccupancyRate: number;
    readmissionRate: number;
    mortalityRate: number;
  };
  activities: {
    patientStatusDistribution: Array<{ name: string; value: number }>;
    dailyActivities: Array<{ name: string; value: number }>;
    topProcedures: Array<{ name: string; count: number }>;
    commonDiagnoses: Array<{ name: string; count: number }>;
  };
  dateRange: DateRange;
}

export function generatePDF(data: ReportData) {
  const doc = new jsPDF();
  const dateFormat = 'MMM dd, yyyy';

  // Title
  doc.setFontSize(20);
  doc.text('ICU Performance Report', 20, 20);

  // Date Range
  doc.setFontSize(12);
  doc.text(
    `Period: ${format(data.dateRange.startDate, dateFormat)} - ${format(
      data.dateRange.endDate,
      dateFormat
    )}`,
    20,
    30
  );

  // Key Metrics
  doc.setFontSize(16);
  doc.text('Key Metrics', 20, 45);

  const metricsData = [
    ['Total Patients', data.metrics.totalPatients.toString()],
    ['Critical Cases', data.metrics.criticalCases.toString()],
    ['Medications Given', data.metrics.medicationsGiven.toString()],
    ['Lab Tests', data.metrics.labTests.toString()],
    ['Average Stay Duration', `${data.metrics.averageStayDuration.toFixed(1)} days`],
    ['Bed Occupancy Rate', `${(data.metrics.bedOccupancyRate * 100).toFixed(1)}%`],
    ['Readmission Rate', `${(data.metrics.readmissionRate * 100).toFixed(1)}%`],
    ['Mortality Rate', `${(data.metrics.mortalityRate * 100).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'striped',
  });

  // Patient Status Distribution
  doc.setFontSize(16);
  doc.text('Patient Status Distribution', 20, doc.lastAutoTable.finalY + 20);

  const statusData = data.activities.patientStatusDistribution.map((status) => [
    status.name,
    status.value.toString(),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Status', 'Count']],
    body: statusData,
    theme: 'striped',
  });

  // Daily Activities
  doc.setFontSize(16);
  doc.text('Daily Activities', 20, doc.lastAutoTable.finalY + 20);

  const activitiesData = data.activities.dailyActivities.map((activity) => [
    activity.name,
    activity.value.toString(),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Activity', 'Count']],
    body: activitiesData,
    theme: 'striped',
  });

  // Top Procedures
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Top Procedures', 20, 20);

  const proceduresData = data.activities.topProcedures.map((proc) => [
    proc.name,
    proc.count.toString(),
  ]);

  autoTable(doc, {
    startY: 25,
    head: [['Procedure', 'Count']],
    body: proceduresData,
    theme: 'striped',
  });

  // Common Diagnoses
  doc.setFontSize(16);
  doc.text('Common Diagnoses', 20, doc.lastAutoTable.finalY + 20);

  const diagnosesData = data.activities.commonDiagnoses.map((diag) => [
    diag.name,
    diag.count.toString(),
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [['Diagnosis', 'Count']],
    body: diagnosesData,
    theme: 'striped',
  });

  // Save the PDF
  doc.save(`ICU-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}