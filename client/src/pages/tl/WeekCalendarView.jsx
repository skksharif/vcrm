import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useToast } from '../../contexts/ToastContext';
import AssignEmployeeModal from '../../components/AssignEmployeeModal';

export default function WeekCalendarView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teamlead/tasks');
      const allTasks = res.data.tasks || [];
      setTasks(allTasks);

      // Extract unique clients
      const uniqueClients = [];
      const clientMap = new Map();
      allTasks.forEach((task) => {
        if (task.clientId && !clientMap.has(task.clientId._id)) {
          clientMap.set(task.clientId._id, task.clientId);
          uniqueClients.push(task.clientId);
        }
      });
      setClients(uniqueClients);
    } catch (err) {
      toast.show('Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedClient && task.clientId?._id !== selectedClient) return false;
    if (selectedType && task.type !== selectedType) return false;
    return true;
  });

  // Get tasks for specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter((task) => {
      const taskDate = task.scheduledDate
        ? new Date(task.scheduledDate).toISOString().split('T')[0]
        : null;
      return taskDate === dateStr;
    });
  };

  // Get week days (Monday to Sunday)
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const monday = new Date(curr.setDate(first));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekStartDate = weekDays[0];
  const weekEndDate = weekDays[6];

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleAssignTask = async (stage, employeeId, remarks) => {
    try {
      await api.patch(`/teamlead/tasks/${selectedTask._id}/updateStage`, {
        stage,
        employeeId,
        remarks,
      });
      toast.show('Task updated successfully', 'success');
      fetchTasks();
      setShowAssignModal(false);
      setSelectedTask(null);
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to update task', 'error');
    }
  };

  const getStageColor = (stage) => {
    if (stage?.includes('Approval')) return 'bg-orange-100 border-l-4 border-orange-500';
    if (stage === 'Done') return 'bg-green-100 border-l-4 border-green-500';
    if (stage === 'Ready to Post') return 'bg-purple-100 border-l-4 border-purple-500';
    if (stage === 'Not Started Yet') return 'bg-gray-100 border-l-4 border-gray-500';
    return 'bg-blue-100 border-l-4 border-blue-500';
  };

  const getDayName = (date) => {
    return date.toLocaleString('default', { weekday: 'short' });
  };

  const getFormattedDate = (date) => {
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
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
          <h1 className="text-3xl font-bold text-gray-900">Week View - Task Assignment</h1>
          <p className="text-gray-600 mt-1">
            {getFormattedDate(weekStartDate)} - {getFormattedDate(weekEndDate)}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="poster">Poster</option>
                <option value="reel">Reel</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setSelectedClient('')}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredTasks.length} task(s)
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Week of {getFormattedDate(weekStartDate)}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevWeek}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                ← Prev Week
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-[#026c8a] text-white rounded-lg text-sm font-medium hover:bg-[#025a75]"
              >
                Today
              </button>
              <button
                onClick={handleNextWeek}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Next Week →
              </button>
            </div>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div
                  key={day.toISOString()}
                  className={`border-2 rounded-lg p-3 ${
                    isToday
                      ? 'border-[#026c8a] bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="font-bold text-gray-800 mb-2">
                    {getDayName(day)}
                  </div>
                  <div className={`text-sm ${isToday ? 'text-[#026c8a]' : 'text-gray-600'}`}>
                    {day.getDate()}
                  </div>

                  {/* Tasks for this day */}
                  <div className="mt-3 space-y-2">
                    {dayTasks.length === 0 && (
                      <div className="text-xs text-gray-400 italic">No tasks</div>
                    )}
                    {dayTasks.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => handleTaskClick(task)}
                        className={`text-xs p-2 rounded cursor-pointer hover:shadow-md transition-all ${getStageColor(
                          task.stage
                        )}`}
                        title={task.title}
                      >
                        <div className="font-semibold truncate text-gray-900">
                          {task.title.substring(0, 15)}
                        </div>
                        <div className="text-[10px] text-gray-700 mt-1">
                          {task.clientId?.name?.substring(0, 10)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All tasks for the week (list view) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            All Tasks This Week ({filteredTasks.filter(t => {
              if (!t.scheduledDate) return false;
              const taskDate = new Date(t.scheduledDate);
              return taskDate >= weekStartDate && taskDate <= weekEndDate;
            }).length})
          </h3>

          <div className="space-y-3">
            {filteredTasks
              .filter((task) => {
                if (!task.scheduledDate) return false;
                const taskDate = new Date(task.scheduledDate);
                return taskDate >= weekStartDate && taskDate <= weekEndDate;
              })
              .sort(
                (a, b) =>
                  new Date(a.scheduledDate) - new Date(b.scheduledDate)
              )
              .map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${getStageColor(
                    task.stage
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {task.title}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {task.clientId?.name || 'Unknown Client'} •{' '}
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-700 mt-2">
                        <span className="capitalize font-medium">{task.type}</span> •{' '}
                        <span>{task.stage || 'Not Started Yet'}</span> •{' '}
                        <span>Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {filteredTasks.filter((task) => {
              if (!task.scheduledDate) return false;
              const taskDate = new Date(task.scheduledDate);
              return taskDate >= weekStartDate && taskDate <= weekEndDate;
            }).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No tasks scheduled for this week
              </div>
            )}
          </div>
        </div>

        {/* Assign Modal */}
        {showAssignModal && selectedTask && (
          <AssignEmployeeModal
            taskId={selectedTask._id}
            currentStage={selectedTask.stage || 'Not Started Yet'}
            taskType={selectedTask.type}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedTask(null);
            }}
            onAssign={handleAssignTask}
          />
        )}
      </div>
    </Layout>
  );
}
