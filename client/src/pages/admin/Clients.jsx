import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import Loader from '../../components/Loader';

/* ---------------- CONSTANTS ---------------- */

const CLIENT_PRIORITY = ['Basic', 'Advance', 'Premium'];

const PRIORITY_COLORS = {
  Basic: 'bg-gray-100 text-gray-700',
  Advance: 'bg-blue-100 text-blue-700',
  Premium: 'bg-purple-100 text-purple-700'
};

/* Normalize old backend values if any */
const normalizePriority = (p) => {
  if (!p) return 'Basic';
  if (['LOW', 'MEDIUM', 'HIGH'].includes(p)) {
    return p === 'LOW' ? 'Basic' : p === 'MEDIUM' ? 'Advance' : 'Premium';
  }
  return p;
};

export default function Clients() {
  const nav = useNavigate();

  const emptyForm = {
    name: '',
    companyName: '',
    priority: 'Basic'
  };

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => ({
    visible: clients.length,
    modeLabel: showDeleted ? 'Deleted' : 'Active'
  }), [clients.length, showDeleted]);

  /* ---------------- FETCH ---------------- */

  const fetchClients = async () => {
    setLoading(true);
    try {
      const url = showDeleted
        ? '/admin/clients/deleted/all'
        : '/admin/clients';

      const params = { q };
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const res = await api.get(url, { params });

      const normalized = (res.data.clients || []).map(c => ({
        ...c,
        priority: normalizePriority(c.priority)
      }));

      setClients(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [q, showDeleted, priorityFilter]);

  /* ---------------- ACTIONS ---------------- */

  const startEdit = (c) => {
    setEditingId(c._id);
    setShowCreate(false);
    setForm({
      name: c.name || '',
      companyName: c.companyName || '',
      priority: normalizePriority(c.priority)
    });
  };

  const updateClient = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/clients/${editingId}`, form);
      setEditingId(null);
      fetchClients();
    } finally {
      setSaving(false);
    }
  };

  const createClient = async () => {
    setSaving(true);
    try {
      await api.post('/admin/clients', form);
      setShowCreate(false);
      setForm(emptyForm);
      fetchClients();
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    await api.delete(`/admin/clients/${id}`);
    fetchClients();
  };

  const restoreClient = async (id) => {
    await api.patch(`/admin/clients/${id}/restore`);
    fetchClients();
  };

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <div className="space-y-6">

        {/* Page shell */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-600">Manage client roster, priorities, and visibility.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-gray-50">
              <div className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
              <div className="text-sm">
                <p className="font-medium text-gray-800">{stats.modeLabel} list</p>
                <p className="text-gray-500">{stats.visible} {stats.visible === 1 ? 'client' : 'clients'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleted(v => !v)}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition shadow-sm hover:shadow ${showDeleted ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}
              >
                {showDeleted ? 'Viewing deleted' : 'Viewing active'}
              </button>
              {!showDeleted && (
                <button
                  onClick={() => {
                    setForm(emptyForm);
                    setShowCreate(true);
                    setEditingId(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                >
                  Add client
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700">Basic</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700">Advance</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700">Premium</span>
            </div>

            <div className="flex w-full sm:w-auto flex-wrap gap-2">
              <div className="relative w-full sm:w-72">
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search by client or company"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                />
                {q && (
                  <button
                    onClick={() => setQ('')}
                    className="absolute inset-y-0 right-2 text-gray-400 hover:text-gray-600 text-xs"
                    aria-label="Clear search"
                  >
                    x
                  </button>
                )}
              </div>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="all">All priorities</option>
                {CLIENT_PRIORITY.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <button
                onClick={() => { setQ(''); setPriorityFilter('all'); }}
                className="px-3 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>

              <div className="flex rounded-lg border overflow-hidden text-sm font-medium">
                <button
                  onClick={() => setShowDeleted(false)}
                  className={`px-3 py-2 transition ${!showDeleted ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowDeleted(true)}
                  className={`px-3 py-2 transition ${showDeleted ? 'bg-rose-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Deleted
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && <Loader />}

        {!loading && clients.length === 0 && (
          <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">No clients found for this view.</p>
          </div>
        )}

        {!loading && clients.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map(c => (
              <div
                key={c._id}
                className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Client</p>
                    <h2 className="text-lg font-semibold text-gray-900">{c.name || 'Unnamed client'}</h2>
                    <p className="text-sm text-gray-600">{c.companyName || 'No company provided'}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[c.priority]}`}>
                      {c.priority}
                    </span>
                    {showDeleted && (
                      <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">Deleted</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="rounded-md bg-gray-50 border px-3 py-1">ID: {c._id}</span>
                  <span className="text-xs text-gray-500">Priority aligned</span>
                </div>

                <div className="flex flex-wrap gap-2 justify-between text-sm font-medium">
                  {!showDeleted ? (
                    <>
                      <button
                        onClick={() => nav(`/admin/clients/${c._id}`)}
                        className="px-3 py-2 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                      >
                        View profile
                      </button>
                      <button
                        onClick={() => startEdit(c)}
                        className="px-3 py-2 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClient(c._id)}
                        className="px-3 py-2 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => restoreClient(c._id)}
                      className="px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDIT MODAL */}
        {editingId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Edit client</h2>
                  <p className="text-sm text-gray-500">Update name, company, or priority.</p>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  aria-label="Close"
                >
                  x
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Client name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Client Name"
                    className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Company</label>
                  <input
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {CLIENT_PRIORITY.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateClient}
                  disabled={saving}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white ${saving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE MODAL */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add client</h2>
                  <p className="text-sm text-gray-500">Create a new client entry with priority.</p>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                  aria-label="Close"
                >
                  x
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Client name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Client Name"
                    className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Company</label>
                  <input
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {CLIENT_PRIORITY.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createClient}
                  disabled={saving}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white ${saving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {saving ? 'Saving...' : 'Add client'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
