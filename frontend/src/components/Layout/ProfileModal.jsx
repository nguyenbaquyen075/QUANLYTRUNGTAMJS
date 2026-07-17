import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('detail');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Edit form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  
  // Avatar cropping state & refs
  const [avatarFileName, setAvatarFileName] = useState('Chưa chọn tệp nào');
  const [avatarCropperModalOpen, setAvatarCropperModalOpen] = useState(false);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const cropperRef = useRef(null);
  const originalImageSrcRef = useRef('');

  // Teacher specific edit states
  const [teacherBio, setTeacherBio] = useState('');
  const [teacherTitle, setTeacherTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherExperience, setTeacherExperience] = useState(5);
  const [teacherBankName, setTeacherBankName] = useState('');
  const [teacherBankAccount, setTeacherBankAccount] = useState('');
  const [teacherBankHolder, setTeacherBankHolder] = useState('');

  // Password form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfileDetails = async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      const res = await api.get('/Profile/GetDetails');
      if (res.data && res.data.success) {
        const data = res.data.data;
        setProfile(data);
        // Initialize form fields
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setDob(data.dob || '');
        setGender(data.gender || 'MALE');
        setAddress(data.address || '');
        setTeacherBio(data.teacherBio || '');
        setTeacherTitle(data.teacherTitle || '');
        setSubject(data.subject || '');
        setTeacherExperience(data.teacherExperience !== null ? data.teacherExperience : 5);
        setTeacherBankName(data.teacherBankName || '');
        setTeacherBankAccount(data.teacherBankAccount || '');
        setTeacherBankHolder(data.teacherBankHolder || '');
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể tải thông tin cá nhân', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [isOpen]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        originalImageSrcRef.current = event.target.result;
        setAvatarCropperModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCrop = () => {
    if (!cropperRef.current) return;
    const canvas = cropperRef.current.getCroppedCanvas({
      width: 256,
      height: 256
    });
    canvas.toBlob((blob) => {
      setCroppedBlob(blob);
      setPreviewAvatarUrl(canvas.toDataURL());
      setAvatarCropperModalOpen(false);
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    }, 'image/png');
  };

  const closeCropperModal = () => {
    setAvatarCropperModalOpen(false);
    if (cropperRef.current) {
      cropperRef.current.destroy();
      cropperRef.current = null;
    }
    clearAvatarFile();
  };

  const clearAvatarFile = () => {
    setAvatarFile(null);
    setCroppedBlob(null);
    setPreviewAvatarUrl(null);
    setAvatarFileName('Chưa chọn tệp nào');
    const input = document.getElementById('reactEditAvatarFile');
    if (input) input.value = '';
  };

  const triggerAvatarClick = () => {
    if (activeTab !== 'edit') {
      setActiveTab('edit');
      setTimeout(() => {
        document.getElementById('reactEditAvatarFile')?.click();
      }, 150);
    } else {
      document.getElementById('reactEditAvatarFile')?.click();
    }
  };

  const imageRefCallback = (el) => {
    if (el && originalImageSrcRef.current) {
      el.src = originalImageSrcRef.current;
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
      cropperRef.current = new window.Cropper(el, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.9,
        restore: false,
        guides: false,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('address', address);
    
    if (croppedBlob) {
      formData.append('avatarFile', croppedBlob, 'avatar.png');
    } else if (avatarFile) {
      formData.append('avatarFile', avatarFile);
    }

    if (profile?.role === 'TEACHER') {
      formData.append('teacherBio', teacherBio);
      formData.append('teacherTitle', teacherTitle);
      formData.append('subject', subject);
      formData.append('teacherExperience', teacherExperience);
      formData.append('teacherBankName', teacherBankName);
      formData.append('teacherBankAccount', teacherBankAccount);
      formData.append('teacherBankHolder', teacherBankHolder);
    }

    try {
      const res = await api.post('/Profile/UpdateDetails', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        showToast(res.data.message || 'Cập nhật thông tin thành công!');
        fetchProfileDetails();
        checkAuth(); // Refresh global user state
        clearAvatarFile();
        setActiveTab('detail');
      } else {
        showToast(res.data.message || 'Cập nhật thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi cập nhật.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp.', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('oldPassword', oldPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmNewPassword', confirmPassword);

    try {
      const res = await api.post('/Profile/ChangePassword', formData);
      if (res.data && res.data.success) {
        showToast(res.data.message || 'Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setActiveTab('detail');
      } else {
        showToast(res.data.message || 'Đổi mật khẩu thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi đổi mật khẩu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Quản Trị Viên';
      case 'STAFF': return 'Nhân Viên';
      case 'TEACHER': return 'Giáo Viên';
      case 'STUDENT': return 'Học Viên';
      case 'PARENT': return 'Phụ Huynh';
      default: return role;
    }
  };

  const formatDate = (str) => {
    if (!str) return 'Chưa cập nhật';
    const parts = str.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return str;
  };

  const getGenderLabel = (g) => {
    if (g === 'MALE') return 'Nam';
    if (g === 'FEMALE') return 'Nữ';
    if (g === 'OTHER') return 'Khác';
    return 'Chưa cập nhật';
  };

  const initial = profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[2100] p-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[3000] bg-white border-l-4 border-l-emerald-500 rounded-lg shadow-xl p-4 flex items-center gap-3 animate-fade-in" style={{ borderLeftColor: toast.type === 'error' ? '#EF4444' : '#10B981' }}>
          <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-circle-check text-emerald-500'} text-lg`} />
          <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
        </div>
      )}

      {/* Modal Content */}
      <div className="max-w-[680px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-none flex flex-col md:flex-row h-[550px] md:h-[500px]">
        
        {/* Left Panel */}
        <div className="w-full md:w-[35%] bg-gradient-to-br from-primary to-blue-600 p-8 text-center flex flex-col items-center justify-center text-white relative">
          <div
            onClick={triggerAvatarClick}
            className="w-[90px] h-[90px] rounded-full bg-white border-4 border-white/20 shadow-lg flex items-center justify-center text-primary text-3xl font-extrabold mb-4 overflow-hidden shrink-0 cursor-pointer relative group"
            title="Click để thay đổi ảnh đại diện"
          >
            {previewAvatarUrl ? (
              <img src={previewAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg">
              📷
            </div>
          </div>
          <h3 className="text-white text-base font-bold mb-1 line-clamp-2 leading-snug">{profile?.fullName}</h3>
          <span className="inline-block bg-white/25 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6">
            {getRoleLabel(profile?.role)}
          </span>

          <div className="text-[11px] opacity-90 text-left w-full mt-auto border-t border-white/25 pt-4 space-y-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calendar-days" />
              <span>Tham gia: <strong>{profile?.createdAt || '--/--/----'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-400" />
              <span>Trạng thái: <strong className="text-emerald-400">Đang hoạt động</strong></span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[65%] flex flex-col relative bg-white">
          <button onClick={onClose} className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 text-2xl font-light z-10">
            &times;
          </button>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-6 pt-4 bg-slate-50 gap-2 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('detail')}
              className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'detail' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-id-card" /> Thông tin
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'edit' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-user-pen" /> Chỉnh sửa
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-2.5 font-bold text-xs flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'password' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              <i className="fa-solid fa-key" /> Đổi mật khẩu
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && !profile && (
              <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-spinner fa-spin text-primary text-2xl" />
              </div>
            )}

            {profile && activeTab === 'detail' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Địa chỉ Email</span>
                    <strong className="text-xs text-slate-800 break-all">{profile.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Số điện thoại</span>
                    <strong className="text-xs text-slate-800">{profile.phone || 'Chưa cập nhật'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Ngày sinh</span>
                    <strong className="text-xs text-slate-800">{formatDate(profile.dob)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Giới tính</span>
                    <strong className="text-xs text-slate-800">{getGenderLabel(profile.gender)}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Địa chỉ</span>
                  <strong className="text-xs text-slate-800">{profile.address || 'Chưa cập nhật'}</strong>
                </div>

                {profile.role === 'TEACHER' && (
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                      <i className="fa-solid fa-graduation-cap" /> Thông tin chuyên môn
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Chức danh & Môn dạy</span>
                        <strong className="text-xs text-slate-800">{profile.teacherTitle || 'Giáo viên'} - Môn {profile.subject || 'Chưa cập nhật'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Kinh nghiệm</span>
                        <strong className="text-xs text-slate-800">{profile.teacherExperience || 5} năm dạy</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Tiểu sử</span>
                      <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">{profile.teacherBio || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Ngân hàng</span>
                        <strong className="text-xs text-slate-800">{profile.teacherBankName || 'Chưa cập nhật'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Số tài khoản</span>
                        <strong className="text-xs text-slate-800">{profile.teacherBankAccount || 'Chưa cập nhật'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block uppercase">Chủ tài khoản</span>
                        <strong className="text-xs text-slate-800">{profile.teacherBankHolder || 'Chưa cập nhật'}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {profile && activeTab === 'edit' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">HỌ VÀ TÊN</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">SỐ ĐIỆN THOẠI</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">ẢNH ĐẠI DIỆN</label>
                    <input
                      type="file"
                      id="reactEditAvatarFile"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white text-xs h-[34px] mt-1">
                      <label htmlFor="reactEditAvatarFile" className="shrink-0 cursor-pointer bg-slate-100 border-r border-slate-200 px-3 h-full flex items-center font-semibold text-slate-700 hover:bg-slate-200 select-none">
                        Chọn tệp
                      </label>
                      <span className="flex-1 px-2.5 text-slate-500 truncate">
                        {avatarFileName}
                      </span>
                      {(avatarFile || croppedBlob) && (
                        <button
                          type="button"
                          onClick={clearAvatarFile}
                          className="shrink-0 flex items-center justify-center bg-red-500 text-white w-5 h-5 rounded mr-1.5 hover:bg-red-600 font-bold"
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">NGÀY SINH</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">GIỚI TÍNH</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">ĐỊA CHỈ</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {profile.role === 'TEACHER' && (
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h4 className="font-bold text-xs text-primary">Cập nhật thông tin giảng dạy</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">HỌC HÀM / HỌC VỊ</label>
                        <input
                          type="text"
                          value={teacherTitle}
                          onChange={(e) => setTeacherTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">MÔN HỌC GIẢNG DẠY</label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">GIỚI THIỆU BẢN THÂN</label>
                        <textarea
                          value={teacherBio}
                          onChange={(e) => setTeacherBio(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white h-20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">SỐ NĂM KINH NGHIỆM</label>
                        <input
                          type="number"
                          value={teacherExperience}
                          onChange={(e) => setTeacherExperience(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div />
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">TÊN NGÂN HÀNG</label>
                        <input
                          type="text"
                          value={teacherBankName}
                          onChange={(e) => setTeacherBankName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">SỐ TÀI KHOẢN (BANK ACCOUNT)</label>
                        <input
                          type="text"
                          value={teacherBankAccount}
                          onChange={(e) => setTeacherBankAccount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">CHỦ TÀI KHOẢN (BANK HOLDER)</label>
                        <input
                          type="text"
                          value={teacherBankHolder}
                          onChange={(e) => setTeacherBankHolder(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-1.5"
                >
                  {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-floppy-disk" />} Lưu thay đổi
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">MẬT KHẨU CŨ</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">MẬT KHẨU MỚI</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">XÁC NHẬN MẬT KHẨU MỚI</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-1.5"
                >
                  {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-key" />} Đổi mật khẩu
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* React Avatar Crop Modal */}
      {avatarCropperModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-[2200] p-4 animate-fade-in">
          <div className="max-w-[520px] w-full bg-white rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                  <i className="fa-solid fa-crop-simple" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">Chỉnh sửa ảnh đại diện</h3>
              </div>
              <button onClick={closeCropperModal} className="text-slate-400 hover:text-slate-600 text-xl font-light">
                &times;
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
              <i className="fa-solid fa-circle-info" /> Kéo, zoom hoặc xoay ảnh. Khung tròn là phần sẽ được lưu.
            </p>

            <div className="h-[280px] overflow-hidden border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
              <img ref={imageRefCallback} className="max-w-full max-h-full block" />
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              <button type="button" onClick={() => cropperRef.current?.rotate(-90)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm" title="Xoay trái 90°">↺</button>
              <button type="button" onClick={() => cropperRef.current?.rotate(90)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm" title="Xoay phải 90°">↻</button>
              <button type="button" onClick={() => cropperRef.current?.zoom(0.1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold" title="Phóng to">+</button>
              <button type="button" onClick={() => cropperRef.current?.zoom(-0.1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold" title="Thu nhỏ">-</button>
              <button type="button" onClick={() => cropperRef.current?.reset()} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm" title="Đặt lại">🗘</button>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-auto">
              <button type="button" onClick={closeCropperModal} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold">Hủy</button>
              <button type="button" onClick={applyCrop} className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-check" /> Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
