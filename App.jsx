import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { InboxView } from './components/InboxView.jsx';
import { PromptConfigPanel } from './components/PromptConfigPanel.jsx';
import { EmailDetail } from './components/EmailDetail.jsx';
import { DraftEditor } from './components/DraftEditor.jsx';
import { ChatInterface } from './components/ChatInterface.jsx';
import { Category } from './types.js'; // Keep Category enum definition
import { emailService } from './services/emailService.js';
import { promptService } from './services/promptService.js';
import { geminiService } from './services/geminiService.js';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';

// Context for global application state
const AppContext = createContext(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('inbox');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [prompts, setPrompts] = useState(promptService.getDefaultPrompts());
  const [drafts, setDrafts] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load prompts on initial render
  useEffect(() => {
    const savedPrompts = promptService.getPrompts();
    if (savedPrompts) {
      setPrompts(savedPrompts);
    }
  }, []);

  // Save prompts whenever they change
  useEffect(() => {
    promptService.savePrompts(prompts);
  }, [prompts]);

  const addDraft = useCallback((draft) => {
    setDrafts(prevDrafts => [...prevDrafts, draft]);
  }, []);

  const updateDraft = useCallback((id, updatedDraft) => {
    setDrafts(prevDrafts =>
      prevDrafts.map(draft => (draft.id === id ? { ...draft, ...updatedDraft } : draft))
    );
  }, []);

  const deleteDraft = useCallback((id) => {
    setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== id));
  }, []);

  const loadMockInbox = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedEmails = await emailService.loadMockEmails();
      setEmails(loadedEmails);
      alert('Mock inbox loaded successfully!');
    } catch (error) {
      console.error('Error loading mock inbox:', error);
      alert('Failed to load mock inbox. See console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processEmails = useCallback(async () => {
    if (emails.length === 0) {
      alert('No emails to process. Please load the mock inbox first.');
      return;
    }

    setIsLoading(true);
    try {
      const processedEmails = [];
      for (const email of emails) {
        let updatedEmail = { ...email };

        // 1. Categorization
        try {
          const categoryResponse = await geminiService.categorizeEmail(
            email.body,
            prompts.categorizationPrompt
          );
          if (categoryResponse) {
            updatedEmail.category = categoryResponse.category;
          }
        } catch (catError) {
          console.error(`Error categorizing email ${email.id}:`, catError);
          updatedEmail.category = Category.UNKNOWN; // Fallback
        }

        // 2. Action Item Extraction
        try {
          const actionItemsResponse = await geminiService.extractActionItems(
            email.body,
            prompts.actionItemPrompt
          );
          updatedEmail.actionItems = actionItemsResponse || [];
        } catch (actionError) {
          console.error(`Error extracting action items for email ${email.id}:`, actionError);
          updatedEmail.actionItems = []; // Fallback
        }
        processedEmails.push(updatedEmail);
      }
      setEmails(processedEmails);
      alert('Emails processed (categorized and action items extracted)!');
    } catch (error) {
      console.error('Error processing emails:', error);
      alert('Failed to process emails. See console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [emails, prompts]);

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    setCurrentPage('email-detail');
  };

  const handleBackToInbox = () => {
    setSelectedEmail(null);
    setCurrentPage('inbox');
  };

  const handleEditDraft = (draft) => {
    setEditingDraft(draft);
    setCurrentPage('draft-editor');
  };

  const handleSaveEditedDraft = (updatedDraft) => {
    updateDraft(updatedDraft.id, updatedDraft);
    setEditingDraft(null);
    setCurrentPage('inbox'); // Or back to email detail? For now, inbox.
  };

  const handleCancelEditDraft = () => {
    setEditingDraft(null);
    if (selectedEmail) {
      setCurrentPage('email-detail');
    } else {
      setCurrentPage('inbox');
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
    switch (currentPage) {
      case 'inbox':
        return (
          <InboxView
            emails={emails}
            onEmailSelect={handleEmailSelect}
            onLoadMockInbox={loadMockInbox}
            onProcessEmails={processEmails}
            drafts={drafts}
            onEditDraft={handleEditDraft}
            onDeleteDraft={deleteDraft}
          />
        );
      case 'prompt-brain':
        return <PromptConfigPanel currentPrompts={prompts} onSavePrompts={setPrompts} />;
      case 'email-detail':
        return selectedEmail ? (
          <EmailDetail
            email={selectedEmail}
            onBack={handleBackToInbox}
            prompts={prompts}
            addDraft={addDraft}
            setCurrentPage={setCurrentPage}
            onEditDraft={handleEditDraft}
          />
        ) : (
          <p className="text-center text-gray-600 mt-8">No email selected.</p>
        );
      case 'draft-editor':
        return editingDraft ? (
          <DraftEditor
            draft={editingDraft}
            onSave={handleSaveEditedDraft}
            onCancel={handleCancelEditDraft}
          />
        ) : (
          <p className="text-center text-gray-600 mt-8">No draft selected for editing.</p>
        );
      default:
        return <InboxView
          emails={emails}
          onEmailSelect={handleEmailSelect}
          onLoadMockInbox={loadMockInbox}
          onProcessEmails={processEmails}
          drafts={drafts}
          onEditDraft={handleEditDraft}
          onDeleteDraft={deleteDraft}
        />;
    }
  };

  const appContextValue = {
    emails,
    setEmails,
    selectedEmail,
    setSelectedEmail,
    prompts,
    setPrompts,
    drafts,
    setDrafts,
    addDraft,
    updateDraft,
    deleteDraft,
    loadMockInbox,
    processEmails,
    isLoading,
    setIsLoading,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="flex flex-col h-screen w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="flex-grow p-4 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;