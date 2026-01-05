import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useToast } from '../../contexts/ToastContext';
import AssignEmployeeModal from '../../components/AssignEmployeeModal';

export default function TaskCalendarView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month or week
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

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

  // Filter tasks based on selections
  const filteredTasks = tasks.filter((task) => {
    if (selectedClient && task.clientId?._id !== selectedClient) return false;
    if (selectedType && task.type !== selectedType) return false;
    if (selectedStage && task.stage !== selectedStage) return false;
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

  // Get calendar days for current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getStageColor = (stage) => {
    if (stage?.includes('Approval')) return 'bg-orange-100 border-orange-300';
    if (stage === 'Done') return 'bg-green-100 border-green-300';
    if (stage === 'Ready to Post') return 'bg-purple-100 border-purple-300';
    if (stage === 'Not Started Yet') return 'bg-gray-100 border-gray-300';
    return 'bg-blue-100 border-blue-300';
  };

  const getStageTextColor = (stage) => {
    if (stage?.includes('Approval')) return 'text-orange-700';
    if (stage === 'Done') return 'text-green-700';
    if (stage === 'Ready to Post') return 'text-purple-700';
    if (stage === 'Not Started Yet') return 'text-gray-700';
    return 'text-blue-700';
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
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

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const days = getDaysInMonth();

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
          <h1 className="text-3xl font-bold text-gray-900">Task Calendar</h1>
          <p className="text-gray-600 mt-1">
            View and assign tasks by date - Click on tasks to manage
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              >
                <option value="">All Stages</option>
                <option value="Not Started Yet">Not Started Yet</option>
                <option value="Content Writing">Content Writing</option>
                <option value="Content Client Approval">
                  Content Client Approval
                </option>
                <option value="Designing">Designing</option>
                <option value="Design Client Approval">
                  Design Client Approval
                </option>
                <option value="Shooting">Shooting</option>
                <option value="Editing">Editing</option>
                <option value="Editing Client Approval">
                  Editing Client Approval
                </option>
                <option value="Ready to Post">Ready to Post</option>
                <option value="Posted">Posted</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedClient('');
                  setSelectedType('');
                  setSelectedStage('');
                }}
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

        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {monthName} {year}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                ← Prev
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-[#026c8a] text-white rounded-lg text-sm font-medium hover:bg-[#025a75]"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
              {days.map((day, idx) => {
                const dayTasks = day ? getTasksForDate(day) : [];
                const isToday =
                  day &&
                  new Date().toDateString() === day.toDateString();
                const isCurrentMonth =
                  day && day.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={idx}
                    className={`min-h-24 p-2 ${
                      isCurrentMonth
                        ? 'bg-white'
                        : 'bg-gray-50'
                    } ${isToday ? 'bg-blue-50 border-2 border-[#026c8a]' : ''}`}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-semibold mb-1 ${
                            isToday
                              ? 'text-[#026c8a]'
                              : isCurrentMonth
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {day.getDate()}
                        </div>

                        {/* Tasks for this day */}
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map((task) => (
                            <div
                              key={task._id}
                              onClick={() => handleTaskClick(task)}
                              className={`text-xs p-1.5 rounded cursor-pointer hover:shadow-md transition-all border ${getStageColor(
                                task.stage
                              )} ${getStageTextColor(task.stage)}`}
                              title={task.title}
                            >
                              <div className="font-semibold truncate">
                                {task.title.substring(0, 12)}...
                              </div>
                              <div className="text-[10px] opacity-75 truncate">
                                {task.clientId?.name || 'Client'}
                              </div>
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-600 px-1">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold text-gray-700 mb-2">Legend:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Not Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                <span>Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        {filteredTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Upcoming Tasks (Next 7 Days)
            </h3>
            <div className="space-y-3">
              {filteredTasks
                .filter((task) => {
                  if (!task.scheduledDate) return false;
                  const taskDate = new Date(task.scheduledDate);
                  const today = new Date();
                  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return taskDate >= today && taskDate <= sevenDaysLater;
                })
                .sort(
                  (a, b) =>
                    new Date(a.scheduledDate) - new Date(b.scheduledDate)
                )
                .map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleTaskClick(task)}
                    className="flex justify-between items-start p-3 border-l-4 border-[#026c8a] bg-gray-50 rounded hover:bg-white cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {task.title}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {task.clientId?.name || 'Unknown Client'} •{' '}
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="capitalize">{task.type}</span> •{' '}
                        <span>{task.stage || 'Not Started Yet'}</span>
                      </div>
                    </div>
                  </div>
                ))}

              {filteredTasks.filter((task) => {
                if (!task.scheduledDate) return false;
                const taskDate = new Date(task.scheduledDate);
                const today = new Date();
                const sevenDaysLater = new Date(
                  today.getTime() + 7 * 24 * 60 * 60 * 1000
                );
                return taskDate >= today && taskDate <= sevenDaysLater;
              }).length === 0 && (
                <div className="text-center text-gray-500 py-6">
                  No tasks scheduled for the next 7 days
                </div>
              )}
            </div>
          </div>
        )}

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
