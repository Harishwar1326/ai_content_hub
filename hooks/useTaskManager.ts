import { useState, useEffect, useCallback } from 'react';
import { TaskList, ContentItem, Subtask, User } from '../types';

const LOCAL_STORAGE_KEY = 'ai-task-manager-data';

const initialUsers: User[] = [
    { id: 'user-1', name: 'Alex', avatarColor: 'bg-teal-500' },
    { id: 'user-2', name: 'Brenda', avatarColor: 'bg-purple-500' },
    { id: 'user-3', name: 'Charlie', avatarColor: 'bg-orange-500' },
];

const getInitialData = (): TaskList[] => {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error reading from localStorage', error);
  }
  return [
    {
      id: 'list-1',
      name: 'Project Phoenix Launch',
      items: [
        { id: 'task-1', type: 'task', title: 'Draft initial marketing plan', description: 'Focus on social media outreach and key messaging.', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-1', tags: ['#marketing', '#planning'] },
        { id: 'task-2', type: 'task', title: 'Develop core software features', description: 'User authentication and data processing pipeline are top priority.', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-2', tags: ['#development', '#backend'] },
        { id: 'task-3', type: 'note', title: 'Ideas for launch event', description: 'Maybe a webinar or a live demo session?', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-3', tags: ['#marketing', '#ideas'] },
        { id: 'task-4', type: 'task', title: 'Plan Twitter campaign', description: 'Schedule tweets for the week leading up to launch.', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-1', tags: ['#social-media', '#marketing'] },
      ],
    },
  ];
};

export const useTaskManager = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>(getInitialData);
  const [activeListId, setActiveListId] = useState<string | null>(taskLists[0]?.id || null);
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(taskLists));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [taskLists]);
  
  const activeList = taskLists.find(list => list.id === activeListId);

  const selectList = (listId: string) => {
    setActiveListId(listId);
  };
  
  const addList = (name: string) => {
    const newList: TaskList = {
      id: `list-${Date.now()}`,
      name,
      items: [],
    };
    setTaskLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
  };
  
  const addItem = useCallback((listId: string, itemData: Partial<ContentItem>) => {
    const newItem: ContentItem = {
      id: `item-${Date.now()}`,
      type: 'task',
      title: 'New Item',
      description: '',
      completed: false,
      subtasks: [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      tags: [],
      ...itemData,
    };

    setTaskLists(prev => 
      prev.map(list => 
        list.id === listId ? { ...list, items: [newItem, ...list.items] } : list
      )
    );
  }, [currentUser.id]);

  const updateItem = useCallback((listId: string, itemId: string, updates: Partial<ContentItem>) => {
    setTaskLists(prev => 
      prev.map(list => 
        list.id === listId ? {
          ...list,
          items: list.items.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          ),
        } : list
      )
    );
  }, []);
  
  const deleteItem = useCallback((listId: string, itemId: string) => {
    setTaskLists(prev => 
      prev.map(list => 
        list.id === listId ? {
          ...list,
          items: list.items.filter(item => item.id !== itemId),
        } : list
      )
    );
  }, []);
  
  const updateSubtask = useCallback((listId: string, itemId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setTaskLists(prev =>
      prev.map(list => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.map(item => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              subtasks: item.subtasks.map(subtask =>
                subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
              ),
            };
          }),
        };
      })
    );
  }, []);

  return {
    taskLists,
    activeList,
    activeListId,
    users,
    currentUser,
    setCurrentUser,
    selectList,
    addList,
    addItem,
    updateItem,
    deleteItem,
    updateSubtask
  };
};
