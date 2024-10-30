import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export function SignOutButton() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center px-2 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md w-full transition-colors duration-150"
    >
      <LogOut className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
      Sign Out
    </button>
  );
}