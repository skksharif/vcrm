import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function TaskView(){
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionState, setActionState] = useState(''); // 'accept', 'reject', 'submit'

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/employee/tasks/${id}`);
      setTask(res.data.task);
    } catch (err) {
      if (toast && toast.show) toast.show('Failed to load task', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/employee/tasks/${id}/accept`);
      if (toast && toast.show) toast.show('Task accepted successfully! ✅', 'success');
      fetchTask();
    } catch (err) {
      if (toast && toast.show) toast.show(err.response?.data?.message || 'Failed to accept task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectTask = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/employee/tasks/${id}/reject`);
      if (toast && toast.show) toast.show('Task rejected', 'success');
      fetchTask();
    } catch (err) {
      if (toast && toast.show) toast.show(err.response?.data?.message || 'Failed to reject task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!remarks.trim()) {
      if (toast && toast.show) toast.show('Please add remarks before submitting', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.patch(`/employee/tasks/${id}/submit`, { remarks });
      if (toast && toast.show) toast.show('Work submitted successfully! ✅', 'success');
      setRemarks('');
      setActionState('');
      fetchTask();
    } catch (err) {
      if (toast && toast.show) toast.show(err.response?.data?.message || 'Failed to submit work', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (stage) => {
    if (!stage) return 'bg-gray-100 text-gray-800 border-gray-300';
    const lower = stage.toLowerCase();
    if (lower.includes('not started')) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (lower.includes('content') || lower.includes('writing')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (lower.includes('design') || lower.includes('shooting')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (lower.includes('editing')) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (lower.includes('approval')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (lower.includes('ready')) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const canAcceptTask = task && task.acceptanceStatus === 'pending';
  const canSubmitWork = task && task.acceptanceStatus === 'accepted' && !task.submittedWork;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Task not found</h2>
          <button onClick={() => nav('/employee/tasks')} className="mt-4 text-blue-600 hover:underline">
            Back to Tasks
          </button>
        </div>
      </Layout>
    );
  }

  const canSubmit = task.status === 'pending' || task.status === 'in_progress';
  const canResubmit = task.status === 'rejected';

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => nav('/employee/tasks')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tasks
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStageColor(task.currentStage)}`}>
              {task.currentStage || 'Not Started'}
            </span>
          </div>
        </div>

        {/* Alert for Pending Acceptance */}
        {canAcceptTask && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-yellow-800 font-semibold">Task Assigned to You</h3>
                <p className="text-yellow-700 text-sm mt-1">This task has been assigned to you. You need to accept or reject it before proceeding.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Task Details</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-800">{task.type || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Current Stage</p>
                    <p className="font-semibold text-gray-800">{task.currentStage ? task.currentStage.replace(/_/g, ' ') : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Acceptance Status</p>
                    <p className="font-semibold text-gray-800">
                      {task.acceptanceStatus ? task.acceptanceStatus.charAt(0).toUpperCase() + task.acceptanceStatus.slice(1) : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold text-gray-800">{new Date(task.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-semibold text-gray-800">{new Date(task.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Submission Card */}
            {(canAcceptTask || canSubmitWork) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {canAcceptTask ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Task Assignment</h2>
                    <p className="text-gray-700 mb-4">You need to accept this task assignment before you can start working on it.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptTask}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Accepting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept Task
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleRejectTask}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject Task
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : canSubmitWork ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Submit Work</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Remarks / Notes *
                        </label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Describe what you've completed, any challenges faced, or additional notes..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="6"
                        />
                      </div>
                      
                      <button
                        onClick={handleSubmitWork}
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Submit Work
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Task Stage History */}
            {task.stageHistory && task.stageHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Stage History</h2>
                <div className="space-y-4">
                  {task.stageHistory.slice().reverse().map((history, idx) => {
                    const normalized = (history.stage || '').toLowerCase();
                    const showAssign = !normalized.includes('approval') && !normalized.includes('posted') && !normalized.includes('not yet started');
                    return (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{history.stage}</p>
                        {history.remarks && (
                          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">{history.remarks}</p>
                        )}
                        {showAssign && (history.assignedBy || history.assignedTo) && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned By: {history.assignedBy?.name || 'Unknown'}
                            {history.assignedTo?.name ? ` • Assigned To: ${history.assignedTo.name}` : ''}
                          </p>
                        )}
                        {!showAssign && history.updatedBy && (
                          <p className="text-xs text-gray-500 mt-1">By {history.updatedBy.name || 'System'}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{new Date(history.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => nav('/employee/tasks')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Back to Tasks
                </button>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Need Help?
              </h3>
              <p className="text-sm text-blue-800">
                If you're stuck or need clarification on this task, contact your team lead or check the feedback section for guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}