import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export default function TLTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('');
  const [filterType, setFilterType] = useState('');
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teamlead/tasks');
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.show('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    if (stage?.includes('Approval')) return 'bg-orange-50 border-orange-200';
    if (stage === 'Done') return 'bg-green-50 border-green-200';
    if (stage === 'Ready to Post') return 'bg-purple-50 border-purple-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getStageTextColor = (stage) => {
    if (stage?.includes('Approval')) return 'text-orange-700';
    if (stage === 'Done') return 'text-green-700';
    if (stage === 'Ready to Post') return 'text-purple-700';
    return 'text-blue-700';
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStage && task.stage !== filterStage) return false;
    if (filterType && task.type !== filterType) return false;
    return true;
  });

  const stages = [...new Set(tasks.map((t) => t.stage).filter(Boolean))];

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assigned Tasks</h1>
          <button
            onClick={() => nav('/tl')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Stage
              </label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="poster">Poster</option>
                <option value="reel">Reel</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStage('');
                  setFilterType('');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#026c8a]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No tasks found
              </div>
            )}
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => nav(`/tl/tasks/${task._id}`)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-[#026c8a]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.clientId?.name || 'Unknown Client'}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded ${getStageTextColor(
                        task.stage
                      )} ${getStageColor(task.stage)}`}
                    >
                      {task.stage || 'Not Started Yet'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{task.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned to:</span>
                    <span className="ml-2 font-medium">
                      {task.assignedTo?.name || 'Unassigned'}
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
                  {task.updatedAt && (
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {task.description && (
                  <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {task.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
