import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiGet } from '../api/client'

export default function VNPayCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode')
    const orderId = localStorage.getItem('pendingOrderId') || searchParams.get('vnp_TxnRef')

    if (responseCode === '00') {
      // Gọi API backend để xác nhận thanh toán
      apiGet('/payment/vn-pay-callback?' + searchParams.toString())
        .then(() => {
          setStatus('success')
          localStorage.removeItem('pendingOrderId')
          setTimeout(() => {
            if (orderId) {
              navigate(`/don-hang/${orderId}`)
            } else {
              navigate('/don-hang')
            }
          }, 2000)
        })
        .catch((err) => {
          console.error('Payment callback error:', err)
          setStatus('failed')
        })
    } else {
      // Thanh toán thất bại: gọi backend để xóa đơn + khôi phục giỏ hàng, sau đó redirect về giỏ hàng
      apiGet('/payment/vn-pay-callback?' + searchParams.toString())
        .catch((err) => console.error('Payment callback error:', err))
        .finally(() => {
          setStatus('failed')
          localStorage.removeItem('pendingOrderId')
          navigate('/gio-hang?payment_failed=1', { replace: true })
        })
    }
  }, [searchParams, navigate])

  return (
    <div className="page-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      {status === 'processing' && (
        <>
          <div className="loading-spinner"></div>
          <p>Đang xử lý thanh toán...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✓</div>
          <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Thanh toán thành công!</h2>
          <p>Đang chuyển về trang chi tiết đơn hàng...</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✗</div>
          <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Thanh toán thất bại</h2>
          <p>Đang chuyển về giỏ hàng...</p>
        </>
      )}
    </div>
  )
}
