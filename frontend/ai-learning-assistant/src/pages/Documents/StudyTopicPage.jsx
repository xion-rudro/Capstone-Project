import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import documentService from '../../services/documentService';

export default function StudyTopicPage() {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const inputRef = useRef(null);
  const pdf = topic?.pdf;
  const pdfUrl = useMemo(() => pdf ? documentService.pdfUrl(pdf.fileId) + '#page=' + page + '&zoom=' + zoom : '', [pdf?.fileId, page, zoom]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    documentService.listSubjects()
      .then((subjects) => {
        if (!active) return;
        const foundSubject = subjects.find((item) => String(item._id) === String(subjectId));
        const foundTopic = foundSubject?.topics?.find((item) => String(item._id) === String(topicId));
        if (!foundSubject || !foundTopic) throw new Error('Topic not found.');
        setSubject(foundSubject); setTopic(foundTopic);
      })
      .catch((error) => { if (active) toast.error(error.response?.data?.error || error.message || 'Could not load this topic.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [subjectId, topicId]);

  const refreshTopic = async () => {
    const subjects = await documentService.listSubjects();
    const foundSubject = subjects.find((item) => String(item._id) === String(subjectId));
    const foundTopic = foundSubject?.topics?.find((item) => String(item._id) === String(topicId));
    if (!foundTopic) throw new Error('Topic no longer exists.');
    setSubject(foundSubject); setTopic(foundTopic);
  };
  const uploadPdf = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('PDFs must be 20 MB or smaller.'); event.target.value = ''; return; }
    try { await documentService.uploadPdf(subjectId, topicId, file); await refreshTopic(); setPage(1); toast.success('PDF uploaded and ready to read.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not upload PDF.'); }
    finally { event.target.value = ''; }
  };
  const renamePdf = async () => {
    const next = window.prompt('Rename this PDF', pdf?.displayName);
    if (!next?.trim()) return;
    try { await documentService.renamePdf(subjectId, topicId, next.trim()); await refreshTopic(); toast.success('PDF renamed.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not rename PDF.'); }
  };
  const removePdf = async () => {
    if (!window.confirm('Delete this PDF from the topic?')) return;
    try { await documentService.deletePdf(subjectId, topicId); await refreshTopic(); toast.success('PDF deleted.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not delete PDF.'); }
  };
  const renameTopic = async () => {
    const next = window.prompt('Rename topic', topic?.name);
    if (!next?.trim()) return;
    try { await documentService.updateTopic(subjectId, topicId, next.trim()); await refreshTopic(); toast.success('Topic renamed.'); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not rename topic.'); }
  };
  const deleteTopic = async () => {
    if (!window.confirm('Delete this topic and its PDF?')) return;
    try { await documentService.deleteTopic(subjectId, topicId); toast.success('Topic deleted.'); navigate('/subjects/' + subjectId); }
    catch (error) { toast.error(error.response?.data?.error || 'Could not delete topic.'); }
  };

  if (loading) return <div className="loading-inline">Opening topic…</div>;
  if (!topic || !subject) return <div className="empty-state"><h3>Topic unavailable</h3><Link to="/subjects">Browse subjects</Link></div>;
  return <div>
    <div className="breadcrumb"><Link to="/subjects">My subjects</Link><span>›</span><Link to={'/subjects/' + subjectId}>{subject.name}</Link><span>›</span><span>{topic.name}</span></div>
    <div className="welcome-row topic-title-row"><div><span className="eyebrow">Study topic</span><h1>{topic.name}</h1><p>{subject.name}{pdf ? ' · ' + pdf.displayName : ' · Add a PDF to view it here'}</p></div><div className="button-row"><button className="btn btn-secondary" onClick={renameTopic}>Rename topic</button><button className="btn btn-danger" onClick={deleteTopic}>Delete</button></div></div>
    <div className="study-grid">
      <section className="panel pdf-panel">
        <div className="panel-heading"><div className="panel-heading-text"><strong>{pdf?.displayName || 'Topic PDF'}</strong><small>{pdf ? (pdf.pageCount || '—') + ' pages · ' + Math.max(1, Math.round((pdf.size || 0) / 1024)) + ' KB' : 'Your PDF stays private to your account'}</small></div>
          <div className="button-row compact"><input ref={inputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={uploadPdf}/><button className="btn btn-secondary" onClick={() => inputRef.current?.click()}>{pdf ? 'Replace PDF' : '＋ Upload PDF'}</button>{pdf && <><button className="btn btn-quiet" onClick={renamePdf} title="Rename PDF">Rename</button><button className="btn btn-quiet btn-danger-text" onClick={removePdf} title="Delete PDF">Delete</button></>}</div>
        </div>
        <div className="pdf-viewer">{pdf ? <iframe title={pdf.displayName} src={pdfUrl} /> : <div className="viewer-empty"><span>▧</span><h3>Your topic PDF appears here</h3><p>Upload lecture slides or reading notes to view them here.</p><button className="btn btn-primary" onClick={() => inputRef.current?.click()}>＋ Upload a PDF</button></div>}</div>
        <div className="viewer-controls"><div><button className="control-button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!pdf || page <= 1}>‹</button><span>Page {page}{pdf?.pageCount ? ' / ' + pdf.pageCount : ''}</span><button className="control-button" onClick={() => setPage((value) => pdf?.pageCount ? Math.min(pdf.pageCount, value + 1) : value + 1)} disabled={!pdf || (pdf.pageCount > 0 && page >= pdf.pageCount)}>›</button></div><div><button className="control-button" onClick={() => setZoom((value) => Math.max(50, value - 10))} disabled={!pdf || zoom <= 50}>−</button><span>{zoom}%</span><button className="control-button" onClick={() => setZoom((value) => Math.min(200, value + 10))} disabled={!pdf || zoom >= 200}>＋</button></div></div>
      </section>
    </div>
  </div>;
}
