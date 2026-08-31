import React from "react";
import "./LoiDaiThachDau.css";

const arenas = [
  {
    rank: "C - D",
    title: "LÔI ĐÀI SƠ CẤP",
    status: "ĐANG DIỄN RA",
    statusClass: "live",
    players: "12/16",
    topic: "Hàm số bậc 2",
    teacher: "Thầy Minh Toán",
    color: "emerald",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
    crest: "✦",
    button: "THAM GIA NGAY",
  },
  {
    rank: "B - A",
    title: "LÔI ĐÀI TRUNG CẤP",
    status: "ĐANG DIỄN RA",
    statusClass: "live",
    players: "8/12",
    topic: "Nguyên hàm - Tích phân",
    teacher: "Cô Lan Anh",
    color: "blue",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85",
    crest: "◆",
    button: "THAM GIA NGAY",
  },
  {
    rank: "S - SS",
    title: "LÔI ĐÀI CAO CẤP",
    status: "SẮP DIỄN RA",
    statusClass: "soon",
    players: "30 phút nữa",
    topic: "Xác suất - Thống kê",
    teacher: "Thầy Khoa Pro",
    color: "gold",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85",
    crest: "♛",
    button: "XEM TRƯỚC LÔI ĐÀI",
  },
  {
    rank: "SS+",
    title: "LÔI ĐÀI ĐỈNH CAO",
    status: "ĐÃ KẾT THÚC",
    statusClass: "ended",
    players: "16/16",
    topic: "Hình học không gian",
    teacher: "Thầy Long VIP",
    color: "purple",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
    crest: "♕",
    button: "XEM KẾT QUẢ",
  },
];

function Icon({ children }) {
  return <span className="mini-icon">{children}</span>;
}

function ArenaCard({ arena }) {
  const ended = arena.statusClass === "ended";
  const soon = arena.statusClass === "soon";

  return (
    <article className={`arena-card ${arena.color} ${ended ? "is-ended" : ""}`}>
      <div
        className="arena-cover"
        style={{ backgroundImage: `url(${arena.image})` }}
      >
        <div className="cover-overlay" />

        <div className={`status ${arena.statusClass}`}>
          <span className="status-dot" />
          {arena.status}
        </div>

        <div className="player-count">
          {soon ? <Icon>◷</Icon> : <Icon>♟</Icon>}
          {arena.players}
        </div>

        <div className="crest">
          <div className="crest-inner">{arena.crest}</div>
        </div>
      </div>

      <div className="arena-body">
        <div className="rank-line">
          <span>RANK</span>
          <strong>{arena.rank}</strong>
        </div>

        <h2>{arena.title}</h2>
        <p className="subtitle">
          {arena.rank === "SS+"
            ? "Dành cho cao thủ cấp SS trở lên"
            : `Dành cho học viên cấp ${arena.rank}`}
        </p>

        <div className="divider" />

        <div className="info">
          <div>
            <Icon>✥</Icon>
            <span>Chủ đề: {arena.topic}</span>
          </div>
          <div>
            <Icon>♙</Icon>
            <span>Giáo viên: {arena.teacher}</span>
          </div>
        </div>

        <button className="arena-button" disabled={ended}>
          <span>{arena.button}</span>
          <span className="arrow">{ended ? "♙" : "→"}</span>
        </button>
      </div>
    </article>
  );
}

export default function LoiDaiThachDau() {
  return (
    <main className="arena-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="arena-header">
        <div className="dragon-mark">⌁</div>
        <div className="header-line" />
        <div>
          <div className="eyebrow">⚔  ĐẤU TRƯỜNG TRI THỨC  ⚔</div>
          <h1>LÔI ĐÀI THÁCH ĐẤU</h1>
          <p>Chọn lôi đài phù hợp · Thử thách bản thân · Vươn tầm cao mới</p>
        </div>
        <div className="header-line" />
      </header>

      <section className="arena-grid">
        {arenas.map((arena) => (
          <ArenaCard key={arena.title} arena={arena} />
        ))}
      </section>

      <section className="feature-bar">
        <div className="feature">
          <span className="feature-icon">♜</span>
          <div>
            <strong>THI ĐẤU CÔNG BẰNG</strong>
            <small>Hệ thống chấm điểm minh bạch</small>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon">♛</span>
          <div>
            <strong>XẾP HẠNG RÕ RÀNG</strong>
            <small>Bảng xếp hạng cập nhật liên tục</small>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon">🎁</span>
          <div>
            <strong>PHẦN THƯỞNG HẤP DẪN</strong>
            <small>Quà tặng & học bổng giá trị</small>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon">⬟</span>
          <div>
            <strong>THÁCH ĐẤU MỖI NGÀY</strong>
            <small>Nâng cao kiến thức mỗi ngày</small>
          </div>
        </div>
      </section>
    </main>
  );
}
