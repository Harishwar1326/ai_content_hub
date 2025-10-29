import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface SubTask {
  text: string;
  completed: false;
}

export interface ContentData {
  type: 'Task' | 'Note';
  title: string;
  content: string;
  folder: string;
  subtasks: SubTask[];
}

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContentData) => void;
}

export function CreateContentModal({ isOpen, onClose, onSave }: CreateContentModalProps) {
  const [type, setType] = useState<'Task' | 'Note'>('Note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Array<{ text: string; completed: false }>>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [error, setError] = useState('');

  // Fetch available folders
  useEffect(() => {
    if (isOpen) {
      fetch('/api/folders')
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.folders)) setFolders(data.folders);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { text: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    onSave({
      type,
      title: title.trim(),
      content: content.trim(),
      folder: folder.trim(),
      subtasks,
    });

    // Reset form
    setTitle('');
    setContent('');
    setFolder('');
    setSubtasks([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Content">
      <div className="space-y-4">
        {/* Content Type Selection */}
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={type === 'Note'}
              onChange={() => setType('Note')}
              className="mr-2"
            />
            Note
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={type === 'Task'}
              onChange={() => setType('Task')}
              className="mr-2"
            />
            Task
          </label>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-md text-white"
            placeholder="Enter title..."
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 px-3 py-2 bg-gray-700 rounded-md text-white resize-none"
            placeholder={type === 'Task' ? 'Task description...' : 'Note content...'}
          />
        </div>

        {/* Task-specific Subtasks */}
        {type === 'Task' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Subtasks
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="flex-1 px-3 py-1 bg-gray-700 rounded-md text-white"
                placeholder="New subtask..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <button
                onClick={handleAddSubtask}
                className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {subtasks.map((subtask, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    className="text-teal-500"
                  />
                  <span className="flex-1 text-gray-300">{subtask.text}</span>
                  <button
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-red-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Folder Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Target Folder
          </label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-md text-white"
          >
            <option value="">-- None (root) --</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};