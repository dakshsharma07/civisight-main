// FormsSection Component
// This component manages and displays forms for users
// It provides functionality to view, submit, and track form status

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Form {
  id: string;
  title: string;
  description: string;
  fileType: 'PDF' | 'DOC' | 'XLS';
  lastUpdated: string;
}

interface FormData {
  title: string;
  description: string;
  fileType: Form['fileType'];
}

interface FormStatus {
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

// Placeholder data
const initialForms: Form[] = [
  {
    id: '1',
    title: 'Annual Budget Template',
    description: 'Standard template for county budget planning and allocation',
    fileType: 'XLS',
    lastUpdated: '2024-03-15'
  },
  {
    id: '2',
    title: 'Environmental Compliance Form',
    description: 'Required documentation for environmental regulations',
    fileType: 'PDF',
    lastUpdated: '2024-02-28'
  },
  {
    id: '3',
    title: 'Public Safety Assessment',
    description: 'Comprehensive safety evaluation and reporting form',
    fileType: 'DOC',
    lastUpdated: '2024-03-01'
  }
];

const FileTypeIcon: React.FC<{ type: Form['fileType'] }> = ({ type }) => {
  const icons = {
    PDF: '📄',
    DOC: '📝',
    XLS: '📊'
  };

  return (
    <span className="text-2xl" role="img" aria-label={`${type} file`}>
      {icons[type]}
    </span>
  );
};

// FormsSection Component Definition
// Manages forms state and functionality
const FormsSection: React.FC = () => {
  // State Management
  // Tracks forms and UI state
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Data Fetching Effect
  // Loads forms when component mounts
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        // Fetch forms logic here
        setLoading(false);
      } catch (err) {
        setError('Failed to load forms');
        setLoading(false);
      }
    };

    if (user) {
      fetchForms();
    }
  }, [user]);

  // Form Management Functions
  // Handles form submission and status updates
  const handleSubmitForm = async (formData: FormData): Promise<void> => {
    // Form submission logic
  };

  const handleUpdateFormStatus = async (formId: string, status: FormStatus): Promise<void> => {
    // Form status update logic
  };

  // UI Rendering
  // Returns the forms section with loading and error states
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Forms & Resources</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Upload New Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {form.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {form.description}
                </p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>Last updated: </span>
                  <span className="ml-1 font-medium">
                    {new Date(form.lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <FileTypeIcon type={form.fileType} />
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                {form.fileType}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state for when there are no forms */}
      {forms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900">No forms available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Upload your first form to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default FormsSection; 