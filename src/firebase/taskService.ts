import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  serverTimestamp,
  deleteDoc 
} from 'firebase/firestore';
import { db, auth } from './config';
import { httpsCallable } from 'firebase/functions';
import { functions } from './config';
import { getFunctions } from 'firebase/functions';

export interface County {
  id: string;
  name: string;
  population: number;
  region: string;
  tasks: Task[];
  completionRate: number;
  taskCount: number;
}

export interface Task {
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

// Default user data
const DEFAULT_USER = {
  id: 'daksh_sharma_id',
  name: 'Daksh Sharma',
  email: 'shahdrew6@gmail.com', // Demo email
  role: 'admin',
  organization: 'ACCG'
};

// Create a new task
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  try {
    console.log('Starting task creation with data:', task);
    
    // Validate required fields
    if (!task.title || !task.countyId || !task.assignedTo || task.assignedTo.length === 0) {
      throw new Error('Missing required fields for task creation');
    }

    const taskData = {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastReminderSent: serverTimestamp(),
      reminderFrequency: 'Daily' // Set default reminder frequency
    };

    console.log('Adding task to Firestore:', taskData);
    const taskRef = await addDoc(collection(db, 'tasks'), taskData);
    console.log('Task document created with ID:', taskRef.id);

    const newTask = {
      id: taskRef.id,
      ...task
    };

    // TODO: Implement email notification
    // const functions = getFunctions();
    // const sendNotification = httpsCallable(functions, 'sendTaskNotification');
    // await sendNotification({...});

    return newTask;
  } catch (error) {
    console.error('Error in createTask:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create task');
  }
};

// Get tasks for a specific county
export const getCountyTasks = async (countyId: string): Promise<Task[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to view tasks');
    }

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('countyId', '==', countyId)
    );

    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline?.toDate(),
        assignedTo: data.assignedTo || [],
        countyId: data.countyId,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        completionDetails: {
          totalAssigned: data.assignedTo?.length || 0,
          completed: 0,
          completedBy: []
        }
      } as Task;
    });
  } catch (error) {
    console.error('Error getting county tasks:', error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update tasks');
    }

    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

// Get the default user (Daksh Sharma)
export const getDefaultUser = async () => {
  try {
    console.log('Getting default user...');
    const q = query(
      collection(db, 'users'),
      where('name', '==', 'Daksh Sharma')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query result:', querySnapshot.empty ? 'No user found' : 'User found');

    if (querySnapshot.empty) {
      console.log('Creating default user...');
      // If user doesn't exist, create it
      const userData = {
        name: 'Daksh Sharma',
        email: 'shahdrew6@gmail.com', // Demo email
        role: 'admin',
        organization: 'ACCG',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'users'), userData);
      console.log('Default user created with ID:', docRef.id);
      return { id: docRef.id, ...userData };
    }
    
    const userDoc = querySnapshot.docs[0];
    console.log('Retrieved default user:', userDoc.id);
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error in getDefaultUser:', error);
    throw error;
  }
};

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to view users');
    }

    const usersQuery = query(
      collection(db, 'users'),
      where('role', 'in', ['county', 'state'])
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      // If no users exist, create a default user
      const defaultUser = await getDefaultUser();
      return [defaultUser];
    }

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      email: doc.data().email || '',
      role: doc.data().role || '',
      organization: doc.data().organization || ''
    })) as User[];
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to fetch users. Please try again.');
  }
};

// Get tasks assigned to the default user
export const getMyTasks = async () => {
  try {
    const defaultUser = await getDefaultUser();
    const q = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', defaultUser.id)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Task[];
  } catch (error) {
    console.error('Error getting user tasks:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete tasks');
    }

    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get task count for a county
export const getCountyTaskCount = async (countyId: string): Promise<number> => {
  try {
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('countyId', '==', countyId)
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting county task count:', error);
    throw error;
  }
};

// Update task count for a county
export const updateCountyTaskCount = async (countyId: string, count: number): Promise<void> => {
  try {
    const countyRef = doc(db, 'counties', countyId);
    await updateDoc(countyRef, {
      taskCount: count,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating county task count:', error);
    throw error;
  }
};

// Get all counties with their task counts
export const getCountiesWithTaskCounts = async (): Promise<County[]> => {
  try {
    const countiesQuery = query(collection(db, 'counties'));
    const querySnapshot = await getDocs(countiesQuery);
    
    const counties = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const taskCount = await getCountyTaskCount(doc.id);
      
      return {
        id: doc.id,
        name: data.name,
        population: data.population,
        region: data.region,
        tasks: [],
        completionRate: data.completionRate || 0,
        taskCount: taskCount
      };
    }));

    return counties;
  } catch (error) {
    console.error('Error getting counties with task counts:', error);
    throw error;
  }
}; 