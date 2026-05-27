import React from 'react';
import BookCard from './BookCard';

const BookGridSkeleton = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="book-skel">
        <div className="skel skel-img" />
        <div className="skel skel-line" />
        <div className="skel skel-line short" />
        <div className="skel skel-line tiny" />
        <style>{`
          .book-skel { display: flex; flex-direction: column; gap: 8px; }
          .skel-img { aspect-ratio: 3/4; }
          .skel-line { height: 14px; }
          .skel-line.short { width: 70%; }
          .skel-line.tiny { width: 40%; height: 12px; }
        `}</style>
      </div>
    ))}
  </>
);

const BookGrid = ({ books, loading, skeletonCount = 8, columns = 'auto' }) => {
  const cols = typeof columns === 'number' ? columns : 4;
  return (
    <div className="book-grid">
      {loading && <BookGridSkeleton count={skeletonCount} />}
      {!loading && books?.map((b) => (
        <BookCard key={b.bookId} book={b} />
      ))}
      <style>{`
        .book-grid {
          display: grid;
          grid-template-columns: repeat(${cols}, 1fr);
          gap: 22px;
        }
        @media (max-width: 720px) {
          .book-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 540px) {
          .book-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </div>
  );
};

export default BookGrid;
