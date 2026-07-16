# Backend LMS Portal (REST API Server)

Đây là máy chủ REST API cho Hệ thống quản lý trung tâm học thêm online, được viết bằng Node.js, Express và Sequelize ORM (PostgreSQL).

## 📂 Cấu trúc thư mục chuẩn Enterprise

```
backend/
├── src/
│   ├── config/          # Cấu hình Database, Cloudinary, Env...
│   ├── controllers/     # Xử lý Request/Response và gọi services
│   ├── services/        # Logic nghiệp vụ chính và truy vấn CSDL
│   ├── models/          # Khai báo các mô hình dữ liệu (Sequelize ORM)
│   ├── routes/          # Khai báo định tuyến (endpoints)
│   ├── middlewares/     # Bộ lọc trung gian (Auth, logging, uploads)
│   ├── utils/           # Các tiện ích dùng chung
│   ├── validations/     # Bộ kiểm tra tính hợp lệ dữ liệu
│   ├── jobs/            # Tác vụ định kỳ (Cron jobs)
│   ├── sockets/         # WebSocket / SignalR Compatibility Hub
│   └── app.js           # Khởi tạo Express app
├── tests/               # Kiểm thử phần mềm (Unit/Integration tests)
├── .env                 # Cấu hình môi trường nội bộ
├── .env.example         # Mẫu cấu hình môi trường
├── package.json
└── server.js            # Tệp khởi chạy chính (Listen port & DB connection)
```

## 🚀 Hướng dẫn khởi chạy

Chạy độc lập backend:
```bash
npm install
npm run dev
```
Hoặc khởi chạy đồng thời với Frontend bằng cách gõ `npm run dev` ở thư mục gốc của dự án.
