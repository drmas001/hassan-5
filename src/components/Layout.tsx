import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  Activity,
  FileText,
  PlusCircle,
  LogOut,
  BarChart3,
  Settings,
} from 'lucide-react';
import { SignOutButton } from './SignOutButton';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { UserProfile } from './UserProfile';
import { useUser } from '../hooks/useUser';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useUser();

  // Initialize session timeout
  useSessionTimeout();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Admit Patient', href: '/admit', icon: PlusCircle },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Discharge Records', href: '/discharges', icon: LogOut },
    ...(user?.role === 'Admin' ? [{ name: 'Employee Management', href: '/admin', icon: Settings }] : []),
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-gray-600 ${
            sidebarOpen ? 'opacity-75' : 'opacity-0'
          } transition-opacity duration-300 ease-in-out`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar panel */}
        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out`}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                ICU Manager
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile user profile */}
          <div className="border-t border-gray-200">
            <div className="p-4">
              <Link 
                to="/profile" 
                className="block transition-colors duration-200 hover:bg-gray-50 rounded-md -m-2 p-2"
                onClick={() => setSidebarOpen(false)}
              >
                <UserProfile />
              </Link>
            </div>
            <div className="px-2 pb-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:z-50">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Sidebar Header */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                ICU Manager
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-200 flex-shrink-0">
            <div className="p-4">
              <Link 
                to="/profile" 
                className="block transition-colors duration-200 hover:bg-gray-50 rounded-md -m-2 p-2"
              >
                <UserProfile />
              </Link>
            </div>
            <div className="px-2 pb-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                ICU Manager
              </span>
            </div>
            <div className="w-6" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}