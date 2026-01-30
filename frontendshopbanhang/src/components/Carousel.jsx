import React from 'react'

const slides = [
  { id: 1, title: 'Sale up to 45%', color: '#f44336' },
  { id: 2, title: 'New Year New Reads', color: '#4caf50' },
  { id: 3, title: 'Hot Deals Today', color: '#2196f3' }
]

export default function Carousel() {
  return (
    <div className="carousel hero">
      <div className="hero-inner">Bật mode săn sale - Ngập tràn quà tặng</div>
    </div>
  )
}

