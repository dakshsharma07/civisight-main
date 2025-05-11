// FormsSection Component
// This component manages and displays forms for users
// It provides functionality to view, submit, and track form status

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type FileType = 'PDF' | 'DOC' | 'XLS';
type FormStatus = 'draft' | 'in_progress' | 'completed';

interface Form {
  id: string;
  title: string;
  status: FormStatus;
  assignedTo: string[];
  dueDate: string;
  createdAt: string;
  documentUrl?: string;
  fileType?: FileType;
}

interface Personnel {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Placeholder data
const initialForms: Form[] = [
  {
    id: '1',
    title: 'Annual Budget Template',
    status: 'completed',
    assignedTo: ['1'],
    dueDate: '2024-03-15',
    createdAt: '2024-03-15',
    fileType: 'PDF'
  },
  {
    id: '2',
    title: 'Environmental Compliance Form',
    status: 'completed',
    assignedTo: ['2'],
    dueDate: '2024-02-28',
    createdAt: '2024-02-28',
    fileType: 'DOC'
  },
  {
    id: '3',
    title: 'Public Safety Assessment',
    status: 'completed',
    assignedTo: ['1'],
    dueDate: '2024-03-01',
    createdAt: '2024-03-01',
    fileType: 'XLS'
  }
];

const FileTypeIcon: React.FC<{ type: FileType }> = ({ type }) => {
  const icons: Record<FileType, string> = {
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const { user } = useAuth();

  // Mock personnel data - this would come from your database
  const personnel: Personnel[] = [
    { id: '1', name: 'John Doe', email: 'john@county.gov', role: 'County Clerk' },
    { id: '2', name: 'Jane Smith', email: 'jane@county.gov', role: 'Deputy Clerk' },
  ];

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formTitle) return;

    // Here you would typically:
    // 1. Upload the file to your storage
    // 2. Create a form record in your database
    // 3. Send notifications to assigned personnel
    // 4. Set up any necessary tracking

    const newForm: Form = {
      id: Date.now().toString(),
      title: formTitle,
      status: 'draft',
      assignedTo: selectedAssignees,
      dueDate,
      createdAt: new Date().toISOString(),
    };

    setForms([...forms, newForm]);
    setShowUploadModal(false);
    setSelectedFile(null);
    setFormTitle('');
    setDueDate('');
    setSelectedAssignees([]);
  };

  // UI Rendering
  // Returns the forms section with loading and error states
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Forms & Documents</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload, manage, and track important county documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Upload New Form
        </button>
      </div>

      {/* Forms List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {form.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Due: {form.dueDate}</p>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        {form.assignedTo.length} assignees
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {forms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No forms uploaded yet. Click "Upload New Form" to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upload New Form</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Form Title</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Document</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <div className="mt-2 space-y-2">
                  {personnel.map((person) => (
                    <label key={person.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedAssignees.includes(person.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssignees([...selectedAssignees, person.id]);
                          } else {
                            setSelectedAssignees(selectedAssignees.filter(id => id !== person.id));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {person.name} ({person.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={!selectedFile || !formTitle}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsSection; 