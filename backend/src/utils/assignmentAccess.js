// Bài chỉ làm/thấy được từ OpenAt. Trước đây OpenAt chỉ được lưu, không nơi nào kiểm tra.
const { Op } = require('sequelize');

const isAssignmentOpen = (assignment, now = new Date()) =>
  !assignment.OpenAt || new Date(assignment.OpenAt) <= now;

// Điều kiện Sequelize tương đương, dùng cho findAll.
const openNowFilter = (now = new Date()) => ({
  [Op.or]: [{ OpenAt: null }, { OpenAt: { [Op.lte]: now } }]
});

module.exports = { isAssignmentOpen, openNowFilter };
