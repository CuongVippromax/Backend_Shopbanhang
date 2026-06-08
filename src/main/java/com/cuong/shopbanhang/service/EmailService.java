package com.cuong.shopbanhang.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.cuong.shopbanhang.exception.BadRequestException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Service
@RequiredArgsConstructor
@Slf4j(topic = "EmailService")
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Gửi email xác nhận đơn hàng.
     *
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - BadRequestException (1): Khi gửi email thất bại
     *
     * @param toEmail Email người nhận
     * @param orderId Mã đơn hàng
     * @param totalAmount Tổng số tiền
     * @param orderDetails Chi tiết đơn hàng (HTML)
     */
    @Async
    public void sendOrderConfirmation(String toEmail, String orderId, Double totalAmount, String orderDetails) {
        if (toEmail == null || toEmail.isBlank()) {
            log.error("Cannot send order confirmation: toEmail is empty for order {}", orderId);
            return;
        }
        try {
            log.info("Starting to send order confirmation email to {} for order {}", toEmail, orderId);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đơn hàng #" + orderId + " - Nhà Sách Hoàng Kim");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif;'>" +
                    "<h2>Xác nhận đơn hàng</h2>" +
                    "<p>Cảm ơn bạn đã đặt hàng! Đơn hàng #" + orderId + " đã được xác nhận.</p>" +
                    "<h3>Thông tin đơn hàng:</h3>" +
                    "<ul>" +
                    "<li><strong>Mã đơn hàng:</strong> " + orderId + "</li>" +
                    "<li><strong>Tổng tiền:</strong> " + String.format("%,.0f", totalAmount) + " VNĐ</li>" +
                    "</ul>" +
                    "<h3>Chi tiết sản phẩm:</h3>" +
                    orderDetails +
                    "<p>Chúng tôi sẽ sớm giao hàng cho bạn!</p>" +
                    "<p>Trân trọng,<br>Nhà Sách Hoàng Kim</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);

            log.debug("Sending email to {} with subject: {}", toEmail, helper.getMimeMessage().getSubject());
            javaMailSender.send(message);
            log.info("Successfully sent order confirmation email to {} for order {}", toEmail, orderId);
        } catch (MessagingException e) {
            log.error("MessagingException while sending email to {} for order {}: {}", toEmail, orderId, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected exception while sending email to {} for order {}: {}", toEmail, orderId, e.getMessage(), e);
        }
    }

    /**
     * Gửi email thông báo đổi mật khẩu thành công.
     * 
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - BadRequestException (1): Khi gửi email thất bại
     * 
     * @param toEmail Email người nhận
     * @param username Tên đăng nhập
     */
    public void sendPasswordChangeNotification(String toEmail, String username) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Thông báo thay đổi mật khẩu - Nhà Sách Hoàng Kim");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif;'>" +
                    "<h2>Thay đổi mật khẩu thành công</h2>" +
                    "<p>Xin chào <strong>" + username + "</strong>,</p>" +
                    "<p>Mật khẩu của bạn đã được thay đổi thành công.</p>" +
                    "<p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay.</p>" +
                    "<p>Trân trọng,<br>Nhà Sách Hoàng Kim</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send password change notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Gửi email đặt lại mật khẩu.
     *
     * EXCEPTIONS CÓ THỂ NÉM RA:
     * - BadRequestException (1): Khi gửi email thất bại
     *
     * @param toEmail Email người nhận
     * @param resetToken Token đặt lại mật khẩu (UUID), sẽ được nhúng vào URL frontend
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/auth/reset-password?token=" + resetToken;

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu - Nhà Sách Hoàng Kim");

            String htmlContent = "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#333;'>" +
                    "<table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%' style='background:#f5f5f5;padding:24px 0;'>" +
                    "<tr><td align='center'>" +
                    "<table role='presentation' cellspacing='0' cellpadding='0' border='0' width='560' style='background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.05);'>" +
                    "<tr><td style='background:#0f766e;padding:20px 24px;color:#fff;font-size:20px;font-weight:bold;'>Nhà Sách Hoàng Kim</td></tr>" +
                    "<tr><td style='padding:28px 24px;'>" +
                    "<h2 style='margin:0 0 12px 0;color:#111;font-size:20px;'>Yêu cầu đặt lại mật khẩu</h2>" +
                    "<p style='margin:0 0 16px 0;line-height:1.6;'>Xin chào,</p>" +
                    "<p style='margin:0 0 16px 0;line-height:1.6;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản này. Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới:</p>" +
                    "<p style='text-align:center;margin:28px 0;'>" +
                    "<a href='" + resetUrl + "' style='display:inline-block;background:#0f766e;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;'>Đặt lại mật khẩu</a>" +
                    "</p>" +
                    "<p style='margin:0 0 8px 0;line-height:1.6;font-size:13px;color:#666;'>Hoặc copy đường dẫn sau vào trình duyệt:</p>" +
                    "<p style='margin:0 0 20px 0;word-break:break-all;font-size:13px;color:#0f766e;'>" + resetUrl + "</p>" +
                    "<hr style='border:none;border-top:1px solid #eee;margin:20px 0;' />" +
                    "<p style='margin:0 0 8px 0;line-height:1.6;font-size:13px;color:#666;'><strong>Lưu ý bảo mật:</strong></p>" +
                    "<ul style='margin:0 0 16px 18px;padding:0;line-height:1.6;font-size:13px;color:#666;'>" +
                    "<li>Liên kết có hiệu lực trong <strong>24 giờ</strong>.</li>" +
                    "<li>Mỗi liên kết chỉ sử dụng được <strong>một lần</strong>.</li>" +
                    "<li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.</li>" +
                    "</ul>" +
                    "<p style='margin:24px 0 0 0;line-height:1.6;'>Trân trọng,<br/><strong>Đội ngũ Nhà Sách Hoàng Kim</strong></p>" +
                    "</td></tr>" +
                    "<tr><td style='background:#fafafa;padding:14px 24px;font-size:12px;color:#999;text-align:center;'>" +
                    "Email tự động — vui lòng không trả lời." +
                    "</td></tr>" +
                    "</table>" +
                    "</td></tr></table></body></html>";

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Sent password reset email to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new BadRequestException("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."); // EX-003
        }
    }
}
