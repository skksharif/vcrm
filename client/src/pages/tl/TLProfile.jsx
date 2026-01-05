import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function TLProfile() {
  const [profile, setProfile] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
  });
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchProfile();
    fetchAssignmentHistory();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teamlead/profile');
      setProfile(res.data);
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        department: res.data.department || '',
      });
    } catch (err) {
      toast.show('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const res = await api.get('/teamlead/profile/assignments');
      setAssignmentHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch assignment history:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/teamlead/profile', formData);
      toast.show('Profile updated successfully', 'success');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast.show(err.response?.data?.error || 'Failed to update profile', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  if (!profile) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Unable to load profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and update your personal details</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#025a75] text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#025a75]"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile.name || '',
                        phone: profile.phone || '',
                        department: profile.department || '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Full Name</span>
                  <div className="font-medium text-gray-800">{profile.name}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <div className="font-medium text-gray-800">{profile.email}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Role</span>
                  <div className="font-medium text-gray-800">{profile.role}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone</span>
                  <div className="font-medium text-gray-800">
                    {profile.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Department</span>
                  <div className="font-medium text-gray-800">
                    {profile.department || 'Not provided'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <div className="font-medium text-gray-800">
                    {profile.isSuspended ? (
                      <span className="text-red-600">Suspended</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assignment History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Assignment History</h2>
          
          {assignmentHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No assignment history available
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                Total Assignments: {assignmentHistory.length}
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {assignmentHistory.map((assignment, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {assignment.taskId?.title || 'Unknown Task'}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {assignment.clientId?.name || 'Unknown Client'}
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        {assignment.taskId?.type || 'N/A'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Assigned To:</span>
                        <span className="ml-2 font-medium">
                          {assignment.assignedTo?.name || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Stage:</span>
                        <span className="ml-2 font-medium">
                          {assignment.stage || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Assigned At:</span>
                        <span className="ml-2 font-medium">
                          {assignment.assignedAt
                            ? new Date(assignment.assignedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Acceptance:</span>
                        <span className="ml-2 font-medium capitalize">
                          {assignment.acceptanceStatus || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {assignment.remarks && (
                      <div className="mt-3 bg-gray-50 rounded p-2">
                        <span className="text-xs text-gray-600">Remarks:</span>
                        <p className="text-sm text-gray-700 mt-1">{assignment.remarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
