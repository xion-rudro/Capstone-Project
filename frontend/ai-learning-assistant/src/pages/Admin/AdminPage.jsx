import { useEffect, useState } from 'react';
import api from '../../utils/axiosinstance';
import toast from 'react-hot-toast';

function ago(value) {
  if (!value) return 'No recent activity';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return minutes + ' min ago';
  if (minutes < 1440) return Math.floor(minutes / 60) + ' hr ago';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    const response = await api.get('/admin/overview');
    setData(response.data);
  };
  useEffect(() => { refresh().catch((error) => toast.error(error.response?.data?.error || 'Could not load admin overview.')).finally(() => setLoading(false)); }, []);
  const toggleBlock = async (user) => {
    try { await api.patch('/admin/users/' + user.id + '/block', { isBlocked: !user.isBlocked }); await refresh(); toast.success(user.isBlocked ? 'Account unblocked.' : 'Account blocked.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not update account.'); }
  };
  const deleteUser = async (user) => {
    if (!window.confirm('Delete ' + user.email + ' and their subjects, PDFs, and saved chats? This cannot be undone.')) return;
    try { await api.delete('/admin/users/' + user.id); await refresh(); toast.success('User and study data deleted.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not delete user.'); }
  };
  if (loading) return <div className="loading-inline">Loading account activity…</div>;
  if (!data) return <div className="empty-state"><h3>Could not load admin data</h3><button className="btn btn-primary" onClick={() => refresh().catch((error) => toast.error(error.response?.data?.error || 'Try again.'))}>Try again</button></div>;
  const { users, metrics, recentRequests } = data;
  return <div>
    <div className="welcome-row"><div><span className="eyebrow">Account management</span><h1>Admin overview</h1><p>Review user access and see how the study assistant is being used.</p></div><button className="btn btn-secondary" onClick={() => refresh().catch(() => toast.error('Could not refresh.'))}>↻ Refresh</button></div>
    <div className={'admin-banner ' + (metrics.aiConfigured ? '' : 'warning')}>{metrics.aiConfigured ? '✦ AI is configured. Recent request activity is below.' : 'ⓘ Add GEMINI_API_KEY to backend/.env to enable AI answers.'}</div>
    <section className="stat-grid admin-stats">
      <article className="stat-card"><span className="stat-icon">♙</span><small>Registered users</small><strong>{metrics.totalUsers}</strong></article>
      <article className="stat-card"><span className="stat-icon">◉</span><small>Active in last 5 min</small><strong>{metrics.activeUsers}</strong></article>
      <article className="stat-card"><span className="stat-icon">✦</span><small>AI requests · 24h</small><strong>{metrics.requestsToday}</strong></article>
      <article className="stat-card"><span className="stat-icon">↗</span><small>AI requests · total</small><strong>{metrics.totalRequests}</strong></article>
    </section>
    <div className="section-heading"><div><h2>Users</h2><p>Block access or remove an account and its study data.</p></div></div>
    <div className="table-scroll"><table className="data-table"><thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Last active</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.email}</strong></td><td>{user.role}</td><td><span className={'status-chip ' + (user.isBlocked ? 'blocked' : '')}>{user.isBlocked ? 'Blocked' : 'Active'}</span></td><td>{ago(user.lastSeenAt)}</td><td>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.createdAt))}</td><td><div className="button-row compact"><button className="btn btn-quiet" onClick={() => toggleBlock(user)}>{user.isBlocked ? 'Unblock' : 'Block'}</button><button className="btn btn-quiet btn-danger-text" onClick={() => deleteUser(user)}>Delete</button></div></td></tr>)}</tbody></table></div>
    <div className="section-heading section-heading-spaced"><div><h2>Recent AI requests</h2><p>Request status and response time. Prompts are not shown here.</p></div></div>
    <div className="table-scroll"><table className="data-table"><thead><tr><th>User</th><th>Status</th><th>Duration</th><th>Requested</th></tr></thead><tbody>{recentRequests.length ? recentRequests.map((request) => <tr key={request.id}><td>{request.email}</td><td><span className={'status-chip ' + request.status}>{request.status.replace('_', ' ')}</span></td><td>{request.durationMs == null ? '—' : request.durationMs + ' ms'}</td><td>{ago(request.createdAt)}</td></tr>) : <tr><td className="empty-cell" colSpan="4">No AI requests yet.</td></tr>}</tbody></table></div>
  </div>;
}
