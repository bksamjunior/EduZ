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
import PageContainer from './components/PageContainer';
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Student Dashboard */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute roles={['student']}><PageContainer><StudentDashboard /></PageContainer></ProtectedRoute>
          } />

          {/* Quiz Prep */}
          <Route path="/quizprep" element={
            <ProtectedRoute roles={['student', 'teacher']}>
              <Suspense fallback={<div>Loading...</div>}>
                <PageContainer><QuizPrepPage /></PageContainer>
              </Suspense>
            </ProtectedRoute>
          } />

          {/* Quiz Page */}
          <Route path="/quiz" element={
            <ProtectedRoute roles={['student', 'teacher']}><PageContainer><QuizPage /></PageContainer></ProtectedRoute>
          } />

          {/* Quiz Result */}
          <Route path="/quiz/result" element={
            <ProtectedRoute roles={['student', 'teacher']}><PageContainer><QuizResultPage /></PageContainer></ProtectedRoute>
          } />

          {/* Teacher Dashboard */}
          <Route path="/dashboard/teacher" element={
            <ProtectedRoute roles={['teacher']}><PageContainer><TeacherDashboard /></PageContainer></ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}><PageContainer><AdminDashboard /></PageContainer></ProtectedRoute>
          } />

          {/* Add Question */}
          <Route path="/questions/add" element={
            <ProtectedRoute roles={['teacher', 'admin']}><PageContainer><AddQuestionPage /></PageContainer></ProtectedRoute>
          } />

          {/* ✅ Preview Question */}
          <Route path="/questions/preview" element={
            <ProtectedRoute roles={['teacher', 'admin']}><PageContainer><QuestionPreviewPage /></PageContainer></ProtectedRoute>
          } />

          {/* Promote User */}
          <Route path="/admin/promote" element={
            <ProtectedRoute roles={['admin']}><PageContainer><PromoteUserPage /></PageContainer></ProtectedRoute>
          } />

          {/* Manage Entities (you had this earlier, not sure if you still want it) */}
          <Route path="/manage" element={
            <ProtectedRoute roles={['teacher', 'admin']}><PageContainer><ManageEntitiesPage /></PageContainer></ProtectedRoute>
          } />
        </Routes>
      </Box>
    </>
  );
}

export default App;
