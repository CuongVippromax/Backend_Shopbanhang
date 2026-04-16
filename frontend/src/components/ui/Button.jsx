import { createContext, useContext, useState, useCallback } from 'react'

/* ================================================================
   BUTTON COMPOUND COMPONENT
   ================================================================ */

const ButtonContext = createContext(null)

export function ButtonProvider({ 
  children, 
  size = 'md', 
  variant = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button'
}) {
  const value = {
    size,
    variant,
    isLoading,
    disabled: disabled || isLoading,
    fullWidth,
    onClick,
    type
  }

  return (
    <ButtonContext.Provider value={value}>
      {children}
    </ButtonContext.Provider>
  )
}

export function useButton() {
  const context = useContext(ButtonContext)
  if (!context) {
    throw new Error('Button components must be used within ButtonProvider')
  }
  return context
}

/* Base Button Component */
export function Button({ children, className = '', ...props }) {
  const { size, variant, disabled, fullWidth, isLoading, onClick, type } = useButton()
  
  const baseClasses = 'btn'
  const variantClass = `btn--${variant}`
  const sizeClass = size !== 'md' ? `btn--${size}` : ''
  const widthClass = fullWidth ? 'btn--full' : ''
  const loadingClass = isLoading ? 'btn--loading' : ''
  
  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    widthClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="btn__spinner" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      )}
      {children}
    </button>
  )
}

/* Icon Button */
export function IconButton({ children, className = '', label, ...props }) {
  return (
    <Button className={`btn--icon ${className}`} {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </Button>
  )
}

/* ================================================================
   EXPORTS
   ================================================================ */

const ButtonCompound = {
  Provider: ButtonProvider,
  Root: Button,
  Icon: IconButton,
}

export default ButtonCompound
