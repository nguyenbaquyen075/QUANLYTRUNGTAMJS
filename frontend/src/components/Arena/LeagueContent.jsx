import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './League.css';

const nf = (n) => Number(n || 0).toLocaleString('vi-VN');

// Cánh trang trí hai bên tiêu đề (SVG tự vẽ, màu xanh + vàng của LumiEdu)
function Wing({ flip }) {
  return (
    <svg className="lg-wing" viewBox="0 0 200 90" style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <defs>
        <linearGradient id="wingA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2f6df0" stopOpacity=".05" /><stop offset=".6" stopColor="#4A8DEE" /><stop offset="1" stopColor="#bcd8ff" /></linearGradient>
        <linearGradient id="wingB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f6d77e" stopOpacity="0" /><stop offset="1" stopColor="#f6d77e" /></linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M200 ${45 - i * 4} C ${150 - i * 14} ${20 - i * 3}, ${70 - i * 8} ${30 + i * 6}, ${12 + i * 10} ${40 + i * 9} C ${80 - i * 6} ${50 + i * 6}, ${150 - i * 10} ${52 + i * 3}, 200 ${50 + i * 2} Z`}
          fill="url(#wingA)" opacity={1 - i * 0.14} />
      ))}
      <path d="M200 46 C 150 30, 80 38, 22 52" fill="none" stroke="url(#wingB)" strokeWidth="2" />
    </svg>
  );
}

export default function LeagueContent() {
  const [overview, setOverview] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/League/Overview').then((r) => setOverview(r.data)).catch(() => setError('Không tải được số liệu.'));
  }, []);

  useEffect(() => {
    setRanking(null);
    api.get('/api/League/Ranking', { params: { grade, subject } })
      .then((r) => { setRanking(r.data.ranking || []); setLimit(10); })
      .catch(() => { setRanking([]); setError('Không tải được bảng xếp hạng.'); });
  }, [grade, subject]);

  const toRanking = () => document.getElementById('bang-xep-hang')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const pick = (g, s) => { setGrade(g ? String(g) : ''); setSubject(s || ''); setTimeout(toRanking, 60); };
  const max = useMemo(() => Math.max(...(ranking || []).map((r) => r.points), 1), [ranking]);
  const towers = overview?.towers || [];
  const subjects = overview?.subjects || [];

  return (
    <div className="lg" style={{ paddingBottom: '5rem' }}>
      {error && <p className="lg-empty">{error}</p>}

      {/* THÁP THEO KHỐI */}
      <section className="lg-section arena-reveal">
        <div className="lg-towers">
          {towers.map((t, i) => (
            <article key={t.grade} className={`lg-tower${String(t.grade) === grade ? ' is-active' : ''}`} style={{ transitionDelay: `${i * 60}ms` }}>
              <small>Tháp Khối</small>
              <span className="lg-tower__num lg-gold">{t.grade}</span>
              <div className="lg-chips">{t.subjects.map((s) => <span key={s.key}>{s.name}</span>)}</div>
              <div className="lg-meta"><div><b>{nf(t.questions)}</b>câu hỏi</div><div><b>{nf(t.players)}</b>đấu sĩ</div></div>
              <div className="lg-tower__act">
                <Link to="/Home/MockTest" className="lg-btn lg-btn--gold">Vào thi</Link>
                <button type="button" className="lg-btn" onClick={() => pick(t.grade, '')}>Xếp hạng</button>
              </div>
              <div className="lg-tower__base"><img src="/images/logo.jpg" alt="" />LUMIEDU</div>
            </article>
          ))}
          {!towers.length && !error && <p className="lg-empty">Đang tải các tầng tháp…</p>}
        </div>
      </section>

      {/* SỐ LIỆU + MÔN */}
      {overview && (
        <section className="lg-section arena-reveal">
          <div className="lg-stats">
            <div className="lg-big">
              <strong className="lg-gold">{nf(overview.totalQuestions)}+</strong>
              <span>CÂU HỎI</span>
              <p style={{ marginTop: '.6rem', color: '#9fb8e6', fontSize: '.85rem' }}>{nf(overview.totalExams)} đề thi · {nf(overview.totalPlayers)} đấu sĩ đã ghi điểm</p>
            </div>
            <div className="lg-subjects">
              {subjects.map((s) => (
                <button type="button" key={s.key} className={`lg-subject${subject === s.key ? ' is-active' : ''}`} onClick={() => pick(grade, s.key)}>
                  <small>Môn</small>
                  <strong className="lg-gold">{s.name}</strong>
                  <em>{nf(s.questions)} câu hỏi · {nf(s.exams)} đề</em>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BẢNG XẾP HẠNG */}
      <section id="bang-xep-hang" className="lg-section arena-reveal" style={{ scrollMarginTop: '80px' }}>
        <div className="lg-title"><Wing /><h2 className="lg-gold">Bảng xếp hạng</h2><Wing flip /></div>
        <div className="lg-board">
          <div className="lg-filters">
            <select className="lg-select" value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Khối">
              <option value="">Tất cả khối</option>
              {towers.map((t) => <option key={t.grade} value={t.grade}>Khối {t.grade}</option>)}
            </select>
            <select className="lg-select" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Môn">
              <option value="">Tất cả môn</option>
              {subjects.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
            </select>
          </div>
          <div className="lg-thead"><span style={{ textAlign: 'center' }}>TOP</span><span>Đấu sĩ</span><span>Điểm tích lũy</span></div>
          {ranking === null && <p className="lg-empty">Đang tải bảng xếp hạng…</p>}
          {ranking && ranking.length === 0 && <p className="lg-empty">Chưa có đấu sĩ nào ghi điểm ở mục này.</p>}
          {(ranking || []).slice(0, limit).map((r) => (
            <div className="lg-row" key={`${r.rank}-${r.name}`}>
              <span className="lg-rank">{r.rank <= 3 ? <i className={`r${r.rank}`}>{r.rank}</i> : r.rank}</span>
              <span className="lg-name">{r.name}<small>{r.attempts} bài · điểm TB {r.avg}</small></span>
              <span className="lg-valwrap">
                <span className="lg-bar2" style={{ width: `${Math.max(2, (r.points / max) * 62)}%` }} />
                <span className="lg-val">{nf(r.points)}</span>
              </span>
            </div>
          ))}
          {ranking && ranking.length > limit && (
            <button type="button" className="lg-btn lg-more" onClick={() => setLimit((n) => n + 20)}>Xem thêm</button>
          )}
        </div>
      </section>
    </div>
  );
}
