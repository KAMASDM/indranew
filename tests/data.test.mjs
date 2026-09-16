import test from 'node:test';
import assert from 'node:assert/strict';
import { Timestamp } from 'firebase/firestore';
import { toDate, imageUrls, createCsv, animationValue, donationAmount, dateInput } from '../src/lib/data.mjs';
import { renderContent } from '../src/lib/content.mjs';

test('legacy dates and Firestore timestamps produce the same date', () => {
  const date = new Date('2026-01-02T12:00:00Z');
  for (const value of [date, date.toISOString(), Timestamp.fromDate(date), { seconds: date.getTime() / 1000 }]) {
    assert.equal(toDate(value).getTime(), date.getTime());
    assert.equal(dateInput(value), '2026-01-02');
  }
  for (const value of [undefined, null, '', 'invalid']) assert.equal(toDate(value), null);
});
test('media cleanup accepts strings, image objects and arrays without joining URLs', () => {
  assert.deepEqual(imageUrls(['a', { url: 'b' }, 'a', null, '', {}]), ['a', 'b']);
  assert.deepEqual(imageUrls('a'), ['a']);
});
test('CSV escapes commas, quotes, newlines and spreadsheet formulas', () => {
  assert.equal(createCsv([['a,b', 'a"b', 'a\nb', '=1+1']]), '"a,b","a""b","a\nb","\'=1+1"');
});
test('small impact counters reach their target within the animation duration', () => {
  for (const target of [5, 12, 25, 150, 200000]) {
    assert.equal(animationValue(target, 1), target);
    assert.equal(animationValue(target, 2), target);
    assert.equal(animationValue(target, 0), 0);
  }
});
test('donations reject invalid values and preserve paise', () => {
  for (const amount of ['', 0, -1, 'invalid', Infinity, '1.001', 10000001]) assert.equal(donationAmount(amount), null);
  assert.equal(donationAmount('250.50'), 250.5);
});
test('published content preserves formatting and strips executable HTML', () => {
  const html = renderContent('## Hello\n\n**World**\n\n<img src="https://example.com/a.jpg" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">bad</a>');
  assert.match(html, /<h2>Hello<\/h2>/);
  assert.match(html, /<strong>World<\/strong>/);
  assert.doesNotMatch(html, /onerror|script|alert\(/);
  assert.match(html, /https:\/\/example.com\/a.jpg/);
});
