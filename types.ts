export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface ContentItem {
  id: string;
  type: 'task' | 'note';
  title: string;
  description: string;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: string;
  createdBy: User['id'];
  dueDate?: string;
  tags?: string[];
}

export interface TaskList {
  id:string;
  name: string;
  items: ContentItem[];
}
