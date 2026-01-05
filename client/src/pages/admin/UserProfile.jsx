import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import Loader from '../../components/Loader';
import Button from '../../components/ui/Button';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}/profile`);
      setProfile(res.data.profile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

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
        <div className="p-6 text-red-600 bg-white rounded border">
          User not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {/* BASIC INFO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <InfoCard label="Role" value={profile.role} />
        <InfoCard
          label="Status"
          value={
            profile.isDeleted
              ? 'Deleted'
              : profile.suspended
              ? 'Suspended'
              : 'Active'
          }
          color={
            profile.isDeleted
              ? 'text-red-600'
              : profile.suspended
              ? 'text-yellow-600'
              : 'text-green-600'
          }
        />
        <InfoCard
          label="Completed Tasks"
          value={profile.workSummary.completedTasks}
        />
      </div>

      {/* WORK SUMMARY */}
      <div className="bg-white border rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Work Summary</h2>
        <div className="text-sm text-gray-600">
          Total Actions: <b>{profile.workSummary.totalActions}</b>
        </div>
      </div>

      {/* WORK HISTORY */}
      <div className="bg-white border rounded overflow-x-auto">
        <h2 className="font-semibold p-4 border-b">Work History</h2>

        {profile.workLogs.length === 0 ? (
          <div className="p-4 text-gray-500">
            No work history available
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3 text-left">Task</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Stage</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {profile.workLogs.map((log, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3 font-medium">
                    {log.taskTitle}
                  </td>
                  <td className="p-3">
                    {log.clientId?.name || '-'}
                  </td>
                  <td className="p-3 capitalize">
                    {log.taskType}
                  </td>
                  <td className="p-3">
                    {log.stage}
                  </td>
                  <td className="p-3">
                    {log.action}
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(log.workedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

/* ---------------- SMALL INFO CARD ---------------- */

function InfoCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}
