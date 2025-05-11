// ProfileSection Component
// This component manages and displays user profile information
// It provides functionality to view and update user details

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Personnel {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface CountyProfile {
  name: string;
  mainEmail: string;
  address: string;
  phone: string;
  website: string;
  personnel: Personnel[];
}

// Placeholder data
const countyData: CountyProfile = {
  name: 'Henry County',
  mainEmail: 'contact@henrycounty.gov',
  address: '140 Henry Parkway, McDonough, GA 30253',
  phone: '(770) 288-6000',
  website: 'www.henrycountyga.gov',
  personnel: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@henrycounty.gov',
      role: 'County Clerk',
      department: 'Administration'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@henrycounty.gov',
      role: 'Deputy Clerk',
      department: 'Administration'
    }
  ]
};

// ProfileSection Component Definition
// Manages profile state and functionality
const ProfileSection: React.FC = () => {
  // State Management
  // Tracks profile data and UI state
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState<Partial<Personnel>>({});
  const [profile, setProfile] = useState<CountyProfile>(countyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data Fetching Effect
  // Loads profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fetch profile logic here
        setProfile(countyData); // Using placeholder data for now
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Profile Management Functions
  // Handles profile updates and changes
  const handleUpdateProfile = async (updates: Partial<CountyProfile>): Promise<void> => {
    setProfile({ ...profile, ...updates });
  };

  const handleChangePassword = async (newPassword: string): Promise<void> => {
    // Password change logic
  };

  const handleAddPersonnel = () => {
    if (newPersonnel.name && newPersonnel.email && newPersonnel.role && newPersonnel.department) {
      const personnel: Personnel = {
        id: Date.now().toString(),
        name: newPersonnel.name,
        email: newPersonnel.email,
        role: newPersonnel.role,
        department: newPersonnel.department
      };

      setProfile({
        ...profile,
        personnel: [...profile.personnel, personnel]
      });

      setNewPersonnel({});
      setShowAddPersonnel(false);
    }
  };

  const handleRemovePersonnel = (id: string) => {
    setProfile({
      ...profile,
      personnel: profile.personnel.filter(p => p.id !== id)
    });
  };

  // UI Rendering
  // Returns the profile section with loading and error states
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">County Profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your county's information and personnel
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {/* Main Profile Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">County Name</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profile.name}
                onChange={(e) => handleUpdateProfile({ name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Email</label>
              <input
                type="email"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profile.mainEmail}
                onChange={(e) => handleUpdateProfile({ mainEmail: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profile.address}
                onChange={(e) => handleUpdateProfile({ address: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profile.phone}
                onChange={(e) => handleUpdateProfile({ phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={profile.website}
                onChange={(e) => handleUpdateProfile({ website: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personnel Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Personnel</h3>
            <button
              onClick={() => setShowAddPersonnel(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Personnel
            </button>
          </div>

          <div className="space-y-4">
            {profile.personnel.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{person.name}</h4>
                  <p className="text-sm text-gray-500">{person.email}</p>
                  <p className="text-sm text-gray-500">
                    {person.role} • {person.department}
                  </p>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemovePersonnel(person.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Personnel Modal */}
      {showAddPersonnel && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Personnel</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPersonnel.name || ''}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPersonnel.email || ''}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPersonnel.role || ''}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, role: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPersonnel.department || ''}
                  onChange={(e) => setNewPersonnel({ ...newPersonnel, department: e.target.value })}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddPersonnel(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPersonnel}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={!newPersonnel.name || !newPersonnel.email || !newPersonnel.role || !newPersonnel.department}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection; 