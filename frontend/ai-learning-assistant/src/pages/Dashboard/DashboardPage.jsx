import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/documentService';
import aiService from '../../services/aiService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([documentService.listSubjects(), aiService.listChats()])
      .then(([nextSubjects, nextChats]) => { setSubjects(nextSubjects); setChats(nextChats); })
      .catch((error) => toast.error(error.response?.data?.error || 'Could not load your study space.'))
      .finally(() => setLoading(false));
  }, []);
  const topicTotal = subjects.reduce((sum, subject) => sum + (subject.topics?.length || 0), 0);
  const pdfTotal = subjects.reduce((sum, subject) => sum + (subject.topics || []).filter((topic) => topic.pdf).length, 0);
  const recent = chats.slice(0, 4);
  const titleName = user?.username?.split(' ')[0] || 'there';
  return <div>
    <div className="welcome-row"><div><span className="eyebrow">Your learning, in one place</span><h1>Good to see you, {titleName}.</h1><p>Choose a subject and keep building on what you know.</p></div><Link className="btn btn-primary" to="/subjects">＋ New subject</Link></div>
    <section className="stat-grid">
      <article className="stat-card"><span className="stat-icon">▤</span><small>Subjects</small><strong>{subjects.length}</strong></article>
      <article className="stat-card"><span className="stat-icon">◉</span><small>Topics</small><strong>{topicTotal}</strong></article>
      <article className="stat-card"><span className="stat-icon">▧</span><small>Study PDFs</small><strong>{pdfTotal}</strong></article>
    </section>
    <div className="section-heading"><div><h2>Your subjects</h2><p>Course notes and topics, together.</p></div><Link to="/subjects">See all subjects&nbsp; →</Link></div>
    {loading ? <div className="loading-inline">Loading your subjects…</div> : subjects.length ? <div className="subject-grid">{subjects.slice(0, 6).map((subject, index) => <Link className="subject-card" to={'/subjects/' + subject._id} key={subject._id}><span className={'subject-icon subject-icon-' + (index % 3)}>{['✳', '⌘', '◈'][index % 3]}</span><h3>{subject.name}</h3><p>{subject.topics?.length || 0} topics · {(subject.topics || []).filter((topic) => topic.pdf).length} PDFs</p><span className="card-arrow">↗</span></Link>)}</div> : <div className="empty-state"><span>✧</span><h3>Start with a subject</h3><p>Create a subject for a class, then add topics and upload your study notes.</p><Link className="btn btn-primary" to="/subjects">Create your first subject</Link></div>}
    {recent.length > 0 && <><div className="section-heading section-heading-spaced"><div><h2>Pick up a conversation</h2><p>Your topic chats are saved for next time.</p></div><Link to="/conversations">All conversations&nbsp; →</Link></div><div className="list-card">{recent.map((chat) => {
      const subject = subjects.find((item) => String(item._id) === String(chat.subjectId));
      const topic = subject?.topics?.find((item) => String(item._id) === String(chat.topicId));
      return <Link className="conversation-row" key={chat._id} to={'/subjects/' + chat.subjectId + '/topics/' + chat.topicId + '?chat=' + chat._id}><span className="conversation-icon">◌</span><span className="row-main"><strong>{chat.title || topic?.name || 'Study conversation'}</strong><small>{subject?.name || 'Subject'} · {topic?.name || 'Topic'}</small></span><span className="row-arrow">→</span></Link>;
    })}</div></>}
  </div>;
}
