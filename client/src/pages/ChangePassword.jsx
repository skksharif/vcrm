import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-password", { oldPassword, newPassword });
      setSuccess("Password changed successfully. Please log in again.");
      setTimeout(() => {
        logout();
        nav("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-2 text-green-600 text-sm">{success}</div>}
        <div className="mb-3">
          <label className="block text-sm mb-1">Current Password</label>
          <input type="password" className="w-full border rounded p-2" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">New Password</label>
          <input type="password" className="w-full border rounded p-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Confirm New Password</label>
          <input type="password" className="w-full border rounded p-2" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 rounded font-medium disabled:opacity-60">
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
