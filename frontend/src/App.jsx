import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Lazy-loaded Pages for Ultra-Fast Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const MockTestPage = lazy(() => import('./pages/MockTestPage'));
const TeachersPage = lazy(() => import('./pages/TeachersPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/dashboard/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./pages/dashboard/ParentDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const CheckoutPage = lazy(() => import('./pages/auth/CheckoutPage'));
const GatewayPaymentPage = lazy(() => import('./pages/auth/GatewayPaymentPage'));
const ClassroomPage = lazy(() => import('./pages/student/ClassroomPage'));
const DoAssignmentPage = lazy(() => import('./pages/student/DoAssignmentPage'));
const AttendancePage = lazy(() => import('./pages/teacher/AttendancePage'));
const ClassReportPage = lazy(() => import('./pages/teacher/ClassReportPage'));
const ClassDetailPage = lazy(() => import('./pages/teacher/ClassDetailPage'));
const CreateAssignmentPage = lazy(() => import('./pages/teacher/CreateAssignmentPage'));
const CreateExamPage = lazy(() => import('./pages/teacher/CreateExamPage'));
const SubmissionsPage = lazy(() => import('./pages/teacher/SubmissionsPage'));
const GradingPage = lazy(() => import('./pages/teacher/GradingPage'));
const PayInvoicePage = lazy(() => import('./pages/parent/PayInvoicePage'));
const CourseClassesPage = lazy(() => import('./pages/admin/CourseClassesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Sleek Loading Fallback Component
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '12px',
      color: '#4f46e5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e0e7ff',
        borderTopColor: '#4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6b7280' }}>Đang tải trang...</span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Guest Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Auth/Login" element={<LoginPage />} />
          <Route path="/Auth/Register" element={<RegisterPage />} />
          <Route path="/Home/Courses" element={<CoursesPage />} />
          <Route path="/Home/MockTest" element={<MockTestPage />} />
          <Route path="/Home/BigMockTest" element={<MockTestPage />} />
          <Route path="/Home/Teachers" element={<TeachersPage />} />
          <Route path="/Home/News" element={<NewsPage />} />
          <Route path="/Home/Documents" element={<DocumentsPage />} />
          <Route path="/Home/Privacy" element={<PrivacyPage />} />
          <Route path="/Auth/Checkout" element={<CheckoutPage />} />
          <Route path="/Auth/GatewayPayment" element={<GatewayPaymentPage />} />

          {/* Role Dashboards */}
          <Route path="/Student/Dashboard" element={<StudentDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/Student/Classroom/:id" element={<ClassroomPage />} />
          <Route path="/Student/DoAssignment/:id" element={<DoAssignmentPage />} />

          <Route path="/Teacher/Dashboard" element={<TeacherDashboard />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/Teacher/Attendance/:id" element={<AttendancePage />} />
          <Route path="/Teacher/ClassReport/:id" element={<ClassReportPage />} />
          <Route path="/Teacher/ClassDetail/:id" element={<ClassDetailPage />} />
          <Route path="/Teacher/CreateAssignment/:lessonId" element={<CreateAssignmentPage />} />
          <Route path="/Teacher/CreateExam/:classId" element={<CreateExamPage />} />
          <Route path="/Teacher/Submissions/:id" element={<SubmissionsPage />} />
          <Route path="/Teacher/Grading/:id" element={<GradingPage />} />

          <Route path="/Parent/Dashboard" element={<ParentDashboard />} />
          <Route path="/Parent/PayInvoice/:id" element={<PayInvoicePage />} />

          <Route path="/Admin/Dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/Admin/Courses/:courseId/Classes" element={<CourseClassesPage />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
