import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student', inviteCode: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await register(form); navigate('/dashboard', { replace: true }); }
    catch (err) { setError(err.response?.data?.error || 'Could not create your account. Try again.'); }
    finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-frame">
    <div className="auth-art"><div className="brand"><span className="brand-mark">A</span> AI Learning Assistant</div><div><span className="eyebrow">Start with one subject</span><h1>Build a study habit that feels like yours.</h1><p>Organize your notes by subject and topic, then ask questions with your PDFs close by.</p><div className="art-note">✦ &nbsp;Your notes. Your pace. Your progress.</div></div><small>A workspace for learning</small></div>
    <div className="auth-form-panel"><div className="auth-form"><span className="eyebrow">Create your study space</span><h2>Join the workspace</h2><p className="form-subtitle">A few details and you’re ready to begin.</p>
      <form onSubmit={submit}><label>Account type<select name="role" value={form.role} onChange={change}><option value="student">Student</option><option value="admin">Administrator</option></select></label>
        {form.role === 'admin' && <label>Administrator invite code<input name="inviteCode" type="password" value={form.inviteCode} onChange={change} autoComplete="off" required /></label>}
        <label>Your name<input name="username" value={form.username} onChange={change} minLength={2} maxLength={40} autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" value={form.email} onChange={change} autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={change} minLength={10} maxLength={128} autoComplete="new-password" placeholder="At least 10 characters" required /></label>
        {error && <div className="form-error" role="alert">{error}</div>}<button className="btn btn-primary btn-wide" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <span>→</span></button></form>
      <p className="auth-toggle">Already have an account? <Link to="/login">Sign in</Link></p>
    </div></div>
  </section></main>;
}
