import React, { useEffect, useState, useCallback } from 'react';
import { adminUserApi, unwrapPage } from '../../api/shopApi';
import AdminTable from '../../components/admin/AdminTable';
import { Icon } from '../../components/common/Icon';
import { Spinner } from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNo: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminUserApi.list({ pageNo: page, pageSize: 12, search: search || undefined })
      .then((resp) => {
        const inner = resp?.data || resp;
        const p = unwrapPage(inner);
        setUsers(p.items);
        setPageInfo({ pageNo: p.pageNo || page, totalPages: p.totalPages || 1 });
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(load, [load]);

  const onRoleToggle = async (u) => {
    const next = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Chuyển ${u.username} sang vai trò ${next}?`)) return;
    try {
      await adminUserApi.updateRole(u.userId, next);
      toast.show('Đã cập nhật vai trò.', 'success');
      load();
    } catch (err) {
      toast.show('Không thể cập nhật.', 'error');
    }
  };

  const onRemove = async (u) => {
    if (!window.confirm(`Xoá tài khoản ${u.username}?`)) return;
    try {
      await adminUserApi.remove(u.userId);
      toast.show('Đã xoá người dùng.', 'info');
      load();
    } catch {
      toast.show('Không thể xoá.', 'error');
    }
  };

  const columns = [
    { key: 'username', title: 'Tài khoản', render: (r) => (
      <div>
        <strong>{r.username}</strong>
        <div style={{ fontSize: 12, color: 'var(--color-text-mute)' }}>{r.email}</div>
      </div>
    )},
    { key: 'fullName', title: 'Họ tên' },
    { key: 'phone', title: 'SĐT', render: (r) => r.phone || r.phoneNumber || '-' },
    { key: 'role', title: 'Vai trò', render: (r) => (
      <span className={`badge ${r.role === 'ADMIN' ? 'badge-accent' : ''}`}>{r.role}</span>
    ) },
    { key: 'actions', title: '', align: 'right', render: (r) => (
      <div style={{ display: 'inline-flex', gap: 6 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onRoleToggle(r)} title="Đổi vai trò">
          <Icon name="shield" size={14} />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onRemove(r)} style={{ color: 'var(--color-danger)' }}>
          <Icon name="trash" size={14} />
        </button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Tài khoản và phân quyền người dùng.</p>
        </div>
        <div className="adm-search">
          <Icon name="search" size={14} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên, email..." />
        </div>
      </div>

      {loading ? <Spinner size={28} /> : (
        <>
          <AdminTable columns={columns} data={users} rowKey="userId" />
          <Pagination pageNo={pageInfo.pageNo} totalPages={pageInfo.totalPages} onChange={setPage} />
        </>
      )}

      <style>{`
        .adm-page-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; gap: 14px; flex-wrap: wrap; }
        .adm-page-head h1 { font-family: var(--font-serif); font-size: 26px; margin: 0; }
        .adm-page-head p { color: var(--color-text-mute); font-size: 13.5px; margin: 4px 0 0; }
        .adm-search { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
        .adm-search input { border: 0; outline: none; background: transparent; font-size: 14px; padding: 4px 0; min-width: 220px; }
      `}</style>
    </div>
  );
};

export default AdminUsersPage;
