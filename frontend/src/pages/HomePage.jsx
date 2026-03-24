import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getBooks } from '../api/books.js'
import { ProductSection, ProductCardSkeleton } from '../components/ProductCard.jsx'
import { CategoryBanner } from '../components/CategoryBanner.jsx'

/* ================================================================
   ICONS
   ================================================================ */

const Icons = {
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  Star: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  Book: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  Sparkles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"></path>
      <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z"></path>
      <path d="M19 13l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"></path>
    </svg>
  ),
  Child: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
}

/* ================================================================
   HERO BANNER COMPONENT
   ================================================================ */

function HeroBanner() {
  const sliderRef = useRef(null)

  const slides = [
    {
      id: 1,
      title: 'Khám phá sách hay',
      image: '/images/1.jpg',
      link: '/san-pham',
      theme: 'image',
    },
    {
      id: 2,
      title: 'Những cuốn sách không nên bỏ lỡ',
      image: '/images/2.png',
      link: '/sach-hay',
      theme: 'image',
    },
    {
      id: 3,
      title: 'Truyện tranh',
      image: '/images/3.webp',
      link: '/truyen-tranh-thieu-nhi',
      theme: 'image',
    },
  ]

  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  /** Chỉ tạm dừng khi tab ẩn (tiết kiệm pin); không pause khi hover — trước đây hover cả section khiến auto-slide tắt hẳn */
  const [tabVisible, setTabVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  )

  const minSwipeDistance = 50

  // Mouse drag support for desktop
  const onMouseDown = (e) => {
    setIsDragging(true)
    setTouchEnd(null)
    setTouchStart(e.clientX)
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    setTouchEnd(e.clientX)
  }

  const onMouseUp = () => {
    if (!isDragging || !touchStart || !touchEnd) {
      setIsDragging(false)
      return
    }
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      setCurrent((prev) => (prev + 1) % slides.length)
    }
    if (isRightSwipe) {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    }
    setIsDragging(false)
  }

  const onMouseLeave = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleTouchStart = (e) => {
      setTouchEnd(null)
      setTouchStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e) => {
      setTouchEnd(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return
      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > minSwipeDistance
      const isRightSwipe = distance < -minSwipeDistance
      if (isLeftSwipe) {
        setCurrent((prev) => (prev + 1) % slides.length)
      }
      if (isRightSwipe) {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
      }
    }

    slider.addEventListener('touchstart', handleTouchStart, { passive: true })
    slider.addEventListener('touchmove', handleTouchMove, { passive: true })
    slider.addEventListener('touchend', handleTouchEnd)

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart)
      slider.removeEventListener('touchmove', handleTouchMove)
      slider.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStart, touchEnd, slides.length])

  useEffect(() => {
    const onVis = () => setTabVisible(typeof document !== 'undefined' ? !document.hidden : true)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || !tabVisible) return undefined
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => clearInterval(id)
  }, [slides.length, tabVisible])

  const goToSlide = (index) => {
    setCurrent(index)
  }

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  const currentSlide = slides[current]

  return (
    <section className="hero-banner" aria-roledescription="carousel" aria-label="Banner trang chủ">
      <div className="hero-banner__track" ref={sliderRef}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-banner__slide ${index === current ? 'hero-banner__slide--active' : ''}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {slide.image ? (
              <Link to={slide.link} className="hero-banner__image-wrap">
                <img src={slide.image} alt={slide.title} className="hero-banner__image" />
                <div className="hero-banner__overlay" />
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button className="hero-banner__arrow hero-banner__arrow--prev" onClick={goToPrev} aria-label="Banner trước">
            <Icons.ChevronLeft />
          </button>
          <button className="hero-banner__arrow hero-banner__arrow--next" onClick={goToNext} aria-label="Banner tiếp">
            <Icons.ChevronRight />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="hero-banner__dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-banner__dot ${index === current ? 'hero-banner__dot--active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content Overlay */}
      <div className="hero-banner__content">
        <div className="hero-banner__text">
          <span className="hero-banner__label">NHÀ SÁCH HOÀNG KIM</span>
          <h1 className="hero-banner__title">{currentSlide.title}</h1>
          <p className="hero-banner__desc">
            Kho sách chọn lọc giúp bạn phát triển tư duy, kiến tạo tương lai bền vững.
          </p>
          <Link to={currentSlide.link} className="hero-banner__cta">
            Khám phá ngay
            <Icons.ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   FEATURES SECTION
   ================================================================ */

function FeaturesSection() {
  const features = [
    {
      id: 'bestseller',
      to: '/san-pham?sortBy=price:desc',
      title: 'Bestseller',
      desc: 'Top sách bán chạy nhất',
      icon: <Icons.TrendingUp />,
      variant: 'bestseller',
      ariaLabel: 'Bestseller — Top sách bán chạy nhất. Mở trang sản phẩm, sắp xếp theo giá cao đến thấp.',
    },
    {
      id: 'new-books',
      to: '/sach-moi',
      title: 'Sách mới',
      desc: 'Cập nhật liên tục',
      icon: <Icons.Sparkles />,
      variant: 'new',
      ariaLabel: 'Sách mới phát hành — cập nhật liên tục',
    },
    {
      id: 'kids',
      to: '/truyen-tranh-thieu-nhi',
      title: 'Thiếu nhi',
      desc: 'Truyện tranh & sách giáo dục',
      icon: <Icons.Child />,
      variant: 'kids',
      ariaLabel: 'Truyện tranh và thiếu nhi — sách giáo dục cho trẻ',
    },
  ]

  return (
    <section className="features-section" aria-labelledby="features-section-heading">
      <h2 id="features-section-heading" className="visually-hidden">
        Lối tắt danh mục
      </h2>
      <div className="features-section__grid">
        {features.map((feature) => (
          <Link
            key={feature.id}
            to={feature.to}
            className={`feature-card feature-card--${feature.variant}`}
            aria-label={feature.ariaLabel}
          >
            <div className="feature-card__icon" aria-hidden>
              {feature.icon}
            </div>
            <div className="feature-card__content">
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__desc">{feature.desc}</p>
            </div>
            <div className="feature-card__arrow" aria-hidden>
              <Icons.ChevronRight />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ================================================================
   HOME PAGE COMPONENT
   ================================================================ */

export default function HomePage() {
  const [bestSellerBooks, setBestSellerBooks] = useState([])
  const [newBooks, setNewBooks] = useState([])
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [comicBooks, setComicBooks] = useState([])
  const [loadingBest, setLoadingBest] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingComic, setLoadingComic] = useState(true)

  useEffect(() => {
    setLoadingBest(true)
    setLoadingNew(true)
    setLoadingFeatured(true)
    setLoadingComic(true)

    // Sách bán chạy: lấy nhiều sách, shuffle rồi lấy 20 cuốn ngẫu nhiên
    getBooks({ pageNo: 1, pageSize: 30, sortBy: 'price:desc' })
      .then((res) => {
        const allBooks = Array.isArray(res?.data) ? res.data : []
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
        setBestSellerBooks(shuffled.slice(0, 20))
      })
      .catch(() => setBestSellerBooks([]))
      .finally(() => setLoadingBest(false))

    // Sách mới: sắp xếp theo bookId giảm dần
    getBooks({ pageNo: 1, pageSize: 12, sortBy: 'bookId:desc' })
      .then((res) => setNewBooks(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setNewBooks([]))
      .finally(() => setLoadingNew(false))

    // Sách hay: lấy nhiều sách rồi random 20 cuốn
    getBooks({ pageNo: 1, pageSize: 30 })
      .then((res) => {
        const allBooks = Array.isArray(res?.data) ? res.data : []
        const shuffled = [...allBooks].sort(() => Math.random() - 0.5)
        setFeaturedBooks(shuffled.slice(0, 20))
      })
      .catch(() => setFeaturedBooks([]))
      .finally(() => setLoadingFeatured(false))

    // Truyện tranh & Thiếu nhi: lọc theo 2 category
    Promise.all([
      getBooks({ pageNo: 1, pageSize: 6, category: 'Truyện tranh' }),
      getBooks({ pageNo: 1, pageSize: 6, category: 'Thiếu nhi' })
    ])
      .then(([comics, children]) => {
        const comicData = Array.isArray(comics?.data) ? comics.data : []
        const childrenData = Array.isArray(children?.data) ? children.data : []
        const combined = [...comicData, ...childrenData].sort(() => Math.random() - 0.5)
        setComicBooks(combined)
      })
      .catch(() => setComicBooks([]))
      .finally(() => setLoadingComic(false))
  }, [])

  return (
    <>
      <HeroBanner />
      <FeaturesSection />
      <div className="main__content">
        <div className="main__sections" style={{ width: '100%' }}>
          <CategoryBanner
            categoryName="Sách bán chạy"
            tagline="Khám phá những cuốn sách được yêu thích nhất"
            books={bestSellerBooks}
            showBookCovers={!loadingBest && bestSellerBooks.length > 0}
            linkTo="/san-pham?sortBy=price:desc"
          />
          <ProductSection
            title="Sản phẩm bán chạy"
            highlight="Bán chạy"
            products={loadingBest ? [] : bestSellerBooks}
            initialVisibleCount={4}
            linkTo="/san-pham?sortBy=price:desc"
          />

          <CategoryBanner
            categoryName="Sách hay"
            tagline="Gợi ý cho bạn những cuốn sách đặc biệt"
            books={featuredBooks}
            showBookCovers={!loadingFeatured && featuredBooks.length > 0}
            linkTo="/sach-hay"
          />
          <ProductSection
            title="Sách hay"
            highlight="Hay"
            products={loadingFeatured ? [] : featuredBooks}
            initialVisibleCount={4}
            linkTo="/sach-hay"
          />

          <CategoryBanner
            categoryName="Sách mới"
            tagline="Những đầu sách mới nhất từ tủ sách Hoàng Kim"
            books={newBooks}
            showBookCovers={!loadingNew && newBooks.length > 0}
            linkTo="/sach-moi"
          />
          <ProductSection
            title="Sách mới"
            highlight="Mới"
            products={loadingNew ? [] : newBooks}
            initialVisibleCount={4}
            linkTo="/sach-moi"
          />

          <CategoryBanner
            categoryName="Truyện tranh & Thiếu nhi"
            tagline="Khám phá thế giới truyện tranh và sách dành cho thiếu nhi"
            books={comicBooks}
            showBookCovers={!loadingComic && comicBooks.length > 0}
            linkTo="/truyen-tranh-thieu-nhi"
          />
          <ProductSection
            title="Truyện tranh & Thiếu nhi"
            highlight="Comic & Kids"
            products={loadingComic ? [] : comicBooks}
            initialVisibleCount={4}
            linkTo="/truyen-tranh-thieu-nhi"
          />
        </div>
      </div>
    </>
  )
}
