import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    let endpoint = '/auth/me'; // default
    
    // Role-based profile endpoints
    if (user.role === 'CEO') {
      endpoint = '/admin/profile/me';
    } else if (user.role === 'Employee') {
      endpoint = '/employee/profile/me';
    } else if (user.role === 'Social Media Manager') {
      endpoint = '/smm/profile/me';
    } else if (user.role === 'TL-1' || user.role === 'TL-2') {
      endpoint = '/teamlead/profile/me';
    }

    console.log('Fetching profile from:', endpoint);
    
    api.get(endpoint)
      .then(res => {
        console.log('Profile response:', res.data);
        const profileData = res.data.user || res.data.profile;
        if (profileData) {
          setProfile(profileData);
          setForm({ name: profileData.name, email: profileData.email });
          setError(null);
        } else {
          setError('No profile data in response');
        }
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
        const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load profile';
        setError(errMsg);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleEdit = async () => {
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    setEditing(true);
    try {
      await api.patch('/auth/me', {
        name: form.name,
        email: form.email
      });

      setProfile({ ...profile, name: form.name, email: form.email });
      setEditOpen(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditing(false);
    }
  };

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {!profile ? (
        <div className="p-6 text-red-500 text-center">
          <p>Unable to load profile</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {/* PROFILE CARD */}
          <div className="bg-white p-8 rounded shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Profile</h2>
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
      )}

      {/* EDIT MODAL */}
      <Modal
        open={editOpen}
        title="Edit Profile"
        onClose={() => {
          setEditOpen(false);
          setError(null);
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
