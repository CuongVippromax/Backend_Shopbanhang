import React, { useState, useEffect } from 'react';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api';
import { useToast } from './Toast';
import './AddressManager.css';

export default function AddressManager({ onSelectAddress, selectionMode = false }) {
  const { success, error: showError } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    address: '',
    isDefault: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      const list = data?.data || data || [];
      setAddresses(list);
    } catch (err) {
      console.error('Error loading addresses:', err);
      showError('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        success('Cập nhật địa chỉ thành công!');
      } else {
        await addAddress(form);
        success('Thêm địa chỉ thành công!');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ label: '', recipientName: '', phone: '', address: '', isDefault: false });
      loadAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      showError(err.message || 'Lưu địa chỉ thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label || '',
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      isDefault: addr.isDefault || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await deleteAddress(id);
      success('Xóa địa chỉ thành công!');
      loadAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      showError(err.message || 'Xóa địa chỉ thất bại!');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      success('Đặt địa chỉ mặc định thành công!');
      loadAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      showError(err.message || 'Cập nhật thất bại!');
    }
  };

  const handleSelect = (addr) => {
    if (selectionMode && onSelectAddress) {
      onSelectAddress(addr);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ label: '', recipientName: '', phone: '', address: '', isDefault: false });
  };

  if (loading) {
    return <div className="address-loading">Đang tải địa chỉ...</div>;
  }

  return (
    <div className="address-manager">
      <div className="address-header">
        <h3>📍 Địa chỉ giao hàng</h3>
        {!selectionMode && (
          <button className="btn-add-address" onClick={() => setShowForm(true)}>
            + Thêm địa chỉ mới
          </button>
        )}
      </div>

      {showForm && (
        <form className="address-form" onSubmit={handleSubmit}>
          <h4>{editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h4>
          
          <div className="form-group">
            <label>Tên địa chỉ (VD: Nhà riêng, Công ty)</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({...form, label: e.target.value})}
              placeholder="VD: Nhà riêng"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tên người nhận</label>
              <input
                type="text"
                value={form.recipientName}
                onChange={(e) => setForm({...form, recipientName: e.target.value})}
                placeholder="Họ và tên"
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                placeholder="0xxx xxx xxx"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ chi tiết</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              rows={3}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({...form, isDefault: e.target.checked})}
              />
              Đặt làm địa chỉ mặc định
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Hủy
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="no-addresses">
          <p>Chưa có địa chỉ nào.</p>
          <button className="btn-add-address" onClick={() => setShowForm(true)}>
            + Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`address-card ${addr.isDefault ? 'default' : ''} ${selectionMode ? 'selectable' : ''}`}
              onClick={() => handleSelect(addr)}
            >
              {addr.isDefault && <span className="default-badge">Mặc định</span>}
              
              <div className="address-info">
                <div className="address-label">{addr.label || 'Địa chỉ'}</div>
                <div className="address-recipient">
                  <strong>{addr.recipientName}</strong> | {addr.phone}
                </div>
                <div className="address-detail">{addr.address}</div>
              </div>

              {!selectionMode && (
                <div className="address-actions">
                  <button className="btn-action" onClick={(e) => { e.stopPropagation(); handleEdit(addr); }}>
                    Sửa
                  </button>
                  {!addr.isDefault && (
                    <button className="btn-action" onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }}>
                      Đặt mặc định
                    </button>
                  )}
                  <button className="btn-action btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}>
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
