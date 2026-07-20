const db = require('./src/models');
const bcrypt = require('bcryptjs');

// Helper to generate 15 detailed questions per subject
function create15Questions(subject, courseTitle, lessonTitle) {
  if (subject.includes('Toán')) {
    return Array.from({ length: 15 }, (_, i) => {
      const qNum = i + 1;
      return {
        id: qNum,
        question: `Câu ${qNum}: [${courseTitle}] Trong bài ${lessonTitle}, tìm khẳng định đúng về phương trình và dạng toán nâng cao số ${qNum}?`,
        options: [
          `A. Giá trị của tham số m nằm trong khoảng (${qNum}, ${qNum + 5})`,
          `B. Hàm số đạt cực trị tại x = ${qNum * 2}`,
          `C. Nghiệm của phương trình là x = ${qNum} hoặc x = -${qNum}`,
          `D. Tập xác định của hàm số D = R \\ {${qNum}}`
        ],
        answer: ['A', 'B', 'C', 'D'][i % 4],
        explanation: `Hướng dẫn giải câu ${qNum}: Áp dụng công thức biến đổi tương đương và điều kiện xác định ta suy ra đáp án đúng.`
      };
    });
  } else if (subject.includes('Lý') || subject.includes('Vật Lý')) {
    return Array.from({ length: 15 }, (_, i) => {
      const qNum = i + 1;
      return {
        id: qNum,
        question: `Câu ${qNum}: [${courseTitle}] Một vật dao động/chuyển động với chu kỳ T = ${qNum * 0.5}s. Tính gia tốc/vận tốc cực đại tại thời điểm t = ${qNum}s?`,
        options: [
          `A. v = ${qNum * 10} cm/s`,
          `B. a = ${qNum * 20} cm/s²`,
          `C. W = ${qNum * 0.1} Joules`,
          `D. F = ${qNum * 2} Newtons`
        ],
        answer: ['B', 'A', 'C', 'D'][i % 4],
        explanation: `Hướng dẫn giải câu ${qNum}: Sử dụng công thức định luật bảo toàn cơ năng và phương trình chuyển động v = x'.`
      };
    });
  } else if (subject.includes('Hóa')) {
    return Array.from({ length: 15 }, (_, i) => {
      const qNum = i + 1;
      return {
        id: qNum,
        question: `Câu ${qNum}: [${courseTitle}] Cho ${qNum * 2.4}g hỗn hợp tác dụng hoàn toàn với dung dịch axit thu được V lít khí ở ĐKTC (bài ${lessonTitle})?`,
        options: [
          `A. V = ${(qNum * 2.24).toFixed(2)} lít`,
          `B. Khối lượng muối thu được m = ${qNum * 5.8}g`,
          `C. Nồng độ mol của dung dịch C = ${qNum * 0.5}M`,
          `D. Số mol electron trao đổi n = ${qNum * 0.1} mol`
        ],
        answer: ['C', 'A', 'D', 'B'][i % 4],
        explanation: `Hướng dẫn giải câu ${qNum}: Lập phương trình bảo toàn electron và bảo toàn khối lượng để tính V.`
      };
    });
  } else if (subject.includes('Anh') || subject.includes('IELTS')) {
    return Array.from({ length: 15 }, (_, i) => {
      const qNum = i + 1;
      return {
        id: qNum,
        question: `Question ${qNum}: [${courseTitle}] Select the most correct option to complete the sentence related to ${lessonTitle}:`,
        options: [
          `A. If the students had studied harder for unit ${qNum}, they would have passed easily.`,
          `B. Having finished the test ${qNum}, the students went home.`,
          `C. The teacher recommended that every student ${qNum > 5 ? 'complete' : 'completes'} the assignment.`,
          `D. Neither the teacher nor the students ${qNum % 2 === 0 ? 'were' : 'was'} present at the seminar.`
        ],
        answer: ['A', 'C', 'B', 'D'][i % 4],
        explanation: `Explanation Q${qNum}: Pay attention to conditional sentences, subjunctive mood, and subject-verb agreement.`
      };
    });
  } else {
    return Array.from({ length: 15 }, (_, i) => {
      const qNum = i + 1;
      return {
        id: qNum,
        question: `Câu ${qNum}: [${courseTitle}] Phân tích giá trị nghệ thuật và nội dung tư tưởng trong đoạn văn/tác phẩm thuộc ${lessonTitle}?`,
        options: [
          `A. Thể hiện lòng yêu nước sâu sắc và tinh thần nhân đạo cao cả`,
          `B. Bộc lộ cảm xúc lãng mạn, hình ảnh thơ giàu tính biểu cảm`,
          `C. Nghệ thuật mô tả tâm lý nhân vật sắc sảo và sinh động`,
          `D. Cả A, B và C đều đúng`
        ],
        answer: 'D',
        explanation: `Hướng dẫn trả lời câu ${qNum}: Kết hợp phân tích hoàn cảnh sáng tác và nghệ thuật ngôn từ của tác giả.`
      };
    });
  }
}

