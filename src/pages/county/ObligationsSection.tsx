// ObligationsSection Component
// This component manages and displays county obligations
// It provides functionality to view, track, and manage compliance requirements

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Obligation {
  id: string;
  lawName: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'In Progress';
}

interface ObligationUpdate {
  status?: Obligation['status'];
  dueDate?: string;
  notes?: string;
}

interface ProgressUpdate {
  percentage: number;
  notes?: string;
}

// Placeholder data
const initialObligations: Obligation[] = [
  {
    id: '1',
    lawName: 'Annual Tax Report',
    dueDate: '2025-06-01',
    status: 'Pending'
  },
  {
    id: '2',
    lawName: 'Environmental Compliance Review',
    dueDate: '2024-12-15',
    status: 'In Progress'
  },
  {
    id: '3',
    lawName: 'Budget Allocation Report',
    dueDate: '2024-09-30',
    status: 'Completed'
  },
  {
    id: '4',
    lawName: 'Infrastructure Assessment',
    dueDate: '2024-08-15',
    status: 'Overdue'
  },
  {
    id: '5',
    lawName: 'Public Safety Audit',
    dueDate: '2024-11-30',
    status: 'Pending'
  }
];

const StatusBadge: React.FC<{ status: Obligation['status'] }> = ({ status }) => {
  const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Overdue: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

// ObligationsSection Component Definition
// Manages obligations state and functionality
const ObligationsSection: React.FC = () => {
  // State Management
  // Tracks obligations and UI state
  const [obligations, setObligations] = useState<Obligation[]>(initialObligations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Data Fetching Effect
  // Loads obligations when component mounts
  useEffect(() => {
    const fetchObligations = async () => {
      try {
        setLoading(true);
        // Fetch obligations logic here
        setLoading(false);
      } catch (err) {
        setError('Failed to load obligations');
        setLoading(false);
      }
    };

    if (user) {
      fetchObligations();
    }
  }, [user]);

  // Obligation Management Functions
  // Handles obligation updates and status tracking
  const handleUpdateObligation = async (obligationId: string, updates: ObligationUpdate): Promise<void> => {
    setObligations(prevObligations =>
      prevObligations.map(obligation =>
        obligation.id === obligationId
          ? { ...obligation, ...updates }
          : obligation
      )
    );
  };

  const handleTrackProgress = async (obligationId: string, progress: ProgressUpdate): Promise<void> => {
    // Progress tracking logic
  };

  // UI Rendering
  // Returns the obligations section with loading and error states
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Obligations</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Add New Obligation
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Law Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {obligations.map((obligation) => (
              <tr key={obligation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{obligation.lawName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(obligation.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={obligation.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{obligations.length}</span> of{' '}
          <span className="font-medium">{obligations.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObligationsSection; 