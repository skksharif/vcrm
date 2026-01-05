import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import { useToast } from '../../contexts/ToastContext';

export default function AdminTasks(){
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'poster', client: '', scheduledDate: '' });
  const toast = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tasks');
      setTasks(Array.isArray(res.data) ? res.data : res.data.tasks || []);
    } catch (err) {
      toast.show('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data.clients || []);
    } catch (err) {
      console.error('Failed to load clients');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchClients();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.client) {
      toast.show('Please fill in all required fields', 'error');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/admin/tasks', {
        title: form.title,
        description: form.description,
        type: form.type,
        clientId: form.client,
        scheduledDate: form.scheduledDate
      });
      const newTask = res.data.task;
      setTasks(prev => [newTask, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', type: 'poster', client: '', scheduledDate: '' });
      toast.show('Task created successfully! ✅', 'success');
    } catch (err) {
      toast.show(err.response?.data?.message || err.response?.data?.error || 'Failed to create task', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.show('Task deleted', 'success');
    } catch (err) {
      toast.show('Failed to delete task', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#026c8a]"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage all project tasks and assignments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#034a60] transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">No tasks yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-[#026c8a] hover:underline font-medium"
            >
              Create your first task →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <div key={task._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{task.type} • {task.clientId?.name || 'No Client'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.currentStage === 'Posted' ? 'bg-green-100 text-green-800' :
                      task.currentStage?.includes('Ready') ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.currentStage || 'Not Started'}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 line-clamp-2">
                    {task.description}
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/admin/clients/${task.clientId?._id || ''}`}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      View Client
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Task">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
              <input
                type="text"
                placeholder="e.g., Instagram Post - Product Launch"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Task details and requirements..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent resize-none"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
                >
                  <option value="poster">Poster</option>
                  <option value="reel">Reel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm({ title: '', description: '', type: 'poster', client: '', scheduledDate: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#034a60] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}