import React from "react";
import ClientCalendar from "./ClientCalendar";

const GlobalCalendar = ({ allTasks, onTaskClick }) => (
  <div>
    <h3 className="font-bold mb-2">Global Calendar</h3>
    <ClientCalendar tasks={allTasks} onTaskClick={onTaskClick} />
  </div>
);

export default GlobalCalendar;
