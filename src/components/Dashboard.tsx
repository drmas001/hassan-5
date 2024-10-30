import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { StatisticsCard } from './StatisticsCard';
import { PatientList } from './PatientList';
import { NotificationPanel } from './NotificationPanel';
import { usePatients } from '../hooks/usePatients';
import { LoadingSpinner } from './LoadingSpinner';

export function Dashboard() {
  const navigate = useNavigate();
  const { patients, loading } = usePatients();

  const stats = {
    totalPatients: patients.filter(p => p.status !== 'Discharged').length,
    criticalPatients: patients.filter(p => p.status === 'Critical').length,
    stablePatients: patients.filter(p => p.status === 'Stable').length,
    newAdmissions: patients.filter(p => {
      const today = new Date();
      const admissionDate = new Date(p.admission_date);
      return (
        admissionDate.getDate() === today.getDate() &&
        admissionDate.getMonth() === today.getMonth() &&
        admissionDate.getFullYear() === today.getFullYear()
      );
    }).length,
    dischargedToday: patients.filter(p => {
      const today = new Date();
      const updatedDate = new Date(p.updated_at);
      return (
        p.status === 'Discharged' &&
        updatedDate.getDate() === today.getDate() &&
        updatedDate.getMonth() === today.getMonth() &&
        updatedDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="mb-6">
        <StatisticsCard stats={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientList />
        </div>
        <div>
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
}