async function seedComprehensiveData() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    console.log('Database synced & force-cleared for 15-question exams & beautiful course images.');

    const defaultPasswordHash = await bcrypt.hash('123456', 10);

    // 1. ADMIN USERS
    const admin1 = await db.User.create({
      Email: 'admin@trungtam.com',
      Phone: '0987654321',
      PasswordHash: defaultPasswordHash,
      FullName: 'Quản trị viên Hệ thống',
      Role: 0, // ADMIN
      Status: 0
    });
    await db.UserProfile.create({ UserId: admin1.Id });

    const admin2 = await db.User.create({
      Email: 'baquyen@gmail.com',
      Phone: '0901111111',
      PasswordHash: defaultPasswordHash,
      FullName: 'Nguyễn Bá Quyền',
      Role: 0, // ADMIN
      Status: 0
    });
    await db.UserProfile.create({ UserId: admin2.Id });

    // 2. 5 TEACHERS
    const teacherData = [
      { email: 'nvnguyen@gmail.com', phone: '0902000001', name: 'Nguyễn Văn Nguyên', subject: 'Toán Học Cấp 3', title: 'Thạc sĩ Toán học - ĐH Sư Phạm Hà Nội', bio: '12 năm kinh nghiệm luyện thi HSG và THPT QG Toán 10, 11, 12 chuyên sâu.', exp: '12 năm', rating: 5.0, students: 450 },
      { email: 'tranvanb@trungtam.com', phone: '0902000002', name: 'Trần Thị Bích', subject: 'Tiếng Anh Cấp 3', title: 'IELTS 8.5 Master & Giảng viên Ngoại Thương', bio: 'Chuyên gia luyện thi Ngữ pháp, Từ vựng trọng tâm và IELTS Cấp 3.', exp: '8 năm', rating: 4.9, students: 380 },
      { email: 'lehoang@trungtam.com', phone: '0902000003', name: 'Lê Hoàng Nam', subject: 'Vật Lý Cấp 3', title: 'Thạc sĩ Vật Lý Chuyên KHTN', bio: 'Tác giả 5 bộ sách công thức Vật lý Cấp 3, phương pháp giải nhanh trắc nghiệm 30s.', exp: '10 năm', rating: 4.9, students: 410 },
      { email: 'phamquynh@trungtam.com', phone: '0902000004', name: 'Phạm Quỳnh Anh', subject: 'Hóa Học Cấp 3', title: 'Thạc sĩ Hóa Kỹ Thuật - ĐH Bách Khoa', bio: 'Chuyên gia phương pháp bảo toàn khối lượng và electron độc quyền.', exp: '9 năm', rating: 4.8, students: 350 },
      { email: 'vuminh@trungtam.com', phone: '0902000005', name: 'Vũ Minh Đức', subject: 'Ngữ Văn Cấp 3', title: 'Chuyên gia Nghị luận Văn học & Xã hội', bio: 'Hướng dẫn tư duy viết văn súc tích, bay bổng, đạt mốc 8.5+ kì thi THPT QG.', exp: '11 năm', rating: 4.9, students: 290 }
    ];

    const teachers = [];
    for (const t of teacherData) {
      const u = await db.User.create({
        Email: t.email,
        Phone: t.phone,
        PasswordHash: defaultPasswordHash,
        FullName: t.name,
        Role: 2, // TEACHER
        Status: 0
      });
      await db.UserProfile.create({
        UserId: u.Id,
        Subject: t.subject,
        TeacherTitle: t.title,
        TeacherBio: t.bio,
        TeacherExperience: t.exp,
        TeacherRating: t.rating,
        TeacherStudents: t.students,
        TeacherBankName: 'MBBank',
        TeacherBankAccount: '9999' + u.Id + '8888',
        TeacherBankHolder: t.name.toUpperCase()
      });
      teachers.push(u);
    }

    // 3. 5 PARENTS
    const parents = [];
    for (let i = 1; i <= 5; i++) {
      const p = await db.User.create({
        Email: `ph${i}@trungtam.com`,
        Phone: `090300000${i}`,
        PasswordHash: defaultPasswordHash,
        FullName: `Phụ Huynh ${i}`,
        Role: 4, // PARENT
        Status: 0
      });
      await db.UserProfile.create({ UserId: p.Id, Address: `Hà Nội - Khu vực ${i}` });
      parents.push(p);
    }

    // 4. 30 STUDENTS
    const studentNames = [
      'Nguyễn Bá Quyền 27', 'Bảo Chi', 'Nguyễn Lê Uyên', 'Nguyễn Văn A', 'Lê Văn Học Viên',
      'Phạm Minh Cường', 'Hoàng Thị Dung', 'Nguyễn An Nhiên', 'Trần Bảo Nam', 'Đỗ Đức Anh',
      'Vũ Thu Trang', 'Đặng Quốc Huy', 'Bùi Mai Phương', 'Lý Gia Hưng', 'Phan Thanh Thảo',
      'Ngô Hoàng Yến', 'Dương Văn Minh', 'Trịnh Khánh Linh', 'Nguyễn Việt Anh', 'Hà Phương Thảo',
      'Vũ Anh Tuấn', 'Nguyễn Ngọc Anh', 'Trần Đình Trọng', 'Lê Quỳnh Nga', 'Hoàng Trọng Nghĩa',
      'Phạm Thu Hà', 'Đỗ Minh Trí', 'Nguyễn Thành Long', 'Đặng Kim Anh', 'Vũ Khánh Huyền'
    ];

    const studentEmails = [
      'quyen27@gmail.com', 'baochi@gmail.com', 'nguyenleuyen@gmail.com', 'nguyen@gmail.com', 'hv@trungtam.com',
      'minhcuong@trungtam.com', 'hoangdung@trungtam.com', 'nguyenan@trungtam.com', 'hs9@trungtam.com', 'hs10@trungtam.com',
      'hs11@trungtam.com', 'hs12@trungtam.com', 'hs13@trungtam.com', 'hs14@trungtam.com', 'hs15@trungtam.com',
      'hs16@trungtam.com', 'hs17@trungtam.com', 'hs18@trungtam.com', 'hs19@trungtam.com', 'hs20@trungtam.com',
      'hs21@trungtam.com', 'hs22@trungtam.com', 'hs23@trungtam.com', 'hs24@trungtam.com', 'hs25@trungtam.com',
      'hs26@trungtam.com', 'hs27@trungtam.com', 'hs28@trungtam.com', 'hs29@trungtam.com', 'hs30@trungtam.com'
    ];

    const students = [];
    for (let i = 0; i < 30; i++) {
      const email = studentEmails[i];
      const phone = i < 9 ? `090400000${i + 1}` : `09040000${i + 1}`;
      const name = studentNames[i];

      const s = await db.User.create({
        Email: email,
        Phone: phone,
        PasswordHash: defaultPasswordHash,
        FullName: name,
        Role: 3, // STUDENT
        Status: 0
      });
      await db.UserProfile.create({
        UserId: s.Id,
        ParentId: parents[i % 5].Id,
        Address: `Hà Nội - Học sinh lớp ${10 + (i % 3)}`
      });
      students.push(s);
    }

    // 5. 10 HIGH SCHOOL COURSES WITH BEAUTIFUL UNSPLASH IMAGES
    const courseData = [
      {
        code: 'TOAN10',
        title: 'Toán Học Lớp 10 - Đại Số & Hình Học Nâng Cao',
        desc: 'Nắm chắc phương trình, hệ phương trình, mệnh đề tập hợp, vectơ và phương pháp tọa độ.',
        price: 2400000,
        lessons: 24,
        teacherIdx: 0,
        img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop'
      },
      {
        code: 'LY10',
        title: 'Vật Lý Lớp 10 - Cơ Học & Chuyển Động Học',
        desc: 'Hệ thống các định luật Niu-tơn, động lực học chất điểm và các dạng bài tập thực tế.',
        price: 2200000,
        lessons: 20,
        teacherIdx: 2,
        img: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop'
      },
      {
        code: 'HOA10',
        title: 'Hóa Học Lớp 10 - Cấu Tạo Nguyên Tử & Phản Ứng',
        desc: 'Hiểu sâu bản chất hóa trị, liên kết hóa học, phản ứng oxi hóa - khử nâng cao.',
        price: 2200000,
        lessons: 20,
        teacherIdx: 3,
        img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop'
      },
      {
        code: 'TOAN11',
        title: 'Toán Học Lớp 11 - Lượng Giác & Hình Không Gian',
        desc: 'Chuyên đề lượng giác, tổ hợp xác suất, dãy số và hình học không gian dựng góc, khoảng cách.',
        price: 2800000,
        lessons: 28,
        teacherIdx: 0,
        img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop'
      },
      {
        code: 'LY11',
        title: 'Vật Lý Lớp 11 - Điện Tích, Điện Trường & Quang Học',
        desc: 'Định luật Cu-lông, dòng điện trong các môi trường, khúc xạ ánh sáng và bài tập nâng cao.',
        price: 2500000,
        lessons: 24,
        teacherIdx: 2,
        img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop'
      },
      {
        code: 'HOA11',
        title: 'Hóa Học Lớp 11 - Sự Điện Li & Hóa Học Hữu Cơ',
        desc: 'Cân bằng hóa học, khái niệm Hữu cơ, Hydrocarbon, Ancol - Phenol chi tiết.',
        price: 2500000,
        lessons: 24,
        teacherIdx: 3,
        img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop'
      },
      {
        code: 'ANH11',
        title: 'Tiếng Anh Lớp 11 - Ngữ Pháp Trọng Tâm & Nghe Nói',
        desc: 'Củng cố 12 thì tiếng Anh, câu tường thuật, câu điều kiện và luyện nghe phản xạ.',
        price: 2600000,
        lessons: 24,
        teacherIdx: 1,
        img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop'
      },
      {
        code: 'VAN11',
        title: 'Ngữ Văn Lớp 11 - Nghị Luận Văn Học & Tác Phẩm',
        desc: 'Luyện kỹ năng phân tích tác phẩm văn học trung đại và hiện đại, viết bài văn đạt điểm 8+.',
        price: 2000000,
        lessons: 20,
        teacherIdx: 4,
        img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop'
      },
      {
        code: 'TOAN12',
        title: 'Luyện Thi THPT Quốc Gia Môn Toán 12 (Target 8.5+)',
        desc: 'Tổng ôn 12 chuyên đề thi THPT QG: Khảo sát hàm số, Mũ - Logarit, Tích phân, Tọa độ Oxyz.',
        price: 3600000,
        lessons: 36,
        teacherIdx: 0,
        img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop'
      },
      {
        code: 'ANH12',
        title: 'Luyện Thi THPT Quốc Gia Môn Tiếng Anh & IELTS 7.0+',
        desc: 'Giải đề thi chính thức các năm, phương pháp làm bài đọc hiểu, tư duy làm bài trắc nghiệm nhanh.',
        price: 3800000,
        lessons: 36,
        teacherIdx: 1,
        img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'
      }
    ];

    const courses = [];
    const classes = [];
    const now = new Date();
    const future = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < courseData.length; i++) {
      const cData = courseData[i];
      const course = await db.Course.create({
        CourseCode: cData.code,
        Title: cData.title,
        Description: cData.desc,
        BasePrice: cData.price,
        TotalLessons: cData.lessons,
        ImageUrl: cData.img,
        Status: 1
      });
      courses.push(course);

      const assignedTeacher = teachers[cData.teacherIdx];
      const cls = await db.Class.create({
        ClassName: `Lớp ${cData.code} - Khóa ${i + 1}`,
        CourseId: course.Id,
        TeacherId: assignedTeacher.Id,
        Schedule: `Thứ ${(i % 5) + 2} - Thứ ${(i % 5) + 4} (18:30 - 20:30)`,
        MaxStudents: 25,
        StartDate: now,
        EndDate: future,
        Status: 1
      });
      classes.push(cls);
    }

    // 6. ENROLL STUDENTS INTO CLASSES
    for (let sIdx = 0; sIdx < students.length; sIdx++) {
      const student = students[sIdx];
      const assignedClass1 = classes[sIdx % classes.length];
      const assignedClass2 = classes[(sIdx + 3) % classes.length];

      await db.ClassStudent.create({ ClassId: assignedClass1.Id, StudentId: student.Id, Status: 0 });
      await db.ClassStudent.create({ ClassId: assignedClass2.Id, StudentId: student.Id, Status: 0 });
    }

    // 7. LESSONS & ATTENDANCES
    const createdLessons = [];
    for (let cIdx = 0; cIdx < classes.length; cIdx++) {
      const cls = classes[cIdx];
      const course = courses[cIdx];
      for (let lNum = 1; lNum <= 3; lNum++) {
        const lDate = new Date(now.getTime() + (lNum * 3 - 3) * 24 * 60 * 60 * 1000);
        const lesson = await db.Lesson.create({
          ClassId: cls.Id,
          Title: `Buổi ${lNum}: Chuyên đề trọng tâm ${lNum} - ${course.Title}`,
          LessonDate: lDate,
          StartTime: '18:30:00',
          EndTime: '20:30:00',
          Content: `Bài học số ${lNum} bao gồm lý thuyết chuyên sâu, các ví dụ minh họa và 15 câu bài tập trắc nghiệm tự luyện.`,
          Status: lNum === 1 ? 1 : 0
        });
        createdLessons.push({ lesson, course });

        // Attendances
        if (lNum === 1) {
          const enrolled = students.filter((_, idx) => (idx % classes.length === cIdx) || ((idx + 3) % classes.length === cIdx));
          for (const st of enrolled) {
            await db.Attendance.create({
              LessonId: lesson.Id,
              StudentId: st.Id,
              Status: st.Id % 4 === 0 ? 2 : (st.Id % 7 === 0 ? 1 : 0),
              Note: st.Id % 4 === 0 ? 'Vào trễ 10 phút' : 'Có mặt đầy đủ'
            });
          }
        }
      }
    }

    // 8. 15-QUESTION ASSIGNMENTS & QUIZ EXAMS
    for (let lIdx = 0; lIdx < createdLessons.length; lIdx++) {
      const { lesson, course } = createdLessons[lIdx];

      // 15-Question Quiz Exam
      const quizQuestions = create15Questions(course.Title, course.Title, lesson.Title);
      const quizExam = await db.Assignment.create({
        LessonId: lesson.Id,
        Title: `Bài kiểm tra 15 câu trắc nghiệm - ${lesson.Title}`,
        Instruction: 'Bài kiểm tra gồm 15 câu trắc nghiệm. Học sinh làm trực tiếp trên giao diện và nộp bài để xem điểm tức thì.',
        DueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        AssignmentType: 0, // QUIZ
        QuizData: JSON.stringify(quizQuestions)
      });

      // 15-Prompt Essay Assignment
      const essayPrompts = Array.from({ length: 15 }, (_, i) => `Câu ${i + 1}: Trình bày lời giải chi tiết cho chuyên đề ${course.Title} - Phần ${i + 1}.`).join('\n');
      const essayAssign = await db.Assignment.create({
        LessonId: lesson.Id,
        Title: `Bài tập tự luận 15 câu - ${lesson.Title}`,
        Instruction: `Danh sách 15 câu hỏi bài tập tự luận rèn luyện:\n${essayPrompts}`,
        DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        AssignmentType: 1 // ESSAY
      });

      // Sample Submissions for Student 1 and Student 2
      if (lIdx < 5) {
        await db.Submission.create({
          AssignmentId: quizExam.Id,
          StudentId: students[0].Id, // quyen27@gmail.com
          TextContent: 'Đã nộp bài kiểm tra 15 câu trắc nghiệm.',
          SubmittedAt: new Date(),
          Score: 9.3,
          Feedback: 'Làm đúng 14/15 câu trắc nghiệm, kết quả rất tốt!',
          GradedAt: new Date()
        });

        await db.Submission.create({
          AssignmentId: essayAssign.Id,
          StudentId: students[1].Id, // baochi@gmail.com
          TextContent: 'Em đã hoàn thành cả 15 câu bài tập tự luận ra giấy và đính kèm lời giải.',
          SubmittedAt: new Date(),
          Score: 9.5,
          Feedback: 'Hoàn thành trọn vẹn 15 câu tự luận, lập luận logic chính xác!',
          GradedAt: new Date()
        });
      }
    }

    // 9. INVOICES & PAYMENTS
    for (let sIdx = 0; sIdx < 10; sIdx++) {
      const st = students[sIdx];
      const cls = classes[sIdx % classes.length];
      const course = courses[sIdx % courses.length];

      const inv = await db.Invoice.create({
        InvoiceCode: `INV-2026-${100 + sIdx}`,
        StudentId: st.Id,
        ClassId: cls.Id,
        Amount: course.BasePrice,
        DueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        Status: sIdx % 2 === 0 ? db.Invoice.StatusMap.PAID : db.Invoice.StatusMap.UNPAID
      });

      if (sIdx % 2 === 0) {
        await db.Payment.create({
          InvoiceId: inv.Id,
          TransactionCode: `TRANS-VNPAY-${900 + sIdx}`,
          Amount: course.BasePrice,
          PaymentMethod: db.Payment.MethodMap.GATEWAY,
          PaymentTime: new Date()
        });
      }
    }

    // 10. NOTIFICATIONS
    for (let sIdx = 0; sIdx < 5; sIdx++) {
      await db.Notification.create({
        UserId: students[sIdx].Id,
        Title: 'Bài kiểm tra 15 câu mới',
        Content: `Lớp ${classes[sIdx].ClassName} đã mở bài kiểm tra 15 câu trắc nghiệm. Hạn nộp trong 5 ngày.`,
        IsRead: false,
        Type: 'ASSIGNMENT'
      });
    }

    console.log('✅ ALL 10 COURSES WITH BEAUTIFUL IMAGES & 15-QUESTION EXAMS SEEDED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Error seeding 15-question database:', error);
  } finally {
    process.exit(0);
  }
}

seedComprehensiveData();
