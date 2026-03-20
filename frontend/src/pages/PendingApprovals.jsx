import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, Mail, Calendar } from 'lucide-react';
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
import { formatDateTime, timeAgo } from '../utils/helpers';

export default function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null); // { userId, userName }
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = async () => {
    try {
      const { data } = await userAPI.getPending();
      setUsers(data.data.users);
    } catch {
      toast.error('Failed to load pending users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (userId, userName) => {
    setActionLoading((a) => ({ ...a, [userId]: 'approve' }));
    try {
      await userAPI.approve(userId);
      toast.success(`✅ ${userName} has been approved.`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve user.');
    } finally {
      setActionLoading((a) => ({ ...a, [userId]: null }));
    }
  };

  const openRejectModal = (user) => {
    setRejectModal({ userId: user._id, userName: user.name });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const { userId, userName } = rejectModal;
    setActionLoading((a) => ({ ...a, [userId]: 'reject' }));
    try {
      await userAPI.reject(userId, rejectReason || 'Access denied by administrator.');
      toast.success(`❌ ${userName} has been rejected.`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setRejectModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject user.');
    } finally {
      setActionLoading((a) => ({ ...a, [userId]: null }));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">
              Pending Approvals
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {users.length} user{users.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setLoading(true); fetchPending(); }}
            loading={loading}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Pending count badge */}
        {users.length > 0 && (
          <div className="flex items-center gap-2 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-sm text-amber-700 font-medium">
              {users.length} pending request{users.length !== 1 ? 's' : ''} need your attention
            </p>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <EmptyState
              icon={CheckCircle}
              title="All caught up!"
              description="No pending user requests at this time."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user._id} className="p-5 hover:shadow-card-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar name={user.name} size="lg" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-800">
                        {user.name}
                      </h3>
                      <Badge status="pending" />
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Registered {timeAgo(user.createdAt)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(user.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openRejectModal(user)}
                      loading={actionLoading[user._id] === 'reject'}
                      disabled={!!actionLoading[user._id]}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(user._id, user.name)}
                      loading={actionLoading[user._id] === 'approve'}
                      disabled={!!actionLoading[user._id]}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setRejectModal(null)}
          />
          <Card className="relative w-full max-w-md p-6 animate-slide-up z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-slate-800">
                  Reject User
                </h3>
                <p className="text-xs text-slate-500">
                  Rejecting access for{' '}
                  <span className="font-semibold">{rejectModal.userName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Reason <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-2.5 mt-5">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 !bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
                onClick={handleReject}
                loading={actionLoading[rejectModal.userId] === 'reject'}
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
