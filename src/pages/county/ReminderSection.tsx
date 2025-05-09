// ReminderSection Component
// This component manages and displays task reminders for users
// It provides functionality to view, create, and manage task reminders

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  deadline: string;
}

// Placeholder data - reusing tasks from TasksSection
const availableTasks: Task[] = [
  {
    id: '1',
    title: 'Review Q2 Budget Report',
    deadline: '2024-04-15'
  },
  {
    id: '2',
    title: 'Complete Environmental Assessment',
    deadline: '2024-03-30'
  },
  {
    id: '3',
    title: 'Update Public Safety Protocols',
    deadline: '2024-03-20'
  }
];

// ReminderSection Component Definition
// Manages reminder state and functionality
const ReminderSection: React.FC = () => {
  // State Management
  // Tracks reminders and UI state
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  // Data Fetching Effect
  // Loads reminders when component mounts
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        // Fetch reminders logic here
        setLoading(false);
      } catch (err) {
        setError('Failed to load reminders');
        setLoading(false);
      }
    };

    if (user) {
      fetchReminders();
    }
  }, [user]);

  // UI Rendering
  // Returns the reminders section with loading and error states
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create Reminder</h2>
      
      <form className="space-y-6">
        {/* Reminder Title */}
        <div className="form-group">
          <label htmlFor="reminderTitle" className="block text-sm font-medium text-gray-700">
            Reminder Title
          </label>
          <input
            type="text"
            id="reminderTitle"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter reminder title"
          />
        </div>

        {/* Trigger Date */}
        <div className="form-group">
          <label htmlFor="triggerDate" className="block text-sm font-medium text-gray-700">
            Trigger Date
          </label>
          <input
            type="datetime-local"
            id="triggerDate"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Select Task */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Select Task
          </label>
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setShowTaskDropdown(!showTaskDropdown)}
              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {selectedTask || 'Select a task'}
            </button>
            
            {showTaskDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                {availableTasks.map(task => (
                  <div
                    key={task.id}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task.title);
                      setShowTaskDropdown(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Reminder Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Reminder
        </button>
      </form>

      {/* Empty state for when there are no tasks */}
      {availableTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900">No tasks available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create a task first to set up reminders
          </p>
        </div>
      )}
    </div>
  );
};

export default ReminderSection; 