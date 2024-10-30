import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddVitalsFormProps {
  patientId: string;
  onClose: () => void;
}

export function AddVitalsForm({ patientId, onClose }: AddVitalsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    heart_rate: '',
    blood_pressure: '',
    temperature: '',
    oxygen_saturation: '',
    respiratory_rate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        toast.error('Please log in again');
        return;
      }

      const user = JSON.parse(userString);

      const { error } = await supabase.from('vitals').insert([
        {
          patient_id: patientId,
          heart_rate: parseInt(formData.heart_rate),
          blood_pressure: formData.blood_pressure,
          temperature: parseFloat(formData.temperature),
          oxygen_saturation: parseInt(formData.oxygen_saturation),
          respiratory_rate: parseInt(formData.respiratory_rate),
          notes: formData.notes || null,
          recorded_by: user.id,
        },
      ]);

      if (error) throw error;

      toast.success('Vitals recorded successfully');
      onClose();
    } catch (error) {
      console.error('Error recording vitals:', error);
      toast.error('Failed to record vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Record New Vitals</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
          <input
            type="number"
            name="heart_rate"
            required
            min="0"
            max="300"
            value={formData.heart_rate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
          <input
            type="text"
            name="blood_pressure"
            required
            placeholder="120/80"
            value={formData.blood_pressure}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
          <input
            type="number"
            name="temperature"
            required
            step="0.1"
            min="30"
            max="45"
            value={formData.temperature}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Oxygen Saturation (%)</label>
          <input
            type="number"
            name="oxygen_saturation"
            required
            min="0"
            max="100"
            value={formData.oxygen_saturation}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Respiratory Rate</label>
          <input
            type="number"
            name="respiratory_rate"
            required
            min="0"
            max="100"
            value={formData.respiratory_rate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Record Vitals'}
          </button>
        </div>
      </form>
    </div>
  );
}