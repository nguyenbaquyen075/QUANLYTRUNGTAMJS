const express = require('express');
const controller = {};
const db = require('../models');

// POST: /api/v1/ai/chat/message
controller.chatMessage = async (req, res) => {
  const { session_token, message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Tin nhắn không được để trống.' });
  }

  try {
    const token = session_token || Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    // Find or create session
    let [session, created] = await db.AiChatSession.findOrCreate({
      where: { SessionToken: token },
      defaults: {
        CreatedAt: new Date()
      }
    });

    // Save user message
    await db.AiChatMessage.create({
      SessionId: session.Id,
      SenderType: db.AiChatMessage.SenderMap.USER,
      MessageContent: message,
      CreatedAt: new Date()
    });

    let reply = '';
    const suggestedCourses = [];
    let leadCaptured = false;

    // 1. Detect Phone Number
    const phoneMatch = message.match(/(0[35789])([0-9]{8})\b/);
    if (phoneMatch) {
      session.LeadPhone = phoneMatch[0];
      leadCaptured = true;
    }

    // 2. Detect Name
    const nameKeywords = ['tên tôi là', 'tôi tên là', 'mình là', 'tên là'];
    for (const kw of nameKeywords) {
      const idx = message.toLowerCase().indexOf(kw);
      if (idx !== -1) {
        const afterKw = message.substring(idx + kw.length).trim();
        const firstWord = afterKw.split(' ')[0];
        if (firstWord) {
          session.LeadName = firstWord;
          leadCaptured = true;
        }
      }
    }

    if (leadCaptured) {
      await session.save();
    }

    // 3. Keyword Match (RAG simulation)
    const msgLower = message.toLowerCase();
    let matchedCourses = [];

    if (msgLower.includes('toán') || msgLower.includes('math')) {
      matchedCourses = await db.Course.findAll({
        where: {
          Status: db.Course.StatusMap.ACTIVE,
          CourseCode: { [db.Sequelize.Op.like]: '%TOAN%' }
        }
      });
    } else if (msgLower.includes('lý') || msgLower.includes('phys')) {
      matchedCourses = await db.Course.findAll({
        where: {
          Status: db.Course.StatusMap.ACTIVE,
          CourseCode: { [db.Sequelize.Op.like]: '%VATLY%' }
        }
      });
    }

    if (matchedCourses.length > 0) {
      const first = matchedCourses[0];
      reply = `Dạ trung tâm hiện có khóa học rất phù hợp với nhu cầu của anh/chị: **${first.Title}** (${first.Description}). Học phí cơ bản toàn khóa là ${Number(first.BasePrice).toLocaleString('vi-VN')} VNĐ.`;
      
      matchedCourses.forEach(c => {
        suggestedCourses.push({
          id: c.Id,
          course_code: c.CourseCode,
          title: c.Title,
          price: c.BasePrice
        });
      });
    } else if (msgLower.includes('học phí') || msgLower.includes('tiền')) {
      reply = 'Học phí tại trung tâm dao động từ 1.200.000đ đến 1.800.000đ tùy theo môn học và cấp học của học sinh. Các lớp đều có sĩ số giới hạn tối đa 25-30 học sinh nhằm tăng tương tác.';
    } else if (phoneMatch) {
      reply = `Cảm ơn anh/chị đã để lại số điện thoại (${phoneMatch[0]}). Đội ngũ tư vấn tuyển sinh sẽ gọi lại hỗ trợ lộ trình học chi tiết trong vòng 15 phút tới ạ!`;
    } else {
      reply = 'Chào anh/chị! Em là trợ lý ảo AI của trung tâm học thêm online. Anh/chị đang muốn tìm kiếm khóa ôn thi, lấy lại căn bản hay lớp nâng cao cho con ở môn học nào ạ? (Toán lớp 10, Lý lớp 11...)';
    }

    // Save AI reply
    await db.AiChatMessage.create({
      SessionId: session.Id,
      SenderType: db.AiChatMessage.SenderMap.AI,
      MessageContent: reply,
      CreatedAt: new Date()
    });

    res.json({
      success: true,
      session_token: token,
      reply: reply,
      suggested_courses: suggestedCourses,
      lead_captured: {
        detected: leadCaptured,
        phone: session.LeadPhone || null,
        name: session.LeadName || null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
  }
};

// POST: /api/v1/ai/payments/webhook
controller.paymentsWebhook = async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.Data) {
    return res.status(400).json({ success: false, message: 'Payload không hợp lệ.' });
  }

  const desc = payload.Data.Desc || '';

  // Match invoice code (INV20260601001 or INV-20260701-0004 formats)
  const invoiceMatch = desc.match(/INV[0-9]{11}/) || desc.match(/INV-[0-9]{8}-[0-9]{4}/);
  if (!invoiceMatch) {
    return res.status(400).json({ success: false, message: 'Không tìm thấy mã hóa đơn trong nội dung chuyển khoản.' });
  }

  const invoiceCode = invoiceMatch[0];

  try {
    const invoice = await db.Invoice.findOne({
      where: { InvoiceCode: invoiceCode }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: `Không tìm thấy hóa đơn mã ${invoiceCode} trong hệ thống.` });
    }

    if (invoice.Status === db.Invoice.StatusMap.PAID) {
      return res.json({ success: true, message: 'Hóa đơn này đã được thanh toán trước đó.' });
    }

    // Check amount matches (accept minor float tolerances)
    if (Math.abs(payload.Data.Amount - parseFloat(invoice.Amount)) > 0.01) {
      return res.status(400).json({ success: false, message: 'Số tiền chuyển khoản không khớp với số tiền trên hóa đơn.' });
    }

    invoice.Status = db.Invoice.StatusMap.PAID;
    await invoice.save();

    // Create Payment
    await db.Payment.create({
      InvoiceId: invoice.Id,
      TransactionCode: payload.Data.Reference || Math.random().toString(36).substring(2),
      Amount: invoice.Amount,
      PaymentMethod: db.Payment.MethodMap.BANK_TRANSFER,
      PaymentTime: new Date(),
      RawWebhookData: JSON.stringify(payload)
    });

    res.json({
      success: true,
      message: `Đối soát học phí tự động thành công cho hóa đơn ${invoiceCode}.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi đối soát tự động.' });
  }
};

module.exports = controller;
