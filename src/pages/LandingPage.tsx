import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Users,
  Bell,
  ClipboardList,
  BarChart2,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">ICU Manager</span>
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex flex-col items-center text-center">
          <Activity className="h-16 w-16 text-blue-600 mb-8" />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Streamline ICU Management
          </h1>
          <p className="max-w-2xl text-xl text-gray-600 mb-10">
            A comprehensive solution for managing intensive care units with real-time monitoring
            and seamless collaboration.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg md:px-10"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Patient Management
              </h3>
            </div>
            <p className="text-gray-600">
              Comprehensive patient monitoring with real-time vitals tracking and detailed medical history management.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Real-time Updates
              </h3>
            </div>
            <p className="text-gray-600">
              Instant notifications for critical updates, status changes, and important patient developments.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <ClipboardList className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Clinical Documentation
              </h3>
            </div>
            <p className="text-gray-600">
              Streamlined documentation for procedures, medications, and lab results.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 rounded-lg p-3">
                <BarChart2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Analytics & Reports
              </h3>
            </div>
            <p className="text-gray-600">
              Comprehensive reporting and analytics tools for monitoring ICU performance, patient outcomes, and resource utilization.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">ICU Manager</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ICU Manager. All rights reserved to alpha-medi.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}