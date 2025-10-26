// FIX: Providing the full implementation for the TaskItem component.
import React from 'react';
import { ContentItem, User } from '../types';
import { TrashIcon } from './IconComponents';

interface TaskItemProps {
  item: ContentItem;
  creator?: User;
  onUpdateItem: (updates: Partial<ContentItem>) => void;
  onDeleteItem: () => void;
  onSelectItem: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ item, creator, onUpdateItem, onDeleteItem, onSelectItem }) => {
  const isTask = item.type === 'task';
  const subtaskProgress = isTask ? item.subtasks.filter(st => st.completed).length : 0;
  const totalSubtasks = isTask ? item.subtasks.length : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem();
  };

  return (
    <div
      onClick={onSelectItem}
      className="flex items-start p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition-colors border border-gray-700 space-x-4"
    >
      {isTask && (
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={(e) => {
              e.stopPropagation();
              onUpdateItem({ completed: !item.completed });
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 text-teal-600 bg-gray-900 border-gray-600 rounded focus:ring-teal-500 focus:ring-2"
          />
        </div>
      )}
      <div className="flex-grow">
        <p className={`font-semibold ${item.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-sm text-gray-400 mt-1 truncate">
            {item.description}
          </p>
        )}
        {isTask && totalSubtasks > 0 && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
            <span>{subtaskProgress} / {totalSubtasks} subtasks</span>
            <div className="w-full bg-gray-600 rounded-full h-1.5">
              <div
                className="bg-teal-500 h-1.5 rounded-full"
                style={{ width: `${totalSubtasks > 0 ? (subtaskProgress / totalSubtasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-medium text-cyan-200 bg-cyan-900 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex items-center space-x-2">
        {creator && (
            <div title={`Created by ${creator.name}`} className={`w-6 h-6 rounded-full ${creator.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                {creator.name.charAt(0)}
            </div>
        )}
        <button onClick={handleDelete} className="text-gray-500 hover:text-red-400 transition-colors p-1">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
