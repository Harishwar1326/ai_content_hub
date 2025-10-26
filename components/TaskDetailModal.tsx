
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { ContentItem, Subtask } from '../types';
import { PlusIcon, SparklesIcon, TrashIcon } from './IconComponents';
import { ContentWeaverModal } from './ContentWeaverModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
  onUpdateItem: (updates: Partial<ContentItem>) => void;
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, item, onUpdateItem, onUpdateSubtask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isWeaverOpen, setIsWeaverOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
    }
  }, [item]);

  if (!item) return null;

  const handleBlur = (field: 'title' | 'description') => {
    const value = field === 'title' ? title : description;
    if (value !== item[field]) {
      onUpdateItem({ [field]: value });
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: `sub-${Date.now()}`,
        title: newSubtask.trim(),
        completed: false,
      };
      onUpdateItem({ subtasks: [...item.subtasks, subtask] });
      setNewSubtask('');
    }
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    onUpdateItem({ subtasks: item.subtasks.filter(st => st.id !== subtaskId) });
  };

  const handleWeaverComplete = (newDescription: string) => {
    setDescription(newDescription);
    onUpdateItem({ description: newDescription });
  };

  const isTask = item.type === 'task';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isTask ? "Task Details" : "Note Details"}>
        <div className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            className="w-full text-2xl font-bold bg-transparent focus:outline-none text-gray-100 border-b-2 border-gray-700 focus:border-teal-500 transition-colors py-2"
          />
          
          <div>
            <label className="text-sm font-semibold text-gray-400">Description</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleBlur('description')}
                placeholder={isTask ? "Add more details about this task..." : "Add content to this note..."}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                rows={4}
              />
              <button
                onClick={() => setIsWeaverOpen(true)}
                className="absolute bottom-2 right-2 p-1.5 bg-gray-700 text-teal-400 rounded-full hover:bg-gray-600 transition-colors"
                title="Rewrite with Content Weaver AI"
              >
                <SparklesIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {isTask && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Subtasks</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {item.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center space-x-3 bg-gray-900 p-2 rounded-md">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => onUpdateSubtask(subtask.id, { completed: !subtask.completed })}
                      className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500"
                    />
                    <span className={`flex-grow text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-3 space-x-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Add a new subtask"
                  className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-1 px-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button onClick={handleAddSubtask} className="p-2 bg-teal-600 rounded-md hover:bg-teal-700">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs font-medium text-cyan-200 bg-cyan-900 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
      
      <ContentWeaverModal
        isOpen={isWeaverOpen}
        onClose={() => setIsWeaverOpen(false)}
        initialText={description}
        onComplete={handleWeaverComplete}
      />
    </>
  );
};
