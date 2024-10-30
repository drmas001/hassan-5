import React from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { generatePDF } from '../utils/pdfExport';
import { generateExcel } from '../utils/excelExport';
import type { ReportData } from '../types/reports';

interface ExportButtonsProps {
  data: ReportData;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export function ExportButtons({ data, dateRange }: ExportButtonsProps) {
  const handlePDFExport = () => {
    generatePDF(data, dateRange);
  };

  const handleExcelExport = () => {
    generateExcel(data, dateRange);
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
      <button
        onClick={handlePDFExport}
        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </button>
      <button
        onClick={handleExcelExport}
        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export Excel
      </button>
    </div>
  );
}