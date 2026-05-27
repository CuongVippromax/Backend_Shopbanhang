import React, { useEffect, useState, useCallback } from 'react';
import { adminReviewApi, unwrapPage } from '../../api/shopApi';
import AdminTable from '../../components/admin/AdminTable';
import { Icon } from '../../components/common/Icon';
import { Rating } from '../../components/common/Rating';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatDate, truncate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState('');
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminReviewApi.list({ page, size: 12, rating: rating || undefined })
      .then((resp) => {
        const p = unwrapPage(resp);
        setReviews(p.items);
        setPageInfo({ pageNo: p.pageNo || page, totalPages: p.totalPages || 1 });
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [page, rating]);

  useEffect(load, [load]);

  const onRemove = async (r) => {
    if (!window.confirm('Xoá đánh giá này?')) return;
    try {
      await adminReviewApi.remove(r.reviewId);
      toast.show('Đã xoá.', 'info');
      load();
    } catch {
      toast.show('Không thể xoá.', 'error');
    }
  };

  const columns = [
    { key: 'book', title: 'Sản phẩm', render: (r) => <strong>{r.bookName || r.bookTitle}</strong> },
    { key: 'user', title: 'Người đánh giá', render: (r) => r.username || r.userName || r.reviewerName },
    { key: 'rating', title: 'Sao', render: (r) => <Rating value={r.rating} size={12} /> },
    { key: 'comment', title: 'Nội dung', render: (r) => truncate(r.comment || r.content, 80) },
    { key: 'date', title: 'Ngày', render: (r) => formatDate(r.createdAt || r.reviewDate) },
    { key: 'actions', title: '', align: 'right', render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={() => onRemove(r)} style={{ color: 'var(--color-danger)' }}>
        <Icon name="trash" size={14} />
      </button>
    ) },
  ];

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Quản lý đánh giá</h1>
          <p>Xem và kiểm duyệt nội dung đánh giá của khách hàng.</p>
        </div>
        <select className="form-control" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }} style={{ width: 'auto' }}>
          <option value="">Tất cả mức sao</option>
          {[5, 4, 3, 2, 1].map((s) => <option value={s} key={s}>{s} sao</option>)}
        </select>
      </div>

      {loading ? <Spinner size={28} /> : (
        <>
          <AdminTable columns={columns} data={reviews} rowKey="reviewId" />
          <Pagination pageNo={pageInfo.pageNo} totalPages={pageInfo.totalPages} onChange={setPage} />
        </>
      )}

      <style>{`
        .adm-page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; gap: 14px; flex-wrap: wrap; }
        .adm-page-head h1 { font-family: var(--font-serif); font-size: 26px; margin: 0; }
        .adm-page-head p { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
      `}</style>
    </div>
  );
};

export default AdminReviewsPage;
