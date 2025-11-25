import {
  DEFAULT_CATEGORIZATION_PROMPT,
  DEFAULT_ACTION_ITEM_PROMPT,
  DEFAULT_AUTO_REPLY_PROMPT,
  DEFAULT_SUMMARIZATION_PROMPT,
  DEFAULT_TASK_EXTRACTION_PROMPT,
} from '../constants.js';

const PROMPT_STORAGE_KEY = 'emailAgentPrompts';

export const promptService = {
  /**
   * Retrieves saved prompt templates from local storage.
   * If no prompts are found, returns the default prompts.
   * @returns {Object} The PromptTemplates object.
   */
  getPrompts() {
    try {
      const storedPrompts = localStorage.getItem(PROMPT_STORAGE_KEY);
      if (storedPrompts) {
        return JSON.parse(storedPrompts);
      }
    } catch (error) {
      console.error('Error loading prompts from localStorage:', error);
    }
    return this.getDefaultPrompts();
  },

  /**
   * Saves prompt templates to local storage.
   * @param {Object} prompts The PromptTemplates object to save.
   */
  savePrompts(prompts) {
    try {
      localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(prompts));
    } catch (error) {
      console.error('Error saving prompts to localStorage:', error);
    }
  },

  /**
   * Provides the default prompt templates.
   * @returns {Object} The default PromptTemplates object.
   */
  getDefaultPrompts() {
    return {
      categorizationPrompt: DEFAULT_CATEGORIZATION_PROMPT,
      actionItemPrompt: DEFAULT_ACTION_ITEM_PROMPT,
      autoReplyDraftPrompt: DEFAULT_AUTO_REPLY_PROMPT,
      summarizationPrompt: DEFAULT_SUMMARIZATION_PROMPT,
      taskExtractionPrompt: DEFAULT_TASK_EXTRACTION_PROMPT,
    };
  },
};