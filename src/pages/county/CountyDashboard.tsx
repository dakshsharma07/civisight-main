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
import InitiativesSection from './InitiativesSection';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const countyNavItems: NavItem[] = [
  { name: 'Profile', path: '/county-dashboard/profile', icon: '👤' },
  { name: 'Obligations', path: '/county-dashboard/obligations', icon: '📋' },
  { name: 'Forms', path: '/county-dashboard/forms', icon: '📝' },
  { name: 'Initiatives', path: '/county-dashboard/initiatives', icon: '🎯' }
];

const CivioAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hi! I'm Civio, your county management assistant. How can I help you today?", isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
    setInputMessage('');

    // Simulate assistant response (this will be replaced with actual LLM integration)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "I'm here to help! This feature will be enhanced with AI capabilities soon.",
        isUser: false
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-72 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Chat Header */}
          <div className="p-3 border-b border-gray-200 bg-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                C
              </div>
              <h3 className="ml-3 text-lg font-medium">Civio</h3>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

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
                className="h-12 w-auto"
              />
              <h1 className={`ml-4 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Compliance Portal
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
              <Route path="obligations" element={<ObligationsSection />} />
              <Route path="forms" element={<FormsSection />} />
              <Route path="initiatives" element={<InitiativesSection />} />
              <Route path="/" element={<ProfileSection />} />
            </Routes>
          </div>
        </div>

        {/* State Agency Dashboard Link */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${
              isDarkMode 
                ? 'text-indigo-400 hover:text-indigo-300' 
                : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            <span className="mr-2">🏛️</span>
            Switch to State Agency Dashboard
          </Link>
        </div>
      </div>

      {/* Add Civio Assistant */}
      <CivioAssistant />
    </div>
  );
};

export default CountyDashboard; 