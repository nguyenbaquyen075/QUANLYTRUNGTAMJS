import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

export default function NotFoundPage({ message }) {
  return (
    <MainLayout hideHeader={false} hideChatbot={true}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-12">
        <span className="material-symbols-outlined text-primary text-[72px] mb-4">error</span>
        <h1 className="text-3xl font-black text-slate-800 mb-2">404 - Không Tìm Thấy Trang</h1>
        <p className="text-slate-500 text-sm max-w-md leading-relaxed font-semibold mb-8">
          {message || 'Đường dẫn bạn yêu cầu không tồn tại hoặc đã bị di chuyển.'}
        </p>
        <Link to="/" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full text-xs font-bold shadow-lg transition-all">
          Quay lại trang chủ
        </Link>
      </div>
    </MainLayout>
  );
}
