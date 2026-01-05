import React from "react";
import { useAuth } from "../contexts/AuthContext";

// CEO must never be shown in UI
const HIDDEN_ROLES = ["CEO"];

/**
 * Usage:
 * <RoleGuard allowed={["Admin", "TL-1"]}> ... </RoleGuard>
 * <RoleGuard allowed="Employee"> ... </RoleGuard>
 */
const RoleGuard = ({ allowed, children, fallback = null }) => {
  const { user } = useAuth();
  if (!user || HIDDEN_ROLES.includes(user.role)) return null;
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  if (allowedRoles.includes(user.role)) return children;
  return fallback;
};

export default RoleGuard;
