import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500',
    secondary: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow focus:ring-slate-300',
    danger: 'bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 focus:ring-red-500',
    success: 'bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-500 focus:ring-emerald-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-5 py-3 text-base rounded-xl',
    xl: 'px-6 py-3.5 text-base rounded-xl',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ status, role, className }) {
  if (role === 'admin') {
    return (
      <span className={cn('badge-admin', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
        Admin
      </span>
    );
  }

  const map = {
    pending: {
      cls: 'badge-pending',
      dot: 'bg-amber-400',
      label: 'Pending',
    },
    approved: {
      cls: 'badge-approved',
      dot: 'bg-emerald-500',
      label: 'Approved',
    },
    rejected: {
      cls: 'badge-rejected',
      dot: 'bg-red-500',
      label: 'Rejected',
    },
  };

  const config = map[status] || map.pending;

  return (
    <span className={cn(config.cls, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          className={cn(
            'input-field',
            Icon && 'pl-10',
            error && 'border-red-300 focus:ring-red-400 focus:border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return (
    <Loader2 className={cn('animate-spin text-emerald-500', sizes[size], className)} />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 'md', className }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };
  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-semibold text-white flex-shrink-0',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'emerald', trend }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-display font-bold text-slate-800 mt-1">
            {value ?? '—'}
          </p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl', colors[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
