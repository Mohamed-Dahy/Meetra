import React from 'react';
import Sidebar from '../components/layout/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">All Features Upcoming</h1>
          <p className="text-slate-400">Stay tuned for exciting updates!</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
