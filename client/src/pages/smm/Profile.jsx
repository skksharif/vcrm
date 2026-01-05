import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import api from '../../services/api';

export default function SmmProfile() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [profileRes, historyRes, statsRes] = await Promise.all([
          api.get('/smm/profile'),
          api.get('/smm/profile/work-history'),
          api.get('/smm/profile/statistics')
        ]);

        setProfile(profileRes.data || null);
        setHistory(historyRes.data?.workHistory || []);
        setStats({
          ...historyRes.data?.stats,
          ...statsRes.data
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="p-6 text-red-600 bg-white border rounded">Unable to load profile</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">Social Media Manager</p>
          <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Posted" value={stats?.totalPosted || 0} color="from-green-500 to-green-600" />
          <StatCard label="Ready to Post" value={stats?.readyToPostCount || 0} color="from-amber-500 to-amber-600" />
          <StatCard label="This Month" value={stats?.thisMonth || 0} color="from-blue-500 to-blue-600" />
          <StatCard label="Completion %" value={`${stats?.completionRate || 0}%`} color="from-purple-500 to-purple-600" />
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Work History</h2>
              <p className="text-sm text-gray-500">Posted tasks</p>
            </div>
            <span className="text-sm text-gray-500">{history.length} items</span>
          </div>

          {history.length === 0 ? (
            <div className="text-gray-500 text-sm">No work history available.</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {history.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title || 'Task'}</p>
                      <p className="text-sm text-gray-600">{item.clientId?.name || item.clientId?.companyName || 'Unknown client'}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">Posted</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.postedAt ? new Date(item.postedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-sm`}>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
