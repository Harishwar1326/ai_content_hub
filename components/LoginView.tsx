
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here.
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative waves */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg width="100%" height="100%" id="svg" viewBox="0 0 1440 390" xmlns="http://www.w3.org/2000/svg" className="transition duration-300 ease-in-out delay-150"><path d="M 0,400 L 0,150 C 120,133 240,116 360,135 C 480,154 600,209 720,208 C 840,207 960,150 1080,131 C 1200,112 1320,131 1440,150 L 1440,400 Z" stroke="none" strokeWidth="0" fill="#00c9a7" fillOpacity="0.5" className="transition-all duration-300 ease-in-out delay-150 path-0"></path><path d="M 0,400 L 0,250 C 102,238 205,226 335,225 C 465,224 622,234 745,238 C 868,242 957,240 1065,233 C 1173,226 1306,214 1440,202 L 1440,400 Z" stroke="none" strokeWidth="0" fill="#00c9a7" fillOpacity="0.25" className="transition-all duration-300 ease-in-out delay-150 path-1"></path></svg>
        </div>

        <div className="w-full max-w-md bg-gray-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 z-10">
            <h1 className="text-4xl font-bold text-center mb-2 text-teal-400">AI Content Hub</h1>
            <p className="text-center text-gray-400 mb-8">Your intelligent task manager.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors"
                >
                    Sign In
                </button>
            </form>
             <p className="text-center text-xs text-gray-500 mt-6">
                This is a demo. Use the provided credentials to log in.
            </p>
        </div>
    </div>
  );
};
