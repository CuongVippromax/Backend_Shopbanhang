// BACKUP - Order Header Card (OrderDetailPage.js) - Saved at 2026-05-14
// Lưu ý: Đây là code gốc TRƯỚC KHI CHỈNH SỬA

/*
        {/* Order Header Card - CODE GỐC *\/}
        <div className="order-header-card">
          <div className="order-header-left">
            <h1>Đơn hàng #{order.orderId}</h1>
            <p className="order-date">Ngày đặt: {formatDate(order.orderDate)}</p>
            <div className="order-badges">
              <span className={`payment-badge payment-${order.paymentStatus}`}>
                {paymentLabels[order.paymentStatus] || order.paymentStatus}
              </span>
              {order.orderStatus === 'CANCELLED' && (
                <span className="order-status status-CANCELLED">Đã hủy</span>
              )}
            </div>
          </div>
          <div className="order-header-right">
            <div className="total-amount">
              <span className="total-label">Tổng tiền</span>
              <span className="total-value">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
*/
