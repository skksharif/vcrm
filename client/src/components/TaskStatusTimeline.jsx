import React from "react";

const shouldShowAssignment = (stage = '') => {
  const normalized = stage.toLowerCase();
  return !normalized.includes('approval') && !normalized.includes('posted') && !normalized.includes('not yet started');
};

const TaskStatusTimeline = ({ statusHistory = [], onRevert, canRevert }) => (
  <div className="p-4 bg-white rounded shadow">
    <h3 className="font-bold mb-2">Task Stage Timeline</h3>
    <ol className="relative border-l border-gray-200">
      {statusHistory.map((entry, idx) => (
        <li key={idx} className="mb-4 ml-6">
          <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white">
            {idx + 1}
          </span>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{entry.stage}</span>
              <span className="text-xs text-gray-500">{new Date(entry.changedAt || entry.timestamp).toLocaleString()}</span>
            </div>
            {shouldShowAssignment(entry.stage) && (
              <div className="text-xs text-gray-600">
                Assigned By: {entry.assignedBy?.name || entry.changedByName || entry.changedBy || "Unknown"}
                {entry.assignedTo?.name ? ` • Assigned To: ${entry.assignedTo.name}` : ''}
              </div>
            )}
            {canRevert && idx < statusHistory.length - 1 && (
              <button
                className="mt-1 text-xs text-red-600 underline"
                onClick={() => onRevert(idx)}
              >
                Revert to here
              </button>
            )}
            {entry.remarks && <div className="text-xs text-gray-500 italic mt-1">{entry.remarks}</div>}
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default TaskStatusTimeline;
