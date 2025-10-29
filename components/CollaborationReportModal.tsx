import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { analyzeHubContent, HubAnalysis } from '../services/geminiService';
import { TaskList, User } from '../types';
import { SparklesIcon, UsersIcon } from './IconComponents';

interface CollaborationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hub: TaskList | undefined;
  users: User[];
}

export const CollaborationReportModal: React.FC<CollaborationReportModalProps> = ({ isOpen, onClose, hub, users }) => {
  const [analysis, setAnalysis] = useState<HubAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && hub) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
          const result = await analyzeHubContent(hub, users);
          setAnalysis(result);
        } catch (err: any) {
          setError(err.message || 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalysis();
    }
  }, [isOpen, hub, users]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <SparklesIcon className="w-8 h-8 mx-auto text-teal-400 animate-pulse" />
          <p className="mt-2 text-gray-400">AI is analyzing your hub...</p>
        </div>
      );
    }
    
    if (error) {
      return <p className="text-red-400 text-center py-8">{error}</p>;
    }
    
    if (analysis) {
      return (
        <div className="space-y-6">
          {analysis.summary && (
            <div className="p-3 bg-gray-900 rounded-md border border-gray-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Project Analysis</h3>
              <div className="text-gray-300 whitespace-pre-line">{analysis.summary}</div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collaborative Intelligence Report">
      {renderContent()}
    </Modal>
  );
};
