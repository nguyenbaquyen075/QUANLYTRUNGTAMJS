import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import ArenaCinematic from '../components/Arena/ArenaCinematic';
import LeagueHeader from '../components/Arena/LeagueHeader';
import LeagueContent from '../components/Arena/LeagueContent';
import '../components/Arena/League.css';

// Trang Thách đấu (đấu trường): cảnh phim mở đầu cuộn theo chuột, sau đó là tháp theo khối, số liệu và bảng xếp hạng.
// Dữ liệu lấy từ /api/League/*, tính trên bài nộp thật của học viên.
export default function BigMockTestPage() {
  return (
    <MainLayout hideHeader>
      <ArenaCinematic
        header={<LeagueHeader />}
        title={(
          <div className="lg text-center relative">
            <div className="lg-badge"><span>✦</span> Mùa giải 2026 <span>✦</span></div>
            <h1 className="fantasy-wuxia-title text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-wider">THÁCH ĐẤU CAO THỦ</h1>
            <p className="fantasy-wuxia-subtitle text-sm sm:text-lg tracking-widest uppercase flex items-center justify-center gap-3 mt-2">
              <span>Vượt tháp</span><span>•</span><span>Tranh ngôi đầu bảng</span>
            </p>
          </div>
        )}
      >
        <LeagueContent />
      </ArenaCinematic>
    </MainLayout>
  );
}
