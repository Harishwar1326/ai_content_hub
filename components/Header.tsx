import React, { useState } from 'react';
import { BrainIcon } from './IconComponents';
import { User } from '../types';

interface HeaderProps {
    onLogout: () => void;
    onSmartAdd: () => void;
    users: User[];
    currentUser: User;
    onSetCurrentUser: (user: User) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onSmartAdd, users, currentUser, onSetCurrentUser }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    const handleUserSelect = (user: User) => {
        onSetCurrentUser(user);
        setIsUserMenuOpen(false);
    }

    return (
        <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-teal-400">AI Content Hub</h1>
            <div className="flex items-center space-x-4">
                 <button 
                    onClick={onSmartAdd}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors flex items-center"
                    title="Add task with AI"
                >
                    <BrainIcon className="w-5 h-5 mr-2" />
                    Smart Add
                </button>

                <div className="relative">
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2">
                         <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold`}>
                            {currentUser.name.charAt(0)}
                        </div>
                        <span className="text-white hidden sm:inline">{currentUser.name}</span>
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20 border border-gray-700">
                           {users.map(user => (
                               <button 
                                key={user.id} 
                                onClick={() => handleUserSelect(user)} 
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
                               >
                                    <div className={`w-6 h-6 rounded-full ${user.avatarColor} flex items-center justify-center text-white font-bold text-xs mr-2`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.name}
                               </button>
                           ))}
                        </div>
                    )}
                </div>

                <button 
                    onClick={onLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};
