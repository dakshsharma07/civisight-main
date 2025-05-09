import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, getCountyTasks, getUsers, Task as FirebaseTask, User, deleteTask, getDefaultUser, getCountyTaskCount, updateCountyTaskCount, getCountiesWithTaskCounts } from '../../firebase/taskService';
import { auth } from '../../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

// Type Definitions
interface County {
  id: string;
  name: string;
  tasks: Task[];
  completionRate: number;
  population: number;
  region: string;
  taskCount: number;
}

interface AssignedCounty {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  assignedTo: string[];
  countyId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completionDetails: {
    totalAssigned: number;
    completed: number;
    completedBy: string[];
  };
  assignedCounties?: AssignedCounty[];
}

// Initial Data
const initialCounties: County[] = [
  {
    id: '1',
    name: 'Fulton County',
    population: 1063937,
    region: 'Metro Atlanta',
    tasks: [],
    completionRate: 0,
    taskCount: 0
  },
  {
    id: '2',
    name: 'Gwinnett County',
    population: 957062,
    region: 'Metro Atlanta',
    tasks: [],
    completionRate: 0,
    taskCount: 0
  },
  {
    id: '3',
    name: 'Cobb County',
    population: 766149,
    region: 'Metro Atlanta',
    tasks: [],
    completionRate: 0,
    taskCount: 0
  },
  {
    id: '4',
    name: 'DeKalb County',
    population: 759297,
    region: 'Metro Atlanta',
    tasks: [],
    completionRate: 0,
    taskCount: 0
  },
  {
    id: '5',
    name: 'Chatham County',
    population: 295291,
    region: 'Coastal',
    tasks: [],
    completionRate: 0,
    taskCount: 0
  },
  {
    id: '6',
    name: 'Clayton County',
    population: 297595,
    region: 'Metro Atlanta',
    tasks: [],
    completionRate: 0,
    taskCount: 0
  }
];

