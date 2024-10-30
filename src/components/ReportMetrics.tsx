import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Metrics {
  totalPatients: number;
  criticalCases: number;
  medicationsGiven: number;
  labTests: number;
  averageStayDuration: number;
  bedOccupancyRate: number;
  readmissionRate: number;
  mortalityRate: number;
}

interface Activities {
  patientStatusDistribution: Array<{ name: string; value: number }>;
  dailyActivities: Array<{ name: string; value: number }>;
  topProcedures: Array<{ name: string; count: number }>;
  commonDiagnoses: Array<{ name: string; count: number }>;
}

interface ReportMetricsProps {
  metrics: Metrics;
  activities: Activities;
}

export function ReportMetrics({ metrics, activities }: ReportMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Performance Metrics</h3>
        </div>
        <div className="p-4 sm:p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Average Stay Duration</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-gray-900">
                  {metrics.averageStayDuration.toFixed(1)}
                  <span className="ml-2 text-sm font-medium text-gray-500">days</span>
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Bed Occupancy Rate</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-gray-900">
                  {(metrics.bedOccupancyRate * 100).toFixed(1)}%
                </div>
                <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 md:mt-2 lg:mt-0">
                  <ArrowUp className="-ml-1 mr-0.5 h-4 w-4" />
                  4.5%
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Readmission Rate</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-gray-900">
                  {(metrics.readmissionRate * 100).toFixed(1)}%
                </div>
                <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 md:mt-2 lg:mt-0">
                  <ArrowUp className="-ml-1 mr-0.5 h-4 w-4" />
                  2.1%
                </div>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Mortality Rate</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-gray-900">
                  {(metrics.mortalityRate * 100).toFixed(1)}%
                </div>
                <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 md:mt-2 lg:mt-0">
                  <ArrowDown className="-ml-1 mr-0.5 h-4 w-4" />
                  1.2%
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Common Procedures and Diagnoses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Top Procedures</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {activities.topProcedures.map((procedure, index) => (
                <div key={procedure.name} className="flex items-center">
                  <div className="w-6 sm:w-8 text-sm text-gray-500">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {procedure.name}
                    </div>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                        <div
                          style={{
                            width: `${(procedure.count / Math.max(...activities.topProcedures.map(p => p.count))) * 100}%`,
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 sm:w-16 text-right text-sm text-gray-500">
                    {procedure.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Common Diagnoses</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {activities.commonDiagnoses.map((diagnosis, index) => (
                <div key={diagnosis.name} className="flex items-center">
                  <div className="w-6 sm:w-8 text-sm text-gray-500">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {diagnosis.name}
                    </div>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                        <div
                          style={{
                            width: `${(diagnosis.count / Math.max(...activities.commonDiagnoses.map(d => d.count))) * 100}%`,
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 sm:w-16 text-right text-sm text-gray-500">
                    {diagnosis.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}