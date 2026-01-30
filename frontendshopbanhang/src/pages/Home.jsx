import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '../services/mockApi'
import Carousel from '../components/Carousel'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts().then(setProducts)
    fetchCategories().then(setCategories)
  }, [])

  return (
    <div>
      <Carousel />

      <section className="categories">
        {categories.map(c => (
          <a key={c.categoryId} className="category-chip" href={`/category/${c.categoryId}`}>{c.categoryName}</a>
        ))}
      </section>

      <section className="product-grid">
        {products.map(p => <ProductCard key={p.productId} p={p} />)}
      </section>
    </div>
  )
}

