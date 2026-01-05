import React from "react";

const statusColors = {
  CONTENT_WRITING: "bg-yellow-200",
  CLIENT_APPROVAL_TL1: "bg-blue-200",
  DESIGNING: "bg-green-200",
  CLIENT_APPROVAL_TL2: "bg-purple-200",
  SHOOT: "bg-pink-200",
  EDITING: "bg-orange-200",
  READY_FOR_POST: "bg-gray-300",
  COMPLETED: "bg-green-400",
  POSTED: "bg-green-400",
};

const ClientCalendar = ({ tasks, onTaskClick }) => (
  <div className="grid grid-cols-7 gap-2">
    {tasks.map(task => {
      const status = (task.currentStage || task.status || '').toUpperCase();
      const isPosted = status === 'POSTED';
      const color = statusColors[status] || (isPosted ? 'bg-green-400' : 'bg-gray-100');
      return (
        <div
          key={task._id}
          className={`p-2 rounded cursor-pointer ${color}`}
          onClick={() => onTaskClick(task)}
        >
          <div className="font-semibold flex items-center gap-1">
            {isPosted && <span>✓</span>}
            {task.title}
          </div>
          <div className="text-xs capitalize">{status.replace(/_/g, " ") || 'Not started'}</div>
        </div>
      );
    })}
  </div>
);

export default ClientCalendar;
