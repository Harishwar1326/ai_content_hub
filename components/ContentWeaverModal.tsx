// FIX: Providing the full implementation for the ContentWeaverModal component.
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { rewriteText } from '../services/geminiService';
import { SparklesIcon } from './IconComponents';

interface ContentWeaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onComplete: (newText: string) => void;
}

export const ContentWeaverModal: React.FC<ContentWeaverModalProps> = ({ isOpen, onClose, initialText, onComplete }) => {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setResult('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, initialText]);

  const handleRewrite = async (instruction: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult('');
    try {
      const newText = await rewriteText(text, instruction);
      setResult(newText);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApply = () => {
    if (result) {
        onComplete(result);
    }
    onClose();
  };

  const rewriteOptions = [
    'Summarize', 'Expand', 'Fix Grammar', 'Make Professional'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Content Weaver AI">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Your Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500"
            rows={5}
            placeholder="Enter or paste text to edit with AI..."
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {rewriteOptions.map(opt => (
                <button 
                    key={opt}
                    onClick={() => handleRewrite(opt)} 
                    disabled={isLoading} 
                    className="p-2 text-sm bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-500 transition-colors"
                >
                    {opt}
                </button>
            ))}
        </div>
        
        {isLoading && <p className="text-center text-gray-400 flex items-center justify-center"><SparklesIcon className="w-5 h-5 mr-2 animate-pulse" /> Weaving content...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}
        
        {result && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <h4 className="font-semibold text-gray-300">AI Suggestion:</h4>
            <div className="p-3 bg-gray-900 border border-gray-600 rounded-md max-h-40 overflow-y-auto">
              {result}
            </div>
            <button onClick={handleApply} className="w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700">
              Apply & Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
