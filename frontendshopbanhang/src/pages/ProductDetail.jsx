import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProductById, fetchProducts } from '../services/mockApi'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)

  useEffect(() => {
    async function load() {
      const p = await fetchProductById(parseInt(id, 10))
      setProduct(p)
      const list = await fetchProducts()
      setRelated(list.filter(x => x.category === p?.category && x.productId !== p.productId).slice(0, 4))
    }
    load().catch(console.error)
  }, [id])

  if (!product) return <div>Product not found</div>

  return (
    <div className="product-detail-page">
      <div className="product-detail-grid">
        <div className="gallery">
          <div className="main-img"><img src={product.image} alt={product.productName} /></div>
          <div className="thumbs">
            <img src={product.image} alt="thumb1" />
            <img src={product.image} alt="thumb2" />
            <img src={product.image} alt="thumb3" />
          </div>
        </div>
        <aside className="product-aside">
          <h1>{product.productName}</h1>
          <div className="meta">
            <div className="price">{product.price.toLocaleString()} đ</div>
            <div className="stock">{product.quantity} in stock</div>
          </div>

          <div className="purchase">
            <label>Quantity:</label>
            <input type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value || 1)))} />
            <button className="btn">Thêm vào giỏ</button>
          </div>

          <div className="details">
            <h4>Mô tả sản phẩm</h4>
            <p>{product.description}</p>
          </div>
        </aside>
      </div>

      <section className="related">
        <h3>Sản phẩm liên quan</h3>
        <div className="product-grid">
          {related.map(p => (
            <div key={p.productId} style={{ width: 220 }}><img src={p.image} alt={p.productName} style={{ width: '100%', borderRadius: 8 }} /><div style={{ padding: 8 }}>{p.productName}</div></div>
          ))}
        </div>
      </section>
    </div>
  )
}

