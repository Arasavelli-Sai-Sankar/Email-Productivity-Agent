// Gemini Model Names
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';
export const GEMINI_PRO_MODEL = 'gemini-3-pro-preview';

// Default prompts - these will be saved as initial prompts
export const DEFAULT_CATEGORIZATION_PROMPT = `Categorize emails into one of the following: Important, Newsletter, Spam, To-Do, Project Update, Meeting Request.
To-Do emails must include a direct request requiring user action.
Respond only with the category name.`;

export const DEFAULT_ACTION_ITEM_PROMPT = `Extract tasks from the email. Respond in JSON array format:
[ { "task": "...", "deadline": "..." }, ... ]
If no deadline is specified, omit the deadline field. If no tasks are found, return an empty array.`;

export const DEFAULT_AUTO_REPLY_PROMPT = `Given the email content and context, draft a polite, concise, and helpful reply.
Consider the tone and purpose of the original email.
If it's a meeting request, suggest an agenda or ask for more details.
Keep it professional.`;

export const DEFAULT_SUMMARIZATION_PROMPT = `Summarize the following email concisely, highlighting the main points and any critical information.`;

export const DEFAULT_TASK_EXTRACTION_PROMPT = `From the following email, identify all explicit and implicit tasks or action items. List them clearly.`;

export const PLACEHOLDER_API_KEY_INSTRUCTIONS =
  'Set your Gemini API key as `GEMINI_API_KEY` in `.env` (recommended) or `.env.local`. Without it, AI features will not work.';
