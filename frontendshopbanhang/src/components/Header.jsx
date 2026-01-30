import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="left">
          <Link to="/" className="logo">Shopbanhang</Link>
        </div>

        <div className="center">
          <form className="search-form" onSubmit={(e)=>e.preventDefault()}>
            <input className="search-input" placeholder="Tìm kiếm sách, sản phẩm..." />
            <button className="search-btn" type="submit">Tìm</button>
          </form>
        </div>

        <div className="right">
          <nav className="top-nav">
            <Link to="/products">Sản phẩm</Link>
            <Link to="/categories">Danh mục</Link>
            <Link to="/cart" className="cart-link">Giỏ hàng</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

