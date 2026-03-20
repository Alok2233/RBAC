import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  UserCheck,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/helpers';

const userLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Overview' },
  { to: '/admin/pending', icon: Clock, label: 'Pending Approvals' },
  { to: '/admin/users', icon: Users, label: 'All Users' },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-slate-100 z-30 flex flex-col py-4 px-3 overflow-y-auto">
      {/* Nav section */}
      <nav className="flex-1 space-y-0.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {user?.role === 'admin' ? 'Admin Panel' : 'Navigation'}
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  )}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100">
        <div className="px-3 py-2">
          <p className="text-xs text-slate-400">
            Logged in as{' '}
            <span className="font-semibold text-slate-500 capitalize">{user?.role}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
