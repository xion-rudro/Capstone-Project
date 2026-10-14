import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentNavigation = [
  { to: '/dashboard', label: 'Overview', icon: '⌂' },
  { to: '/subjects', label: 'My subjects', icon: '▤' },
  { to: '/conversations', label: 'Conversations', icon: '◌' }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const admin = user?.role === 'admin';
  const title = location.pathname.startsWith('/admin') ? 'Admin overview'
    : location.pathname.startsWith('/subjects/') ? 'Subject workspace'
      : location.pathname === '/subjects' ? 'My subjects'
        : location.pathname === '/conversations' ? 'Conversations' : 'Overview';
  const signOut = async () => { try { await logout(); } finally { navigate('/login', { replace: true }); } };
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">A</span><span>AI Learning<br/>Assistant</span></div>
      <div className="nav-caption">{admin ? 'Management' : 'My learning'}</div>
      <nav className="side-nav">
        {admin ? <NavLink to="/admin" className={({ isActive }) => 'side-link ' + (isActive ? 'active' : '')}><span>◫</span> Admin overview</NavLink>
          : studentNavigation.map((item) => <NavLink key={item.to} to={item.to} end className={({ isActive }) => 'side-link ' + (isActive ? 'active' : '')}><span>{item.icon}</span>{item.label}</NavLink>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-tip"><span className="tip-icon">✦</span><strong>{admin ? 'Admin space' : 'A gentle reminder'}</strong><p>{admin ? 'Manage access and review AI activity.' : 'Small study sessions add up. One page at a time.'}</p></div>
      <div className="profile-mini"><span className="avatar">{String(user?.username || user?.email || 'S').slice(0, 1).toUpperCase()}</span><span className="profile-text"><strong>{user?.username}</strong><small>{user?.role}</small></span><button className="logout-icon" onClick={signOut} title="Sign out" aria-label="Sign out">↗</button></div>
    </aside>
    <section className="app-main"><header className="topbar"><div><strong>{title}</strong><small>{admin ? 'Account access and activity' : 'Your learning space, all in one place'}</small></div><span className="role-badge">{user?.role}</span></header><main className="page-content"><Outlet /></main></section>
  </div>;
}
