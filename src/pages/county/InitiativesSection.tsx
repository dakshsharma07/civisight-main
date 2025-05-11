import React, { useState } from 'react';

interface Initiative {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed';
  requiredDocuments: string[];
  estimatedTimeline: string;
  department: string;
}

// Placeholder data
const initialInitiatives: Initiative[] = [
  {
    id: '1',
    title: 'Public Park Renovation',
    description: 'Renovation of the central public park including new playground equipment and walking trails.',
    status: 'planning',
    requiredDocuments: [
      'Environmental Impact Assessment',
      'Construction Permit Application',
      'Budget Proposal',
      'Community Feedback Survey'
    ],
    estimatedTimeline: '6-8 months',
    department: 'Parks & Recreation'
  },
  {
    id: '2',
    title: 'Road Infrastructure Upgrade',
    description: 'Upgrading main arterial roads with new paving and improved drainage systems.',
    status: 'in_progress',
    requiredDocuments: [
      'Traffic Impact Study',
      'Engineering Plans',
      'Construction Timeline',
      'Budget Allocation Document'
    ],
    estimatedTimeline: '12-18 months',
    department: 'Public Works'
  },
  {
    id: '3',
    title: 'Community Center Expansion',
    description: 'Adding new facilities to the existing community center including a gym and meeting rooms.',
    status: 'completed',
    requiredDocuments: [
      'Architectural Plans',
      'Building Permit',
      'Safety Inspection Report',
      'Final Budget Report'
    ],
    estimatedTimeline: '8-10 months',
    department: 'Community Development'
  }
];

const InitiativesSection: React.FC = () => {
  const [initiatives, setInitiatives] = useState<Initiative[]>(initialInitiatives);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [showNewInitiativeModal, setShowNewInitiativeModal] = useState(false);

  const getStatusColor = (status: Initiative['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Initiatives</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage county initiatives and their required documentation
          </p>
        </div>
        <button
          onClick={() => setShowNewInitiativeModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          New Initiative
        </button>
      </div>

      {/* Initiatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initiatives.map((initiative) => (
          <div
            key={initiative.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedInitiative(initiative)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{initiative.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{initiative.department}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(initiative.status)}`}>
                  {initiative.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{initiative.description}</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Required Documents:</h4>
                <ul className="mt-2 space-y-1">
                  {initiative.requiredDocuments.slice(0, 3).map((doc, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {doc}
                    </li>
                  ))}
                  {initiative.requiredDocuments.length > 3 && (
                    <li className="text-sm text-gray-500">
                      +{initiative.requiredDocuments.length - 3} more documents
                    </li>
                  )}
                </ul>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Timeline: {initiative.estimatedTimeline}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Initiative Detail Modal */}
      {selectedInitiative && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{selectedInitiative.title}</h3>
              <button
                onClick={() => setSelectedInitiative(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="mt-1 text-sm text-gray-600">{selectedInitiative.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Department</h4>
                  <p className="mt-1 text-sm text-gray-600">{selectedInitiative.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Status</h4>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInitiative.status)}`}>
                    {selectedInitiative.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Required Documents</h4>
                  <ul className="mt-2 space-y-2">
                    {selectedInitiative.requiredDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Estimated Timeline</h4>
                  <p className="mt-1 text-sm text-gray-600">{selectedInitiative.estimatedTimeline}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedInitiative(null)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Initiative Modal - Placeholder for future LLM integration */}
      {showNewInitiativeModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Initiative</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500">
                This feature will be enhanced with AI assistance in the future.
                For now, please contact your administrator to create new initiatives.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowNewInitiativeModal(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InitiativesSection; 