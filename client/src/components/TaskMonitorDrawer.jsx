import React from "react";
import TaskStatusTimeline from "./TaskStatusTimeline";
import AssignEmployeeModal from "./AssignEmployeeModal";
import RoleGuard from "./RoleGuard";

const TaskMonitorDrawer = ({
  task,
  onClose,
  onRevert,
  canRevert,
  onAssign,
  showAssign,
  users,
  children
}) => (
  <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto z-50">
    <button className="mb-4 text-gray-500" onClick={onClose}>Close</button>
    <h2 className="text-xl font-bold mb-2">{task.title}</h2>
    <div className="mb-4">
      <div>Type: <span className="font-semibold">{task.type}</span></div>
      <div>Stage: <span className="font-semibold">{task.stage}</span></div>
      <div>Assigned To: <span>{task.assignedTo?.name || "Unassigned"}</span></div>
    </div>
    <TaskStatusTimeline
      statusHistory={task.stageHistory}
      onRevert={onRevert}
      canRevert={canRevert}
    />
    {showAssign && (
      <AssignEmployeeModal users={users} onAssign={onAssign} onClose={onClose} />
    )}
    {children}
  </div>
);

export default TaskMonitorDrawer;
