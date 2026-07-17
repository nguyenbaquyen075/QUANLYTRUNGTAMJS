import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function DoAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetchData(`/Student/DoAssignment/${id}`);

  const assignment = data?.assignment || null;
  const isQuiz = assignment?.AssignmentType === 0;
  const isEssay = assignment?.AssignmentType === 1;

  const [quizData, setQuizData] = useState([]);
  const [answers, setAnswers] = useState({}); // Stores selected answers for quiz { qIndex: choiceIndex }
  const [essayText, setEssayText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assignment && assignment.QuizData) {
      try {
        const raw = assignment.QuizData;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        setQuizData(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Quiz parsing error:', e);
      }
    }
  }, [assignment]);

  const handleChoiceSelect = (qIdx, choiceIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qIdx]: choiceIdx
    }));
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isQuiz) {
        // Submit quiz choices
        await api.post(`/Student/SubmitAssignment/${id}`, {
          answers: answers
        });
        alert('Nộp bài trắc nghiệm thành công!');
        navigate('/Student/Dashboard');
      } else {
        // Submit essay multipart
        const formData = new FormData();
        formData.append('notes', essayText);
        if (attachmentFile) {
          formData.append('attachmentFile', attachmentFile);
        }
        await api.post(`/Student/SubmitAssignment/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Nộp bài tự luận thành công!');
        navigate('/Student/Dashboard');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi trong quá trình nộp bài.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout hideHeader={false} hideChatbot={true}>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 select-none text-slate-800">
        
        {/* Back Link */}
        <div>
          <Link to="/Student/Dashboard" className="inline-flex items-center gap-1 text-slate-400 hover:text-primary transition-all text-xs font-bold">
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            Quay lại Góc học tập
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-primary text-3xl" />
          </div>
        ) : !assignment ? (
          <div className="text-center py-10 text-slate-500 font-semibold">
            Không tìm thấy bài tập được chỉ định hoặc bạn đã nộp bài tập này rồi.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            {/* Header info */}
            <div className="p-8 bg-slate-50 border-b border-slate-100 text-center space-y-2">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {isQuiz ? 'Bài kiểm tra trắc nghiệm' : 'Bài nộp tự luận'}
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 font-serif">{assignment.Title}</h1>
              <p className="text-xs text-slate-400 font-semibold">Hạn nộp bài: {new Date(assignment.DueDate).toLocaleString('vi-VN')}</p>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-12 space-y-8">
              {/* Instructions */}
              {assignment.Instruction && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">description</span> Hướng dẫn làm bài
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold whitespace-pre-line">{assignment.Instruction}</p>
                </div>
              )}

              {/* QUIZ PORTION */}
              {isQuiz && (
                <div className="space-y-8">
                  {quizData.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-4 border-b border-slate-100 pb-8 last:border-b-0">
                      <h4 className="font-bold text-xs md:text-sm text-slate-800 leading-relaxed">
                        Câu {qIdx + 1}: {q.question || q.question_text}
                      </h4>
                      <div className="grid gap-2">
                        {(q.choices || q.options || [])?.map((choice, choiceIdx) => {
                          const isSelected = answers[qIdx] === choiceIdx;
                          return (
                            <div
                              key={choiceIdx}
                              onClick={() => handleChoiceSelect(qIdx, choiceIdx)}
                              className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-3 text-xs font-semibold ${
                                isSelected ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-primary bg-primary' : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              {choice}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ESSAY PORTION */}
              {isEssay && (
                <div className="space-y-6">
                  {/* File Attachment Upload */}
                  <div className="space-y-2">
                    <label className="font-extrabold text-slate-700 text-xs block">File bài làm đính kèm (nếu có)</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all rounded-2xl p-6 text-center bg-slate-50/50 cursor-pointer relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">upload_file</span>
                      <p className="text-xs text-slate-500 font-semibold">
                        {attachmentFile ? (
                          <strong className="text-primary">{attachmentFile.name}</strong>
                        ) : (
                          'Kéo thả tệp tin hoặc click để chọn file từ máy tính'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Written Answers / Notes */}
                  <div className="space-y-2">
                    <label className="font-extrabold text-slate-700 text-xs block">Nội dung bài làm / Ghi chú cho thầy cô</label>
                    <textarea
                      rows={6}
                      value={essayText}
                      onChange={(e) => setEssayText(e.target.value)}
                      placeholder="Nhập nội dung trả lời bài tập tự luận của bạn tại đây..."
                      className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submission Button */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-8 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {submitting ? 'ĐANG NỘP BÀI...' : 'NỘP BÀI TẬP NGAY'}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
