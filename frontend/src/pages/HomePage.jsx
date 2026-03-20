import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getBooks } from '../api/books.js'
import { ProductSection } from '../components/ProductCard.jsx'
import { CategoryBanner } from '../components/CategoryBanner.jsx'

function HeroBanner() {
  const sliderRef = useRef(null)

  const slides = [
    {
      id: 1,
      title: 'Tất cả sản phẩm',
      image: '/images/1.jpg',
      link: '/san-pham',
      theme: 'image',
    },
    {
      id: 2,
      title: 'Sách khoa học',
      image: '/images/2.jpg',
      link: '/san-pham?category=Khoa học',
      theme: 'image',
    },
    {
      id: 3,
      title: 'Truyện tranh',
      image: '/images/3.webp',
      link: '/san-pham?category=Truyện tranh',
      theme: 'image',
    },
  ]
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

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
    if (slides.length <= 1) return undefined
    setCurrent(0)
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(id)
  }, [slides.length])

  const currentSlide = slides[current]

  return (
    <section className="hero">
      <div className="hero__content">
        <span className="hero__label">HOANGKIMBOOKS</span>
        <h1>KIẾN TẠO 2026</h1>
        <p>
          Kho sách chọn lọc giúp bạn phát triển tư duy, kiến tạo tương lai
          bền vững.
        </p>
        <Link to="/san-pham" className="hero__cta">Khám phá ngay</Link>
      </div>
      <div className="hero__banner">
        {currentSlide && (
          <div
            ref={sliderRef}
            className={`hero-slider ${currentSlide.theme ? `hero-slider--${currentSlide.theme}` : ''}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            <div className="hero-slide">
              {currentSlide.image ? (
                <Link to={currentSlide.link} className="hero-banner-image-wrap">
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="hero-banner-image"
                  />
                </Link>
              ) : (
                <div className="hero-slide-info">
                  {currentSlide.tag && (
                    <span className="hero-slide-tag">{currentSlide.tag}</span>
                  )}
                  <h3>{currentSlide.title}</h3>
                  {currentSlide.subtitle && (
                    <p className="hero-slide-subtitle">{currentSlide.subtitle}</p>
                  )}
                  {currentSlide.description && (
                    <p className="hero-slide-description">{currentSlide.description}</p>
                  )}
                </div>
              )}
            </div>
            {slides.length > 1 && (
              <div className="hero-slider-dots">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    className={index === current ? 'active' : ''}
                    onClick={() => setCurrent(index)}
                    aria-label={`Banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

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
        // Gộp 2 mảng, ưu tiên random
        const combined = [...comicData, ...childrenData].sort(() => Math.random() - 0.5)
        setComicBooks(combined)
      })
      .catch(() => setComicBooks([]))
      .finally(() => setLoadingComic(false))
  }, [])

  return (
    <>
      <HeroBanner />
      <div className="main__content">
        <div className="main__sections" style={{ width: '100%' }}>
          <CategoryBanner
            categoryName="Sách bán chạy"
            tagline="Khám phá những cuốn sách được yêu thích nhất"
            books={bestSellerBooks}
            showBookCovers={!loadingBest && bestSellerBooks.length > 0}
            linkTo="/san-pham?sort=price:desc"
          />
          <ProductSection
            title="Sản phẩm bán chạy"
            highlight="Bán chạy"
            products={loadingBest ? [] : bestSellerBooks}
            initialVisibleCount={4}
          />

          <CategoryBanner
            categoryName="Sách hay"
            tagline="Gợi ý cho bạn những cuốn sách đặc biệt"
            books={featuredBooks}
            showBookCovers={!loadingFeatured && featuredBooks.length > 0}
            linkTo="/san-pham"
          />
          <ProductSection
            title="Sách hay"
            highlight="Hay"
            products={loadingFeatured ? [] : featuredBooks}
            initialVisibleCount={4}
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
          />

          <CategoryBanner
            categoryName="Truyện tranh & Thiếu nhi"
            tagline="Khám phá thế giới truyện tranh và sách dành cho thiếu nhi"
            books={comicBooks}
            showBookCovers={!loadingComic && comicBooks.length > 0}
            linkTo="/san-pham?category=Truyện tranh"
          />
          <ProductSection
            title="Truyện tranh & Thiếu nhi"
            highlight="Comic & Kids"
            products={loadingComic ? [] : comicBooks}
            initialVisibleCount={4}
          />
        </div>
      </div>
    </>
  )
}
