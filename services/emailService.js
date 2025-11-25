import mockEmails from '../mock-emails.json';

// In a real application, this would fetch from a backend or an email service API.
// For this assignment, we'll use a local JSON file.

export const emailService = {
  /**
   * Loads a list of mock emails from a local JSON file.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of Email objects.
   */
  async loadMockEmails() {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve(mockEmails.emails);
      }, 500);
    });
  },

  // In a full application, you'd have methods like:
  // async saveEmail(email: Email): Promise<Email> { ... }
  // async getEmailById(id: string): Promise<Email | null> { ... }
  // async updateEmailCategory(id: string, category: Category): Promise<Email> { ... }
};