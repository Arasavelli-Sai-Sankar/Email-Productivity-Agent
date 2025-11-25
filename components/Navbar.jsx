import React from 'react';

export const Navbar = ({ currentPage, onNavigate }) => {
  const commonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "text-gray-700 hover:bg-gray-200";

  return (
    <nav className="bg-gray-800 p-4 shadow-md flex justify-between items-center z-10">
      <h1 className="text-white text-xl font-bold">Email Agent</h1>
      <div className="space-x-4">
        <button
          onClick={() => onNavigate('inbox')}
          className={`${commonClasses} ${currentPage === 'inbox' ? activeClasses : inactiveClasses}`}
        >
          Inbox & Drafts
        </button>
        <button
          onClick={() => onNavigate('prompt-brain')}
          className={`${commonClasses} ${currentPage === 'prompt-brain' ? activeClasses : inactiveClasses}`}
        >
          Prompt Brain
        </button>
      </div>
    </nav>
  );
};