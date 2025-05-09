// TasksSection Component
// This component manages and displays tasks for users
// It provides functionality to view, create, update, and delete tasks

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  deadline: string;
  assignedTo: string[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  reminder: {
    date: string;
    duration: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'none';
  };
  assignedDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

// Placeholder data
const teamMembers: TeamMember[] = [
  { id: '1', name: 'John Smith', role: 'County Manager' },
  { id: '2', name: 'Sarah Johnson', role: 'Environmental Officer' },
  { id: '3', name: 'Michael Brown', role: 'Budget Analyst' },
  { id: '4', name: 'Emily Davis', role: 'Public Safety Director' }
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review Q2 Budget Report',
    deadline: '2024-04-15',
    assignedTo: ['John Smith', 'Michael Brown'],
    status: 'In Progress',
    reminder: {
      date: '2024-04-10',
      duration: 'weekly'
    },
    assignedDate: '2024-03-15'
  },
  {
    id: '2',
    title: 'Complete Environmental Assessment',
    deadline: '2024-03-30',
    assignedTo: ['Sarah Johnson'],
    status: 'Not Started',
    reminder: {
      date: '2024-03-25',
      duration: 'biweekly'
    },
    assignedDate: '2024-03-10'
  },
  {
    id: '3',
    title: 'Update Public Safety Protocols',
    deadline: '2024-03-20',
    assignedTo: ['Emily Davis'],
    status: 'Overdue',
    reminder: {
      date: '2024-03-15',
      duration: 'daily'
    },
    assignedDate: '2024-03-01'
  }
];

const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
  const statusStyles = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

// TasksSection Component Definition
// Manages task state and functionality
const TasksSection: React.FC = () => {
  // State Management
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskReminderDate, setNewTaskReminderDate] = useState('');
  const [newTaskReminderDuration, setNewTaskReminderDuration] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'none'>('none');
  const { user } = useAuth();

  // Data Fetching Effect
  // Loads tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Fetch tasks logic here
        setTasks(initialTasks); // Using placeholder data for now
        setLoading(false);
      } catch (err) {
        setError('Failed to load tasks');
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Task Management Functions
  // Handles task creation, updates, and deletion
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim() || !newTaskDeadline) {
      setError('Please fill in all required fields');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      deadline: newTaskDeadline,
      assignedTo: selectedMembers,
      status: 'Not Started',
      reminder: {
        date: newTaskReminderDate || newTaskDeadline,
        duration: newTaskReminderDuration
      },
      assignedDate: new Date().toISOString().split('T')[0]
    };

    // Clear form first
    setNewTaskTitle('');
    setNewTaskDeadline('');
    setNewTaskReminderDate('');
    setNewTaskReminderDuration('none');
    setSelectedMembers([]);
    setShowMemberDropdown(false);
    setError(null);

    // Then update tasks state
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      return updatedTasks;
    });
  };

  // Add a key to force re-render of the task list
  const taskListKey = tasks.length;

  // Add an effect to monitor tasks state changes
  useEffect(() => {
    console.log('Tasks state updated:', tasks);
  }, [tasks]);

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const toggleMember = (memberName: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberName)
        ? prev.filter(name => name !== memberName)
        : [...prev, memberName]
    );
  };

  // UI Rendering
  // Returns the tasks section with loading and error states
  return (
    <div className="space-y-6">
      {/* Task Creation Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Create New Task</h2>
        
        <form className="space-y-6" onSubmit={handleCreateTask}>
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          
          {/* Task Title */}
          <div className="form-group">
            <label htmlFor="taskTitle" className="block text-sm font-medium">
              Task Title
            </label>
            <input
              type="text"
              id="taskTitle"
              className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label htmlFor="deadline" className="block text-sm font-medium">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              required
            />
          </div>

          {/* Reminder Settings */}
          <div className="form-group p-4 rounded-lg border">
            <label className="block text-sm font-medium mb-2">
              Reminder Settings
            </label>
            <div className="space-y-4">
              <div>
                <label htmlFor="reminderDate" className="block text-sm">
                  When to start reminding
                </label>
                <input
                  type="date"
                  id="reminderDate"
                  className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTaskReminderDate}
                  onChange={(e) => setNewTaskReminderDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={newTaskDeadline}
                />
              </div>
              <div>
                <label htmlFor="reminderDuration" className="block text-sm">
                  How often to remind
                </label>
                <select
                  id="reminderDuration"
                  className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTaskReminderDuration}
                  onChange={(e) => setNewTaskReminderDuration(e.target.value as Task['reminder']['duration'])}
                >
                  <option value="none">No Reminder</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-sm">
              Set when you want to start receiving reminders and how often you want to be reminded
            </p>
          </div>

          {/* Assign To */}
          <div className="form-group">
            <label className="block text-sm font-medium">
              Assign To
            </label>
            <div className="relative mt-1">
              <button
                type="button"
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                className="w-full px-3 py-2 text-left rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {selectedMembers.length > 0
                  ? selectedMembers.join(', ')
                  : 'Select team members'}
              </button>
              
              {showMemberDropdown && (
                <div className="absolute z-10 mt-1 w-full shadow-lg rounded-md border">
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleMember(member.name)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.name)}
                          onChange={() => {}}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Task
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Current Tasks</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Task', 'Deadline', 'Reminder', 'Assigned To', 'Status', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks && tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {new Date(task.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {task.reminder.duration !== 'none' ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {new Date(task.reminder.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-indigo-400 font-medium capitalize">
                            {task.reminder.duration} reminders
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          No reminder set
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {task.assignedTo.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TasksSection; 