// Main Component
const StateAgencyDashboard: React.FC = () => {
  // Component State
  const navigate = useNavigate();
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [counties, setCounties] = useState<County[]>(initialCounties);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Add new state variables for task creation
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedUser, setSelectedUser] = useState('');
  const { user } = useAuth();

  // Form state
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    assignedTo: [] as string[],
    reminderFrequency: 'Weekly' as const
  });

  // Add new state for global task creation
  const [showGlobalTaskModal, setShowGlobalTaskModal] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);

  // Add new state for county search
  const [countySearch, setCountySearch] = useState('');
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

  // Add new state for task sorting
  const [taskSortBy, setTaskSortBy] = useState<'deadline' | 'counties'>('deadline');

  // Filter counties based on search
  const filteredCounties = counties.filter(county => 
    county.name.toLowerCase().includes(countySearch.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Add a function to refresh counties data
  const refreshCounties = async () => {
    try {
      setLoading(true);
      const updatedCounties = await Promise.all(counties.map(async (county) => {
        const tasks = await getCountyTasks(county.id);
        return {
          ...county,
          tasks: tasks,
          taskCount: tasks.length
        };
      }));
      setCounties(updatedCounties);
    } catch (error) {
      console.error('Error refreshing counties:', error);
      setError('Failed to refresh counties data');
    } finally {
      setLoading(false);
    }
  };

  // Load counties with task counts on component mount and when authenticated
  useEffect(() => {
    const loadCounties = async () => {
      try {
        setLoading(true);
        console.log('Loading counties and tasks...');
        const updatedCounties = await Promise.all(initialCounties.map(async (county) => {
          const tasks = await getCountyTasks(county.id);
          console.log(`Loaded ${tasks.length} tasks for ${county.name}`);
          return {
            ...county,
            tasks: tasks,
            taskCount: tasks.length
          };
        }));
        console.log('Updated counties with tasks:', updatedCounties);
        setCounties(updatedCounties);
      } catch (error) {
        console.error('Error loading counties:', error);
        setError('Failed to load counties');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCounties();
    }
  }, [isAuthenticated]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Task Management Functions
  const handleCreateTask = async () => {
    // Create temporary task ID outside try block
    const tempTaskId = `temp-${Date.now()}`;
    
    try {
      if (!selectedCounty) {
        setError('Please select a county first');
        return;
      }

      if (!taskTitle.trim()) {
        setError('Please enter a task title');
        return;
      }

      if (!taskDescription.trim()) {
        setError('Please enter a task description');
        return;
      }

      if (!taskDeadline) {
        setError('Please select a deadline');
        return;
      }

      if (!selectedUser) {
        setError('Please select a user to assign the task to');
        return;
      }
      
      const newTask = {
        id: tempTaskId,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        countyId: selectedCounty.id,
        assignedTo: [selectedUser],
        deadline: new Date(taskDeadline),
        status: 'pending' as const,
        priority: taskPriority,
        createdBy: user?.uid || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        completionDetails: {
          totalAssigned: 1,
          completed: 0,
          completedBy: []
        }
      };

      // Optimistically update the UI
      if (selectedCounty) {
        setSelectedCounty({
          ...selectedCounty,
          tasks: [...selectedCounty.tasks, newTask],
          taskCount: selectedCounty.taskCount + 1
        });
      }

      // Reset form immediately for better UX
      setTaskTitle('');
      setTaskDescription('');
      setTaskDeadline('');
      setTaskPriority('medium');
      setSelectedUser('');
      setShowReminderModal(false);
      setError(null);

      // Create task in Firebase
      console.log('Creating task with data:', newTask);
      const createdTask = await createTask(newTask);
      console.log('Task created successfully:', createdTask);

      // Update the task with the real ID from Firebase
      if (selectedCounty) {
        setSelectedCounty(prev => ({
          ...prev!,
          tasks: prev!.tasks.map(task => 
            task.id === tempTaskId ? { ...task, id: createdTask.id } : task
          )
        }));
      }

      // Refresh all counties data in the background
      refreshCounties();
    } catch (error) {
      // Revert optimistic update on error
      if (selectedCounty) {
        setSelectedCounty(prev => ({
          ...prev!,
          tasks: prev!.tasks.filter(task => task.id !== tempTaskId),
          taskCount: prev!.taskCount - 1
        }));
      }
      
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (!selectedCounty) return;
      
      // Optimistically update UI first
      const updatedTasks = selectedCounty.tasks.filter(task => task.id !== taskId);
      setSelectedCounty({
        ...selectedCounty,
        tasks: updatedTasks
      });
      
      // Then delete from Firebase
      await deleteTask(taskId);
      
      // Refresh all counties data in the background
      refreshCounties();
      
      setError(null);
    } catch (err) {
      // If there's an error, revert the optimistic update
      if (selectedCounty) {
        const originalTasks = await getCountyTasks(selectedCounty.id);
        setSelectedCounty({
          ...selectedCounty,
          tasks: originalTasks
        });
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      console.error('Error deleting task:', err);
    }
  };

  // Update the county card to show task count
  const getCountyTaskCount = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    return county?.taskCount || 0;
  };

  // Add a function to load county tasks
  const loadCountyTasks = async (county: County) => {
    try {
      setLoading(true);
      const tasks = await getCountyTasks(county.id);
      return {
        ...county,
        tasks: tasks
      };
    } catch (error) {
      console.error('Error loading county tasks:', error);
      setError('Failed to load tasks');
      return county;
    } finally {
      setLoading(false);
    }
  };

  // Modify the county selection handler
  const handleCountySelect = async (county: County) => {
    const updatedCounty = await loadCountyTasks(county);
    setSelectedCounty(updatedCounty);
  };

  // Add global task creation handler
  const handleCreateGlobalTask = async () => {
    // Create temporary task IDs outside try block
    const tempTaskIds = selectedCounties.map(() => `temp-${Date.now()}-${Math.random()}`);
    
    try {
      if (!taskTitle.trim()) {
        setError('Please enter a task title');
        return;
      }

      if (!taskDescription.trim()) {
        setError('Please enter a task description');
        return;
      }

      if (!taskDeadline) {
        setError('Please select a deadline');
        return;
      }

      if (selectedCounties.length === 0) {
        setError('Please select at least one county');
        return;
      }
      
      // Optimistically update the UI for each selected county
      setCounties(prevCounties => 
        prevCounties.map(county => {
          if (selectedCounties.includes(county.id)) {
            const tempTaskId = tempTaskIds[selectedCounties.indexOf(county.id)];
            const newTask = {
              id: tempTaskId,
              title: taskTitle.trim(),
              description: taskDescription.trim(),
              countyId: county.id,
              assignedTo: ['main'],
              deadline: new Date(taskDeadline),
              status: 'pending' as const,
              priority: taskPriority,
              createdBy: user?.uid || 'system',
              createdAt: new Date(),
              updatedAt: new Date(),
              completionDetails: {
                totalAssigned: 1,
                completed: 0,
                completedBy: []
              }
            };
            return {
              ...county,
              tasks: [...county.tasks, newTask],
              taskCount: county.taskCount + 1
            };
          }
          return county;
        })
      );

      // Reset form immediately for better UX
      setTaskTitle('');
      setTaskDescription('');
      setTaskDeadline('');
      setTaskPriority('medium');
      setSelectedCounties([]);
      setShowGlobalTaskModal(false);
      setError(null);

      // Create tasks in Firebase
      const createdTasks = await Promise.all(
        selectedCounties.map(async (countyId, index) => {
          const newTask = {
            title: taskTitle.trim(),
            description: taskDescription.trim(),
            countyId: countyId,
            assignedTo: ['main'],
            deadline: new Date(taskDeadline),
            status: 'pending' as const,
            priority: taskPriority,
            createdBy: user?.uid || 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            completionDetails: {
              totalAssigned: 1,
              completed: 0,
              completedBy: []
            }
          };
          return await createTask(newTask);
        })
      );

      // Update tasks with real IDs from Firebase
      setCounties(prevCounties =>
        prevCounties.map(county => {
          if (selectedCounties.includes(county.id)) {
            const index = selectedCounties.indexOf(county.id);
            return {
              ...county,
              tasks: county.tasks.map(task =>
                task.id === tempTaskIds[index] ? { ...task, id: createdTasks[index].id } : task
              )
            };
          }
          return county;
        })
      );

      // Refresh all counties data in the background
      refreshCounties();
    } catch (error) {
      // Revert optimistic updates on error
      setCounties(prevCounties =>
        prevCounties.map(county => {
          if (selectedCounties.includes(county.id)) {
            return {
              ...county,
              tasks: county.tasks.filter(task => !tempTaskIds.includes(task.id)),
              taskCount: county.taskCount - 1
            };
          }
          return county;
        })
      );

      console.error('Error creating global task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Add function to get all tasks across counties
  const getAllTasks = () => {
    const allTasks = counties.flatMap((county: County) => 
      county.tasks.map(task => ({
        ...task,
        countyName: county.name,
        countyId: county.id
      }))
    );

    // Group tasks by their ID to combine tasks from different counties
    const taskMap = new Map();
    allTasks.forEach(task => {
      if (taskMap.has(task.id)) {
        const existingTask = taskMap.get(task.id);
        taskMap.set(task.id, {
          ...existingTask,
          assignedCounties: [...existingTask.assignedCounties, { id: task.countyId, name: task.countyName }]
        });
      } else {
        taskMap.set(task.id, {
          ...task,
          assignedCounties: [{ id: task.countyId, name: task.countyName }]
        });
      }
    });

    return Array.from(taskMap.values());
  };

  // Add function to sort tasks
  const getSortedTasks = () => {
    const tasks = getAllTasks();
    return tasks.sort((a, b) => {
      if (taskSortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        return b.assignedCounties.length - a.assignedCounties.length;
      }
    });
  };

  // Authentication and Loading States
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // Main UI Structure
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Component */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Association of County Commissioners of Georgia</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>County Management & Compliance Portal</p>
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
                onClick={() => setShowGlobalTaskModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </span>
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <nav className="-mb-px flex space-x-8">
            {['overview', 'counties', 'tasks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? isDarkMode
                      ? 'border-indigo-400 text-indigo-400'
                      : 'border-indigo-500 text-indigo-600'
                    : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Statistics Overview */}
        {!selectedCounty && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Counties</h3>
                  <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>{counties.length}</p>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Tasks</h3>
                  <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {counties.reduce((acc, county) => acc + county.tasks.length, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Completion</h3>
                  <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {Math.round(counties.reduce((acc, county) => acc + county.completionRate, 0) / counties.length)}%
                  </p>
                </div>
              </div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm p-6 border hover:shadow-md transition-shadow`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Population</h3>
                  <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {counties.reduce((acc, county) => acc + county.population, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* County Grid */}
        {activeTab !== 'tasks' && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>County Management</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Select a county to view and manage tasks</p>
                </div>
                <div className="flex space-x-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search counties..."
                      className={`w-64 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border border-gray-300'
                      }`}
                      value={countySearch}
                      onChange={(e) => setCountySearch(e.target.value)}
                    />
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} absolute right-3 top-2.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* County Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {counties.map((county) => {
                  // Count active tasks (excluding completed ones)
                  const activeTaskCount = county.tasks.filter(task => task.status !== 'completed').length;
                  
                  return (
                    <div
                      key={county.id}
                      className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} p-6 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer`}
                      onClick={() => handleCountySelect(county)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{county.name}</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{county.region}</p>
                          <div className="mt-4 space-y-2">
                            <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Population: {county.population.toLocaleString()}
                            </div>
                            <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                              {activeTaskCount} Active Tasks
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            county.completionRate >= 75 ? 'bg-green-100 text-green-800' :
                            county.completionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {county.completionRate}% Complete
                          </span>
                          <button className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Tasks</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>View and manage all tasks across counties</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sort by:</span>
                    <select
                      value={taskSortBy}
                      onChange={(e) => setTaskSortBy(e.target.value as 'deadline' | 'counties')}
                      className={`rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border-gray-300'
                      } focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    >
                      <option value="deadline">Deadline</option>
                      <option value="counties">Number of Counties</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {getSortedTasks().map((task) => (
                  <div
                    key={task.id}
                    className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    } p-6 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {task.description}
                        </p>
                        <div className="mt-4">
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Assigned Counties:
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.assignedCounties?.map((county: AssignedCounty) => (
                              <span
                                key={county.id}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  isDarkMode 
                                    ? 'bg-indigo-900 text-indigo-200' 
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {county.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-3 ml-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowReminderModal(true);
                            }}
                            className={`text-sm font-medium ${
                              isDarkMode 
                                ? 'text-indigo-400 hover:text-indigo-300' 
                                : 'text-indigo-600 hover:text-indigo-500'
                            }`}
                          >
                            Set Reminders
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this task?')) {
                                handleDeleteTask(task.id);
                              }
                            }}
                            className={`text-sm font-medium ${
                              isDarkMode 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-red-600 hover:text-red-500'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : task.status === 'in_progress' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Priority: {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {getSortedTasks().length === 0 && (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No tasks found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Components */}
      {/* Various modals for task creation and management */}
      {/* Selected County Tasks Modal */}
      {selectedCounty && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedCounty.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedCounty.region} • Population: {selectedCounty.population.toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowReminderModal(true);
                      setSelectedTask(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create New Task
                  </button>
                  <button
                    onClick={() => setSelectedCounty(null)}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {selectedCounty.tasks.length > 0 ? (
                <div className="space-y-4">
                  {selectedCounty.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700">Assigned To:</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {task.assignedTo.map((person) => (
                                <span
                                  key={person}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                >
                                  {person}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setShowReminderModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                            >
                              Set Reminders
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this task?')) {
                                  handleDeleteTask(task.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-500 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active tasks for this county</p>
                  <button
                    onClick={() => {
                      setShowReminderModal(true);
                      setSelectedTask(null);
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Create First Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder/Task Creation Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedTask ? 'Set Reminders for Task' : 'Create New Task'}
              </h3>
            </div>
            <div className="p-6">
              {selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reminder Frequency</label>
                    <select 
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={newTask.reminderFrequency}
                      onChange={(e) => setNewTask(prev => ({ ...prev, reminderFrequency: e.target.value as any }))}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Task Title</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter task title..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter task description..."
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assign To</label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="">Select a user</option>
                      <option value="daksh_sharma_id">Daksh Sharma (shahdrew6@gmail.com)</option>
                    </select>
                  </div>
                </div>
              )}
              {error && (
                <div className="mt-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : (selectedTask ? 'Set Reminder' : 'Create Task')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Task Creation Modal */}
      {showGlobalTaskModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create Global Task</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter task title..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter task description..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">Select Counties</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search counties..."
                      value={countySearch}
                      onChange={(e) => {
                        setCountySearch(e.target.value);
                        setShowCountyDropdown(true);
                      }}
                      onFocus={() => setShowCountyDropdown(true)}
                    />
                    {showCountyDropdown && countySearch && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        {filteredCounties.map((county) => (
                          <div
                            key={county.id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                            onClick={() => {
                              if (!selectedCounties.includes(county.id)) {
                                setSelectedCounties([...selectedCounties, county.id]);
                              }
                              setCountySearch('');
                              setShowCountyDropdown(false);
                            }}
                          >
                            <span className="block truncate">{county.name}</span>
                          </div>
                        ))}
                        {filteredCounties.length === 0 && (
                          <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                            No counties found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Selected Counties */}
                  {selectedCounties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCounties.map((countyId) => {
                        const county = counties.find(c => c.id === countyId);
                        return county ? (
                          <span
                            key={countyId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {county.name}
                            <button
                              type="button"
                              className="ml-2 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none"
                              onClick={() => setSelectedCounties(selectedCounties.filter(id => id !== countyId))}
                            >
                              <span className="sr-only">Remove county</span>
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
              {error && (
                <div className="mt-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowGlobalTaskModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGlobalTask}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateAgencyDashboard; 