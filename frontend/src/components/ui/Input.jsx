import { createContext, useContext, useState } from 'react'

/* ================================================================
   INPUT COMPOUND COMPONENT
   ================================================================ */

const InputContext = createContext(null)

export function InputProvider({ children, label, error, hint, required = false }) {
  const value = { label, error, hint, required }
  return <InputContext.Provider value={value}>{children}</InputContext.Provider>
}

export function useInput() {
  return useContext(InputContext)
}

/* Input Group */
export function InputGroup({ children, className = '' }) {
  return <div className={`input-group ${className}`}>{children}</div>
}

/* Input Label */
export function InputLabel({ children, htmlFor, className = '' }) {
  const { required } = useInput()
  
  return (
    <label 
      htmlFor={htmlFor} 
      className={`input-label ${required ? 'input-label--required' : ''} ${className}`}
    >
      {children}
    </label>
  )
}

/* Text Input */
export function Input({ 
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props 
}) {
  const inputClass = [
    'input',
    error ? 'input--error' : '',
    type === 'search' ? 'input--search' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <input
      type={type}
      id={id || name}
      name={name}
      className={inputClass}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
  )
}

/* Textarea */
export function Textarea({ 
  id,
  name,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  disabled = false,
  className = '',
  ...props 
}) {
  const inputClass = [
    'input',
    error ? 'input--error' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <textarea
      id={id || name}
      name={name}
      className={inputClass}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  )
}

/* Error Message */
export function InputError({ children, id, className = '' }) {
  if (!children) return null
  
  return (
    <span id={id} className={`input-error-message ${className}`} role="alert">
      {children}
    </span>
  )
}

/* Hint Text */
export function InputHint({ children, id, className = '' }) {
  if (!children) return null
  
  return (
    <span id={id} className={`input-hint ${className}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
      {children}
    </span>
  )
}

/* Search Input with Button */
export function SearchInput({ 
  value,
  onChange,
  onSubmit,
  placeholder = 'Tìm kiếm...',
  className = '',
  ...props 
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`input-group ${className}`} role="search">
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label="Tìm kiếm"
        {...props}
      />
    </form>
  )
}

/* ================================================================
   EXPORTS
   ================================================================ */

const InputCompound = {
  Provider: InputProvider,
  Group: InputGroup,
  Label: InputLabel,
  Input: Input,
  Textarea: Textarea,
  Error: InputError,
  Hint: InputHint,
  Search: SearchInput,
}

export default InputCompound
