import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#026c8a]"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  if (!data)
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-600">Unable to fetch dashboard</p>
        </div>
      </Layout>
    );

  const completedTasks = data.completedTasks || 0;
  const totalClients = data.totalClients || 0;
  const teamMembers = data.teamMembers || 0;

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#026c8a] to-[#034a60] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest opacity-80">Welcome back</p>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-sm opacity-90 mt-1">Real-time overview of your operations</p>
            </div>
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard icon="🏢" label="Total Clients" value={totalClients} color="bg-blue" />
          <MetricCard icon="👥" label="Team Members" value={teamMembers} color="bg-emerald" />
          <MetricCard icon="✅" label="Tasks Completed" value={completedTasks} color="bg-green" />
        </div>
      </div>
    </Layout>
  );
}

function MetricCard({ icon, label, value, color }) {
  const colors = {
    'bg-blue': 'from-blue-500/90 to-blue-600',
    'bg-emerald': 'from-emerald-500/90 to-emerald-600',
    'bg-amber': 'from-amber-500/90 to-amber-600',
    'bg-green': 'from-green-500/90 to-green-600'
  };

  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${colors[color]} text-white shadow-lg hover:shadow-xl transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}
