import React from 'react';

export const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, className = '' }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    cart: <><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
    heart: <path d="M12 21s-7-4.5-9.5-9C.7 8.7 2.7 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.3 0 5.3 3.7 3.5 7-2.5 4.5-9.5 9-9.5 9z" />,
    menu: <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>,
    x: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    star: <path d="M12 3l2.7 5.5L20.5 9l-4.2 4.1 1 5.9L12 16.8 6.7 19l1-5.9L3.5 9l5.8-.5L12 3z" />,
    book: <><path d="M3 5a2 2 0 0 1 2-2h6v18H5a2 2 0 0 1-2-2V5z" /><path d="M21 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 0 2-2V5z" /></>,
    package: <><path d="M3 8 12 4l9 4-9 4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></>,
    chat: <path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.3-3.9-.8L3 21l1.6-4.4C3.6 15.2 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="m22 2-11 11" /></>,
    location: <><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2L8 9.7a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17.3 17.3 0 0 1-3.4 4.3" /><path d="M6.6 6.6A17 17 0 0 0 2 12s4 6 10 6c1.6 0 3-.4 4.2-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    trash: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="m6 6 1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></>,
    edit: <><path d="M14 4l6 6" /><path d="M4 20h6L20.5 9.5a2 2 0 0 0-3-3L4 18v2z" /></>,
    check: <path d="m5 12 5 5 9-12" />,
    arrow: <><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></>,
    arrowLeft: <><path d="M19 12H5" /><path d="m11 19-6-7 6-7" /></>,
    filter: <path d="M3 5h18l-7 9v6l-4-2v-4z" />,
    sort: <><path d="M7 4v16" /><path d="m3 8 4-4 4 4" /><path d="M17 20V4" /><path d="m13 16 4 4 4-4" /></>,
    google: <><path d="M21.6 12.2c0-.6-.1-1.3-.2-1.8H12v3.6h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" stroke="none" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0 0 12 22z" stroke="none" fill="#34A853"/><path d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3a10 10 0 0 0 0 8.8l3.4-2.6z" stroke="none" fill="#FBBC04"/><path d="M12 5.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3 7.6l3.4 2.6C7.2 7.2 9.4 5.4 12 5.4z" stroke="none" fill="#EA4335"/></>,
    facebook: <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 3h-2.3v7A10 10 0 0 0 22 12z" />,
    youtube: <><path d="M22 12s0-3.5-.4-5a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7C2 8.5 2 12 2 12s0 3.5.4 5a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-5 .4-5z" /><path d="m10 9 5 3-5 3z" /></>,
    sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
    truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></>,
    medal: <><circle cx="12" cy="15" r="6" /><path d="m8 8 1-5h6l1 5" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
    receipt: <><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
};

export default Icon;
