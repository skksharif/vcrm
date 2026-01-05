import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function TLDashboard(){
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { user } = useAuth();
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
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="p-6">Loading Team Lead dashboard...</div></Layout>;
  }

  const getStatusBucket = (stage = '') => {
    if (stage === 'Not Started Yet') return 'pending';
    if (stage === 'Done') return 'completed';
    return 'in-progress';
  };

  const stats = tasks.reduce((acc, t) => {
    const bucket = getStatusBucket(t.stage || 'Not Started Yet');
    acc.total += 1;
    if (bucket === 'completed') acc.completed += 1;
    if (bucket === 'pending') acc.pending += 1;
    if (bucket === 'in-progress') acc.inProgress += 1;
    return acc;
  }, { total: 0, completed: 0, pending: 0, inProgress: 0 });

  const tasksByType = {
    poster: tasks.filter(t => t.type === 'poster').length,
    reel: tasks.filter(t => t.type === 'reel').length,
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

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Lead Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {user?.name} ({user?.role})</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <Stat title="Total Tasks" value={stats.total} color="bg-blue-50" textColor="text-blue-700" />
          <Stat title="Pending" value={stats.pending} color="bg-yellow-50" textColor="text-yellow-700" />
          <Stat title="In Progress" value={stats.inProgress} color="bg-blue-50" textColor="text-blue-700" />
          <Stat title="Completed" value={stats.completed} color="bg-green-50" textColor="text-green-700" />
        </div>

        {/* Task Type Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500 font-medium">Poster Tasks</div>
            <div className="text-3xl font-bold text-indigo-600">{tasksByType.poster}</div>
            <div className="text-xs text-gray-400 mt-2">{((tasksByType.poster / stats.total) * 100 || 0).toFixed(0)}% of total</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-sm text-gray-500 font-medium">Reel Tasks</div>
            <div className="text-3xl font-bold text-pink-600">{tasksByType.reel}</div>
            <div className="text-xs text-gray-400 mt-2">{((tasksByType.reel / stats.total) * 100 || 0).toFixed(0)}% of total</div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
            <button 
              onClick={() => nav('/tl/tasks')} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              View All Tasks
            </button>
          </div>
          <div className="divide-y">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No tasks found</div>
            ) : (
              tasks.slice(0, 8).map(t => {
                const stage = t.stage || 'Not Started Yet';
                const bucket = getStatusBucket(stage);
                return (
                  <div 
                    key={t._id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition border-l-4 ${getStageColor(stage)}`}
                    onClick={() => nav(`/tl/tasks/${t._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{t.title}</h3>
                        <div className="flex gap-2 mt-2 items-center text-sm">
                          <span className="text-gray-600">{t.clientId?.name || 'No Client'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${bucket === 'completed' ? 'bg-green-100 text-green-800' : bucket === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {bucket}
                          </span>
                          <span className={`font-medium ${getStageTextColor(stage)}`}>{stage}</span>
                        </div>
                        {t.assignedTo?.name && (
                          <div className="text-xs text-gray-500 mt-1">Assigned to: {t.assignedTo.name}</div>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : 'No date'}</div>
                        <div className="text-xs mt-1 font-medium text-gray-600">{t.type}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <QuickAction 
            title="Create New Task" 
            description="Add a new task to the queue"
            icon="+"
            onClick={() => nav('/admin/tasks')}
          />
          <QuickAction 
            title="View Calendar" 
            description="See scheduled tasks"
            icon="📅"
            onClick={() => nav('/tl/tasks')}
          />
          <QuickAction 
            title="Team Members" 
            description="Manage assignments"
            icon="👥"
            onClick={() => nav('/admin/users')}
          />
        </div>
      </div>
    </Layout>
  );
}

function Stat({title, value, color, textColor}){
  return (
    <div className={`p-4 ${color} rounded-lg shadow border`}>
      <div className="text-xs text-gray-600 font-medium">{title}</div>
      <div className={`text-3xl font-bold mt-1 ${textColor}`}>{value}</div>
    </div>
  );
}

function QuickAction({title, description, icon, onClick}){
  return (
    <button 
      onClick={onClick}
      className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition text-left"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </button>
  );
}
