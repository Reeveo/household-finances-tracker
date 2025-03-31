import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{user?.email}</p>
            <p className="text-sm text-gray-600">Welcome back!</p>
          </div>
          
          <button 
            onClick={() => signOut()} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome to your Financial Dashboard</h2>
        <p>This is a protected page that can only be accessed when authenticated.</p>
      </div>
    </div>
  );
};

export default Dashboard; 