export const formatVnd = (value) => {
  if (value == null || isNaN(value)) return '0₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value) => {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const formatDate = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return value;
  }
};

export const formatDateTime = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export const truncate = (text, max = 120) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
};

export const placeholderBook = (name = 'Book') => {
  const initial = encodeURIComponent((name || 'B').trim().charAt(0).toUpperCase());
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 420'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0' stop-color='#7fb5a0'/>
          <stop offset='1' stop-color='#4d7866'/>
        </linearGradient>
      </defs>
      <rect width='300' height='420' fill='url(#g)'/>
      <text x='50%' y='50%' fill='#fff' font-family='serif' font-size='140' font-weight='700' text-anchor='middle' dominant-baseline='central'>${decodeURIComponent(initial)}</text>
    </svg>`
  )}`;
};

export const safeImage = (url, fallbackName) => {
  if (!url) return placeholderBook(fallbackName);
  return url;
};
