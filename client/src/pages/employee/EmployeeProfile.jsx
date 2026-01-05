import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get("/employee/profile"),
          api.get("/employee/profile/work-history")
        ]);

        setProfile(profileRes.data || null);
        setStats(historyRes.data?.stats || null);
        setHistory(historyRes.data?.workHistory || []);
      } catch (err) {
        console.error('Failed to fetch employee profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <div className="text-red-500 text-xl">Profile not found</div>
          <button onClick={() => nav('/employee')} className="mt-4 text-blue-600 hover:underline">
            Go to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">View your profile information and work history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              {/* Avatar */}
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profile.name?.charAt(0).toUpperCase() || 'E'}
                </div>
              </div>

              {/* Name and Role */}
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {profile.name}
              </h2>
              <p className="text-blue-600 font-medium mb-4">{profile.role}</p>

              {/* Contact Info */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-800 truncate">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm text-gray-800">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => nav('/change-password')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
                <button
                  onClick={() => nav('/employee/tasks')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  View My Tasks
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Completed Tasks" value={stats?.completedTasks || 0} color="from-green-500 to-green-600" />
              <StatCard label="Total Assignments" value={stats?.totalAssignments || 0} color="from-blue-500 to-blue-600" />
              <StatCard label="Submitted" value={stats?.submittedTasks || 0} color="from-amber-500 to-amber-600" />
              <StatCard label="In Progress" value={stats?.inProgress || 0} color="from-purple-500 to-purple-600" />
            </div>

            {/* Work Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Work Timeline</h2>
                <span className="text-sm text-gray-500">
                  {profile.workTimeline?.length || 0} entries
                </span>
              </div>

              {!history || history.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No work history</h3>
                  <p className="mt-1 text-sm text-gray-500">Your work timeline will appear here once you start working on tasks.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {history.map((log, idx) => {
                    const getActionColor = (action) => {
                      const colors = {
                        COMPLETED: 'bg-green-100 text-green-800 border-green-300',
                        ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-300',
                        SUBMITTED: 'bg-purple-100 text-purple-800 border-purple-300',
                        REJECTED: 'bg-red-100 text-red-800 border-red-300',
                        APPROVED: 'bg-green-100 text-green-800 border-green-300'
                      };
                      return colors[action] || 'bg-gray-100 text-gray-800 border-gray-300';
                    };

                    const getActionIcon = (action) => {
                      switch(action) {
                        case 'COMPLETED':
                          return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
                        case 'SUBMITTED':
                          return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />;
                        case 'REJECTED':
                          return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />;
                        case 'ASSIGNED':
                          return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />;
                        default:
                          return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />;
                      }
                    };

                    return (
                      <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getActionColor(log.action)}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {getActionIcon(log.action)}
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {(log.stageHistory?.slice(-1)[0]?.status || log.currentStage || log.action || '').replace(/_/g, ' ') || 'Action'}
                              </p>
                              {log.taskId && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Task: {log.title || log.taskId?.title || 'Unknown Task'}
                                </p>
                              )}
                              {log.type && (
                                <p className="text-xs text-gray-500">
                                  Type: {log.type} | Stage: {log.currentStage || log.stage || 'N/A'}
                                </p>
                              )}
                              {log.clientId && (
                                <p className="text-xs text-gray-500">
                                  Client: {log.clientId.name || log.clientId.companyName || 'Unknown'}
                                </p>
                              )}
                              {log.details && (
                                <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-gray-200">
                                  {log.details}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getActionColor(log.action)}`}>
                              {log.action || log.currentStage || 'Action'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(log.assignedAt || log.createdAt || log.updatedAt || Date.now()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6 text-white`}>
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}
