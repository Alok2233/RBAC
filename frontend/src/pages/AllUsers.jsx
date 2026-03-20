import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Mail,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
} from '../components/ui';
import DashboardLayout from '../components/layout/DashboardLayout';
import { timeAgo, formatDateTime } from '../utils/helpers';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await userAPI.getAll({
          page,
          limit: 15,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } catch {
        toast.error('Failed to load users.');
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleApprove = async (userId, userName) => {
    setActionLoading((a) => ({ ...a, [userId]: 'approve' }));
    try {
      const { data } = await userAPI.approve(userId);
      toast.success(`✅ ${userName} approved.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: 'approved' } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve.');
    } finally {
      setActionLoading((a) => ({ ...a, [userId]: null }));
    }
  };

  const handleReject = async (userId, userName) => {
    const reason = prompt(`Reason for rejecting ${userName} (optional):`);
    if (reason === null) return; // user cancelled

    setActionLoading((a) => ({ ...a, [userId]: 'reject' }));
    try {
      await userAPI.reject(userId, reason || 'Access denied by administrator.');
      toast.success(`❌ ${userName} rejected.`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: 'rejected' } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setActionLoading((a) => ({ ...a, [userId]: null }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">
              All Users
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {pagination.total} total user{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchUsers(1)}
            loading={loading}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1 border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === f.value
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="Try adjusting your search or filter criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge status={user.status} />
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <Badge role={user.role} />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {timeAgo(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {user.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-1.5">
                            {user.status !== 'approved' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(user._id, user.name)}
                                loading={actionLoading[user._id] === 'approve'}
                                disabled={!!actionLoading[user._id]}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                            )}
                            {user.status !== 'rejected' && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleReject(user._id, user.name)}
                                loading={actionLoading[user._id] === 'reject'}
                                disabled={!!actionLoading[user._id]}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reject</span>
                              </Button>
                            )}
                            {user.status === 'approved' &&
                              actionLoading[user._id] == null && (
                                <span className="text-xs text-emerald-500 font-medium">
                                  Active
                                </span>
                              )}
                          </div>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-xs text-slate-400 italic">
                            Super Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
