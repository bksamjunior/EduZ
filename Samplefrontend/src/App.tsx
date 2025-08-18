import ManageEntitiesPage from './pages/ManageEntitiesPage';
import type { ReactElement } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import AddQuestionPage from './pages/AddQuestionPage';
import PromoteUserPage from './pages/PromoteUserPage';
import QuestionPreviewPage from './pages/QuestionPreviewPage'; // ✅ Import your preview page
import NavBar from './components/NavBar';
import { useUserStore } from './store/user';
import React, { Suspense } from 'react';
import { Box } from '@mui/material';

const QuizPrepPage = React.lazy(() => import('./pages/QuizPrepPage'));

function ProtectedRoute({ children, roles }: { children: ReactElement, roles?: string[] }) {
  const { token, role } = useUserStore();
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && (!role || !roles.includes(role))) {
    // Redirect to dashboard if role is not allowed
    if (role === 'student') return <Navigate to="/dashboard/student" replace />;
    if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
    if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();
  // Hide NavBar on landing, login, signup
  const hideNav = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <>
      {!hideNav && <NavBar />}
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Student Dashboard */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
          } />

          {/* Quiz Prep */}
          <Route path="/quizprep" element={
            <ProtectedRoute roles={['student', 'teacher']}>
              <Suspense fallback={<div>Loading...</div>}>
                <QuizPrepPage />
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Quiz Page */}
          <Route path="/quiz" element={
            <ProtectedRoute roles={['student', 'teacher']}><QuizPage /></ProtectedRoute>
          } />

          {/* Quiz Result */}
          <Route path="/quiz/result" element={
            <ProtectedRoute roles={['student', 'teacher']}><QuizResultPage /></ProtectedRoute>
          } />

          {/* Teacher Dashboard */}
          <Route path="/dashboard/teacher" element={
            <ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          {/* Add Question */}
          <Route path="/questions/add" element={
            <ProtectedRoute roles={['teacher', 'admin']}><AddQuestionPage /></ProtectedRoute>
          } />

          {/* ✅ Preview Question */}
          <Route path="/questions/preview" element={
            <ProtectedRoute roles={['teacher', 'admin']}><QuestionPreviewPage /></ProtectedRoute>
          } />

          {/* Promote User */}
          <Route path="/admin/promote" element={
            <ProtectedRoute roles={['admin']}><PromoteUserPage /></ProtectedRoute>
          } />

          {/* Manage Entities (you had this earlier, not sure if you still want it) */}
          <Route path="/manage" element={
            <ProtectedRoute roles={['teacher', 'admin']}><ManageEntitiesPage /></ProtectedRoute>
          } />
        </Routes>
      </Box>
    </>
  );
}

export default App;
