import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { fetchProducts, fetchCategories } from '../services/mockApi'

export default function CategoryPage() {
  const { id } = useParams()
  const [products, setProducts] = useState([])
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    fetchCategories().then(cats => {
      const cat = cats.find(c => String(c.categoryId) === id)
      setCategoryName(cat ? cat.categoryName : '')
    })
    fetchProducts().then(ps => setProducts(ps.filter(p => String(p.categoryId) === id || p.category === id || true)))
  }, [id])

  // simple filter by categoryName
  const filtered = products.filter(p => p.category === categoryName)

  return (
    <div>
      <h2>Category: {categoryName || 'All'}</h2>
      <div className="product-grid">
        {filtered.map(p => <ProductCard key={p.productId} p={p} />)}
      </div>
    </div>
  )
}

