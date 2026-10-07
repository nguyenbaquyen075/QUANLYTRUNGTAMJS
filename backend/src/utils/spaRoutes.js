// Các URL mà React Router (frontend/src/App.jsx) xử lý. Khi trình duyệt tải/làm mới trực tiếp một URL này,
// server phải trả index.html của React. Trước đây các URL này rơi vào route EJS cũ nên trên Render
// cứ tải lại là hiện giao diện cũ (chỉ "/" là React). tests/spaRoutes.test.js đối chiếu danh sách này với App.jsx.
const SPA_ROUTES = [
  '/Admin/Courses/:courseId/Classes', '/Admin/Dashboard', '/Admin/Settings',
  '/Auth/Checkout', '/Auth/GatewayPayment', '/Auth/Login', '/Auth/Register',
  '/Cart', '/Home/BigMockTest', '/Home/Cart', '/Home/Courses', '/Home/Documents', '/Home/MockTest',
  '/Home/News', '/Home/Privacy', '/Home/Teachers', '/Notification', '/notification',
  '/Student/Classroom/:id', '/Student/Dashboard', '/Student/DoAssignment/:id',
  '/Teacher/Attendance/:id', '/Teacher/ClassDetail/:id', '/Teacher/ClassReport/:id',
  '/Teacher/CreateAssignment/:lessonId', '/Teacher/CreateExam/:classId', '/Teacher/Dashboard',
  '/Teacher/Grading/:id', '/Teacher/Submissions/:id',
  '/dashboard/admin', '/dashboard/student', '/dashboard/teacher', '/thi-thu-thpt'
];

const PATTERNS = SPA_ROUTES.map((r) => new RegExp(`^${r.replace(/:[A-Za-z]+/g, '[^/]+')}/?$`, 'i'));

const isSpaRoute = (urlPath) => PATTERNS.some((re) => re.test(urlPath));

module.exports = { SPA_ROUTES, isSpaRoute };
