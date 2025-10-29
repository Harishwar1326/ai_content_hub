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
        { id: 'task-1', type: 'task', title: 'Draft initial marketing plan', description: 'Focus on social media outreach and key messaging.', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-1', tags: ['#marketing', '#planning'], folder: 'Project Phoenix Launch' },
        { id: 'task-2', type: 'task', title: 'Develop core software features', description: 'User authentication and data processing pipeline are top priority.', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-2', tags: ['#development', '#backend'], folder: 'Project Phoenix Launch' },
        { id: 'task-3', type: 'note', title: 'Ideas for launch event', description: 'Maybe a webinar or a live demo session?', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-3', tags: ['#marketing', '#ideas'], folder: 'Project Phoenix Launch' },
        { id: 'task-4', type: 'task', title: 'Plan Twitter campaign', description: 'Schedule tweets for the week leading up to launch.', completed: false, subtasks: [], createdAt: new Date().toISOString(), createdBy: 'user-1', tags: ['#social-media', '#marketing'], folder: 'Project Phoenix Launch' },
      ],
    },
  ];
};

export const useTaskManager = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>(getInitialData);
  const [activeListId, setActiveListId] = useState<string | null>(taskLists[0]?.id || null);
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const deleteList = useCallback(async (listId: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete list on server');
      }

      setTaskLists(prevLists => {
        const filteredLists = prevLists.filter(list => list.id !== listId);
        // If we're deleting the active list, select the first available list or null
        if (activeListId === listId) {
          setActiveListId(filteredLists[0]?.id || null);
        }
        return filteredLists;
      });
    } catch (err) {
      console.error('Failed to delete list:', err);
      // You could add an error notification for the user here
    }
  }, [activeListId]);

  const editList = useCallback((listId: string, newName: string) => {
    setTaskLists(prevLists => {
      return prevLists.map(list => {
        if (list.id === listId) {
          // Update folder name in items as well
          const updatedItems = list.items.map(item => ({
            ...item,
            folder: newName
          }));
          return {
            ...list,
            name: newName,
            items: updatedItems
          };
        }
        return list;
      });
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(taskLists));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [taskLists]);

  // Fetch lists from backend on mount to reflect server-side folders
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/lists');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Map server lists to frontend TaskList shape if necessary
          const mapped = data.map((l: any) => {
            const items = (l.items || []).map((it: any) => ({
              id: it._id || it.id,
              type: it.type || 'note',
              title: it.title,
              description: it.description || '',
              completed: !!it.completed,
              subtasks: (it.subtasks || []).map((s: any) => ({ id: s._id || s.id || `sub-${Date.now()}`, title: s.title, completed: !!s.completed })),
              createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : new Date().toISOString(),
              createdBy: it.createdBy || 'system',
              tags: it.tags || [],
              dueDate: it.dueDate ? new Date(it.dueDate).toISOString() : undefined,
            }));
            return { id: l._id || l.id, name: l.name, items };
          });
          setTaskLists(mapped);

          // Always set the active list to the first one from the server on initial load
          setActiveListId(data[0]?._id || data[0]?.id || null);
        }
      } catch (err) {
        console.error('Failed to load lists from backend', err);
      }
    };
    load();
  }, []);
  
  const activeList = taskLists.find(list => list.id === activeListId);

  const selectList = useCallback((listId: string) => {
    setActiveListId(listId);
  }, []);
  
  const addList = useCallback(async (name: string) => {
    try {
      const res = await fetch('/api/lists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const created = await res.json();
      const newList: TaskList = { id: created._id || created.id, name: created.name, items: (created.items || []).map((it: any) => ({ id: it._id || it.id, type: it.type || 'note', title: it.title, description: it.description || '', completed: !!it.completed, subtasks: (it.subtasks || []).map((s: any) => ({ id: s._id || s.id || `sub-${Date.now()}`, title: s.title, completed: !!s.completed })), createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : new Date().toISOString(), createdBy: it.createdBy || 'system', tags: it.tags || [] })) };
      setTaskLists(prev => [...prev, newList]);
      setActiveListId(newList.id);
      return newList.id;
    } catch (err) {
      console.error('Failed to create list on server', err);
      // fallback locally
      const newList: TaskList = { id: `list-${Date.now()}`, name, items: [] };
      setTaskLists(prev => [...prev, newList]);
      setActiveListId(newList.id);
      return newList.id;
    }
  }, []);
  
  const addItem = useCallback(async (listId: string, itemData: Partial<ContentItem>) => {
    // If listId is actually a folder name (client may pass folder instead), try to find list
    try {
      const payload = { ...itemData } as any;
      // Post to server to add item under listId
      const res = await fetch(`/api/lists/${listId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        // If server returns 404 (list not found), try to create list then add
        if (res.status === 404 && itemData && (itemData as any).folder) {
          const folderName = (itemData as any).folder;
          const createRes = await fetch('/api/lists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: folderName }) });
          const created = await createRes.json();
          const newListId = created._id || created.id;
          const retry = await fetch(`/api/lists/${newListId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (retry.ok) {
            // refresh lists
            const listsRes = await fetch('/api/lists');
            const listsData = await listsRes.json();
            const mapped = listsData.map((l: any) => {
              const items = (l.items || []).map((it: any) => ({
                id: it._id || it.id,
                type: it.type || 'note',
                title: it.title,
                description: it.description || '',
                completed: !!it.completed,
                subtasks: (it.subtasks || []).map((s: any) => ({ 
                  id: s._id || s.id || `sub-${Date.now()}`, 
                  title: s.title, 
                  completed: !!s.completed 
                })),
                createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : new Date().toISOString(),
                createdBy: it.createdBy || 'system',
                tags: it.tags || [],
                folder: it.folder || l.name,
              }));
              return { id: l._id || l.id, name: l.name, items };
            });
            setTaskLists(mapped);
            return;
          }
        }
        throw new Error('Failed to add item');
      }

      const createdItem = await res.json();
      // Update local state by inserting into the matching list
      setTaskLists(prev => prev.map(list => list.id === listId ? { ...list, items: [{ id: createdItem._id || createdItem.id, type: createdItem.type || 'note', title: createdItem.title, description: createdItem.description || '', completed: !!createdItem.completed, subtasks: (createdItem.subtasks || []).map((s: any) => ({ id: s._id || s.id || `sub-${Date.now()}`, title: s.title, completed: !!s.completed })), createdAt: createdItem.createdAt ? new Date(createdItem.createdAt).toISOString() : new Date().toISOString(), createdBy: createdItem.createdBy || 'system', tags: createdItem.tags || [] }, ...list.items ] } : list ));
    } catch (err) {
      console.error('Failed to add item via server, falling back to local', err);
      const newItem: ContentItem = {
        id: `item-${Date.now()}`,
        type: (itemData.type as 'task' | 'note') || 'task',
        title: itemData.title || 'New Item',
        description: itemData.description || '',
        completed: false,
        subtasks: itemData.subtasks || [],
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        tags: itemData.tags || [],
        folder: (itemData as any).folder || 'Default',
      };
      setTaskLists(prev => prev.map(list => list.id === listId ? { ...list, items: [newItem, ...list.items] } : list));
    }
  }, [currentUser.id]);

  const updateItem = useCallback(async (listId: string, itemId: string, updates: Partial<ContentItem>) => {
    try {
      // Update on server first
      const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        throw new Error('Failed to update item on server');
      }

      const updatedItem = await res.json();

      // Update local state after successful server update
      setTaskLists(prev => 
        prev.map(list => 
          list.id === listId ? {
            ...list,
            items: list.items.map(item => 
              item.id === itemId ? {
                ...item,
                ...updatedItem,
                type: updatedItem.type || item.type,
                folder: updatedItem.folder || item.folder,
                createdAt: updatedItem.createdAt ? new Date(updatedItem.createdAt).toISOString() : item.createdAt,
                subtasks: (updatedItem.subtasks || []).map((s: any) => ({
                  id: s._id || s.id || `sub-${Date.now()}`,
                  title: s.title,
                  completed: !!s.completed
                }))
              } : item
            ),
          } : list
        )
      );
    } catch (err) {
      console.error('Failed to update item:', err);
      // Optimistically update local state
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
    }
  }, []);
  
  const deleteItem = useCallback(async (listId: string, itemId: string) => {
    try {
      // Delete on server first
      const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete item on server');
      }

      // Update local state after successful server delete
      setTaskLists(prev => 
        prev.map(list => 
          list.id === listId ? {
            ...list,
            items: list.items.filter(item => item.id !== itemId),
          } : list
        )
      );
    } catch (err) {
      console.error('Failed to delete item:', err);
      // Optimistically update local state
      setTaskLists(prev => 
        prev.map(list => 
          list.id === listId ? {
            ...list,
            items: list.items.filter(item => item.id !== itemId),
          } : list
        )
      );
    }
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
    activeList: taskLists.find(list => list.id === activeListId) || null,
    activeListId,
    users,
    currentUser,
    setCurrentUser,
    selectList,
    addList,
    addItem,
    updateItem,
    deleteItem,
    deleteList,
    updateSubtask,
    editList
  };
};
