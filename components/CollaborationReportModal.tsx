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
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Knowledge Gaps</h3>
            {analysis.gaps.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {analysis.gaps.map((gap, index) => <li key={index}>{gap}</li>)}
              </ul>
            ) : (
                <p className="text-gray-500">No significant knowledge gaps found. Great work!</p>
            )}
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Concept Merge Suggestions</h3>
             {analysis.mergeSuggestions.length > 0 ? (
                <div className="space-y-4">
                    {analysis.mergeSuggestions.map((suggestion, index) => {
                        const itemsToMerge = hub?.items.filter(item => suggestion.itemIds.includes(item.id));
                        return (
                        <div key={index} className="p-3 bg-gray-900 rounded-md border border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">{suggestion.reason}</p>
                            <ul className="text-sm space-y-1">
                            {itemsToMerge?.map(item => (
                                <li key={item.id} className="text-gray-200 font-medium truncate">
                                - "{item.title}"
                                </li>
                            ))}
                            </ul>
                        </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500">No obvious items to merge right now.</p>
            )}
          </div>
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
