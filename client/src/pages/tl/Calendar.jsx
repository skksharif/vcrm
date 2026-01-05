import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ClientCalendar from '../../components/ClientCalendar';
import { useToast } from '../../contexts/ToastContext';

export default function TLCalendar() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchClientTasks(selectedClient);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Get unique clients from tasks
      const res = await api.get('/teamlead/tasks');
      const allTasks = res.data.tasks || [];
      
      const uniqueClients = [];
      const clientMap = new Map();
      
      allTasks.forEach(task => {
        if (task.clientId && !clientMap.has(task.clientId._id)) {
          clientMap.set(task.clientId._id, task.clientId);
          uniqueClients.push(task.clientId);
        }
      });
      
      setClients(uniqueClients);
      if (uniqueClients.length > 0) {
        setSelectedClient(uniqueClients[0]._id);
      }
    } catch (err) {
      toast.show('Failed to fetch clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientTasks = async (clientId) => {
    try {
      const res = await api.get('/teamlead/tasks', {
        params: { clientId }
      });
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.show('Failed to fetch client tasks', 'error');
    }
  };

  const handleTaskClick = (task) => {
    // Navigate to task detail page or open modal
    window.location.href = `/tl/tasks/${task._id}`;
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Client Calendar</h1>
          <p className="text-gray-600 mt-1">View tasks by client</p>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No clients found with tasks
          </div>
        ) : (
          <>
            {/* Client Selector */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client
              </label>
              <select
                value={selectedClient || ''}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              >
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} {client.companyName ? `(${client.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {clients.find((c) => c._id === selectedClient)?.name || 'Client'} Tasks
              </h2>
              
              {tasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No tasks found for this client
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {tasks.length} task(s)
                  </div>
                  <ClientCalendar tasks={tasks} onTaskClick={handleTaskClick} />
                </>
              )}
            </div>

            {/* Task List */}
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-800">Task List</h3>
              {tasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-[#026c8a]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{task.title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {task.currentStage || task.stage || 'Not Started Yet'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.scheduledDate
                        ? new Date(task.scheduledDate).toLocaleDateString()
                        : 'No date'}
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
