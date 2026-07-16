# Frontend LMS Portal (React Single Page Application)

Ứng dụng Frontend được xây dựng bằng React 19, Vite, Tailwind CSS v4, và Axios kết nối với REST API Server.

## 📂 Cấu trúc thư mục chuẩn React

```
frontend/
├── public/
│   └── favicon.ico       # Icon trang web
├── src/
│   ├── assets/           # Tài nguyên tĩnh (css, images)
│   ├── components/       # Các components dùng chung và layout
│   │   ├── common/       # Loading, modal, form input...
│   │   └── layout/       # HomeNavbar, Header, Sidebar...
│   ├── hooks/            # Custom React hooks (useAuth.js, useNotifications.js)
│   ├── layouts/          # Các layout định dạng vai trò (AdminLayout, StudentLayout...)
│   ├── pages/            # Các trang giao diện (Home, Auth, Admin, Student...)
│   ├── router/           # Định tuyến client-side (react-router-dom)
│   ├── services/         # Tầng gọi API Backend thông qua Axios (authService, courseService...)
│   ├── store/            # Quản lý State toàn cục (Zustand: authSlice, notificationSlice)
│   ├── App.jsx           # Component chính quản lý luồng
│   └── main.jsx          # Điểm kết xuất ứng dụng chính
├── vite.config.js        # Cấu hình Vite & API Proxy
└── package.json          # Quản lý script chạy
```

## 🚀 Khởi chạy dự án
Chạy độc lập frontend:
```bash
npm install
npm run dev
```
Hệ thống sẽ chạy tại địa chỉ: **http://localhost:3000/** và tự động kết nối qua API Proxy tới Backend (cổng 3001).
