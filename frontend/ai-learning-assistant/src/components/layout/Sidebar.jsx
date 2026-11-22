
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BookOpen,
  X
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/90 backdrop-blur-lg border-r border-slate-200 shadow-xl flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Logo and Close Button */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">

          <div className="flex items-center gap-3">

            <div className="brand-mark">
              <img src="/favicon.svg" alt="" width="40" height="40" />
            </div>

            <h1 className="text-sm font-bold text-slate-800 leading-tight">
              AI Learning Assistant
            </h1>

          </div>

          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${
                      isActive ? '' : 'group-hover:scale-110'
                    }`}
                  />

                  <span>{link.text}</span>
                </>
              )}
            </NavLink>
          ))}

        </nav>

        {/* Logout Section */}
        <div className="px-4 py-5 border-t border-slate-200">

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
            />

            Logout
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;
