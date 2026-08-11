function computeMockTestScore(questions, answers) {
  const safeAnswers = answers || {};
  let totalMaxPoints = 0;
  let totalCorrectPoints = 0;
  let correctCount = 0;

  questions.forEach((q) => {
    const points = typeof q.Points === 'number' ? q.Points : parseFloat(q.Points) || 1;
    totalMaxPoints += points;
    const chosen = safeAnswers[String(q.Id)];
    if (chosen !== undefined && chosen !== null && chosen === q.CorrectIndex) {
      correctCount++;
      totalCorrectPoints += points;
    }
  });

  const score = totalMaxPoints > 0 ? Number(((totalCorrectPoints / totalMaxPoints) * 10).toFixed(1)) : 0;

  return {
    score,
    correctCount,
    totalQuestions: questions.length
  };
}

module.exports = { computeMockTestScore };
