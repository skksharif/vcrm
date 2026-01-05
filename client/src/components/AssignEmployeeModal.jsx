import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { POSTER_STAGES, REEL_STAGES, INITIAL_TASK_STAGE } from "../models/constants";
import { useAuth } from "../contexts/AuthContext";

const AssignEmployeeModal = ({ 
  taskId, 
  currentStage, 
  taskType,
  onAssign, 
  onClose, 
  title = "Update Stage & Assign Employee" 
}) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStage, setSelectedStage] = useState(currentStage || "");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Get all stages for the task type
  const allStages = taskType === 'poster' ? POSTER_STAGES : REEL_STAGES;
  
  // Filter stages based on user role
  let allowedStages = allStages.filter(stage => stage !== INITIAL_TASK_STAGE);

  if (user?.role === 'TL-1') {
    if (taskType === 'poster') {
      // TL-1: up to Designing (no client approvals)
      allowedStages = ['Content Writing', 'Designing'];
    } else if (taskType === 'reel') {
      // TL-1: up to Editing for reels
      allowedStages = ['Content Writing', 'Content Client Approval', 'Shooting', 'Editing'];
    }
  } else if (user?.role === 'TL-2') {
    if (taskType === 'poster') {
      // TL-2: from Design Client Approval to Ready to Post for posters
      allowedStages = ['Design Client Approval', 'Ready to Post'];
    } else if (taskType === 'reel') {
      // TL-2: from Editing Client Approval to Ready to Post for reels
      allowedStages = ['Editing Client Approval', 'Ready to Post'];
    }
  } else if (user?.role === 'SMM') {
    // SMM: can mark as Posted and task ends
    allowedStages = ['Posted'];
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/teamlead/users?role=Employee');
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStage) {
      alert('Please select a stage');
      return;
    }
    
    const isClientApproval = selectedStage.toLowerCase().includes('approval');
    const assignmentOptional = isClientApproval || selectedStage === 'Ready to Post' || selectedStage === 'Posted';
    if (!assignmentOptional && !selectedEmployee) {
      alert('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedStage, selectedEmployee, remarks);
      onClose();
    } catch (err) {
      console.error('Failed to assign:', err);
    } finally {
      setLoading(false);
    }
  };

  const isClientApprovalStage = selectedStage.toLowerCase().includes('approval');
  const assignmentOptional = isClientApprovalStage || selectedStage === 'Ready to Post' || selectedStage === 'Posted';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[500px] p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        
        <div className="space-y-4">
          {/* Stage Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select New Stage *
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
            >
              <option value="">-- Select Stage --</option>
              {allowedStages.map(stage => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Selection - Hidden when assignment is optional */}
          {!assignmentOptional && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Employee *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option 
                    key={emp._id} 
                    value={emp._id}
                    disabled={emp.suspended || emp.isDeleted}
                  >
                    {emp.name} {emp.suspended ? "(Suspended)" : emp.isDeleted ? "(Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isClientApprovalStage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              ℹ️ Client approval stages don't require employee assignment
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#026c8a] focus:border-transparent"
              rows="3"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Add any notes or instructions..."
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#026c8a] text-white rounded-lg hover:bg-[#034a60] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !selectedStage || (!assignmentOptional && !selectedEmployee)}
            onClick={handleSubmit}
          >
            {loading ? 'Updating...' : 'Update & Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeeModal;

