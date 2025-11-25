import React, { useState, useEffect } from 'react';
import { Button } from './Button.jsx';
import { v4 as uuidv4 } from 'uuid';

export const DraftEditor = ({ draft, onSave, onCancel }) => {
  const [editedDraft, setEditedDraft] = useState(draft);
  const [newFollowUp, setNewFollowUp] = useState('');

  useEffect(() => {
    setEditedDraft(draft);
  }, [draft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDraft(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFollowUp = () => {
    if (newFollowUp.trim()) {
      setEditedDraft(prev => ({
        ...prev,
        suggestedFollowUps: [...(prev.suggestedFollowUps || []), newFollowUp.trim()],
      }));
      setNewFollowUp('');
    }
  };

  const handleRemoveFollowUp = (index) => {
    setEditedDraft(prev => ({
      ...prev,
      suggestedFollowUps: prev.suggestedFollowUps?.filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = () => {
    onSave({ ...editedDraft, lastEditedAt: new Date().toISOString() });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Edit Draft</h2>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-xl font-semibold text-gray-700 mb-2">Subject</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={editedDraft.subject}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="body" className="block text-xl font-semibold text-gray-700 mb-2">Body</label>
        <textarea
          id="body"
          name="body"
          value={editedDraft.body}
          onChange={handleChange}
          rows={15}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y"
        ></textarea>
      </div>

      {/* Suggested Follow-ups */}
      <div>
        <label className="block text-xl font-semibold text-gray-700 mb-2">Suggested Follow-ups</label>
        <div className="space-y-2 mb-3">
          {editedDraft.suggestedFollowUps?.map((followUp, index) => (
            <div key={uuidv4()} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
              <span className="flex-grow text-gray-800">{followUp}</span>
              <Button size="sm" variant="danger" onClick={() => handleRemoveFollowUp(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newFollowUp}
            onChange={(e) => setNewFollowUp(e.target.value)}
            placeholder="Add a new follow-up suggestion..."
            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
          <Button onClick={handleAddFollowUp} variant="secondary">
            Add
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 sticky bottom-0 bg-white pt-4 border-t">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSaveDraft} variant="primary">
          Save Draft
        </Button>
      </div>
    </div>
  );
};