import React from 'react';
import { LogOut } from 'lucide-react';

interface DischargeButtonProps {
  onDischarge: () => void;
  disabled?: boolean;
}

export function DischargeButton({ onDischarge, disabled }: DischargeButtonProps) {
  return (
    <button
      onClick={onDischarge}
      disabled={disabled}
      className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Discharge Patient
    </button>
  );
}