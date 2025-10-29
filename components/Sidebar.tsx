import React, { useState } from 'react';
import { TaskList } from '../types';
import { PlusIcon } from './IconComponents';

interface SidebarProps {
  taskLists: TaskList[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onAddList: (name: string) => void;
  onEditList?: (listId: string, newName: string) => void;
  onDeleteList?: (listId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  taskLists,
  activeListId,
  onSelectList,
  onAddList,
  onEditList,
  onDeleteList,
}) => {
  const [newListName, setNewListName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddList = () => {
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
      setIsAdding(false);
    }
  };

  const handleEditList = (listId: string) => {
    const list = taskLists.find(l => l.id === listId);
    if (list) {
      setEditingListId(listId);
      setEditingName(list.name);
    }
  };

  const handleSaveEdit = (listId: string) => {
    if (editingName.trim() && onEditList) {
      onEditList(listId, editingName.trim());
    }
    setEditingListId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, isEditing: boolean = false, listId?: string) => {
    if (e.key === 'Enter') {
      if (isEditing && listId) {
        handleSaveEdit(listId);
      } else {
        handleAddList();
      }
    } else if (e.key === 'Escape') {
      if (isEditing) {
        setEditingListId(null);
        setEditingName('');
      } else {
        setIsAdding(false);
        setNewListName('');
      }
    }
  };

  return (
    <aside className="w-64 min-w-[16rem] max-w-[16rem] bg-gray-900 text-white p-4 flex flex-col border-r border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">Task Lists</h2>
      <nav className="flex-grow">
        <ul className="space-y-1">
          {taskLists.map((list) => (
            <li key={list.id} className="group">
              {editingListId === list.id ? (
                <div className="px-3 py-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, true, list.id)}
                    onBlur={() => handleSaveEdit(list.id)}
                    autoFocus
                    className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              ) : (
                <div onClick={() => onSelectList(list.id)} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  activeListId === list.id
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}>
                  <span className="flex-1 truncate" title={list.name}>
                    {list.name}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditList && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditList(list.id); }}
                        className="hover:text-white"
                        title="Edit folder name"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" /><path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                    )}
                    {onDeleteList && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this folder?')) {
                            onDeleteList(list.id);
                          }
                        }}
                        className="hover:text-red-500"
                        title="Delete folder"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div>
        {isAdding ? (
          <div className="mt-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => setIsAdding(false)}
              placeholder="New list name"
              autoFocus
              className="w-full bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center mt-4 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add New List
          </button>
        )}
      </div>
    </aside>
  );
};