import React from 'react';
import { EmailList } from './EmailList.jsx';

export const InboxView = ({
  emails,
  onEmailSelect,
  onLoadMockInbox,
  onProcessEmails,
  drafts,
  onEditDraft,
  onDeleteDraft,
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden">
      <EmailList
        emails={emails}
        onEmailSelect={onEmailSelect}
        onLoadMockInbox={onLoadMockInbox}
        onProcessEmails={onProcessEmails}
        drafts={drafts}
        onEditDraft={onEditDraft}
        onDeleteDraft={onDeleteDraft}
      />
    </div>
  );
};