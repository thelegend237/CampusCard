import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-100 overflow-x-hidden">
      {/* Sidebar desktop */}
      <Sidebar />
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full max-w-[80vw] w-64 bg-gray-900 text-white shadow-xl z-50 md:hidden flex flex-col overflow-y-auto">
            <Sidebar mobile={true} />
            <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setSidebarOpen(false)} title="Fermer le menu">✕</button>
          </div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;