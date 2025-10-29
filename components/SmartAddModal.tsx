import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { parseTaskFromString } from '../services/geminiService';
import { ContentItem } from '../types';
import { BrainIcon, SparklesIcon } from './IconComponents';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemData: Partial<ContentItem>) => void;
}

type Stage = 'prompt' | 'confirm';

export const SmartAddModal: React.FC<SmartAddModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [prompt, setPrompt] = useState('');
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('prompt');
  const [parsedItem, setParsedItem] = useState<Partial<ContentItem> | null>(null);

  useEffect(() => {
    // Reset state when modal is opened
    if (isOpen) {
      setPrompt('');
      setIsLoading(false);
      setError(null);
      setStage('prompt');
      setParsedItem(null);
      setFolder('');
      // Fetch available folders
      fetch('/api/folders')
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.folders)) setFolders(data.folders);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleParse = async () => {
    if (!prompt.trim()) {
      setError('Please enter some text to parse.');
      return;
    }
    if (!folder.trim()) {
      setError('Please select or enter a folder name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const parsed = await parseTaskFromString(prompt, folder);
      setParsedItem(parsed);
      setStage('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to parse input. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddItem = (type: 'task' | 'note') => {
    if (parsedItem) {
      onAddItem({ ...parsedItem, type, folder });
      onClose();
    }
  };

  const renderPromptStage = () => (
    <div className="flex flex-col space-y-4">
      <p className="text-gray-400">
        Describe your task or note in natural language. The AI will parse it for you.
      </p>
      <p className="text-xs text-gray-500">
        Example: "Review the Q3 marketing report and create a presentation by next Friday. Include slides for budget and ROI."
      </p>
      <label className="text-sm text-gray-300 font-semibold">Folder</label>
      <div className="flex gap-2 items-center">
        <select
          value={folder}
          onChange={e => setFolder(e.target.value)}
          className="p-2 bg-gray-900 border border-gray-600 rounded-md"
        >
          <option value="">Select folder</option>
          {folders.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <span className="text-gray-400">or</span>
        <input
          type="text"
          value={folder}
          onChange={e => setFolder(e.target.value)}
          placeholder="Enter new folder name"
          className="p-2 bg-gray-900 border border-gray-600 rounded-md flex-1"
        />
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'Buy milk tomorrow' or 'Meeting notes about the new project launch...'"
        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
        rows={4}
      />
      <button
        onClick={handleParse}
        disabled={isLoading}
        className="flex items-center justify-center w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-500 transition-colors"
      >
        <BrainIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Parsing...' : 'Parse with AI'}
      </button>
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );

  const renderConfirmStage = () => (
    <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-gray-300">AI has parsed your input:</h3>
        <div className="p-4 bg-gray-900 rounded-md border border-gray-700 space-y-2">
            <p className="font-bold text-teal-400">{parsedItem?.title || 'No title found'}</p>
            {parsedItem?.description && <p className="text-sm text-gray-400 mt-1">{parsedItem.description}</p>}
            {parsedItem?.subtasks && parsedItem.subtasks.length > 0 && (
                <ul className="text-sm text-gray-400 list-disc list-inside">
                    {parsedItem.subtasks.map(sub => <li key={sub.id}>{sub.title}</li>)}
                </ul>
            )}
            {parsedItem?.tags && parsedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {parsedItem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs font-medium text-cyan-200 bg-cyan-900 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
        </div>
        <p className="text-center text-gray-400">How would you like to add this?</p>
        <div className="flex space-x-4">
            <button onClick={() => handleAddItem('task')} className="flex-1 px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Add as Task
            </button>
            <button onClick={() => handleAddItem('note')} className="flex-1 px-4 py-2 font-bold text-white bg-purple-600 rounded-md hover:bg-purple-700">
                Add as Note
            </button>
        </div>
        <button onClick={() => setStage('prompt')} className="text-sm text-gray-400 hover:text-white">
            Go back and edit
        </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Smart Add">
        {stage === 'prompt' ? renderPromptStage() : renderConfirmStage()}
    </Modal>
  );
};