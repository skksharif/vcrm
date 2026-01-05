import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useToast } from '../../contexts/ToastContext';
import Loader from '../../components/Loader';

export default function EmployeeWorkload() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const toast = useToast();

  useEffect(() => {
    fetchEmployeeWorkload();
  }, []);

  const fetchEmployeeWorkload = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teamlead/tasks/employees/workload');
      setEmployees(res.data.employees || []);
    } catch (err) {
      toast.show('Failed to fetch employee workload', 'error');
      console.error('Error fetching employee workload:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedEmployees = () => {
    const sorted = [...employees];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'assigned':
        return sorted.sort((a, b) => b.assignedTasks - a.assignedTasks);
      case 'inProgress':
        return sorted.sort((a, b) => b.inProgressTasks - a.inProgressTasks);
      case 'completed':
        return sorted.sort((a, b) => b.completedTasks - a.completedTasks);
      default:
        return sorted;
    }
  };

  const getWorkloadColor = (inProgress, assigned) => {
    if (assigned === 0) return 'text-gray-500';
    const percentage = (inProgress / assigned) * 100;
    if (percentage > 80) return 'text-red-600';
    if (percentage > 50) return 'text-orange-600';
    return 'text-green-600';
  };

  const getWorkloadBg = (inProgress, assigned) => {
    if (assigned === 0) return 'bg-gray-50';
    const percentage = (inProgress / assigned) * 100;
    if (percentage > 80) return 'bg-red-50';
    if (percentage > 50) return 'bg-orange-50';
    return 'bg-green-50';
  };

  const sortedEmployees = getSortedEmployees();

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex justify-center items-center min-h-[400px]">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Employee Workload</h1>
          <p className="text-gray-600 mt-1">
            Monitor task assignments and workload distribution across team
          </p>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 flex gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
          >
            <option value="name">Name (A-Z)</option>
            <option value="assigned">Total Assigned Tasks</option>
            <option value="inProgress">In Progress Tasks</option>
            <option value="completed">Completed Tasks</option>
          </select>
        </div>

        {employees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No employees found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedEmployees.map((emp) => (
              <div
                key={emp._id}
                className={`${getWorkloadBg(
                  emp.inProgressTasks,
                  emp.assignedTasks
                )} rounded-lg shadow p-4 border-l-4 border-[#026c8a] transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {emp.name}
                    </h3>
                    <p className="text-sm text-gray-600">{emp.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">
                      Workload Status
                    </div>
                    <div
                      className={`text-2xl font-bold ${getWorkloadColor(
                        emp.inProgressTasks,
                        emp.assignedTasks
                      )}`}
                    >
                      {emp.assignedTasks === 0
                        ? 'No tasks'
                        : `${emp.inProgressTasks}/${emp.assignedTasks}`}
                    </div>
                  </div>
                </div>

                {/* Task breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {emp.assignedTasks}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Total Assigned
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {emp.inProgressTasks}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">In Progress</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">
                      {emp.completedTasks}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Completed</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        emp.inProgressTasks === 0
                          ? 'bg-green-500'
                          : emp.inProgressTasks > emp.assignedTasks * 0.8
                          ? 'bg-red-500'
                          : emp.inProgressTasks > emp.assignedTasks * 0.5
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${
                          emp.assignedTasks === 0
                            ? 0
                            : ((emp.inProgressTasks / emp.assignedTasks) *
                                100) %
                              100
                        }%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {emp.assignedTasks === 0
                      ? 'No active tasks'
                      : `${(
                          (emp.inProgressTasks / emp.assignedTasks) *
                          100
                        ).toFixed(0)}% workload`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
