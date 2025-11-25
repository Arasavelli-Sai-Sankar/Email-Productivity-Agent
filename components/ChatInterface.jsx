import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types.js';
import { geminiService } from '../services/geminiService.js';
import { Button } from './Button.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { v4 as uuidv4 } from 'uuid';

export const ChatInterface = ({
  email,
  prompts,
  addDraft,
  setCurrentPage,
  onEditDraft,
  isLoading, // optional global loading state (JUST for disabling UI if needed)
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false); // local thinking state
  const chatContainerRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const addMessage = (sender, text) => {
    setChatMessages(prevMessages => [
      ...prevMessages,
      { id: uuidv4(), sender, text, timestamp: new Date().toISOString() },
    ]);
  };

  const handleSendMessage = async (userMessage = currentInput) => {
    if (!userMessage.trim()) return;

    // Add user message
    addMessage('user', userMessage);
    setCurrentInput('');
    setIsAgentThinking(true);

    try {
      let agentResponseText = 'I am sorry, I could not process that request.';
      let newDraft = null;
      let actionItems;
      let category;

      const lower = userMessage.toLowerCase();

      if (lower.includes('summarize')) {
        const prompt = prompts.summarizationPrompt || prompts.categorizationPrompt;
        agentResponseText = await geminiService.summarizeEmail(email.body, prompt);
      } else if (lower.includes('what tasks') || lower.includes('action items')) {
        const prompt = prompts.taskExtractionPrompt || prompts.actionItemPrompt;
        const extracted = await geminiService.extractActionItems(email.body, prompt);
        if (extracted && extracted.length > 0) {
          agentResponseText =
            `Here are the action items I found:\n` +
            extracted
              .map(
                item =>
                  `- ${item.task}${
                    item.deadline ? ` (due by ${item.deadline})` : ''
                  }`
              )
              .join('\n');
          actionItems = extracted;
        } else {
          agentResponseText = 'I did not find any specific action items in this email.';
        }
      } else if (lower.includes('draft a reply') || lower.includes('write a reply')) {
        agentResponseText = await geminiService.draftReply(
          email,
          prompts.autoReplyDraftPrompt
        );
        newDraft = {
          id: uuidv4(),
          originalEmailId: email.id,
          subject: `Re: ${email.subject}`,
          body: agentResponseText,
          createdAt: new Date().toISOString(),
          lastEditedAt: new Date().toISOString(),
          metadata: {
            category: email.category,
            actionItems: actionItems || email.actionItems,
          },
        };
        addDraft(newDraft);
        agentResponseText +=
          `\n\nI have created a draft. You can find it in the "Inbox & Drafts" section.`;
      } else if (lower.includes('categorize this email')) {
        const categorizationPrompt = prompts.categorizationPrompt;
        const result = await geminiService.categorizeEmail(
          email.body,
          categorizationPrompt
        );
        if (result) {
          agentResponseText = `I categorized this email as: **${result.category}**.`;
          category = result.category;
        } else {
          agentResponseText = `I couldn't confidently categorize this email.`;
        }
      } else {
        // General chat
        agentResponseText = await geminiService.chatWithEmail(email.body, userMessage);
      }

      // Add agent reply
      addMessage('agent', agentResponseText);

      // If a draft was created, optionally jump to editor
      if (newDraft) {
        setTimeout(() => {
          if (
            window.confirm(
              'A draft has been created. Would you like to edit it now?'
            )
          ) {
            onEditDraft(newDraft);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      addMessage(
        'agent',
        `An error occurred: ${
          error.message || 'Unknown error'
        }. Please check the console and ensure your API key is configured correctly.`
      );
    } finally {
      setIsAgentThinking(false);
    }
  };

  const handlePredefinedQuery = query => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 sticky top-0 bg-gray-50 z-10">
        Email Agent Chat
      </h3>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handlePredefinedQuery('Summarize this email.')}
          disabled={isAgentThinking || isLoading}
        >
          Summarize
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            handlePredefinedQuery('What tasks do I need to do from this email?')
          }
          disabled={isAgentThinking || isLoading}
        >
          Extract Tasks
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            handlePredefinedQuery('Draft a reply based on the tone of this email.')
          }
          disabled={isAgentThinking || isLoading}
        >
          Draft Reply
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-white rounded-md shadow-inner mb-4"
      >
        {chatMessages.length === 0 ? (
          <p className="text-center text-gray-500">
            Ask the Email Agent a question about this email, or use the quick actions
            above.
          </p>
        ) : (
          chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-xs text-right opacity-75 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}

        {(isAgentThinking || isLoading) && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-3 rounded-lg shadow-sm bg-gray-200 text-gray-800 flex items-center space-x-2">
              <LoadingSpinner size="sm" className="border-blue-500 border-t-blue-700" />
              <span>Agent is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex mt-auto sticky bottom-0 bg-gray-50 pt-4">
        <textarea
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          rows={1}
          placeholder="Ask the agent about this email..."
          className="flex-grow p-3 border border-gray-300 rounded-l-md resize-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          disabled={isAgentThinking || isLoading}
        />
        <Button
          onClick={() => handleSendMessage()}
          className="rounded-l-none"
          disabled={!currentInput.trim() || isAgentThinking || isLoading}
          isLoading={isAgentThinking}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
