const test = require('node:test');
const assert = require('node:assert/strict');
const { formatSiteContent } = require('../src/services/homeService');

test('trả về settings rỗng và sections rỗng khi không có dữ liệu', () => {
  const result = formatSiteContent([], []);
  assert.deepEqual(result.settings, {});
  assert.deepEqual(Object.values(result.sections).flat(), []);
});

test('gom settings theo Key/Value', () => {
  const result = formatSiteContent(
    [
      { Key: 'center_name', Value: 'Trung Tâm ABC' },
      { Key: 'contact_phone', Value: '0123456789' }
    ],
    []
  );
  assert.equal(result.settings.center_name, 'Trung Tâm ABC');
  assert.equal(result.settings.contact_phone, '0123456789');
});

test('lọc IsActive=false và sắp xếp theo SortOrder tăng dần', () => {
  const result = formatSiteContent([], [
    { Id: 1, Section: 'promo_slide', SortOrder: 2, Title: 'Slide 2', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: true },
    { Id: 2, Section: 'promo_slide', SortOrder: 1, Title: 'Slide 1', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: true },
    { Id: 3, Section: 'promo_slide', SortOrder: 0, Title: 'Slide ẩn', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: false }
  ]);
  assert.equal(result.sections.promo_slide.length, 2);
  assert.equal(result.sections.promo_slide[0].title, 'Slide 1');
  assert.equal(result.sections.promo_slide[1].title, 'Slide 2');
});

test('parse ExtraData là JSON hợp lệ, trả null nếu JSON hỏng', () => {
  const result = formatSiteContent([], [
    { Id: 1, Section: 'promo_slide', SortOrder: 0, Title: 'A', Subtitle: null, Body: null, ImageUrl: null, ExtraData: '{"code":"ABC20"}', IsActive: true },
    { Id: 2, Section: 'promo_slide', SortOrder: 1, Title: 'B', Subtitle: null, Body: null, ImageUrl: null, ExtraData: 'not-json', IsActive: true }
  ]);
  assert.equal(result.sections.promo_slide[0].extraData.code, 'ABC20');
  assert.equal(result.sections.promo_slide[1].extraData, null);
});

test('bỏ qua Section không thuộc danh sách hợp lệ thay vì lỗi', () => {
  const result = formatSiteContent([], [
    { Id: 9, Section: 'unknown_section', SortOrder: 0, Title: 'x', Subtitle: null, Body: null, ImageUrl: null, ExtraData: null, IsActive: true }
  ]);
  assert.deepEqual(Object.values(result.sections).flat(), []);
});
