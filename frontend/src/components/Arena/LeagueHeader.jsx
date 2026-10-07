import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './League.css';

const dashboardOf = (role) => (role === 'ADMIN' || role === 'STAFF' ? '/Admin/Dashboard' : role === 'TEACHER' ? '/Teacher/Dashboard' : '/Student/Dashboard');

export default function LeagueHeader() {
  const { user, isLoggedIn } = useAuth();
  const [guide, setGuide] = useState(false);
  const toRanking = () => document.getElementById('bang-xep-hang')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <header className="lg lg-bar">
        <Link to="/" className="lg-brand">
          <img src="/images/logo.jpg" alt="LumiEdu" />
          <span>LumiEdu</span>
        </Link>
        <nav className="lg-nav">
          <Link to="/">Trang chủ</Link>
          <button type="button" onClick={() => setGuide(true)}>Hướng dẫn thi</button>
          <button type="button" onClick={toRanking}>Bảng xếp hạng</button>
          <Link to="/Home/MockTest">Thi thử</Link>
        </nav>
        <div style={{ display: 'flex', gap: '.6rem' }}>
          {isLoggedIn && user ? (
            <Link to={dashboardOf(user.role)} className="lg-btn lg-btn--gold">Bảng điều khiển</Link>
          ) : (
            <>
              <Link to="/Auth/Login" className="lg-btn">Đăng nhập</Link>
              <Link to="/Auth/Register" className="lg-btn lg-btn--gold">Đăng ký</Link>
            </>
          )}
        </div>
      </header>

      {guide && (
        <div className="lg lg-modal" onClick={() => setGuide(false)} role="dialog" aria-modal="true" aria-label="Hướng dẫn thi">
          <div className="lg-modal__box" onClick={(e) => e.stopPropagation()}>
            <h3 className="lg-gold" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Hướng dẫn thi</h3>
            <ol>
              <li>Chọn <b>tháp theo khối</b> của bạn (12, 11 hoặc 10) và bấm <b>Vào thi</b> để chọn đề.</li>
              <li>Làm bài trong thời gian quy định của từng đề; bài trắc nghiệm được chấm tự động ngay khi nộp.</li>
              <li>Điểm chính thức là điểm của <b>lần làm đầu tiên</b>. Các lần làm lại chỉ để luyện tập, không đổi thứ hạng.</li>
              <li>Điểm các bài đã chấm được cộng dồn vào <b>Bảng xếp hạng</b> theo khối và môn. Tên đấu sĩ hiển thị rút gọn để bảo vệ thông tin.</li>
            </ol>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.6rem', marginTop: '1.3rem' }}>
              <button type="button" className="lg-btn" onClick={() => setGuide(false)}>Đóng</button>
              <Link to="/Home/MockTest" className="lg-btn lg-btn--gold">Vào thi ngay</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
