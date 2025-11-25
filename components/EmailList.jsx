import React, { useState, useMemo } from 'react';
import { Category } from '../types.js';
import { Button } from './Button.jsx';
import { useAppContext } from '../App.jsx';

export const EmailList = ({
  emails,
  onEmailSelect,
  onLoadMockInbox,
  onProcessEmails,
  drafts,
  onEditDraft,
  onDeleteDraft,
}) => {
  const { isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredAndSortedEmails = useMemo(() => {
    let filtered = emails.filter(email =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterCategory !== 'all') {
      filtered = filtered.filter(email => email.category === filterCategory);
    }

    return filtered.sort((a, b) => {
      let valA;
      let valB;

      if (sortBy === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else if (sortBy === 'sender') {
        valA = a.sender.toLowerCase();
        valB = b.sender.toLowerCase();
      } else { // sortBy === 'subject'
        valA = a.subject.toLowerCase();
        valB = b.subject.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [emails, searchTerm, filterCategory, sortBy, sortOrder]);

  const allCategories = useMemo(() => {
    const categories = new Set();
    emails.forEach(email => {
      if (email.category) categories.add(email.category);
    });
    return Array.from(categories).sort();
  }, [emails]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case Category.IMPORTANT: return 'bg-red-100 text-red-800';
      case Category.NEWSLETTER: return 'bg-blue-100 text-blue-800';
      case Category.SPAM: return 'bg-gray-100 text-gray-800';
      case Category.TODO: return 'bg-yellow-100 text-yellow-800';
      case Category.PROJECT_UPDATE: return 'bg-purple-100 text-purple-800';
      case Category.MEETING_REQUEST: return 'bg-green-100 text-green-800';
      case Category.UNKNOWN: return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 rounded-lg shadow-inner overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 mb-6 sticky top-0 bg-gray-50 pb-4 z-10">
        <Button onClick={onLoadMockInbox} isLoading={isLoading} disabled={isLoading} variant="primary">
          Load Mock Inbox
        </Button>
        <Button onClick={onProcessEmails} isLoading={isLoading} disabled={isLoading || emails.length === 0} variant="secondary">
          Process Emails (Categorize & Extract Tasks)
        </Button>

        <input
          type="text"
          placeholder="Search emails..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-w-[150px] md:min-w-[200px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="timestamp">Sort by Date</option>
          <option value="sender">Sort by Sender</option>
          <option value="subject">Sort by Subject</option>
        </select>
        <Button onClick={toggleSortOrder} variant="outline" size="sm" className="w-10">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Inbox ({filteredAndSortedEmails.length} emails)</h2>
        {emails.length === 0 && !isLoading ? (
          <p className="text-center text-gray-600">No emails loaded. Click "Load Mock Inbox" to get started.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedEmails.map(email => (
              <li
                key={email.id}
                className="p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between"
                onClick={() => onEmailSelect(email)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 truncate">{email.sender}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(email.category)}`}>
                      {email.category || 'Uncategorized'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-base font-medium truncate">{email.subject}</p>
                  <p className="text-gray-500 text-sm">{formatTimestamp(email.timestamp)}</p>
                  {email.actionItems && email.actionItems.length > 0 && (
                    <div className="mt-2 text-sm text-yellow-700">
                      <span className="font-medium">Action Items:</span> {email.actionItems.map(item => item.task).join(', ')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Drafts ({drafts.length} total)</h2>
        {drafts.length === 0 ? (
          <p className="text-center text-gray-600">No drafts saved yet. Ask the AI to draft a reply!</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {drafts.map(draft => (
              <li key={draft.id} className="p-4 hover:bg-gray-100 transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-semibold text-gray-900 truncate">Draft: {draft.subject}</p>
                  <p className="text-gray-700 text-sm truncate">{draft.body.substring(0, 100)}...</p>
                  <p className="text-gray-500 text-xs mt-1">Last Edited: {formatTimestamp(draft.lastEditedAt)}</p>
                </div>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <Button size="sm" variant="secondary" onClick={() => onEditDraft(draft)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDeleteDraft(draft.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};