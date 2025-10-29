// FIX: Providing the full implementation for the main App component.
import React, { useState, useCallback } from 'react';
import { useTaskManager } from './hooks/useTaskManager';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { SmartAddModal } from './components/SmartAddModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { BrainstormView } from './components/BrainstormView';
import { CollaborationReportModal } from './components/CollaborationReportModal'; // New Import
import { ContentItem, Subtask } from './types';

type View = 'tasks' | 'brainstorm';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for testing
  const [isSmartAddOpen, setIsSmartAddOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCollaborationReportOpen, setIsCollaborationReportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [currentView, setCurrentView] = useState<View>('tasks');
  
  // Add this console.log to help debug
  console.log('App rendering, isLoggedIn:', isLoggedIn);

  const {
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
    updateSubtask, // This was missing a comma
    deleteList,
    editList
  } = useTaskManager();

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const handleSmartAdd = useCallback((itemData: Partial<ContentItem>) => {
    (async () => {
      // If itemData includes a folder, try to add to that folder (create if needed)
      const folderName = (itemData as any).folder;
      if (folderName && typeof folderName === 'string' && folderName.trim().length > 0) {
        // Try to find existing list
        const existing = taskLists.find(t => t.name === folderName.trim());
        let targetId = existing ? existing.id : null;
        if (!targetId) {
          // create new list on server + locally
          targetId = await addList(folderName.trim());
        }
        if (targetId) addItem(targetId, itemData);
        return;
      }

      if (activeListId) {
        addItem(activeListId, itemData);
      }
    })();
  }, [addItem, activeListId, taskLists, addList]);

  const handleCreateItem = useCallback(async (data: any) => {
    // data contains title, content (description), type, folder, subtasks
    const folderName = data.folder;
    if (folderName && typeof folderName === 'string' && folderName.trim().length > 0) {
      const existing = taskLists.find(t => t.name === folderName.trim());
      let targetId = existing ? existing.id : null;
      if (!targetId) {
        targetId = await addList(folderName.trim());
      }
      if (targetId) {
        await addItem(targetId, {
          title: data.title,
          description: data.content || data.description || '',
          type: (data.type || 'note').toLowerCase(),
          subtasks: data.subtasks || [],
          tags: data.tags || [],
          dueDate: data.dueDate,
          folder: folderName,
        });
      }
      return;
    }

    if (activeListId) {
      await addItem(activeListId, {
        title: data.title,
        description: data.content || data.description || '',
        type: (data.type || 'note').toLowerCase(),
        subtasks: data.subtasks || [],
        tags: data.tags || [],
        dueDate: data.dueDate,
      });
    }
  }, [taskLists, addList, addItem, activeListId]);

  const handleUpdateItem = useCallback((updates: Partial<ContentItem>) => {
    if (activeListId && selectedItem) {
      updateItem(activeListId, selectedItem.id, updates);
      // Also update the selected item state to reflect changes immediately
      setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [updateItem, activeListId, selectedItem]);
  
  const handleDeleteItem = useCallback((itemId: string) => {
    if (activeListId) {
      deleteItem(activeListId, itemId);
    }
  }, [deleteItem, activeListId]);

  const handleUpdateSubtask = useCallback((subtaskId: string, updates: Partial<Subtask>) => {
      if (activeListId && selectedItem) {
          updateSubtask(activeListId, selectedItem.id, subtaskId, updates);
          // Update local state for immediate feedback
          setSelectedItem(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  subtasks: prev.subtasks.map(st => st.id === subtaskId ? { ...st, ...updates } : st)
              }
          });
      }
  }, [updateSubtask, activeListId, selectedItem]);


  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };
  
  const handleAddIdeaAsNote = useCallback((title: string) => {
    if (activeListId) {
      addItem(activeListId, {
        title,
        type: 'note',
        description: 'Generated from Brainstorm session.'
      });
      setCurrentView('tasks'); // Switch back to tasks view after adding
    }
  }, [addItem, activeListId]);


  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Sidebar
        taskLists={taskLists}
        activeListId={activeListId}
        onSelectList={selectList}
        onAddList={addList}
        onEditList={editList}
        onDeleteList={deleteList}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header 
            onLogout={handleLogout} 
            onSmartAdd={() => setIsSmartAddOpen(true)}
            users={users}
            currentUser={currentUser}
            onSetCurrentUser={setCurrentUser}
        />
        <main className="flex-1 overflow-y-auto bg-gray-800">
            <div className="border-b border-gray-700">
                <nav className="flex space-x-4 px-6" aria-label="Tabs">
                    <button
                        onClick={() => setCurrentView('tasks')}
                        className={`${currentView === 'tasks' ? 'border-teal-400 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Hub Content
                    </button>
                    <button
                        onClick={() => setCurrentView('brainstorm')}
                        className={`${currentView === 'brainstorm' ? 'border-teal-400 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Brainstorm
                    </button>
                </nav>
            </div>
          {currentView === 'tasks' ? (
         <TaskList
           list={activeList}
           users={users}
           onCreateItem={handleCreateItem}
           onUpdateItem={(itemId, updates) => updateItem(activeListId!, itemId, updates)}
           onDeleteItem={handleDeleteItem}
           onSelectItem={handleSelectItem}
           onAnalyzeHub={() => setIsCollaborationReportOpen(true)}
         />
          ) : (
            <div className="p-6">
                <BrainstormView onAddIdeaAsNote={handleAddIdeaAsNote} />
            </div>
          )}
        </main>
      </div>

      <SmartAddModal
        isOpen={isSmartAddOpen}
        onClose={() => setIsSmartAddOpen(false)}
        onAddItem={handleSmartAdd}
      />
      
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedItem(null);
        }}
        item={selectedItem}
        onUpdateItem={handleUpdateItem}
        onUpdateSubtask={handleUpdateSubtask}
      />

      <CollaborationReportModal 
        isOpen={isCollaborationReportOpen}
        onClose={() => setIsCollaborationReportOpen(false)}
        hub={activeList}
        users={users}
      />

    </div>
  );
}

export default App;
