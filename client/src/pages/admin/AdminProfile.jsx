import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/profile/me');
        console.log('Admin profile response:', res.data);
        const profileData = res.data.user;
        setProfile(profileData);
        if (profileData) {
          setForm({ name: profileData.name, email: profileData.email });
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load profile';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    setEditing(true);
    try {
      const res = await api.patch('/auth/me', {
        name: form.name
      });

      setProfile({ ...profile, name: form.name });
      setEditOpen(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setEditing(false);
    }
  };

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
        <div className="p-6 text-red-600 bg-white border rounded">
          {error || 'Unable to load profile'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="bg-white p-8 rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">CEO Profile</p>
              <h2 className="text-3xl font-semibold text-gray-900">{profile.name}</h2>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.name}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Email</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.email}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Role</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile.role}</p>
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-semibold">Joined</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal
        open={editOpen}
        title="Edit Profile"
        onClose={() => {
          setEditOpen(false);
          setError(null);
          setForm({ name: profile.name, email: profile.email });
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setEditOpen(false);
                setError(null);
                setForm({ name: profile.name, email: profile.email });
              }}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleEdit}
              disabled={editing}
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
