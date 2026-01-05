import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

export default function SMMDashboard(){
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    clientId: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  });
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tasksRes = await api.get('/smm/tasks');
      const tasksData = tasksRes.data.tasks || tasksRes.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      
      // Extract unique clients from tasks
      const uniqueClients = [];
      const clientIds = new Set();
      tasksData.forEach(task => {
        if (task.clientId && task.clientId._id && !clientIds.has(task.clientId._id)) {
          clientIds.add(task.clientId._id);
          uniqueClients.push(task.clientId);
        }
      });
      setClients(uniqueClients);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.show('Failed to load dashboard data', 'error');
      setTasks([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.clientId) params.append('clientId', filters.clientId);
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFrom) params.append('from', filters.dateFrom);
      if (filters.dateTo) params.append('to', filters.dateTo);
      
      const response = await api.get(`/smm/tasks?${params.toString()}`);
      const tasksData = response.data.tasks || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error('Error fetching filtered tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      clientId: '',
      type: '',
      dateFrom: '',
      dateTo: ''
    });
    fetchData();
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-64"><div className="text-lg">Loading...</div></div></Layout>;
  }

  const stats = {
    total: tasks.length,
    ready: tasks.filter(t => t.stage === 'Ready to Post').length,
    done: tasks.filter(t => t.stage === 'Done').length
  };

  const getStageColor = (stage) => {
    const normalized = stage?.toLowerCase();
    if (normalized?.includes('ready')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (normalized?.includes('post')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (normalized?.includes('done')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => type === 'Poster' ? '📄' : '🎬';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#026c8a] to-[#034a60] rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Social Media Manager Dashboard</h1>
          <p className="text-blue-100">Manage your content posting schedule</p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-100 mb-1">Total Tasks</div>
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
              <div className="text-4xl opacity-80">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-indigo-100 mb-1">Ready to Post</div>
                <div className="text-3xl font-bold">{stats.ready}</div>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-100 mb-1">Completed</div>
                <div className="text-3xl font-bold">{stats.done}</div>
              </div>
              <div className="text-4xl opacity-80">✓</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Filter Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select
                value={filters.clientId}
                onChange={(e) => setFilters({...filters, clientId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Poster">Poster</option>
                <option value="Reel">Reel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ready to Post */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Ready to Post</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {stats.ready}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.stage === 'Ready to Post').slice(0, 5).map(task => (
                <div
                  key={task._id}
                  onClick={() => nav(`/smm/tasks/${task._id}`)}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{task.clientId?.name}</div>
                    </div>
                    <span className="text-lg ml-2">{getTypeIcon(task.type)}</span>
                  </div>
                </div>
              ))}
              {stats.ready === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No tasks ready</div>
              )}
            </div>
          </div>

          {/* Done */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Completed</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {stats.done}
              </span>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.stage === 'Done').slice(0, 5).map(task => (
                <div
                  key={task._id}
                  onClick={() => nav(`/smm/tasks/${task._id}`)}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{task.clientId?.name}</div>
                    </div>
                    <span className="text-lg ml-2">{getTypeIcon(task.type)}</span>
                  </div>
                </div>
              ))}
              {stats.done === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No completed tasks</div>
              )}
            </div>
          </div>
        </div>

        {/* All Tasks Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
            <button
              onClick={() => nav('/smm/tasks')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.slice(0, 10).map(task => (
                  <tr
                    key={task._id}
                    onClick={() => nav(`/smm/tasks/${task._id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{task.clientId?.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        {getTypeIcon(task.type)} {task.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(task.stage)}`}>
                        {task.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
