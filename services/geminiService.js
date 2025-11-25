import { GoogleGenAI, Type } from "@google/genai";
import { Category } from '../types.js';
import { GEMINI_FLASH_MODEL, PLACEHOLDER_API_KEY_INSTRUCTIONS } from '../constants.js';

// Helper to initialize Gemini API, ensuring API_KEY is present
const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    console.error(PLACEHOLDER_API_KEY_INSTRUCTIONS);
    throw new Error('Gemini API key is not configured.');
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  /**
   * General text generation from a prompt.
   * @param {string} modelName The Gemini model to use.
   * @param {string} prompt The user's query or instruction.
   * @returns {Promise<string>} The generated text.
   */
  async generateText(modelName, prompt) {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: prompt }] }],
      });
      const text = response.text;
      if (!text) {
        throw new Error('No text content received from Gemini API.');
      }
      return text;
    } catch (error) {
      console.error('Error in generateText:', error);
      throw error;
    }
  },

  /**
   * Categorizes an email using a predefined prompt and JSON schema.
   * @param {string} emailBody The body of the email to categorize.
   * @param {string} categorizationPrompt The prompt for categorization.
   * @returns {Promise<{ category: string }>} The categorized email result.
   */
  async categorizeEmail(emailBody, categorizationPrompt) {
    try {
      const ai = getGeminiClient();
      const fullPrompt = `${categorizationPrompt}\n\nEmail Content:\n${emailBody}`;

      const response = await ai.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'The determined category of the email.',
                enum: Object.values(Category), // Use enum values for strict categories
              },
            },
            required: ['category'],
          },
        },
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) {
        throw new Error('No JSON response received for categorization.');
      }

      // Sometimes Gemini might wrap JSON in ```json blocks
      const cleanedJsonStr = jsonStr.startsWith('```json') && jsonStr.endsWith('```')
        ? jsonStr.substring(7, jsonStr.length - 3)
        : jsonStr;

      const result = JSON.parse(cleanedJsonStr);
      return result;

    } catch (error) {
      console.error('Error in categorizeEmail:', error);
      // Attempt to get a fallback category if JSON parsing fails
      try {
        const ai = getGeminiClient();
        const fallbackPrompt = `Given the email below, what is its primary category from this list: ${Object.values(Category).join(', ')}. Just respond with the category name.\n\nEmail Content:\n${emailBody}`;
        const fallbackResponse = await ai.models.generateContent({
          model: GEMINI_FLASH_MODEL,
          contents: [{ parts: [{ text: fallbackPrompt }] }],
        });
        const fallbackText = fallbackResponse.text?.trim();
        if (fallbackText && Object.values(Category).includes(fallbackText)) {
          return { category: fallbackText };
        }
      } catch (fallbackError) {
        console.error('Fallback categorization failed:', fallbackError);
      }
      return { category: Category.UNKNOWN }; // Default to UNKNOWN if all else fails
    }
  },

  /**
   * Extracts action items from an email using a predefined prompt and JSON schema.
   * @param {string} emailBody The body of the email to extract action items from.
   * @param {string} actionItemPrompt The prompt for action item extraction.
   * @returns {Promise<Array<Object>>} An array of ActionItem objects.
   */
  async extractActionItems(emailBody, actionItemPrompt) {
    try {
      const ai = getGeminiClient();
      const fullPrompt = `${actionItemPrompt}\n\nEmail Content:\n${emailBody}`;

      const response = await ai.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: {
                  type: Type.STRING,
                  description: 'The task or action item extracted.',
                },
                deadline: {
                  type: Type.STRING,
                  description: 'The deadline for the task, if specified.',
                },
              },
              required: ['task'],
            },
          },
        },
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) {
        return []; // No action items found or no valid JSON
      }

      const cleanedJsonStr = jsonStr.startsWith('```json') && jsonStr.endsWith('```')
        ? jsonStr.substring(7, jsonStr.length - 3)
        : jsonStr;

      const result = JSON.parse(cleanedJsonStr);
      if (!Array.isArray(result)) {
        throw new Error('Expected an array of action items.');
      }
      return result;

    } catch (error) {
      console.error('Error in extractActionItems:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  /**
   * Summarizes an email based on a prompt.
   * @param {string} emailBody The body of the email to summarize.
   * @param {string} summarizationPrompt The prompt for summarization.
   * @returns {Promise<string>} The summary text.
   */
  async summarizeEmail(emailBody, summarizationPrompt) {
    try {
      const ai = getGeminiClient();
      const fullPrompt = `${summarizationPrompt}\n\nEmail Content:\n${emailBody}`;

      const response = await ai.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: [{ parts: [{ text: fullPrompt }] }],
      });
      const text = response.text;
      if (!text) {
        throw new Error('No text content received for summarization.');
      }
      return text;
    } catch (error) {
      console.error('Error in summarizeEmail:', error);
      throw error;
    }
  },

  /**
   * Drafts a reply for an email using a predefined prompt.
   * @param {Object} originalEmail The original email object.
   * @param {string} autoReplyDraftPrompt The prompt for drafting an auto-reply.
   * @returns {Promise<string>} The drafted reply body text.
   */
  async draftReply(originalEmail, autoReplyDraftPrompt) {
    try {
      const ai = getGeminiClient();
      const fullPrompt = `${autoReplyDraftPrompt}\n\nOriginal Email Details:\nSender: ${originalEmail.sender}\nSubject: ${originalEmail.subject}\nBody:\n${originalEmail.body}\n\nDraft a concise and polite reply.`;

      const response = await ai.models.generateContent({
        model: GEMINI_FLASH_MODEL,
        contents: [{ parts: [{ text: fullPrompt }] }],
      });
      const text = response.text;
      if (!text) {
        throw new Error('No text content received for drafting reply.');
      }
      return text;
    } catch (error) {
      console.error('Error in draftReply:', error);
      throw error;
    }
  },

  /**
   * Engages in a chat conversation about a specific email.
   * @param {string} emailBody The body of the email.
   * @param {string} userQuery The user's query in the chat.
   * @returns {Promise<string>} The agent's response.
   */
  async chatWithEmail(emailBody, userQuery) {
    try {
      const ai = getGeminiClient();
      const chat = ai.chats.create({
        model: GEMINI_FLASH_MODEL,
      });

      // Combine email content and user query into a single message for context
      const prompt = `Given the following email content:\n\n${emailBody}\n\nUser's question: ${userQuery}`;

      const response = await chat.sendMessage({ message: prompt });
      const text = response.text;
      if (!text) {
        throw new Error('No text content received from chat.');
      }
      return text;
    } catch (error) {
      console.error('Error in chatWithEmail:', error);
      throw error;
    }
  },
};
