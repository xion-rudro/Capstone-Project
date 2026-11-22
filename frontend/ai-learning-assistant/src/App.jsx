import React from 'react';
import {BrowserRouter as Router,Routes,Route,Navigate,} from 'react-router-dom';
import useAuth from './context/useAuth';

import LoginPage from './pages/Auth/Loginpage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/Auth/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';
import DocumentDetailPage from './pages/Documents/DocumentsDetailPage';
import FlashcardsListPage from './pages/Flashcards/FlashcardsListPage';
import FlashcardPage from './pages/Flashcards/FlashcardPage';
import ProfilePage from './pages/Profile/ProfilePage';

const App = () => {
  const { isAuthenticated, loading } = useAuth();
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />


      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
      <Route path='/dashboard' element={<DashboardPage />} />
      <Route path='/documents' element={<DocumentListPage />} />
      <Route path='/documents/:id' element={<DocumentDetailPage />} />
      <Route path='/flashcards' element={<FlashcardsListPage />} />
      <Route path='/documents/:id/flashcards' element={<FlashcardPage />} />
      <Route path='/documents/:id/flashcards/:setId' element={<FlashcardPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
