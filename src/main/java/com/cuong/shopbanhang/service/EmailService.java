package com.cuong.shopbanhang.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
    public void sendOrderConfirmation(String toEmail, String orderId, Double totalAmount, String orderDetails) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đơn hàng - Nhà Sách Hoàng Kim" + orderId);

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
            javaMailSender.send(message);
        } catch (MessagingException e) {
            // EXCEPTION: BadRequestException - Khi gửi email thất bại
            throw new BadRequestException("Không thể gửi email xác nhận đơn hàng. Vui lòng thử lại sau."); // EX-003
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
     * @param resetToken Token đặt lại mật khẩu
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu - Nhà Sách Hoàng Kim");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif;'>" +
                    "<h2>Yêu cầu đặt lại mật khẩu</h2>" +
                    "<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui bấm vào link bên dưới:</p>" +
                    "<p><a href='http://localhost:3000/reset-password?token=" + resetToken + "' " +
                    "style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Đặt lại mật khẩu</a></p>" +
                    "<p>Link có hiệu lực trong 24 giờ.</p>" +
                    "<p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>" +
                    "<p>Trân trọng,<br>Nhà Sách Hoàng Kim</p>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new BadRequestException("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."); // EX-003
        }
    }
}
