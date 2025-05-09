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