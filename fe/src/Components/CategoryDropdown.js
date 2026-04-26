import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CategoryDropdown.css';

const CategoryDropdown = ({ categories, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!categories || categories.length === 0) {
    return (
      <div className="category-dropdown">
        <div className="dropdown-content">
          <div className="dropdown-loading">Đang tải danh mục...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-dropdown">
      <div className="dropdown-content">
        <div className="dropdown-column">
          {categories.map((cat) => (
            <div
              key={cat.categoryId || cat.id}
              className={`dropdown-item ${activeCategory === cat.categoryId ? 'active' : ''}`}
              onMouseEnter={() => setActiveCategory(cat.categoryId)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link 
                to={`/cua-hang?categoryId=${cat.categoryId}`} 
                className="dropdown-link"
                onClick={onClose}
              >
                <span className="cat-name">{cat.categoryName}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown;
