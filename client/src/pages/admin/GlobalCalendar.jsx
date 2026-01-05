import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import TaskMonitorDrawer from "../../components/TaskMonitorDrawer";
import Loader from "../../components/Loader";
import Toast from "../../components/Toast";
import api from "../../services/api";

// Helpers
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

export default function GlobalCalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filters, setFilters] = useState({ clientId: "all", type: "all", stage: "all" });

  // Fetch tasks for current month with filters
  const loadTasks = async (date = currentMonth, f = filters) => {
    try {
      setLoading(true);
      const { month, year } = getMonthMeta(date);
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

      const params = { startDate, endDate };
      if (f.clientId && f.clientId !== "all") params.clientId = f.clientId;
      if (f.type && f.type !== "all") params.type = f.type;
      if (f.stage && f.stage !== "all") params.stage = f.stage;

      const res = await api.get("/admin/tasks", { params });
      const data = Array.isArray(res.data) ? res.data : res.data.tasks || [];
      setTasks(data);
      setCalendar(
        data.map((t) => ({
          id: t._id,
          title: t.title,
          date: t.scheduledDate,
          type: t.type,
          client: t.clientId?.name || "-",
          stage: t.currentStage,
          isCompleted: t.currentStage === "Posted" || (t.stageHistory || []).some((h) => h.stage === "Posted"),
        }))
      );
    } catch (err) {
      setToast({ message: "Failed to load tasks", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [currentMonth, filters]);

  const handleTaskClick = async (taskId) => {
    try {
      const res = await api.get(`/admin/tasks/${taskId}`);
      setSelectedTask(res.data);
    } catch {
      setToast({ message: "Failed to load task details", type: "error" });
    }
  };

  const uniqueClients = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (t.clientId?._id) map.set(t.clientId._id, t.clientId.name || t.clientId.companyName || "Client");
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const { firstDay, totalDays } = getMonthMeta(currentMonth);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Global Calendar</h1>
            <p className="text-sm text-gray-500">All clients • Monthly view with filters</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={filters.clientId}
              onChange={(e) => setFilters((f) => ({ ...f, clientId: e.target.value }))}
            >
              <option value="all">All Clients</option>
              {uniqueClients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              <option value="poster">Poster</option>
              <option value="reel">Reel</option>
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={filters.stage}
              onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value }))}
            >
              <option value="all">All Stages</option>
              <option value="Posted">Posted</option>
              <option value="In Progress">In Progress</option>
              <option value="Not yet started">Not yet started</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                ←
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                →
              </button>
              <div className="text-sm text-gray-700 font-medium">
                {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center"><Loader /></div>
        ) : (
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
                const key = dateKey(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));

                const dayTasks = calendar.filter((t) => t.date && dateKey(new Date(t.date)) === key);

                return (
                  <div
                    key={day}
                    className="border rounded min-h-[90px] p-1 text-xs hover:border-indigo-200"
                  >
                    <div className="font-medium mb-1 flex items-center justify-between">
                      <span>{day}</span>
                      <span className="text-[10px] text-gray-400">{dayTasks.length}</span>
                    </div>

                    {dayTasks.map((t) => {
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
                          onClick={() => handleTaskClick(t.id)}
                          className={`block w-full mb-1 px-2 py-1 rounded truncate text-left border hover:shadow-sm transition-all ${
                            isCompleted ? completedClass : isOverdue ? overdueClass : baseClass
                          }`}
                          title={`${t.title} • ${t.client}`}
                        >
                          <div className="flex items-center gap-1">
                            {isOverdue && <span>⚠️</span>}
                            {isCompleted && <span>✓</span>}
                            <span className="truncate">{t.title}</span>
                          </div>
                          <div className="text-[10px] text-gray-600 truncate">{t.client}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTask && (
          <TaskMonitorDrawer
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            canRevert={true}
          />
        )}
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      </div>
    </Layout>
  );
}
