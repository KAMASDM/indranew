// Accept both legacy ISO strings and Firestore Timestamp values.
export function toDate(value) {
  if (value == null || value === '') return null;
  let date;
  if (typeof value.toDate === 'function') date = value.toDate();
  else if (typeof value.seconds === 'number') date = new Date(value.seconds * 1000);
  else date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const formatDate = value => toDate(value)?.toLocaleDateString('en-IN') || 'N/A';
export const formatTime = value => toDate(value)?.toLocaleTimeString('en-IN') || '';
export const dateInput = value => {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : '';
};

export function imageUrls(value) {
  return [...new Set((Array.isArray(value) ? value : [value])
    .map(image => typeof image === 'string' ? image : image?.url)
    .filter(url => typeof url === 'string' && url.trim()))];
}

export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export const createCsv = rows => rows.map(row => row.map(csvCell).join(',')).join('\r\n');

export function downloadCsv(filename, rows) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', createCsv(rows)], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function animationValue(target, progress) {
  return Math.round(target * Math.min(1, Math.max(0, progress)));
}

export function donationAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 1 && amount <= 10000000 && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001
    ? amount : null;
}
