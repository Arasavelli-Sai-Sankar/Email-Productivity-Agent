import React, { useState } from 'react';
import { Button } from './Button.jsx';
import { DEFAULT_CATEGORIZATION_PROMPT, DEFAULT_ACTION_ITEM_PROMPT, DEFAULT_AUTO_REPLY_PROMPT, DEFAULT_SUMMARIZATION_PROMPT, DEFAULT_TASK_EXTRACTION_PROMPT } from '../constants.js';

export const PromptConfigPanel = ({ currentPrompts, onSavePrompts }) => {
  const [prompts, setPrompts] = useState(currentPrompts);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrompts(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSavePrompts(prompts);
    alert('Prompts saved successfully!');
  };

  const handleResetToDefaults = () => {
    const defaultPrompts = {
      categorizationPrompt: DEFAULT_CATEGORIZATION_PROMPT,
      actionItemPrompt: DEFAULT_ACTION_ITEM_PROMPT,
      autoReplyDraftPrompt: DEFAULT_AUTO_REPLY_PROMPT,
      summarizationPrompt: DEFAULT_SUMMARIZATION_PROMPT,
      taskExtractionPrompt: DEFAULT_TASK_EXTRACTION_PROMPT,
    };
    setPrompts(defaultPrompts);
    onSavePrompts(defaultPrompts);
    alert('Prompts reset to default values!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Prompt Brain Configuration</h2>

      <p className="text-gray-600 mb-6">
        Here you can customize the instructions given to the AI for various email processing tasks.
        Tailor these prompts to guide the AI's behavior precisely to your needs.
      </p>

      {/* Categorization Prompt */}
      <div>
        <label htmlFor="categorizationPrompt" className="block text-xl font-semibold text-gray-700 mb-2">
          Categorization Prompt
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This prompt guides the AI in assigning a category to each email (e.g., Important, To-Do, Spam).
        </p>
        <textarea
          id="categorizationPrompt"
          name="categorizationPrompt"
          value={prompts.categorizationPrompt || ''}
          onChange={handleChange}
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="e.g., Categorize emails into: Important, Newsletter, Spam, To-Do. To-Do emails must include a direct request requiring user action."
        ></textarea>
      </div>

      {/* Action Item Prompt */}
      <div>
        <label htmlFor="actionItemPrompt" className="block text-xl font-semibold text-gray-700 mb-2">
          Action Item Extraction Prompt
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This prompt instructs the AI on how to identify and extract actionable tasks and their deadlines from emails.
        </p>
        <textarea
          id="actionItemPrompt"
          name="actionItemPrompt"
          value={prompts.actionItemPrompt || ''}
          onChange={handleChange}
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="e.g., Extract tasks from the email. Respond in JSON: { 'task': '...', 'deadline': '...' }."
        ></textarea>
      </div>

      {/* Auto-Reply Draft Prompt */}
      <div>
        <label htmlFor="autoReplyDraftPrompt" className="block text-xl font-semibold text-gray-700 mb-2">
          Auto-Reply Draft Prompt
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Use this to define the AI's behavior when drafting email replies. Specify tone, formality, and what information to include.
        </p>
        <textarea
          id="autoReplyDraftPrompt"
          name="autoReplyDraftPrompt"
          value={prompts.autoReplyDraftPrompt || ''}
          onChange={handleChange}
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="e.g., If an email is a meeting request, draft a polite reply asking for an agenda."
        ></textarea>
      </div>

      {/* Summarization Prompt (Optional but good to have) */}
      <div>
        <label htmlFor="summarizationPrompt" className="block text-xl font-semibold text-gray-700 mb-2">
          Summarization Prompt
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This prompt instructs the AI on how to summarize emails or chat responses.
        </p>
        <textarea
          id="summarizationPrompt"
          name="summarizationPrompt"
          value={prompts.summarizationPrompt || ''}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="e.g., Summarize the following email concisely, highlighting the main points and any critical information."
        ></textarea>
      </div>

      {/* Task Extraction Prompt (Optional, can be used by chat for "what tasks") */}
      <div>
        <label htmlFor="taskExtractionPrompt" className="block text-xl font-semibold text-gray-700 mb-2">
          General Task Extraction Prompt (for Chat)
        </label>
        <p className="text-sm text-gray-500 mb-2">
          A general prompt for the AI to identify tasks from an email during chat interaction.
        </p>
        <textarea
          id="taskExtractionPrompt"
          name="taskExtractionPrompt"
          value={prompts.taskExtractionPrompt || ''}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="e.g., From the following email, identify all explicit and implicit tasks or action items. List them clearly."
        ></textarea>
      </div>


      <div className="flex justify-end space-x-4 mt-8 sticky bottom-0 bg-white pt-4 border-t">
        <Button onClick={handleResetToDefaults} variant="secondary">
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} variant="primary">
          Save Prompts
        </Button>
      </div>
    </div>
  );
};