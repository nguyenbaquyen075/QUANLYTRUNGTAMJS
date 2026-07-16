import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import TeachersPage from './pages/TeachersPage';
import NewsPage from './pages/NewsPage';
import DocumentsPage from './pages/DocumentsPage';
import PrivacyPage from './pages/PrivacyPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CheckoutPage from './pages/auth/CheckoutPage';
import GatewayPaymentPage from './pages/auth/GatewayPaymentPage';
import ClassroomPage from './pages/student/ClassroomPage';
import DoAssignmentPage from './pages/student/DoAssignmentPage';
import AttendancePage from './pages/teacher/AttendancePage';
import ClassReportPage from './pages/teacher/ClassReportPage';
import CreateAssignmentPage from './pages/teacher/CreateAssignmentPage';
import CreateExamPage from './pages/teacher/CreateExamPage';
import SubmissionsPage from './pages/teacher/SubmissionsPage';
import PayInvoicePage from './pages/parent/PayInvoicePage';
import CourseClassesPage from './pages/admin/CourseClassesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Guest Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/Auth/Login" element={<LoginPage />} />
        <Route path="/Auth/Register" element={<RegisterPage />} />
        <Route path="/Home/Courses" element={<CoursesPage />} />
        <Route path="/Home/Teachers" element={<TeachersPage />} />
        <Route path="/Home/News" element={<NewsPage />} />
        <Route path="/Home/Documents" element={<DocumentsPage />} />
        <Route path="/Home/Privacy" element={<PrivacyPage />} />
        <Route path="/Auth/Checkout" element={<CheckoutPage />} />
        <Route path="/Auth/GatewayPayment" element={<GatewayPaymentPage />} />

        {/* Role Dashboards */}
        <Route path="/Student/Dashboard" element={<StudentDashboard />} />
        <Route path="/Student/Classroom/:id" element={<ClassroomPage />} />
        <Route path="/Student/DoAssignment/:id" element={<DoAssignmentPage />} />

        <Route path="/Teacher/Dashboard" element={<TeacherDashboard />} />
        <Route path="/Teacher/Attendance/:id" element={<AttendancePage />} />
        <Route path="/Teacher/ClassReport/:id" element={<ClassReportPage />} />
        <Route path="/Teacher/CreateAssignment/:lessonId" element={<CreateAssignmentPage />} />
        <Route path="/Teacher/CreateExam/:classId" element={<CreateExamPage />} />
        <Route path="/Teacher/Submissions/:id" element={<SubmissionsPage />} />

        <Route path="/Parent/Dashboard" element={<ParentDashboard />} />
        <Route path="/Parent/PayInvoice/:id" element={<PayInvoicePage />} />

        <Route path="/Admin/Dashboard" element={<AdminDashboard />} />
        <Route path="/Admin/Courses/:courseId/Classes" element={<CourseClassesPage />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
