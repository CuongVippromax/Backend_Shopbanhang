import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminOrderApi, unwrapPage } from '../../api/shopApi';
import AdminTable from '../../components/admin/AdminTable';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatVnd, formatDateTime } from '../../utils/format';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPED', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
];

const STATUS_CLS = {
  PENDING: 'st-pending', PROCESSING: 'st-processing', SHIPPED: 'st-shipped',
  COMPLETED: 'st-completed', CANCELLED: 'st-cancelled',
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminOrderApi.list({ page, size: 12, search: search || undefined })
      .then((resp) => {
        const p = unwrapPage(resp);
        let list = p.items;
        if (status) list = list.filter((o) => o.orderStatus === status);
        setOrders(list);
        setPageInfo({ pageNo: (p.pageNo ?? page) + 1, totalPages: p.totalPages || 1 });
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, search, status]);

  useEffect(load, [load]);

  const columns = [
    { key: 'orderId', title: 'Mã', render: (r) => <strong>#{r.orderId}</strong>, width: 80 },
    { key: 'customer', title: 'Khách hàng', render: (r) => (
      <div>
        <strong>{r.fullName || r.recipientName}</strong>
        <div style={{ fontSize: 12, color: 'var(--color-text-mute)' }}>{r.recipientPhone}</div>
      </div>
    ) },
    { key: 'orderDate', title: 'Ngày đặt', render: (r) => formatDateTime(r.orderDate) },
    { key: 'totalAmount', title: 'Tổng tiền', render: (r) => formatVnd(r.totalAmount), align: 'right' },
    { key: 'orderStatus', title: 'Trạng thái', render: (r) => (
      <span className={`order-status ${STATUS_CLS[r.orderStatus] || ''}`}>{r.orderStatus}</span>
    ) },
    { key: 'paymentStatus', title: 'Thanh toán', render: (r) => (
      <span className={`pay-tag pay-${(r.paymentStatus || 'PENDING').toLowerCase()}`}>{r.paymentStatus}</span>
    ) },
    { key: 'actions', title: '', align: 'right', render: (r) => (
      <Link to={`/admin/orders/${r.orderId}`} className="btn btn-secondary btn-sm">Chi tiết</Link>
    ) },
  ];

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Danh sách đơn hàng từ khách hàng.</p>
        </div>
        <div className="adm-page-tools">
          <select className="form-control" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} style={{ width: 'auto' }}>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="adm-search">
            <Icon name="search" size={14} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Tìm theo mã, tên..." />
          </div>
        </div>
      </div>

      {loading ? <Spinner size={28} /> : (
        <>
          <AdminTable columns={columns} data={orders} rowKey="orderId" />
          <Pagination pageNo={pageInfo.pageNo} totalPages={pageInfo.totalPages} onChange={(p) => setPage(p - 1)} />
        </>
      )}

      <style>{`
        .adm-page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; gap: 14px; flex-wrap: wrap; }
        .adm-page-head h1 { font-family: var(--font-serif); font-size: 26px; margin: 0; }
        .adm-page-head p { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
        .adm-page-tools { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .adm-search { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
        .adm-search input { border: 0; outline: none; background: transparent; font-size: 14px; padding: 4px 0; min-width: 200px; }
        .order-status { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }
        .st-pending { background: var(--color-accent-bg); color: #8a6614; }
        .st-processing { background: #e3f2ff; color: #1962a8; }
        .st-shipped { background: var(--color-primary-bg); color: var(--color-primary); }
        .st-completed { background: #d8f0e2; color: #1d6c44; }
        .st-cancelled { background: var(--color-danger-soft); color: var(--color-danger); }
        .pay-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; }
        .pay-paid { background: #d8f0e2; color: #1d6c44; }
        .pay-pending { background: var(--color-accent-bg); color: #8a6614; }
        .pay-failed, .pay-cancelled { background: var(--color-danger-soft); color: var(--color-danger); }
      `}</style>
    </div>
  );
};

export default AdminOrdersPage;
