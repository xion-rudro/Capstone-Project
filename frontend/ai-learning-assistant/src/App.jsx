import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/Auth/Loginpage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/Auth/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentsDetailPage';
import StudyTopicPage from './pages/Documents/StudyTopicPage';
import ConversationsPage from './pages/Conversations/ConversationsPage';
import AdminPage from './pages/Admin/AdminPage';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><span className="brand-mark">A</span><p>Loading your study space…</p></div>;
  return <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute role="student" />}><Route element={<AppLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/subjects" element={<DocumentListPage />} />
      <Route path="/subjects/:subjectId" element={<DocumentDetailPage />} />
      <Route path="/subjects/:subjectId/topics/:topicId" element={<StudyTopicPage />} />
      <Route path="/conversations" element={<ConversationsPage />} />
    </Route></Route>
    <Route element={<ProtectedRoute role="admin" />}><Route element={<AppLayout />}>
      <Route path="/admin" element={<AdminPage />} />
    </Route></Route>
    {/* Not used in the current four-module version:
        flashcards, quizzes, and the standalone profile page remain intentionally unrouted.
        Their page files are kept for later use. */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes></BrowserRouter>;
}
