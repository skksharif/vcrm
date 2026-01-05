import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import TaskStatusTimeline from '../../components/TaskStatusTimeline';
import AssignEmployeeModal from '../../components/AssignEmployeeModal';

export default function TLTaskView() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teamlead/tasks/${id}`);
      setTask(res.data.task || res.data);
    } catch (err) {
      toast.show('Failed to fetch task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (newStage, employeeId, remarks) => {
    setUpdatingStage(true);
    try {
      await api.patch(`/teamlead/tasks/${id}/updateStage`, {
        stage: newStage,
        employeeId,
        remarks,
      });
      toast.show('Stage updated successfully', 'success');
      fetchTask();
      setShowAssignModal(false);
    } catch (err) {
      console.error('Update stage error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to update stage';
      toast.show(errorMsg, 'error');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this submission?')) return;
    try {
      await api.patch(`/teamlead/tasks/${id}/approveSubmission`, {
        remarks: 'Approved',
      });
      toast.show('Work approved successfully', 'success');
      fetchTask();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to approve', 'error');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/teamlead/tasks/${id}/rejectSubmission`, {
        remarks: reason,
      });
      toast.show('Work rejected', 'success');
      fetchTask();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to reject', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#026c8a]"></div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Task not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStage = task.currentStage || task.stage || 'Not Started Yet';
  const canApprove = task.currentAssignment?.submittedAt && !task.currentAssignment?.reviewedAt;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
          <button
            onClick={() => nav('/tl/tasks')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            ← Back to Tasks
          </button>
        </div>

        {/* Task Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
              <div className="text-sm text-gray-600 mt-2">
                Client: {task.clientId?.name || 'Unknown'}
              </div>
            </div>
            <div className="flex gap-2 flex-col items-end">
              <span className="text-xs font-bold px-3 py-1 rounded bg-blue-100 text-blue-700">
                {currentStage}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium capitalize">{task.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Assigned to:</span>
              <span className="ml-2 font-medium">
                {task.currentAssignment?.assignedTo?.name || 'Unassigned'}
              </span>
            </div>
            {task.scheduledDate && (
              <div>
                <span className="text-gray-500">Scheduled:</span>
                <span className="ml-2 font-medium">
                  {new Date(task.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {task.createdAt && (
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {task.description && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
              <p className="text-gray-600">{task.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Actions</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setShowAssignModal(true)}
              disabled={updatingStage}
              className="px-4 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#025a75] disabled:opacity-50"
            >
              Update Stage & Assign
            </button>
            {canApprove && (
              <>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Approve Work
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✗ Reject Work
                </button>
              </>
            )}
          </div>
        </div>

        {/* Submission Details */}
        {task.currentAssignment?.submittedAt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-3">Work Submitted</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Submitted At:</span>
                <span className="ml-2 font-medium">
                  {new Date(task.currentAssignment.submittedAt).toLocaleString()}
                </span>
              </div>
              {task.currentAssignment.submissionRemarks && (
                <div>
                  <span className="text-gray-600">Remarks:</span>
                  <p className="mt-1 text-gray-700">{task.currentAssignment.submissionRemarks}</p>
                </div>
              )}
              {task.currentAssignment.submittedFileUrl && (
                <div>
                  <span className="text-gray-600">File:</span>
                  <a
                    href={task.currentAssignment.submittedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-[#026c8a] hover:underline"
                  >
                    View Submission
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Stage History</h3>
          {task.stageHistory && task.stageHistory.length > 0 ? (
            <TaskStatusTimeline statusHistory={task.stageHistory} />
          ) : (
            <p className="text-gray-500">No history available</p>
          )}
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <AssignEmployeeModal
            taskId={task._id}
            currentStage={currentStage}
            taskType={task.type}
            onClose={() => setShowAssignModal(false)}
            onAssign={handleUpdateStage}
          />
        )}
      </div>
    </Layout>
  );
}
