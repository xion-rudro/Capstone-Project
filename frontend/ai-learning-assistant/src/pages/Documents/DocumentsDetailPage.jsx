import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import documentService from '../../services/documentService';

export default function DocumentsDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(true);
  const subject = subjects.find((item) => String(item._id) === String(subjectId));
  const refresh = async () => setSubjects(await documentService.listSubjects());
  useEffect(() => { refresh().catch((error) => toast.error(error.response?.data?.error || 'Could not load the subject.')).finally(() => setLoading(false)); }, [subjectId]);
  const addTopic = async (event) => {
    event.preventDefault();
    if (!topicName.trim()) return;
    try { await documentService.createTopic(subjectId, topicName.trim()); setTopicName(''); await refresh(); toast.success('Topic added.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not add that topic.'); }
  };
  const renameSubject = async () => {
    const next = window.prompt('Rename subject', subject?.name);
    if (!next?.trim()) return;
    try { await documentService.updateSubject(subjectId, next.trim()); await refresh(); toast.success('Subject renamed.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not rename subject.'); }
  };
  const deleteSubject = async () => {
    if (!window.confirm('Delete this subject and all its topics and PDFs?')) return;
    try { await documentService.deleteSubject(subjectId); toast.success('Subject deleted.'); navigate('/subjects', { replace: true }); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not delete subject.'); }
  };
  const renameTopic = async (topic) => {
    const next = window.prompt('Rename topic', topic.name);
    if (!next?.trim()) return;
    try { await documentService.updateTopic(subjectId, topic._id, next.trim()); await refresh(); toast.success('Topic renamed.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not rename topic.'); }
  };
  const deleteTopic = async (topic) => {
    if (!window.confirm('Delete this topic and its PDF?')) return;
    try { await documentService.deleteTopic(subjectId, topic._id); await refresh(); toast.success('Topic deleted.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not delete topic.'); }
  };
  if (loading) return <div className="loading-inline">Loading subject…</div>;
  if (!subject) return <div className="empty-state"><h3>Subject not found</h3><Link to="/subjects">Back to subjects</Link></div>;
  return <div>
    <div className="breadcrumb"><Link to="/subjects">My subjects</Link><span>›</span><span>{subject.name}</span></div>
    <div className="welcome-row"><div><span className="eyebrow">Subject workspace</span><h1>{subject.name}</h1><p>{subject.topics?.length || 0} topics · {(subject.topics || []).filter((topic) => topic.pdf).length} PDFs</p></div><div className="button-row"><button className="btn btn-secondary" onClick={renameSubject}>Rename</button><button className="btn btn-danger" onClick={deleteSubject}>Delete subject</button></div></div>
    <div className="section-heading"><div><h2>Topics</h2><p>Each topic can hold a PDF for reading.</p></div></div>
    {subject.topics?.length ? <div className="list-card">{subject.topics.map((topic) => <div className="topic-row" key={topic._id}><Link className="topic-open" to={'/subjects/' + subjectId + '/topics/' + topic._id}><span className="topic-icon">{topic.pdf ? '▧' : '◉'}</span><span className="row-main"><strong>{topic.name}</strong><small>{topic.pdf ? topic.pdf.displayName + ' · ' + (topic.pdf.pageCount || '—') + ' pages' : 'No study PDF yet'}</small></span><span className="row-arrow">→</span></Link><div className="topic-actions"><button className="btn btn-quiet" onClick={() => renameTopic(topic)}>Rename</button><button className="btn btn-quiet btn-danger-text" onClick={() => deleteTopic(topic)}>Delete</button></div></div>)}</div> : <div className="empty-state"><span>◉</span><h3>Add the first topic</h3><p>Organize each reading by topic.</p></div>}
    <form className="inline-create topic-create" onSubmit={addTopic}><input placeholder="e.g. Cell structure" aria-label="New topic name" value={topicName} maxLength={100} onChange={(event) => setTopicName(event.target.value)} required/><button className="btn btn-primary">＋ Add topic</button></form>
  </div>;
}
