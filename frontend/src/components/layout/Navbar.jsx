import { Shield, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Badge } from '../ui';
import { cn } from '../../utils/helpers';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 min-w-[200px]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-slate-800 text-lg tracking-tight">
          RBAC<span className="text-emerald-500">.</span>
        </span>
      </div>

      {/* Center - breadcrumb / title area */}
      <div className="flex-1 hidden md:flex items-center">
        <span className="text-sm text-slate-400">
          {user?.role === 'admin' ? 'Administration' : 'Dashboard'}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell (aesthetic) */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Avatar name={user?.name || 'U'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 capitalize leading-tight">{user?.role}</p>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 card z-40 py-1.5 animate-fade-in">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <Badge status={user?.status} role={user?.role} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
