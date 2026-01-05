import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeTasks, setActiveTasks] = useState([]);



  if (!user) return null;

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  const links = [];

  if (user.role === 'CEO') {
    links.push(
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/clients', label: 'Clients' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/calendar', label: 'Calendar' },
      { to: '/admin/profile', label: 'Profile' }
    );
  }

  if (user.role === 'TL-1' || user.role === 'TL-2') {
    links.push(
      { to: '/tl', label: 'Dashboard' },
      { to: '/tl/tasks', label: 'Tasks' },
      { to: '/tl/acceptances', label: 'Acceptances' },
      { to: '/profile', label: 'Profile' }
    );
  }

  if (user.role === 'Employee') {
    links.push(
      { to: '/employee', label: 'Dashboard' },
      { to: '/employee/tasks', label: 'My Tasks' },
      { to: '/profile', label: 'Profile' }
    );
  }

  if (user.role === 'Social Media Manager') {
    links.push(
      { to: '/smm', label: 'Dashboard' },
      { to: '/smm/tasks', label: 'Ready to Post' },
      { to: '/profile', label: 'Profile' }
    );
  }

  if (!['CEO', 'TL-1', 'TL-2', 'Employee', 'Social Media Manager'].includes(user.role)) {
    links.push({ to: '/profile', label: 'Profile' });
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const initials = (user.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

  // Determine the single most-specific active route so only the best match is highlighted
  const activePath = useMemo(() => {
    let best = '';
    links.forEach((l) => {
      if (location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to + '/'))) {
        if (l.to.length > best.length) best = l.to;
      }
    });
    return best;
  }, [location.pathname, links]);

  const isActive = (path) =>
    path === activePath
      ? 'bg-[#e6f6f8] text-[#026c8a] relative'
      : 'text-gray-700 hover:bg-gray-100';

  const NavIcon = ({ name }) => {
    switch (name) {
      case 'Dashboard':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        );
      case 'Clients':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        );
      case 'Users':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        );
      case 'Tasks':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        );
      case 'My Tasks':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h11"/></svg>
        );
      case 'Ready to Post':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.69l5.66 5.66M12 2.69L6.34 8.35"/></svg>
        );
      case 'Acceptances':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        );
      case 'Calendar':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        );
      case 'Profile':
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        );
      default:
        return (
          <svg className="h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 md:static inset-y-0 left-0 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out shadow-sm ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-5 text-xl font-semibold text-[#026c8a] border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">VCRM</div>
            <div className="text-xs text-gray-500">TrueUp Media</div>
          </div>
          <button className="md:hidden text-gray-500" onClick={() => setOpen(false)} aria-label="Close sidebar">✕</button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => { setOpen(false); setMenuOpen(false); }}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition ${isActive(l.to)}`}
            >
              <NavIcon name={l.label} />
              <span className="flex-1">{l.label}</span>
              {/* Left active indicator */}
              { l.to === activePath && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#026c8a] rounded-r-md" aria-hidden /> }
            </Link>
          ))}
        </nav>

        {activeTasks.length > 0 && (
          <div className="mt-6 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Tasks</h3>
            <div className="space-y-3">
              {activeTasks.map(task => (
                <div key={task._id} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="truncate font-medium text-gray-700" title={task.title}>{task.title}</span>
                    <span className="text-gray-500">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-[#026c8a] h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-2xl"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{user.role} Dashboard</h1>
              <div className="text-xs text-gray-500">{location.pathname.replace('/', '') || 'Overview'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
              <div className="text-right">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="flex items-center gap-3 bg-white border px-2 py-1 rounded-full hover:shadow focus:outline-none"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-[#026c8a] text-white flex items-center justify-center font-semibold">{initials}</div>
                <svg className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.063a.75.75 0 011.08 1.04l-4.25 4.657a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-1" role="menu">
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-auto transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
