import React, { useState } from 'react';
import { generateIdeas } from '../services/geminiService';
import { SparklesIcon, PlusIcon } from './IconComponents';

interface BrainstormViewProps {
  onAddIdeaAsNote: (title: string) => void;
}

export const BrainstormView: React.FC<BrainstormViewProps> = ({ onAddIdeaAsNote }) => {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setIdeas([]);
    try {
      const result = await generateIdeas(prompt);
      setIdeas(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-gray-400">
        Enter a topic or a goal, and let AI generate some ideas or tasks for you.
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'Blog post ideas for a new productivity app'"
        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
        rows={3}
      />
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="flex items-center justify-center w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-500 transition-colors"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Generating...' : 'Generate Ideas'}
      </button>

      {error && <p className="text-red-400">{error}</p>}
      
      {ideas.length > 0 && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-200">Generated Ideas:</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {ideas.map((idea, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-md">
                <span className="flex-grow mr-4 text-gray-300">{idea}</span>
                <button
                  onClick={() => onAddIdeaAsNote(idea)}
                  className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
                  title="Add as note"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};