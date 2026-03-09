package com.cuong.shopbanhang.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Service
@RequiredArgsConstructor
@Slf4j(topic = "EmailService")
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Gửi email xác nhận đơn hàng
    public void sendOrderConfirmation(String toEmail, String orderId, Double totalAmount, String orderDetails) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đơn hàng #" + orderId);

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
                    "<p>Trân trọng,<br>ShopBanHang</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Order confirmation email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Error sending order confirmation email", e);
            throw new RuntimeException("Failed to send order confirmation email", e);
        }
    }

    // Gửi email reset password
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu - ShopBanHang");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif;'>" +
                    "<h2>Yêu cầu đặt lại mật khẩu</h2>" +
                    "<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui bấm vào link bên dưới:</p>" +
                    "<p><a href='http://localhost:3000/reset-password?token=" + resetToken + "' " +
                    "style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Đặt lại mật khẩu</a></p>" +
                    "<p>Link có hiệu lực trong 24 giờ.</p>" +
                    "<p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>" +
                    "<p>Trân trọng,<br>ShopBanHang</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Error sending password reset email", e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
