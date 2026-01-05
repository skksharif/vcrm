import React, { useState } from 'react';
import Modal from '../ui/Modal';
import api from '../../services/api';

export default function MarkPostedModal({ isOpen, onClose, task, onSuccess }) {
  const [formData, setFormData] = useState({
    platform: '',
    link: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    'Facebook',
    'Instagram',
    'Twitter',
    'LinkedIn',
    'TikTok',
    'YouTube',
    'Pinterest',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.platform) {
      setError('Please select a platform');
      return;
    }
    
    if (!formData.link) {
      setError('Please provide a link to the post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Calling API: PATCH /smm/tasks/' + task._id + '/post');
      console.log('Payload:', formData);
      
      const response = await api.patch(`/smm/tasks/${task._id}/post`, {
        platform: formData.platform,
        link: formData.link,
        remarks: formData.remarks
      });
      
      console.log('✓ Mark Posted Success:', response.data);
      console.log('✓ Task auto-completed:', response.data.autoCompleted);

      // Reset form first
      setFormData({ platform: '', link: '', remarks: '' });
      
      // Close modal
      onClose();
      
      // Call success callback to refresh data
      if (onSuccess) {
        console.log('Calling onSuccess callback to refresh task list...');
        onSuccess();
      }
    } catch (err) {
      console.error('✗ Mark Posted Error:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to mark task as posted');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ platform: '', link: '', remarks: '' });
    setError('');
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Mark Task as Posted & Complete">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Task Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">{task?.title}</div>
          <div className="text-xs text-gray-600">{task?.clientId?.name} • {task?.type}</div>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-green-600 text-lg">✓</div>
            <div className="text-xs text-green-800">
              This will mark the task as posted and automatically complete it.
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Platform</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>

        {/* Post Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter the full URL of the posted content</p>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks (Optional)
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={3}
            placeholder="Add any notes or observations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Posting & Completing...' : 'Mark as Posted & Complete'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
