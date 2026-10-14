import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import documentService from '../../services/documentService';

export default function DocumentListPage() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = async () => setSubjects(await documentService.listSubjects());
  useEffect(() => { refresh().catch((error) => toast.error(error.response?.data?.error || 'Could not load subjects.')).finally(() => setLoading(false)); }, []);
  const create = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    try { await documentService.createSubject(name.trim()); setName(''); await refresh(); toast.success('Subject created.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not create the subject.'); }
  };
  return <div>
    <div className="welcome-row"><div><span className="eyebrow">Build your course library</span><h1>My subjects</h1><p>Group every topic and PDF by the class you’re studying.</p></div></div>
    <form className="inline-create" onSubmit={create}><input aria-label="New subject name" placeholder="e.g. Biology 101" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} required/><button className="btn btn-primary">＋ Add subject</button></form>
    {loading ? <div className="loading-inline">Loading subjects…</div> : subjects.length ? <div className="subject-grid">{subjects.map((subject, index) => <Link className="subject-card" to={'/subjects/' + subject._id} key={subject._id}><span className={'subject-icon subject-icon-' + (index % 3)}>{['✳', '⌘', '◈'][index % 3]}</span><h3>{subject.name}</h3><p>{subject.topics?.length || 0} topics · {(subject.topics || []).filter((topic) => topic.pdf).length} PDFs</p><span className="card-arrow">↗</span></Link>)}</div> : <div className="empty-state"><span>✧</span><h3>Your first subject starts here</h3><p>Add a class or course above, then add topics and upload the PDFs you study from.</p></div>}
  </div>;
}
