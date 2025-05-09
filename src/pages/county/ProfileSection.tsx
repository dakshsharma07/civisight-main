// ProfileSection Component
// This component manages and displays user profile information
// It provides functionality to view and update user details

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface CountyInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  website: string;
}

interface ProfileUpdate {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  website?: string;
}

// Placeholder data
const countyData: CountyInfo = {
  name: 'Henry County',
  email: 'contact@henrycounty.gov',
  address: '140 Henry Parkway, McDonough, GA 30253',
  phone: '(770) 288-6000',
  website: 'www.henrycountyga.gov'
};

// ProfileSection Component Definition
// Manages profile state and functionality
const ProfileSection: React.FC = () => {
  // State Management
  // Tracks profile data and UI state
  const [profile, setProfile] = useState<CountyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
  const handleUpdateProfile = async (updates: ProfileUpdate): Promise<void> => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const handleChangePassword = async (newPassword: string): Promise<void> => {
    // Password change logic
  };

  // UI Rendering
  // Returns the profile section with loading and error states
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">County Profile</h2>
      
      <div className="space-y-6">
        {/* County Name */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xl">🏛️</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">County Name</h3>
            <p className="text-lg text-gray-900">{profile?.name || countyData.name}</p>
          </div>
        </div>

        {/* Contact Email */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xl">✉️</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
            <p className="text-lg text-gray-900">{profile?.email || countyData.email}</p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xl">📍</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="text-lg text-gray-900">{profile?.address || countyData.address}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xl">📞</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="text-lg text-gray-900">{profile?.phone || countyData.phone}</p>
          </div>
        </div>

        {/* Website */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 text-xl">🌐</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Website</h3>
            <a 
              href={`https://${profile?.website || countyData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {profile?.website || countyData.website}
            </a>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <div className="mt-8">
        <button
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSection; 