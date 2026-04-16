/* ================================================================
   BADGE COMPONENT
   ================================================================ */

/* Badge Component */
export function Badge({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) {
  const classes = [
    'badge',
    `badge--${variant}`,
    size !== 'md' ? `badge--${size}` : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

/* Sale Badge - Floating */
export function SaleBadge({ discount, className = '' }) {
  if (!discount) return null
  
  return (
    <span className={`badge badge--sale ${className}`}>
      -{discount}%
    </span>
  )
}

/* Status Badge */
export function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Chờ xử lý' },
    processing: { variant: 'info', label: 'Đang xử lý' },
    shipped: { variant: 'primary', label: 'Đang giao' },
    delivered: { variant: 'success', label: 'Đã giao' },
    cancelled: { variant: 'error', label: 'Đã hủy' },
    out_of_stock: { variant: 'error', label: 'Hết hàng' },
    low_stock: { variant: 'warning', label: 'Sắp hết' },
    in_stock: { variant: 'success', label: 'Còn hàng' },
  }

  const config = statusConfig[status] || { variant: 'default', label: status }
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

/* Count Badge */
export function CountBadge({ count, max = 99, className = '' }) {
  if (!count || count <= 0) return null
  
  const displayCount = count > max ? `${max}+` : count
  
  return (
    <span className={`badge badge--primary ${className}`}>
      {displayCount}
    </span>
  )
}

/* Tag Component */
export function Tag({ 
  children, 
  active = false,
  removable = false,
  onClick,
  onRemove,
  className = '',
  ...props 
}) {
  const classes = [
    'tag',
    active ? 'tag--active' : '',
    className
  ].filter(Boolean).join(' ')

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <span className={classes} onClick={handleClick} {...props}>
      {children}
      {removable && (
        <button 
          type="button" 
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          aria-label="Xóa"
          style={{ 
            marginLeft: '4px',
            padding: '2px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  )
}

/* ================================================================
   EXPORTS
   ================================================================ */

const BadgeCompound = {
  Badge,
  SaleBadge,
  StatusBadge,
  CountBadge,
  Tag,
}

export default BadgeCompound
