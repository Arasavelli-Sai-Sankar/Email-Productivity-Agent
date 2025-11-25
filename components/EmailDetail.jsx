import React from 'react';
import { Button } from './Button.jsx';
import { ChatInterface } from './ChatInterface.jsx';
import { Category } from '../types.js';
import { useAppContext } from '../App.jsx';

export const EmailDetail = ({
  email,
  onBack,
  prompts,
  addDraft,
  setCurrentPage,
  onEditDraft,
}) => {
  const { isLoading: appIsLoading } = useAppContext();
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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden md:flex-row">
      {/* Email Content Panel */}
      <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto min-h-[50%] md:min-h-full">
        <Button onClick={onBack} variant="secondary" className="mb-4">
          ← Back to Inbox
        </Button>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-800">{email.subject}</h2>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${getCategoryColor(email.category)}`}>
            {email.category || 'Uncategorized'}
          </span>
        </div>
        <div className="text-gray-600 text-sm mb-4 border-b pb-4">
          <p><strong>From:</strong> {email.sender}</p>
          <p><strong>Date:</strong> {formatTimestamp(email.timestamp)}</p>
        </div>
        <div className="prose max-w-none text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
          {email.body}
        </div>
        {email.actionItems && email.actionItems.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Identified Action Items:</h3>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              {email.actionItems.map((item, index) => (
                <li key={index}>
                  {item.task} {item.deadline && <span className="text-sm italic">(Deadline: {item.deadline})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chat Interface Panel */}
      <div className="flex-1 flex flex-col p-6 bg-gray-50 min-h-[50%] md:min-h-full">
        <ChatInterface
          email={email}
          prompts={prompts}
          addDraft={addDraft}
          setCurrentPage={setCurrentPage}
          onEditDraft={onEditDraft}
          isLoading={appIsLoading} // Pass global loading state to chat
        />
      </div>
    </div>
  );
};