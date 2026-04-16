/* ================================================================
   SKELETON LOADING COMPONENTS
   ================================================================ */

/* Skeleton Base */
export function Skeleton({ 
  width, 
  height, 
  variant = 'rect', 
  className = '',
  style = {},
  ...props 
}) {
  const variantClass = variant === 'circle' ? 'skeleton--circle' : 'skeleton--rect'
  
  return (
    <div 
      className={`skeleton ${variantClass} ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  )
}

/* Skeleton Text */
export function SkeletonText({ 
  lines = 3, 
  className = '',
  lastLineWidth = '60%' 
}) {
  return (
    <div className={`skeleton-text-wrapper ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div 
          key={i} 
          className="skeleton skeleton--text"
          style={{ 
            width: i === lines - 1 ? lastLineWidth : '100%',
            marginBottom: i < lines - 1 ? '8px' : 0
          }}
        />
      ))}
    </div>
  )
}

/* Skeleton Title */
export function SkeletonTitle({ className = '' }) {
  return (
    <div 
      className={`skeleton skeleton--title ${className}`}
    />
  )
}

/* Skeleton Image */
export function SkeletonImage({ aspectRatio = '3/4', className = '' }) {
  return (
    <div 
      className={`skeleton skeleton--image ${className}`}
      style={{ aspectRatio }}
    />
  )
}

/* Skeleton Button */
export function SkeletonButton({ className = '' }) {
  return (
    <div className={`skeleton skeleton--button ${className}`} />
  )
}

/* Skeleton Card */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <SkeletonImage />
      <div className="skeleton-card__content">
        <Skeleton variant="rect" width="40%" height="16px" />
        <SkeletonTitle />
        <Skeleton variant="rect" width="80%" height="14px" />
        <Skeleton variant="rect" width="60%" height="14px" />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <SkeletonButton style={{ flex: 1 }} />
          <SkeletonButton style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  )
}

/* Skeleton List */
export function SkeletonList({ count = 4, className = '' }) {
  return (
    <div className={`skeleton-list ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/* ================================================================
   LOADING SPINNER
   ================================================================ */

export function Spinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  }
  
  const spinnerSize = sizeMap[size] || sizeMap.md

  return (
    <svg 
      className={`spinner ${className}`}
      width={spinnerSize} 
      height={spinnerSize} 
      viewBox="0 0 24 24"
      aria-label="Đang tải..."
      role="status"
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
        opacity="0.25" 
      />
      <path 
        d="M12 2a10 10 0 0 1 10 10" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
      >
        <animateTransform 
          attributeName="transform" 
          type="rotate" 
          from="0 12 12" 
          to="360 12 12" 
          dur="1s" 
          repeatCount="indefinite" 
        />
      </path>
    </svg>
  )
}

/* Full Page Loader */
export function PageLoader({ message = 'Đang tải...' }) {
  return (
    <div 
      className="page-loader"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px',
        color: 'var(--text-muted)'
      }}
    >
      <Spinner size="lg" />
      <span style={{ fontSize: 'var(--text-sm)' }}>{message}</span>
    </div>
  )
}

/* ================================================================
   EXPORTS
   ================================================================ */

const SkeletonCompound = {
  Skeleton,
  Text: SkeletonText,
  Title: SkeletonTitle,
  Image: SkeletonImage,
  Button: SkeletonButton,
  Card: SkeletonCard,
  List: SkeletonList,
  Spinner,
  PageLoader,
}

export default SkeletonCompound
