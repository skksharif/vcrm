import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * RoleRoute component for role-based access control
 * @param {string} role - Single role (deprecated, use roles instead)
 * @param {array} roles - Array of allowed roles
 * @param {React.ReactNode} children - Component to render if authorized
 */
export default function RoleRoute({ role, roles, children }){
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  // Support both single role (deprecated) and multiple roles
  const allowedRoles = roles || (role ? [role] : []);
  const isAuthorized = allowedRoles.includes(user.role) || user.role === 'CEO';
  
  if (isAuthorized) return children;
  return <Navigate to="/" />;
}
