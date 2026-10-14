import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { try { await logout(); } finally { navigate('/login', { replace: true }); } };
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">A</span><span>AI Learning<br/>Assistant</span></div>
      <div className="nav-caption">My learning</div>
      <nav className="side-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => 'side-link ' + (isActive ? 'active' : '')}><span>⌂</span>Overview</NavLink>
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-tip"><span className="tip-icon">✦</span><strong>A gentle reminder</strong><p>Small study sessions add up. One page at a time.</p></div>
      <div className="profile-mini"><span className="avatar">{String(user?.username || user?.email || 'S').slice(0, 1).toUpperCase()}</span><span className="profile-text"><strong>{user?.username}</strong><small>{user?.role}</small></span><button className="logout-icon" onClick={signOut} title="Sign out" aria-label="Sign out">↗</button></div>
    </aside>
    <section className="app-main"><header className="topbar"><div><strong>Overview</strong><small>Your learning space, all in one place</small></div><span className="role-badge">{user?.role}</span></header><main className="page-content"><Outlet /></main></section>
  </div>;
}
