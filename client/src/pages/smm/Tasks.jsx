import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import MarkPostedModal from '../../components/smm/MarkPostedModal';
import { useToast } from '../../contexts/ToastContext';

export default function SMMTasks(){
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    clientId: '',
    type: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPostedModal, setShowPostedModal] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching tasks...');
      const tasksRes = await api.get('/smm/tasks');
      console.log('Tasks Response:', tasksRes.data);
      const tasksData = tasksRes.data.tasks || tasksRes.data || [];
      console.log('Tasks Data:', tasksData.length, 'tasks');
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
      toast.show('Failed to load tasks', 'error');
      setTasks([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPosted = (task) => {
    if (!task || !task._id) {
      toast.show('Invalid task selected', 'error');
      return;
    }
    setSelectedTask(task);
    setShowPostedModal(true);
  };

  const handleModalSuccess = async () => {
    console.log('handleModalSuccess called - refreshing data...');
    toast.show('Task posted and completed successfully!', 'success');
    setShowPostedModal(false);
    setSelectedTask(null);
    
    // Small delay to ensure backend has committed changes
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await fetchData();
    console.log('Data refreshed');
  };

  const getStageColor = (stage) => {
    const normalized = stage?.toLowerCase();
    if (normalized?.includes('ready')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (normalized?.includes('post')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (normalized?.includes('done')) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type) => type === 'Poster' ? '📄' : '🎬';

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'ready') {
        filtered = filtered.filter(t => t.stage === 'Ready to Post');
      } else if (activeTab === 'done') {
        filtered = filtered.filter(t => t.stage === 'Done');
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.clientId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Client filter
    if (filters.clientId) {
      filtered = filtered.filter(t => t.clientId?._id === filters.clientId);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const stats = {
    all: tasks.length,
    ready: tasks.filter(t => t.stage === 'Ready to Post').length,
    done: tasks.filter(t => t.stage === 'Done').length
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="text-lg">Loading...</div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#026c8a] to-[#034a60] rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Publishing Queue</h1>
          <p className="text-blue-100">Manage and track your content posting tasks</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or clients..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Poster">Poster</option>
                <option value="Reel">Reel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Tasks
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">{stats.all}</span>
            </button>
            <button
              onClick={() => setActiveTab('ready')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'ready'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ready to Post
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">{stats.ready}</span>
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'done'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Completed
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">{stats.done}</span>
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📭</div>
            <div className="text-lg font-medium text-gray-900 mb-2">No tasks found</div>
            <div className="text-sm text-gray-600">
              {searchQuery || filters.clientId || filters.type
                ? 'Try adjusting your filters'
                : 'No tasks available in this category'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => {
              const stage = task.stage || '';
              const isReady = stage === 'Ready to Post';
              const isPosted = stage === 'Posted';

              return (
                <div
                  key={task._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{getTypeIcon(task.type)}</span>
                          <span>{task.type}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(stage)}`}>
                        {stage}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <div className="font-medium">{task.clientId?.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Updated {new Date(task.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => nav(`/smm/tasks/${task._id}`)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                      >
                        View Details
                      </button>
                      {isReady && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPosted(task);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                        >
                          Mark Posted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedTask && (
        <MarkPostedModal
          isOpen={showPostedModal}
          onClose={() => setShowPostedModal(false)}
          task={selectedTask}
          onSuccess={handleModalSuccess}
        />
      )}
    </Layout>
  );
}