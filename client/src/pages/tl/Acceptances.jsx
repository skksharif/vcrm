import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export default function TLAcceptances() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchPendingAcceptances();
  }, []);

  const fetchPendingAcceptances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teamlead/tasks/pending-acceptances');
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.show('Failed to fetch pending acceptances', 'error');
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Acceptances</h1>
            <p className="text-gray-600 mt-1">
              Tasks awaiting employee acceptance ({tasks.length})
            </p>
          </div>
          <button
            onClick={() => nav('/tl')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No tasks are awaiting employee acceptance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.clientId?.name || 'Unknown Client'}
                    </div>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded">
                    PENDING ACCEPTANCE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{task.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stage:</span>
                    <span className="ml-2 font-medium">
                      {task.currentStage || task.stage || 'Not Started Yet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned to:</span>
                    <span className="ml-2 font-medium">
                      {task.currentAssignment?.assignedTo?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                {task.currentAssignment?.assignedAt && (
                  <div className="text-xs text-gray-500 mb-3">
                    Assigned on:{' '}
                    {new Date(task.currentAssignment.assignedAt).toLocaleString()}
                  </div>
                )}

                {task.currentAssignment?.remarks && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <span className="text-xs text-gray-600 font-medium">Assignment Remarks:</span>
                    <p className="text-sm text-gray-700 mt-1">
                      {task.currentAssignment.remarks}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => nav(`/tl/tasks/${task._id}`)}
                    className="px-4 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#025a75] text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(task._id);
                      toast.show('Task ID copied to clipboard', 'success');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                  >
                    Copy Task ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Pending Acceptances</h3>
          <p className="text-sm text-blue-800">
            These tasks have been assigned to employees but haven't been accepted yet. Once an
            employee accepts a task, it will be removed from this list and work can begin.
          </p>
        </div>
      </div>
    </Layout>
  );
}
