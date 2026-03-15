import { Link } from 'react-router-dom'

/** Tagline mặc định theo từng danh mục (có thể mở rộng) */
const CATEGORY_TAGLINES = {
  'Khoa học': 'Khám phá thế giới qua lăng kính khoa học',
  'Truyện tranh': 'Thế giới truyện tranh đầy màu sắc',
  'Kinh tế': 'Tuyển tập sách hàng đầu cho giới doanh nhân',
  'Kinh tế - Tài chính': 'Tuyển tập sách hàng đầu cho giới doanh nhân',
  'Tư duy - Kỹ năng': 'Tư duy khác biệt để đột phá thành công',
  'Sách tư duy - Kỹ năng': 'Tư duy khác biệt để đột phá thành công',
  'Văn học': 'Những tác phẩm văn học đặc sắc',
  'Thiếu nhi': 'Sách hay cho bé',
  'Công nghệ': 'Cập nhật xu hướng công nghệ',
  'Lịch sử': 'Lịch sử và văn hóa',
}

const CATEGORY_TAGLINES_EXTRA = {
  'Tất cả sách': 'Khám phá toàn bộ tủ sách Hoàng Kim',
}

const DEFAULT_TAGLINE = 'Khám phá những cuốn sách hay trong danh mục'

export function CategoryBanner({ categoryName, tagline, books = [], showBookCovers = true, linkTo }) {
  const displayTitle = categoryName || 'Hoàng Kim'
  const displayTagline = tagline ?? CATEGORY_TAGLINES[displayTitle] ?? CATEGORY_TAGLINES_EXTRA[displayTitle] ?? DEFAULT_TAGLINE
  const covers = showBookCovers ? (books || []).slice(0, 6).filter((b) => b?.image) : []

  const textBlock = (
    <>
      <span className="category-banner__label">TỦ SÁCH</span>
      <h2 className="category-banner__title">{displayTitle.toUpperCase()}</h2>
      <p className="category-banner__tagline">{displayTagline}</p>
    </>
  )

  return (
    <div className="category-banner">
      <div className="category-banner__inner">
        <div className="category-banner__text">
          {linkTo ? (
            <Link to={linkTo} className="category-banner__text-link">
              {textBlock}
            </Link>
          ) : (
            textBlock
          )}
        </div>
        {covers.length > 0 && (
          <div className="category-banner__covers">
            {covers.map((book, index) => (
              <Link
                key={book.bookId || index}
                to={`/san-pham/${book.bookId}`}
                className="category-banner__cover"
                style={{ '--stack-offset': index }}
              >
                <img src={book.image} alt={book.bookName || ''} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
