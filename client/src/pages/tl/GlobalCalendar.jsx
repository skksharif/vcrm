import React, { useEffect, useState } from 'react';
import GlobalCalendar from '../../components/GlobalCalendar';
import TaskMonitorDrawer from '../../components/TaskMonitorDrawer';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function TLGlobalCalendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
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
      toast.show('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = async (task) => {
    try {
      const res = await api.get(`/teamlead/tasks/${task._id}`);
      setSelectedTask(res.data.task || res.data);
    } catch (err) {
      toast.show('Failed to load task details', 'error');
    }
  };

  const handleApprove = async (taskId) => {
    if (!confirm('Are you sure you want to approve this submission?')) return;
    try {
      await api.patch(`/teamlead/tasks/${taskId}/approveSubmission`, {
        remarks: 'Approved',
      });
      toast.show('Work approved successfully', 'success');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to approve', 'error');
    }
  };

  const handleReject = async (taskId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.patch(`/teamlead/tasks/${taskId}/rejectSubmission`, {
        remarks: reason,
      });
      toast.show('Work rejected', 'success');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to reject', 'error');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Calendar</h1>
            <p className="text-gray-600 mt-1">View all tasks across all clients</p>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <GlobalCalendar allTasks={tasks} onTaskClick={handleTaskClick} />

            {tasks.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 mt-6">
                No tasks found
              </div>
            )}
          </>
        )}

        {selectedTask && (
          <TaskMonitorDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            canApprove={
              selectedTask.currentAssignment?.submittedAt &&
              !selectedTask.currentAssignment?.reviewedAt
            }
            onApprove={() => handleApprove(selectedTask._id)}
            onReject={() => handleReject(selectedTask._id)}
          />
        )}
      </div>
    </Layout>
  );
}
