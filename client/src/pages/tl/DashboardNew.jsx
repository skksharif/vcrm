import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import StatCard from '../../components/StatCard';

export default function TLDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const tasksRes = await api.get('/teamlead/tasks');
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      toast.show('Failed to fetch dashboard data', 'error');
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

  const getStatusBucket = (stage = '') => {
    if (stage === 'Not Started Yet') return 'pending';
    if (stage === 'Done') return 'completed';
    return 'in-progress';
  };

  const stats = tasks.reduce(
    (acc, t) => {
      const bucket = getStatusBucket(t.stage || 'Not Started Yet');
      acc.total += 1;
      if (bucket === 'completed') acc.completed += 1;
      if (bucket === 'pending') acc.pending += 1;
      if (bucket === 'in-progress') acc.inProgress += 1;
      return acc;
    },
    { total: 0, completed: 0, pending: 0, inProgress: 0 }
  );

  const tasksByType = {
    poster: tasks.filter((t) => t.type === 'poster').length,
    reel: tasks.filter((t) => t.type === 'reel').length,
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

  const recentTasks = tasks.slice(0, 5);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Lead Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.name} ({user?.role})
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => nav('/tl/tasks')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left border-l-4 border-[#026c8a]"
          >
            <div className="text-sm text-gray-600 font-medium">View All Tasks</div>
            <div className="text-2xl font-bold text-[#026c8a] mt-1">{stats.total}</div>
          </button>
          <button
            onClick={() => nav('/tl/calendar-assign')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left border-l-4 border-purple-500"
          >
            <div className="text-sm text-gray-600 font-medium">Calendar View</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">📅</div>
          </button>
          <button
            onClick={() => nav('/tl/employees')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left border-l-4 border-green-500"
          >
            <div className="text-sm text-gray-600 font-medium">Employee Workload</div>
            <div className="text-2xl font-bold text-green-600 mt-1">👥</div>
          </button>
          <button
            onClick={() => nav('/profile')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left border-l-4 border-indigo-500"
          >
            <div className="text-sm text-gray-600 font-medium">My Profile</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">👤</div>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            color="bg-blue-50"
            textColor="text-blue-700"
            icon="📋"
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            color="bg-yellow-50"
            textColor="text-yellow-700"
            icon="⏳"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            color="bg-blue-50"
            textColor="text-blue-700"
            icon="🔄"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            color="bg-green-50"
            textColor="text-green-700"
            icon="✅"
          />
        </div>

        {/* Task Type Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500 font-medium">Poster Tasks</div>
            <div className="text-3xl font-bold text-indigo-600">{tasksByType.poster}</div>
            <div className="text-xs text-gray-400 mt-2">
              {((tasksByType.poster / stats.total) * 100 || 0).toFixed(0)}% of total
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500 font-medium">Reel Tasks</div>
            <div className="text-3xl font-bold text-pink-600">{tasksByType.reel}</div>
            <div className="text-xs text-gray-400 mt-2">
              {((tasksByType.reel / stats.total) * 100 || 0).toFixed(0)}% of total
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Tasks</h2>
            <button
              onClick={() => nav('/tl/tasks')}
              className="text-sm text-[#026c8a] hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 && (
              <div className="text-center text-gray-500 py-8">No tasks available</div>
            )}
            {recentTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => nav(`/tl/tasks/${task._id}`)}
                className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getStageColor(
                  task.stage
                )}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{task.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {task.clientId?.name || 'Unknown Client'}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${getStageTextColor(
                        task.stage
                      )} bg-white`}
                    >
                      {task.stage || 'Not Started Yet'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span className="capitalize">{task.type}</span>
                  {task.assignedTo && (
                    <span>Assigned to: {task.assignedTo.name || 'N/A'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
