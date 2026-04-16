/* ================================================================
   CARD COMPOUND COMPONENT
   ================================================================ */

import { createContext, useContext } from 'react'

const CardContext = createContext(null)

export function CardProvider({ children, variant = 'default', className = '' }) {
  const value = { variant, className }
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}

export function useCard() {
  return useContext(CardContext)
}

/* Card Frame */
export function CardFrame({ children, className = '', onClick, ...props }) {
  const { variant } = useCard()
  const variantClass = variant !== 'default' ? `card--${variant}` : ''
  
  const classes = ['card', variantClass, className].filter(Boolean).join(' ')
  
  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

/* Card Image */
export function CardImage({ src, alt, className = '', aspectRatio = '3/4' }) {
  return (
    <div 
      className="card__image-wrapper" 
      style={{ aspectRatio }}
    >
      <img 
        src={src} 
        alt={alt} 
        className={`card__image ${className}`}
        loading="lazy"
      />
    </div>
  )
}

/* Card Body */
export function CardBody({ children, className = '' }) {
  return <div className={`card__body ${className}`}>{children}</div>
}

/* Card Header */
export function CardHeader({ children, className = '' }) {
  return <div className={`card__header ${className}`}>{children}</div>
}

/* Card Footer */
export function CardFooter({ children, className = '' }) {
  return <div className={`card__footer ${className}`}>{children}</div>
}

/* Card Title */
export function CardTitle({ children, as = 'h3', className = '' }) {
  const Tag = as
  return <Tag className={`card__title ${className}`}>{children}</Tag>
}

/* Card Description */
export function CardDescription({ children, className = '' }) {
  return <p className={`card__description ${className}`}>{children}</p>
}

/* ================================================================
   EXPORTS
   ================================================================ */

const Card = {
  Provider: CardProvider,
  Frame: CardFrame,
  Image: CardImage,
  Body: CardBody,
  Header: CardHeader,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
}

export default Card
