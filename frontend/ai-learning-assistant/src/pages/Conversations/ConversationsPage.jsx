import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import aiService from '../../services/aiService';
import documentService from '../../services/documentService';

export default function ConversationsPage() {
  const [chats, setChats] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([aiService.listChats(), documentService.listSubjects()])
      .then(([nextChats, nextSubjects]) => { setChats(nextChats); setSubjects(nextSubjects); })
      .catch((error) => toast.error(error.response?.data?.error || 'Could not load conversations.'))
      .finally(() => setLoading(false));
  }, []);
  return <div>
    <div className="welcome-row"><div><span className="eyebrow">Saved for later</span><h1>Conversations</h1><p>Continue a question thread from where you left it.</p></div></div>
    {loading ? <div className="loading-inline">Loading conversations…</div> : chats.length ? <div className="list-card">{chats.map((chat) => {
      const subject = subjects.find((item) => String(item._id) === String(chat.subjectId));
      const topic = subject?.topics?.find((item) => String(item._id) === String(chat.topicId));
      return <Link className="conversation-row" key={chat._id} to={'/subjects/' + chat.subjectId + '/topics/' + chat.topicId + '?chat=' + chat._id}><span className="conversation-icon">◌</span><span className="row-main"><strong>{chat.title || 'Study conversation'}</strong><small>{subject?.name || 'Subject'} · {topic?.name || 'Topic'} · {chat.messages?.length || 0} messages</small></span><span className="row-arrow">→</span></Link>;
    })}</div> : <div className="empty-state"><span>◌</span><h3>Your chat history starts with a topic</h3><p>Open a topic and ask a question. Your conversation will be saved automatically.</p><Link className="btn btn-primary" to="/subjects">Browse subjects</Link></div>}
  </div>;
}
