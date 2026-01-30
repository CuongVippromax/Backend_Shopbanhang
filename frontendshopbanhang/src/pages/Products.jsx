import React, {useEffect, useState} from 'react'
import ProductCard from '../components/ProductCard'
import { fetchProducts } from '../services/mockApi'

export default function Products(){
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const perPage = 8

  useEffect(()=> {
    fetchProducts().then(data => setProducts(data))
  },[])

  const total = Math.ceil(products.length / perPage)
  const paged = products.slice((page-1)*perPage, page*perPage)

  return (
    <div>
      <h2>Products</h2>
      <div className="product-grid">
        {paged.map(p => <ProductCard key={p.productId} p={p} />)}
      </div>
      <div className="pagination">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span> Page {page} / {total} </span>
        <button disabled={page>=total} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  )
}

