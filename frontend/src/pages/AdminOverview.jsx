import { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, TrendingUp, ArrowRight, ListTodo, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskAPI, userAPI } from '../services/api';
import { StatCard, Card, Button, Spinner, Avatar, EmptyState } from '../components/ui';
import DashboardLayout from '../components/layout/DashboardLayout';
import { timeAgo } from '../utils/helpers';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes, tasksRes] = await Promise.all([
          userAPI.getStats(),
          userAPI.getPending(),
          taskAPI.getAll(),
        ]);
        setStats(statsRes.data.data);
        setPendingUsers(pendingRes.data.data.users.slice(0, 5));
        setTasks(tasksRes.data.data.tasks);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">
            Admin Overview
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Platform-wide metrics and quick actions
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats?.total ?? 0}
            icon={Users}
            color="slate"
            trend="All registered users"
          />
          <StatCard
            label="Pending"
            value={stats?.pending ?? 0}
            icon={Clock}
            color="amber"
            trend="Awaiting review"
          />
          <StatCard
            label="Approved"
            value={stats?.approved ?? 0}
            icon={CheckCircle}
            color="emerald"
            trend="Active accounts"
          />
          <StatCard
            label="Rejected"
            value={stats?.rejected ?? 0}
            icon={XCircle}
            color="red"
            trend="Denied access"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            icon={ListTodo}
            color="violet"
            trend="Tasks created by all approved users"
          />
          <StatCard
            label="Completed Tasks"
            value={tasks.filter((task) => task.status === 'completed').length}
            icon={FolderKanban}
            color="emerald"
            trend="Marked complete across the workspace"
          />
        </div>

        {/* Recent signups + pending queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending approvals preview */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-display font-bold text-slate-800">
                  Pending Approvals
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats?.pending ?? 0} awaiting review
                </p>
              </div>
              {stats?.pending > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold animate-pulse-soft">
                  {stats.pending > 9 ? '9+' : stats.pending}
                </span>
              )}
            </div>

            {pendingUsers.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Avatar name={user.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {timeAgo(user.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/admin/pending" className="block mt-4">
              <Button variant="secondary" size="sm" className="w-full">
                View All Pending
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>

          {/* Weekly stats card */}
          <Card className="p-5">
            <h2 className="text-base font-display font-bold text-slate-800 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              <MetricRow
                label="New signups (7 days)"
                value={stats?.recentSignups ?? 0}
                icon={TrendingUp}
                color="text-emerald-500"
              />
              <MetricRow
                label="Approval rate"
                value={
                  stats?.total > 0
                    ? `${Math.round((stats.approved / stats.total) * 100)}%`
                    : '—'
                }
                icon={CheckCircle}
                color="text-emerald-500"
              />
              <MetricRow
                label="Rejection rate"
                value={
                  stats?.total > 0
                    ? `${Math.round((stats.rejected / stats.total) * 100)}%`
                    : '—'
                }
                icon={XCircle}
                color="text-red-400"
              />
              <MetricRow
                label="Pending rate"
                value={
                  stats?.total > 0
                    ? `${Math.round((stats.pending / stats.total) * 100)}%`
                    : '—'
                }
                icon={Clock}
                color="text-amber-400"
              />
            </div>

            <Link to="/admin/users" className="block mt-5">
              <Button variant="primary" size="sm" className="w-full">
                Manage All Users
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-display font-bold text-slate-800">
                User Tasks
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest tasks across all users
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-violet-600" />
            </div>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No tasks created yet"
              description="Once approved users start adding tasks, they will appear here for admin review."
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-2xl border border-slate-100 p-4 bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {task.createdBy?.name || 'Unknown user'} • {task.createdBy?.email || 'No email'}
                      </p>
                    </div>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                  </p>
                  <div className="mt-3 text-xs text-slate-400">
                    Created {timeAgo(task.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricRow({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-800 font-mono">{value}</span>
    </div>
  );
}

function TaskStatusBadge({ status }) {
  const config = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const label = status === 'in_progress' ? 'In Progress' : status?.replace('_', ' ');

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${config[status] || config.pending}`}>
      {label}
    </span>
  );
}
