import React from "react";
import useAuth from "../../context/useAuth";
import { Bell, User, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Header Left */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-800">
            Dashboard
          </h2>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-4">

          {/* Notification Button */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Bell size={20} strokeWidth={2} />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">

            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600">
              <User size={18} strokeWidth={2.5} />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.username || "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email || "user@example.com"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
