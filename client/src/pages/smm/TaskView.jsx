import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import MarkPostedModal from '../../components/smm/MarkPostedModal';
import { useToast } from '../../contexts/ToastContext';

export default function TaskView(){
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPostedModal, setShowPostedModal] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/smm/tasks/${id}`);
      setTask(response.data);
    } catch (err) {
      console.error('Error fetching task:', err);
      toast.show('Failed to load task details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    toast.show('Task posted and completed successfully!', 'success');
    setShowPostedModal(false);
    fetchTask();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading task details...</div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</div>
          <div className="text-gray-600 mb-6">The task you're looking for doesn't exist or has been removed.</div>
          <button
            onClick={() => nav('/smm/tasks')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Back to Tasks
          </button>
        </div>
      </Layout>
    );
  }

  const stage = task.currentStage || '';
  const isReady = stage?.toLowerCase().includes('ready');
  const isPosted = stage?.toLowerCase().includes('posted');

  const getStageColor = (stage) => {
    const normalized = stage?.toLowerCase();
    if (normalized?.includes('not')) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (normalized?.includes('content')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (normalized?.includes('approval')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (normalized?.includes('ready')) return 'bg-green-100 text-green-800 border-green-200';
    if (normalized?.includes('posted')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => type === 'Poster' ? '📄' : '🎬';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => nav('/smm/dashboard')} className="hover:text-gray-900">Dashboard</button>
          <span>/</span>
          <button onClick={() => nav('/smm/tasks')} className="hover:text-gray-900">Tasks</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{task.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#026c8a] to-[#034a60] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{getTypeIcon(task.type)}</span>
                <h1 className="text-3xl font-bold">{task.title}</h1>
              </div>
              <p className="text-blue-100">Task ID: {task._id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStageColor(stage)} bg-white`}>
              {stage}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => nav('/smm/tasks')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            ← Back to Tasks
          </button>
          {isReady && (
            <button
              onClick={() => setShowPostedModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Mark as Posted
            </button>
          )}
          {isPosted && (
            <span className="px-6 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
              ✓ Posted & Completed
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <div className="text-gray-900 font-medium mt-1">{task.title}</div>
                </div>

                {task.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <div className="text-gray-900 mt-1 whitespace-pre-wrap">{task.description}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <div className="text-gray-900 mt-1 flex items-center gap-2">
                      <span>{getTypeIcon(task.type)}</span>
                      <span>{task.type}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Stage</label>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(stage)}`}>
                        {stage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="text-gray-900 mt-1">
                      {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="text-gray-900 mt-1">
                      {new Date(task.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Details */}
            {(task.contentUrl || task.caption) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
                
                {task.contentUrl && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Content URL</label>
                    <a
                      href={task.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {task.contentUrl}
                    </a>
                  </div>
                )}

                {task.caption && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Caption</label>
                    <div className="p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
                      {task.caption}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Posted Information */}
            {isPosted || isDone && task.postDetails && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Posted Information</h2>
                
                <div className="space-y-3">
                  {task.postedBy?.name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Posted By</label>
                      <div className="text-gray-900 mt-1">{task.postedBy.name}</div>
                    </div>
                  )}

                  {task.postedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Posted At</label>
                      <div className="text-gray-900 mt-1">{new Date(task.postedAt).toLocaleString()}</div>
                    </div>
                  )}

                  {task.postDetails?.platform && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Platform</label>
                      <div className="text-gray-900 mt-1">{task.postDetails.platform}</div>
                    </div>
                  )}

                  {task.postDetails?.link && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Post Link</label>
                      <a
                        href={task.postDetails.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all block mt-1"
                      >
                        {task.postDetails.link}
                      </a>
                    </div>
                  )}

                  {task.postDetails?.remarks && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Remarks</label>
                      <div className="text-gray-900 mt-1 whitespace-pre-wrap">
                        {task.postDetails.remarks}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            {task.clientId && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Client</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <div className="text-gray-900 font-medium mt-1">{task.clientId.name}</div>
                  </div>

                  {task.clientId.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="text-gray-900 mt-1">{task.clientId.email}</div>
                    </div>
                  )}

                  {task.clientId.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <div className="text-gray-900 mt-1">{task.clientId.phone}</div>
                    </div>
                  )}

                  <button
                    onClick={() => nav(`/admin/clients/${task.clientId._id}`)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm mt-3"
                  >
                    View Client Profile
                  </button>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h2>
              
              <div className="space-y-4">
                <div className={`flex items-start gap-3 ${isDone || isReady ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDone || isReady ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone || isReady ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Ready to Post</div>
                    <div className="text-xs text-gray-500">Task is prepared and ready</div>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${isDone ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDone ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isDone ? '✓' : '2'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Posted & Done</div>
                    <div className="text-xs text-gray-500">Content published and completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-2">
                {isReady && (
                  <button
                    onClick={() => setShowPostedModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    Mark as Posted
                  </button>
                )}
                <button
                  onClick={() => nav('/smm/tasks')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {task && (
        <MarkPostedModal
          isOpen={showPostedModal}
          onClose={() => setShowPostedModal(false)}
          task={task}
          onSuccess={handleModalSuccess}
        />
      )}
    </Layout>
  );
}