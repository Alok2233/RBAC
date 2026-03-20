import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  ListTodo,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { taskAPI, userAPI } from '../services/api';
import { Avatar, Badge, Card, Button, Spinner, EmptyState } from '../components/ui';
import DashboardLayout from '../components/layout/DashboardLayout';
import { formatDateTime, timeAgo } from '../utils/helpers';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-200',
    title: 'Awaiting Approval',
    description:
      'Your account is under review. An administrator will approve or reject your request shortly. You will be able to access all features once approved.',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'Account Approved',
    description:
      'Your account is active and you have full access to the platform.',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-200',
    title: 'Account Rejected',
    description:
      'Your account request has been rejected. Please contact support for more information.',
  },
};

export default function UserDashboard() {
  const { user, refreshUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending',
  });

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getMe();
      setProfile(data.data.user);
    } catch (err) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const { data } = await taskAPI.getMine();
      setTasks(data.data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks.');
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await fetchProfile();
    await fetchTasks();
    setRefreshing(false);
    toast.success('Profile refreshed');
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setTaskSubmitting(true);
    try {
      const { data } = await taskAPI.create(taskForm);
      setTasks((prev) => [data.data.task, ...prev]);
      setTaskForm({ title: '', description: '', status: 'pending' });
      toast.success('Task created successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const status = profile?.status || user?.status || 'pending';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const displayUser = profile || user;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">
              My Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Your profile and account status
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Status banner */}
        <div className={`border rounded-2xl p-5 ${config.bg} animate-fade-in`}>
          <div className="flex items-start gap-4">
            <div className="mt-0.5">
              <StatusIcon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                {config.title}
                <Badge status={status} />
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {config.description}
              </p>
              {status === 'rejected' && profile?.rejectionReason && (
                <div className="mt-2 p-2.5 bg-white/70 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700">
                    <span className="font-semibold">Reason: </span>
                    {profile.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile card */}
        <Card className="p-6">
          <div className="flex items-start gap-5">
            <Avatar name={displayUser?.name || ''} size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-display font-bold text-slate-800">
                {displayUser?.name}
              </h2>
              <p className="text-slate-500 text-sm">{displayUser?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge status={displayUser?.status} />
                <Badge role={displayUser?.role} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow
              icon={Mail}
              label="Email"
              value={displayUser?.email}
            />
            <InfoRow
              icon={User}
              label="Full Name"
              value={displayUser?.name}
            />
            <InfoRow
              icon={ShieldCheck}
              label="Role"
              value={
                <span className="capitalize font-medium">
                  {displayUser?.role}
                </span>
              }
            />
            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={formatDateTime(displayUser?.createdAt)}
            />
            <InfoRow
              icon={Clock}
              label="Last Login"
              value={
                displayUser?.lastLogin
                  ? timeAgo(displayUser.lastLogin)
                  : 'First login'
              }
            />
            {displayUser?.approvedAt && (
              <InfoRow
                icon={CheckCircle}
                label="Approved On"
                value={formatDateTime(displayUser.approvedAt)}
              />
            )}
          </div>
        </Card>

        {/* Access info card */}
        {status === 'approved' && (
          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr,1.05fr] gap-6">
            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-800">
                    Full Access Granted
                  </h3>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Your account has been verified and can create personal tasks.
                  </p>
                </div>
              </div>
              <form onSubmit={handleTaskSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Task Title
                  </label>
                  <input
                    name="title"
                    value={taskForm.title}
                    onChange={handleTaskChange}
                    className="input-field"
                    placeholder="Prepare weekly status update"
                    maxLength={120}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={handleTaskChange}
                    rows={4}
                    className="input-field min-h-28 resize-y"
                    placeholder="Add any notes, blockers, or expected outcome"
                    maxLength={1000}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={handleTaskChange}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <Button type="submit" loading={taskSubmitting} className="w-full">
                  <PlusCircle className="w-4 h-4" />
                  Create Task
                </Button>
              </form>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-800">
                    My Tasks
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {tasks.length} task{tasks.length === 1 ? '' : 's'} created
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {taskLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner />
                </div>
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No tasks yet"
                  description="Create your first task from the form to start tracking your work."
                />
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task._id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Created {timeAgo(task.createdAt)}
                          </p>
                        </div>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5 truncate">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}
