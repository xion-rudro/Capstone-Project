import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login(form); navigate('/dashboard', { replace: true }); }
    catch (err) { setError(err.response?.data?.error || 'Could not sign in. Try again.'); }
    finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-frame">
    <div className="auth-art"><div className="brand"><span className="brand-mark">A</span> AI Learning Assistant</div><div><span className="eyebrow">Your learning space</span><h1>Make every page easier to understand.</h1><p>Keep course notes, topics, and questions together in one calm study space.</p><div className="art-note">✦ &nbsp;Learn one idea at a time.</div></div><small>Designed for focused study</small></div>
    <div className="auth-form-panel"><div className="auth-form"><span className="eyebrow">Welcome back</span><h2>Sign in</h2><p className="form-subtitle">Open your subjects and continue where you left off.</p>
      <form onSubmit={submit}><label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" value={form.password} onChange={change} placeholder="Your password" required /></label>
        {error && <div className="form-error" role="alert">{error}</div>}<button className="btn btn-primary btn-wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <span>→</span></button></form>
      <p className="auth-toggle">New here? <Link to="/register">Create an account</Link></p>
    </div></div>
  </section></main>;
}
