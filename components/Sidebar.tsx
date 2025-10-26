
import React, { useState } from 'react';
import { TaskList } from '../types';
import { PlusIcon } from './IconComponents';

interface SidebarProps {
  taskLists: TaskList[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onAddList: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  taskLists,
  activeListId,
  onSelectList,
  onAddList,
}) => {
  const [newListName, setNewListName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddList = () => {
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewListName('');
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col border-r border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">Task Lists</h2>
      <nav className="flex-grow">
        <ul>
          {taskLists.map((list) => (
            <li key={list.id}>
              <button
                onClick={() => onSelectList(list.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeListId === list.id
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {list.name}
              </button>
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
