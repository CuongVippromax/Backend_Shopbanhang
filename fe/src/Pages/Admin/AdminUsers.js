import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../api';
import './AdminUsers.css';

const ROLE_VI = {
  ADMIN: 'Quản trị',
  USER: 'Người dùng',
  STAFF: 'Nhân viên'
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [roleConfirmModal, setRoleConfirmModal] = useState({ show: false, userId: null, newRole: null, message: '' });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 10,
        keyword: searchTerm || undefined,
        role: roleFilter || undefined
      };
      const response = await getAllUsers(params);
      
      // Backend returns DataResponse<PageResponse<List<UserResponse>>>
      // response.data contains PageResponse, response.data.data contains List<UserResponse>
      const pageResponse = response?.data;
      if (pageResponse) {
        setTotalPages(pageResponse.totalPages || 0);
        setTotalElements(pageResponse.totalElements || 0);
        setUsers(pageResponse.data || []);
      } else {
        setUsers([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setRoleConfirmModal({
      show: true,
      userId,
      newRole,
      message: `Bạn có chắc muốn thay đổi vai trò người dùng thành "${ROLE_VI[newRole]}"?`
    });
  };

  const handleConfirmRoleChange = async () => {
    const { userId, newRole } = roleConfirmModal;
    setRoleConfirmModal({ show: false, userId: null, newRole: null, message: '' });
    
    if (!userId || !newRole) return;
    
    setUpdatingRole(userId);
    try {
      await updateUserRole(userId, newRole);
      alert('Cập nhật vai trò thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Cập nhật thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUser(userToDelete.userId || userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Xóa thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const getRoleClass = (role) => {
    const roleMap = {
      ADMIN: 'role-admin',
      STAFF: 'role-staff',
      USER: 'role-user'
    };
    return roleMap[role] || 'role-user';
  };

  return (
    <div className="admin-users">
      <div className="users-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="filter-select"
          >
            <option value="">Tất cả vai trò</option>
            {Object.entries(ROLE_VI).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="toolbar-info">
          <span className="total-count">Tổng: {totalElements} người dùng</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có người dùng nào</p>
        </div>
      ) : (
        <>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.userId || user.id}>
                    <td>{page * 10 + index + 1}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {(user.name || user.username || 'U')[0].toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user.name || user.username}</span>
                          {user.email && <span className="user-email">{user.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>{user.phone || user.phoneNumber || '-'}</td>
                    <td>
                      <select
                        value={user.role || user.roles?.[0] || 'USER'}
                        onChange={(e) => handleRoleChange(user.userId || user.id, e.target.value)}
                        disabled={updatingRole === (user.userId || user.id)}
                        className={`role-select ${getRoleClass(user.role || user.roles?.[0])}`}
                      >
                        {Object.entries(ROLE_VI).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => confirmDelete(user)}
                        className="btn-delete"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="page-btn"
              >
                ««
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="page-btn"
              >
                «
              </button>
              <span className="page-info">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="page-btn"
              >
                »»
              </button>
            </div>
          )}
        </>
      )}

      {/* Role Change Confirmation Modal */}
      {roleConfirmModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận</h3>
            <p>{roleConfirmModal.message}</p>
            <div className="modal-actions">
              <button 
                onClick={() => setRoleConfirmModal({ show: false, userId: null, newRole: null, message: '' })} 
                className="btn-cancel"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmRoleChange} 
                className="btn-confirm-role"
                disabled={updatingRole === roleConfirmModal.userId}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa người dùng "{userToDelete?.name || userToDelete?.username}"?</p>
            <p className="warning">Hành động này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn-cancel"
                disabled={deleting}
              >
                Hủy
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-confirm-delete"
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
