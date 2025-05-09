// CountyDashboard Component
// This component serves as the main dashboard for county users
// It displays county-specific information, tasks, and management tools

import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import ProfileSection from './ProfileSection';
import ObligationsSection from './ObligationsSection';
import FormsSection from './FormsSection';
import TasksSection from './TasksSection';
import ReminderSection from './ReminderSection';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const countyNavItems: NavItem[] = [
  { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
  { name: 'Tasks', path: '/dashboard/tasks', icon: '✓' },
  { name: 'Obligations', path: '/dashboard/obligations', icon: '📋' },
  { name: 'Forms', path: '/dashboard/forms', icon: '📝' },
  { name: 'Reminders', path: '/dashboard/reminders', icon: '🔔' }
];

// CountyDashboard Component Definition
// Manages county dashboard state and functionality
const CountyDashboard: React.FC = () => {
  // State Management
  // Tracks user authentication and loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isStateAgency, setIsStateAgency] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Authentication Effect
  // Monitors authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign Out Handler
  // Processes user logout
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Loading and Authentication States
  // Handles loading and authentication states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // UI Rendering
  // Returns the county dashboard with user information and management tools
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/CiviSight Logo w:o name.png"
                alt="CiviSight Logo"
                className="h-8 w-auto"
              />
              <h1 className={`ml-4 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isStateAgency ? 'State Agency Portal' : 'County Portal'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {isDarkMode ? (
                  <>
                    <span className="text-xl">🌞</span>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🌙</span>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isStateAgency}
                  onChange={() => setIsStateAgency(!isStateAgency)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isStateAgency ? 'State Agency View' : 'County View'}
                </span>
              </label>
              <button
                onClick={handleSignOut}
                className={`px-4 py-2 text-sm font-medium ${
                  isDarkMode 
                    ? 'text-white bg-gray-700 hover:bg-gray-600' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                } border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
              <ul className="space-y-2">
                {countyNavItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        location.pathname === item.path 
                          ? isDarkMode 
                            ? 'bg-gray-700 text-white' 
                            : 'bg-indigo-50 text-indigo-600'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Routes>
              <Route path="profile" element={<ProfileSection />} />
              <Route path="tasks" element={<TasksSection />} />
              <Route path="obligations" element={<ObligationsSection />} />
              <Route path="forms" element={<FormsSection />} />
              <Route path="reminders" element={<ReminderSection />} />
              <Route path="/" element={<ProfileSection />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountyDashboard; 