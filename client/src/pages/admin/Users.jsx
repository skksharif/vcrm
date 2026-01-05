import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import Loader from '../../components/Loader';
import Button from '../../components/ui/Button';

const FILTERS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState(FILTERS.ACTIVE);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  /* ---------------- FETCH USERS ---------------- */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let res;

      if (filter === FILTERS.SUSPENDED) {
        res = await api.get('/admin/users/suspended');
      } else if (filter === FILTERS.DELETED) {
        res = await api.get('/admin/users/soft-deleted');
      } else {
        res = await api.get('/admin/users');
      }

      setUsers(res.data.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  /* ---------------- ACTIONS ---------------- */

  const suspendUser = async (id) => {
    if (!confirm('Suspend this user?')) return;
    await api.patch(`/admin/users/${id}/suspend`);
    fetchUsers();
  };

  const unsuspendUser = async (id) => {
    if (!confirm('Unsuspend this user?')) return;
    await api.patch(`/admin/users/${id}/activate`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const restoreUser = async (id) => {
    if (!confirm('Restore this user?')) return;
    await api.patch(`/admin/users/${id}/restore`);
    fetchUsers();
  };

  /* ---------------- ADD USER HANDLER ---------------- */

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setFormError('All fields are required');
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/admin/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      setFormData({ name: '', email: '', password: '', role: 'Employee' });
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.role !== 'CEO' && `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u) => !u.isDeleted && !u.suspended).length;
    const suspended = filteredUsers.filter((u) => u.suspended && !u.isDeleted).length;
    const deleted = filteredUsers.filter((u) => u.isDeleted).length;
    return { total, active, suspended, deleted };
  }, [filteredUsers]);

  const groupedByRole = useMemo(() => {
    const map = {};
    filteredUsers.forEach((u) => {
      const role = u.role || 'Unassigned';
      if (!map[role]) map[role] = [];
      map[role].push(u);
    });
    return map;
  }, [filteredUsers]);

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600">Manage roster by status and role categories.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <FilterButton
              active={filter === FILTERS.ACTIVE}
              onClick={() => setFilter(FILTERS.ACTIVE)}
            >
              Active
            </FilterButton>

            <FilterButton
              active={filter === FILTERS.SUSPENDED}
              onClick={() => setFilter(FILTERS.SUSPENDED)}
            >
              Suspended
            </FilterButton>

            <FilterButton
              active={filter === FILTERS.DELETED}
              onClick={() => setFilter(FILTERS.DELETED)}
            >
              Deleted
            </FilterButton>

            <div className="relative w-full sm:w-64">
              <input
                className="border px-3 py-2 rounded-lg text-sm w-full pr-10 focus:ring-2 focus:ring-[#026c8a] focus:border-[#026c8a]"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute inset-y-0 right-3 text-gray-400 hover:text-gray-600 text-xs"
                  onClick={() => setSearch('')}
                >
                  x
                </button>
              )}
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add User
            </Button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total} tone="neutral" />
          <StatCard label="Active" value={stats.active} tone="success" />
          <StatCard label="Suspended" value={stats.suspended} tone="warning" />
          <StatCard label="Deleted" value={stats.deleted} tone="danger" />
        </div>

        {/* CONTENT */}
        {loading && <Loader />}

        {!loading && filteredUsers.length === 0 && (
          <div className="p-8 bg-white border rounded-2xl text-center text-gray-500 shadow-sm">
            No users found for this view.
          </div>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div className="space-y-6">
            {Object.keys(groupedByRole).sort().map((role) => (
              <div key={role} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{role}</h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border">{groupedByRole[role].length} users</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedByRole[role].map((u) => (
                    <div key={u._id} className="border bg-white rounded-2xl p-4 shadow-sm hover:shadow transition flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-gray-500">User</p>
                          <p className="text-base font-semibold text-gray-900">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                        </div>
                        <StatusPill user={u} />
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm font-medium">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/admin/users/${u._id}/profile`)}
                        >
                          View
                        </Button>

                        {!u.isDeleted && !u.suspended && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => suspendUser(u._id)}
                          >
                            Suspend
                          </Button>
                        )}

                        {!u.isDeleted && u.suspended && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => unsuspendUser(u._id)}
                          >
                            Unsuspend
                          </Button>
                        )}

                        {!u.isDeleted && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteUser(u._id)}
                          >
                            Delete
                          </Button>
                        )}

                        {u.isDeleted && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => restoreUser(u._id)}
                          >
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New User</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#026c8a] focus:border-[#026c8a]"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#026c8a] focus:border-[#026c8a]"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#026c8a] focus:border-[#026c8a]"
                  placeholder="Password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#026c8a] focus:border-[#026c8a]"
                >
                  <option value="CEO">CEO</option>
                  <option value="TL-1">TL-1</option>
                  <option value="TL-2">TL-2</option>
                  <option value="Employee">Employee</option>
                  <option value="Social Media Manager">Social Media Manager</option>
                  <option value="HR">HR</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Team Lead">Team Lead</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError('');
                    setFormData({ name: '', email: '', password: '', role: 'Employee' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={formLoading}
                  className="flex-1"
                >
                  {formLoading ? '⏳ Creating...' : '✓ Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

/* ---------------- SMALL FILTER BUTTON ---------------- */

function FilterButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-3 py-1 rounded text-sm border ${
        active
          ? 'bg-[#026c8a] text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, tone }) {
  const tones = {
    neutral: 'bg-gray-50 text-gray-800 border-gray-100',
    success: 'bg-green-50 text-green-800 border-green-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    danger: 'bg-rose-50 text-rose-800 border-rose-100'
  };

  return (
    <div className={`border rounded-2xl p-4 shadow-sm ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function StatusPill({ user }) {
  if (user.isDeleted) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">Deleted</span>;
  }
  if (user.suspended) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Suspended</span>;
  }
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">Active</span>;
}
