-- ========================================================
-- CHUẨN CƠ SỞ DỮ LIỆU POSTGRESQL CHO DỰ ÁN QUẢN LÝ TRUNG TÂM
-- Ngày tạo: 7/20/2026
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- Table: Users (Bảng người dùng (Admin, Giáo viên, Học sinh, Phụ huynh))
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Users" (
  "Id" SERIAL PRIMARY KEY,
  "Email" VARCHAR(150) NOT NULL UNIQUE,
  "Phone" VARCHAR(15) NOT NULL UNIQUE,
  "PasswordHash" VARCHAR(255) NOT NULL,
  "FullName" VARCHAR(100) NOT NULL,
  "AvatarUrl" VARCHAR(255),
  "Role" INT NOT NULL DEFAULT 3, -- 0: ADMIN, 1: STAFF, 2: TEACHER, 3: STUDENT, 4: PARENT
  "Status" INT NOT NULL DEFAULT 0, -- 0: ACTIVE, 1: INACTIVE, 2: PENDING
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: UserProfiles (Bảng thông tin chi tiết người dùng)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "UserProfiles" (
  "Id" SERIAL PRIMARY KEY,
  "UserId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "Dob" TIMESTAMP,
  "Gender" INT DEFAULT 0, -- 0: MALE, 1: FEMALE, 2: OTHER
  "Address" VARCHAR(255),
  "ParentId" INT REFERENCES "Users"("Id") ON DELETE SET NULL,
  "TeacherBio" TEXT,
  "TeacherTitle" VARCHAR(255),
  "TeacherExperience" INT DEFAULT 0,
  "TeacherStudents" INT DEFAULT 0,
  "TeacherRating" DECIMAL(3, 1) DEFAULT 5.0,
  "Subject" VARCHAR(100),
  "TeacherBankName" VARCHAR(100),
  "TeacherBankAccount" VARCHAR(30),
  "TeacherBankHolder" VARCHAR(100)
);

-- --------------------------------------------------------
-- Table: Courses (Bảng danh mục khóa học)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Courses" (
  "Id" SERIAL PRIMARY KEY,
  "Code" VARCHAR(50) NOT NULL UNIQUE,
  "Name" VARCHAR(150) NOT NULL,
  "Description" TEXT,
  "Price" DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  "DurationWeeks" INT DEFAULT 0,
  "TotalLessons" INT DEFAULT 0,
  "Status" INT NOT NULL DEFAULT 0, -- 0: ACTIVE, 1: INACTIVE
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: Classes (Bảng lớp học mở theo khóa)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Classes" (
  "Id" SERIAL PRIMARY KEY,
  "CourseId" INT NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
  "TeacherId" INT REFERENCES "Users"("Id") ON DELETE SET NULL,
  "Name" VARCHAR(150) NOT NULL,
  "Room" VARCHAR(50),
  "Schedule" VARCHAR(255), -- Ví dụ: Thứ 2, 4, 6 (18:00 - 20:00)
  "StartDate" DATE,
  "EndDate" DATE,
  "MaxStudents" INT DEFAULT 30,
  "CurrentStudents" INT DEFAULT 0,
  "Status" INT NOT NULL DEFAULT 0, -- 0: UPCOMING, 1: ONGOING, 2: COMPLETED, 3: CANCELLED
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: ClassStudents (Bảng học viên ghi danh vào lớp)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ClassStudents" (
  "Id" SERIAL PRIMARY KEY,
  "ClassId" INT NOT NULL REFERENCES "Classes"("Id") ON DELETE CASCADE,
  "StudentId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "JoinedDate" DATE DEFAULT CURRENT_DATE,
  "Status" INT NOT NULL DEFAULT 0, -- 0: ACTIVE, 1: DROPPED, 2: COMPLETED
  "Notes" TEXT,
  UNIQUE("ClassId", "StudentId")
);

-- --------------------------------------------------------
-- Table: Lessons (Bảng danh sách buổi học)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Lessons" (
  "Id" SERIAL PRIMARY KEY,
  "ClassId" INT NOT NULL REFERENCES "Classes"("Id") ON DELETE CASCADE,
  "Title" VARCHAR(200) NOT NULL,
  "LessonDate" DATE NOT NULL,
  "StartTime" VARCHAR(10),
  "EndTime" VARCHAR(10),
  "Content" TEXT,
  "DocumentUrl" VARCHAR(255),
  "Status" INT NOT NULL DEFAULT 0 -- 0: SCHEDULED, 1: COMPLETED, 2: CANCELLED
);

