import ManageEntitiesPage from './pages/ManageEntitiesPage';
  <Route path="/manage" element={<ProtectedRoute roles={['teacher', 'admin']}><ManageEntitiesPage /></ProtectedRoute>} />
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
import NavBar from './components/NavBar';
import { useUserStore } from './store/user';
import React, { Suspense } from 'react';
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


import { Box } from '@mui/material';

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
          <Route path="/dashboard/student" element={
            <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/quizprep" element={
            <ProtectedRoute roles={['student', 'teacher']}>
              <Suspense fallback={<div>Loading...</div>}>
                <QuizPrepPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/quiz" element={
            <ProtectedRoute roles={['student', 'teacher']}><QuizPage /></ProtectedRoute>
          } />
          <Route path="/quiz/result" element={
            <ProtectedRoute roles={['student', 'teacher']}><QuizResultPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/teacher" element={
            <ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/questions/add" element={
            <ProtectedRoute roles={['teacher', 'admin']}><AddQuestionPage /></ProtectedRoute>
          } />
          <Route path="/admin/promote" element={
            <ProtectedRoute roles={['admin']}><PromoteUserPage /></ProtectedRoute>
          } />
        </Routes>
      </Box>
    </>
  );
}

export default App;
