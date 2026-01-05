import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../services/api";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

/* ---------------- DATE HELPERS ---------------- */

// Always compare YYYY-MM-DD (timezone safe)
const dateKey = (d) => new Date(d).toISOString().split("T")[0];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getMonthMeta = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  return {
    year: y,
    month: m,
    firstDay: new Date(y, m, 1).getDay(),
    totalDays: new Date(y, m + 1, 0).getDate(),
  };
};

/* ---------------- COMPONENT ---------------- */

export default function ClientProfile() {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [calendar, setCalendar] = useState([]);

  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "poster",
    scheduledDate: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  /* ---------------- LOAD PROFILE ---------------- */

  const loadProfile = async () => {
    const res = await api.get(`/admin/clients/${id}`);
    setClient(res.data.client);
    setStats(res.data.stats);
  };

  /* ---------------- LOAD CALENDAR ---------------- */

  const loadCalendar = async (date = currentMonth) => {
    const { month, year } = getMonthMeta(date);
    const res = await api.get(`/admin/clients/${id}/tasks`, {
      params: { month: month + 1, year },
    });
    setCalendar(res.data.calendar || []);
  };

  /* ---------------- LOAD TASK DETAILS ---------------- */

  const loadTask = async (taskId) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/tasks/${taskId}`);
      setSelectedTask(res.data);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadProfile();
        await loadCalendar();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    loadCalendar(currentMonth);
  }, [currentMonth]);

  /* ---------------- CREATE TASK ---------------- */

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title required";
    if (!form.scheduledDate) e.date = "Date required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createTask = async () => {
    if (!validate()) return;

    await api.post(`/admin/tasks`, {
      ...form,
      clientId: id
    });

    setForm({ title: "", type: "poster", scheduledDate: "", description: "" });
    setCreateOpen(false);

    await loadProfile();
    await loadCalendar();
  };
  const dateKeyMinusOne = (d) => {
    const date = new Date(d);
    date.setDate(date.getDate() - 1); // ⬅ shift back one day
    return date.toISOString().split("T")[0];
  };

  /* ---------------- DELETE TASK ---------------- */

  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;

    await api.delete(`/admin/tasks/${selectedTask._id}`);
    setDrawerOpen(false);
    setSelectedTask(null);

    await loadProfile();
    await loadCalendar();
  };

  /* ---------------- DERIVED ---------------- */

  const detailMeta = useMemo(() => {
    if (!selectedTask) return null;

    return {
      stage: selectedTask.stage || "-",
      type: selectedTask.type || "-",
      date: selectedTask.scheduledDate
        ? new Date(selectedTask.scheduledDate).toLocaleDateString()
        : "-",
      client: selectedTask.clientId?.name || "-",
    };
  }, [selectedTask]);

  /* ---------------- GUARDS ---------------- */

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-gray-500">Loading client profile...</div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="p-6 text-red-600">Client not found</div>
      </Layout>
    );
  }

  const { firstDay, totalDays } = getMonthMeta(currentMonth);

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <div className="space-y-6">
        {/* CLIENT INFO */}
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <p className="text-sm text-gray-600">
            {client.companyName}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat title="Total Tasks" value={stats.total} />
          <Stat title="Completed" value={stats.completed} />
          <Stat title="Pending" value={stats.pending} />
        </div>

        {/* CALENDAR HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">
            {currentMonth.toLocaleString("default", { month: "long" })}{" "}
            {currentMonth.getFullYear()}
          </h2>

          <div className="flex gap-2">
            <button
              className="px-2 py-1 border rounded"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }
            >
              ←
            </button>
            <button
              className="px-2 py-1 border rounded"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }
            >
              →
            </button>
            <button
              className="text-sm text-primary"
              onClick={() => setCreateOpen(true)}
            >
              + New Task
            </button>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="bg-white rounded shadow p-4">
          <div className="grid grid-cols-7 text-sm text-gray-500 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const key = dateKey(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                )
              );

              const tasks = calendar.filter(
                (t) => t.date && dateKeyMinusOne(t.date) === key
              );

              return (
                <div
                  key={day}
                  className="border rounded min-h-[90px] p-1 text-xs hover:border-indigo-200"
                >
                  <div className="font-medium mb-1">{day}</div>

                  {tasks.map((t) => {
                    const isCompleted = t.isCompleted;
                    const isOverdue = !isCompleted && new Date(t.date) < new Date();
                    const baseClass = t.type === "reel" 
                      ? "bg-pink-50 text-pink-700 border-pink-200" 
                      : "bg-blue-50 text-blue-700 border-blue-200";
                    const overdueClass = "bg-red-100 text-red-800 border-red-300 font-semibold animate-pulse";
                    const completedClass = "bg-green-50 text-green-700 border-green-200 opacity-75";
                    
                    return (
                      <button
                        key={t.id}
                        onClick={() => loadTask(t.id)}
                        className={`block w-full mb-1 px-2 py-1 rounded truncate text-left border hover:shadow-sm transition-all ${
                          isCompleted ? completedClass : isOverdue ? overdueClass : baseClass
                        }`}
                        title={t.title + (isOverdue ? ' - OVERDUE!' : '')}
                      >
                        {isOverdue && <span className="mr-1">⚠️</span>}
                        {isCompleted && <span className="mr-1">✓</span>}
                        {t.title}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      <Modal
        open={createOpen}
        title="New Task"
        onClose={() => setCreateOpen(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="poster">Poster</option>
              <option value="reel">Reel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.scheduledDate}
              onChange={(e) =>
                setForm({ ...form, scheduledDate: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add task description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={createTask}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* TASK DETAIL DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setDrawerOpen(false); setSelectedTask(null); }}
          />
          <div className="relative h-full w-full max-w-md ml-auto bg-white shadow-2xl border-l">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Task detail</p>
                <h3 className="text-lg font-semibold text-gray-900">{selectedTask?.title || "Task"}</h3>
              </div>
              <button
                onClick={() => { setDrawerOpen(false); setSelectedTask(null); }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100%-56px)] space-y-4">
              {detailLoading && (
                <div className="text-sm text-gray-500">Loading task...</div>
              )}

              {!detailLoading && selectedTask && (
                <>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-gray-500">Stage</div>
                      <div className="font-semibold text-gray-900">{detailMeta?.stage}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="font-semibold text-gray-900">{detailMeta?.type}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-gray-500">Scheduled</div>
                      <div className="font-semibold text-gray-900">{detailMeta?.date}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-gray-500">Client</div>
                      <div className="font-semibold text-gray-900">{detailMeta?.client}</div>
                    </div>
                  </div>

                  {selectedTask.description && (
                    <div className="border rounded-lg p-3 text-sm">
                      <div className="text-xs text-gray-500 mb-1">Description</div>
                      <p className="text-gray-800 whitespace-pre-line">{selectedTask.description}</p>
                    </div>
                  )}

                  {Array.isArray(selectedTask.stageHistory) && selectedTask.stageHistory.length > 0 && (
                    <div className="border rounded-lg p-3 text-sm space-y-2">
                      <div className="text-xs text-gray-500">Stage history</div>
                      {selectedTask.stageHistory.map((h) => {
                        const normalized = (h.stage || '').toLowerCase();
                        const showAssign = !normalized.includes('approval') && !normalized.includes('posted') && !normalized.includes('not yet started');
                        return (
                          <div key={h._id || `${h.stage}-${h.changedAt}`} className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{h.stage}</p>
                              {showAssign && (h.assignedBy?.name || h.assignedTo?.name) && (
                                <p className="text-xs text-gray-500">
                                  Assigned By: {h.assignedBy?.name || 'Unknown'}
                                  {h.assignedTo?.name ? ` • Assigned To: ${h.assignedTo.name}` : ''}
                                </p>
                              )}
                              {!showAssign && (
                                <p className="text-xs text-gray-500">By {h.assignedBy?.name || 'Unassigned'}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {h.changedAt ? new Date(h.changedAt).toLocaleString() : ''}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Button variant="secondary" onClick={() => { setDrawerOpen(false); setSelectedTask(null); }}>
                      Close
                    </Button>
                    <Button variant="danger" onClick={deleteTask}>
                      Delete Task
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

/* ---------------- STAT CARD ---------------- */

function Stat({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
