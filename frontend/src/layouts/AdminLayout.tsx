import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShieldAlert, Sparkles, FileSpreadsheet, Lock } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-xl bg-[#101F33] border border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Administrator Access Required</h2>
        <p className="text-sm text-slate-400">
          This area contains municipal operational controls and requires authenticated administrator privileges.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Sign In as Administrator
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Operations Cockpit', icon: LayoutDashboard },
    { path: '/admin/issues', label: 'Issue Priority Queue', icon: ShieldAlert },
    { path: '/admin/insights', label: 'AI Pattern Insights', icon: Sparkles },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Sub-header admin navigation */}
      <div className="w-full bg-[#0B1728] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supervisor Session Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
