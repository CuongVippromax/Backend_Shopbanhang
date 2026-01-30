import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ p }) {
  return (
    <div className="product-card">
      <div className="thumb">
        <img src={p.image} alt={p.productName} />
      </div>
      <div className="product-info">
        <h4 className="title">{p.productName}</h4>
        <div className="meta">
          <span className="price">{p.price.toLocaleString()} đ</span>
        </div>
      </div>
      <div className="actions">
        <Link className="btn" to={`/product/${p.productId}`}>Chi tiết</Link>
      </div>
    </div>
  )
}