-- --------------------------------------------------------
-- Table: Attendances (Bảng điểm danh học sinh theo buổi học)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Attendances" (
  "Id" SERIAL PRIMARY KEY,
  "LessonId" INT NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
  "StudentId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "Status" INT NOT NULL DEFAULT 0, -- 0: PRESENT, 1: ABSENT, 2: LATE, 3: EXCUSED
  "Note" VARCHAR(255),
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("LessonId", "StudentId")
);

-- --------------------------------------------------------
-- Table: Assignments (Bảng bài tập về nhà / kiểm tra)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Assignments" (
  "Id" SERIAL PRIMARY KEY,
  "LessonId" INT NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
  "Title" VARCHAR(200) NOT NULL,
  "Description" TEXT,
  "FileUrl" VARCHAR(255),
  "DueDate" TIMESTAMP NOT NULL,
  "MaxScore" DECIMAL(5, 2) DEFAULT 10.0,
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: Submissions (Bảng nộp bài tập của học sinh)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Submissions" (
  "Id" SERIAL PRIMARY KEY,
  "AssignmentId" INT NOT NULL REFERENCES "Assignments"("Id") ON DELETE CASCADE,
  "StudentId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "FileUrl" VARCHAR(255),
  "TextContent" TEXT,
  "SubmittedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Score" DECIMAL(5, 2),
  "Feedback" TEXT,
  "GradedAt" TIMESTAMP,
  UNIQUE("AssignmentId", "StudentId")
);

-- --------------------------------------------------------
-- Table: Invoices (Bảng hóa đơn học phí)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Invoices" (
  "Id" SERIAL PRIMARY KEY,
  "InvoiceCode" VARCHAR(50) NOT NULL UNIQUE,
  "StudentId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "ClassId" INT REFERENCES "Classes"("Id") ON DELETE SET NULL,
  "Amount" DECIMAL(12, 2) NOT NULL,
  "DueDate" DATE NOT NULL,
  "Status" INT NOT NULL DEFAULT 0, -- 0: UNPAID, 1: PAID, 2: PARTIAL, 3: OVERDUE, 4: CANCELLED
  "Description" VARCHAR(255),
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: Payments (Bảng thanh toán hóa đơn)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Payments" (
  "Id" SERIAL PRIMARY KEY,
  "InvoiceId" INT NOT NULL REFERENCES "Invoices"("Id") ON DELETE CASCADE,
  "TransactionCode" VARCHAR(100) UNIQUE,
  "Amount" DECIMAL(12, 2) NOT NULL,
  "PaymentMethod" VARCHAR(50) NOT NULL, -- CASH, BANK_TRANSFER, MOMO, VNPAY
  "PaymentDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Note" VARCHAR(255)
);

-- --------------------------------------------------------
-- Table: AiChatSessions (Bảng phiên hội thoại AI)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AiChatSessions" (
  "Id" SERIAL PRIMARY KEY,
  "UserId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "Title" VARCHAR(200) DEFAULT 'Trò chuyện mới',
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: AiChatMessages (Bảng chi tiết tin nhắn AI)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AiChatMessages" (
  "Id" SERIAL PRIMARY KEY,
  "SessionId" INT NOT NULL REFERENCES "AiChatSessions"("Id") ON DELETE CASCADE,
  "Sender" VARCHAR(20) NOT NULL, -- 'user' hoặc 'assistant'
  "Message" TEXT NOT NULL,
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: UserLearningProfiles (Bảng hồ sơ năng lực & phân tích học tập AI)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "UserLearningProfiles" (
  "Id" SERIAL PRIMARY KEY,
  "StudentId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "Strengths" TEXT,
  "Weaknesses" TEXT,
  "AIRecommendations" TEXT,
  "OverallRating" VARCHAR(20),
  "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: Notifications (Bảng thông báo hệ thống)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Notifications" (
  "Id" SERIAL PRIMARY KEY,
  "UserId" INT NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
  "Title" VARCHAR(200) NOT NULL,
  "Content" TEXT NOT NULL,
  "IsRead" BOOLEAN DEFAULT FALSE,
  "Type" VARCHAR(50) DEFAULT 'GENERAL',
  "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- --------------------------------------------------------
INSERT INTO "Users" ("Email", "Phone", "PasswordHash", "FullName", "Role", "Status") 
VALUES ('admin@trungtam.com', '0987654321', '$2a$10$vN9.gq.6K..E1v9H2eFkO.dK4.s2m1W8m.5n3.2m1W8m5n32m1W8m', 'Quản trị viên', 0, 0)
ON CONFLICT ("Email") DO NOTHING;
