import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { useFetchData } from '../../hooks/useFetchData';
import api from '../../services/api';

export default function DoAssignmentPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetchData(`/Student/DoAssignment/${id}`);

  const assignment = data?.assignment || null;
  const isQuiz = assignment?.AssignmentType === 0;
  const isEssay = assignment?.AssignmentType === 1;
  const isTrueFalse = assignment?.AssignmentType === 2;
  const isExam = assignment?.AssignmentType === 3;

  const [quizData, setQuizData] = useState([]);
  const [tfData, setTfData] = useState([]);
  const [examData, setExamData] = useState({ quiz: [], tf: [], essay: [] });
  const [answers, setAnswers] = useState({}); // Quiz: { qIndex: choiceIndex }
  const [tfAnswers, setTfAnswers] = useState({}); // TF: { qIndex: { a, b, c, d } }
  const [examQuizAnswers, setExamQuizAnswers] = useState({});
  const [examTfAnswers, setExamTfAnswers] = useState({});
  const [examEssayAnswers, setExamEssayAnswers] = useState({});
  const [essayText, setEssayText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!assignment || !assignment.QuizData) return;
    try {
      const raw = assignment.QuizData;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (isQuiz) {
        setQuizData(Array.isArray(parsed) ? parsed : []);
      } else if (isTrueFalse) {
        setTfData(Array.isArray(parsed) ? parsed : []);
      } else if (isExam) {
        setExamData({ quiz: parsed.quiz || [], tf: parsed.tf || [], essay: parsed.essay || [] });
      }
    } catch (e) {
      console.error('Quiz parsing error:', e);
    }
  }, [assignment]);

  const handleChoiceSelect = (qIdx, choiceIdx) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: choiceIdx }));
  };

  const handleTfSelect = (qIdx, letter, value) => {
    setTfAnswers((prev) => ({ ...prev, [qIdx]: { ...(prev[qIdx] || {}), [letter]: value } }));
  };

  const handleExamQuizSelect = (qIdx, choiceIdx) => {
    setExamQuizAnswers((prev) => ({ ...prev, [qIdx]: choiceIdx }));
  };

  const handleExamTfSelect = (qIdx, letter, value) => {
    setExamTfAnswers((prev) => ({ ...prev, [qIdx]: { ...(prev[qIdx] || {}), [letter]: value } }));
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isQuiz) {
        // Backend expects `content` as a JSON-stringified array of choice indices, ordered by question index
        const answersArray = quizData.map((_, qIdx) => (answers[qIdx] !== undefined ? answers[qIdx] : null));
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: JSON.stringify(answersArray),
        });
        alert('Nộp bài trắc nghiệm thành công!');
      } else if (isTrueFalse) {
        const answersArray = tfData.map((_, qIdx) => tfAnswers[qIdx] || {});
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: JSON.stringify(answersArray),
        });
        alert('Nộp bài Đúng/Sai thành công!');
      } else if (isExam) {
        let fileUrl = null;
        if (attachmentFile) {
          const uploadForm = new FormData();
          uploadForm.append('file', attachmentFile);
          const uploadRes = await api.post('/Student/UploadFile', uploadForm, { headers: { 'Content-Type': undefined } });
          if (!uploadRes.data?.success) {
            alert(uploadRes.data?.message || 'Lỗi khi tải file lên.');
            setSubmitting(false);
            return;
          }
          fileUrl = uploadRes.data.fileUrl;
        }
        const content = {
          quiz: examData.quiz.map((_, qIdx) => (examQuizAnswers[qIdx] !== undefined ? examQuizAnswers[qIdx] : null)),
          tf: examData.tf.map((_, qIdx) => examTfAnswers[qIdx] || {}),
          essay: examData.essay.map((_, qIdx) => examEssayAnswers[qIdx] || '')
        };
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: JSON.stringify(content),
          fileUrl,
        });
        alert('Nộp bài kiểm tra thành công!');
      } else {
        // File uploads go through a separate endpoint first; SubmitAssignment itself only accepts a fileUrl string
        let fileUrl = null;
        if (attachmentFile) {
          const uploadForm = new FormData();
          uploadForm.append('file', attachmentFile);
          const uploadRes = await api.post('/Student/UploadFile', uploadForm, { headers: { 'Content-Type': undefined } });
          if (!uploadRes.data?.success) {
            alert(uploadRes.data?.message || 'Lỗi khi tải file lên.');
            setSubmitting(false);
            return;
          }
          fileUrl = uploadRes.data.fileUrl;
        }
        await api.post('/Student/SubmitAssignment', {
          assignmentId: id,
          content: essayText,
          fileUrl,
        });
        alert('Nộp bài tự luận thành công!');
      }
      // SubmitAssignment redirects server-side; the axios interceptor follows it automatically.
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
                {isQuiz ? 'Bài kiểm tra trắc nghiệm' : isTrueFalse ? 'Bài kiểm tra Đúng/Sai' : isExam ? 'Bài kiểm tra tổng hợp' : 'Bài nộp tự luận'}
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

              {/* TRUE/FALSE PORTION */}
              {isTrueFalse && (
                <div className="space-y-8">
                  {tfData.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 border-b border-slate-100 pb-8 last:border-b-0">
                      <h4 className="font-bold text-xs md:text-sm text-slate-800 leading-relaxed">Câu {qIdx + 1}: {q.stem}</h4>
                      <div className="space-y-2">
                        {['a', 'b', 'c', 'd'].map((letter, ii) => {
                          const item = q.items?.[ii];
                          if (!item) return null;
                          const current = tfAnswers[qIdx]?.[letter];
                          return (
                            <div key={letter} className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold">
                              <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">{letter}</span>
                              <span className="flex-1">{item.text}</span>
                              <button type="button" onClick={() => handleTfSelect(qIdx, letter, 'dung')} className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${current === 'dung' ? 'bg-emerald-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>Đúng</button>
                              <button type="button" onClick={() => handleTfSelect(qIdx, letter, 'sai')} className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${current === 'sai' ? 'bg-red-500 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>Sai</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EXAM (TỔNG HỢP) PORTION */}
              {isExam && (
                <div className="space-y-10">
                  {examData.quiz.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-black text-sm text-sky-700 uppercase tracking-wide">Phần trắc nghiệm</h3>
                      {examData.quiz.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-3 border-b border-slate-100 pb-6 last:border-b-0">
                          <h4 className="font-bold text-xs md:text-sm text-slate-800">Câu {qIdx + 1}: {q.question_text}</h4>
                          <div className="grid gap-2">
                            {(q.options || []).map((choice, choiceIdx) => {
                              const isSelected = examQuizAnswers[qIdx] === choiceIdx;
                              return (
                                <div key={choiceIdx} onClick={() => handleExamQuizSelect(qIdx, choiceIdx)} className={`p-3 border rounded-xl cursor-pointer flex items-center gap-3 text-xs font-semibold ${isSelected ? 'border-primary bg-blue-50/50 text-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-slate-300'}`}>
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

                  {examData.tf.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-black text-sm text-emerald-700 uppercase tracking-wide">Phần Đúng / Sai</h3>
                      {examData.tf.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-3 border-b border-slate-100 pb-6 last:border-b-0">
                          <h4 className="font-bold text-xs md:text-sm text-slate-800">Câu {qIdx + 1}: {q.stem}</h4>
                          <div className="space-y-2">
                            {['a', 'b', 'c', 'd'].map((letter, ii) => {
                              const item = q.items?.[ii];
                              if (!item) return null;
                              const current = examTfAnswers[qIdx]?.[letter];
                              return (
                                <div key={letter} className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold">
                                  <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center">{letter}</span>
                                  <span className="flex-1">{item.text}</span>
                                  <button type="button" onClick={() => handleExamTfSelect(qIdx, letter, 'dung')} className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${current === 'dung' ? 'bg-emerald-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>Đúng</button>
                                  <button type="button" onClick={() => handleExamTfSelect(qIdx, letter, 'sai')} className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${current === 'sai' ? 'bg-red-500 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>Sai</button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {examData.essay.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="font-black text-sm text-amber-700 uppercase tracking-wide">Phần tự luận</h3>
                      {examData.essay.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-2 border-b border-slate-100 pb-6 last:border-b-0">
                          <h4 className="font-bold text-xs md:text-sm text-slate-800">Câu {qIdx + 1}: {q.question_text}</h4>
                          <textarea
                            rows={4}
                            value={examEssayAnswers[qIdx] || ''}
                            onChange={(e) => setExamEssayAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))}
                            placeholder="Nhập câu trả lời của bạn..."
                            className="w-full border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 text-xs font-semibold"
                          />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <label className="font-extrabold text-slate-700 text-xs block">File bài làm đính kèm (nếu có)</label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all rounded-2xl p-6 text-center bg-slate-50/50 cursor-pointer relative">
                          <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                          <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">upload_file</span>
                          <p className="text-xs text-slate-500 font-semibold">
                            {attachmentFile ? <strong className="text-primary">{attachmentFile.name}</strong> : 'Kéo thả tệp tin hoặc click để chọn file từ máy tính'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
