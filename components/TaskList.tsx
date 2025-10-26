// FIX: Providing the full implementation for the TaskList component.
import React, { useState, useMemo } from 'react';
import { TaskList as TaskListType, ContentItem, User } from '../types';
import { TaskItem } from './TaskItem';
import { UsersIcon } from './IconComponents';

interface TaskListProps {
  list: TaskListType | undefined;
  users: User[];
  onUpdateItem: (itemId: string, updates: Partial<ContentItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onSelectItem: (item: ContentItem) => void;
  onAnalyzeHub: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ list, users, onUpdateItem, onDeleteItem, onSelectItem, onAnalyzeHub }) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  const allTags = useMemo(() => {
    if (!list) return [];
    const tagsSet = new Set<string>();
    list.items.forEach(item => {
      item.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [list]);

  const filteredItems = useMemo(() => {
    if (!list) return [];
    if (!activeTag) return list.items;
    return list.items.filter(item => item.tags?.includes(activeTag));
  }, [list, activeTag]);

  if (!list) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold">Select a list</h2>
        <p>Choose a list from the sidebar or create a new one to get started.</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-white">{list.name}</h2>
        {list.items.length > 0 && (
          <button onClick={onAnalyzeHub} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors">
            <UsersIcon className="w-5 h-5 mr-2" />
            Analyze Hub
          </button>
        )}
      </div>
      
      {allTags.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Smart Filters</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                !activeTag ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeTag === tag ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 overflow-y-auto flex-grow">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <TaskItem
              key={item.id}
              item={item}
              creator={userMap.get(item.createdBy)}
              onUpdateItem={(updates) => onUpdateItem(item.id, updates)}
              onDeleteItem={() => onDeleteItem(item.id)}
              onSelectItem={() => onSelectItem(item)}
            />
          ))
        ) : (
          <div className="text-center py-16 px-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
            <h3 className="text-xl font-semibold text-gray-300">
              {activeTag ? `No items with tag "${activeTag}"` : 'This Hub is empty'}
            </h3>
            <p className="text-gray-500 mt-2">
              Use "Smart Add" to add your first task or note.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
