package com.cuong.shopbanhang.config;

import com.cuong.shopbanhang.model.Faq;
import com.cuong.shopbanhang.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FaqDataSeeder implements CommandLineRunner {

    private final FaqRepository faqRepository;

    @Override
    public void run(String... args) {
        if (faqRepository.count() > 0) {
            return; // Da co du lieu, khong seed lai
        }

        List<Faq> faqs = List.of(
                // CHINH_SACH
                Faq.builder()
                        .question("Chính sách đổi trả sách như thế nào?")
                        .answer("Hoàng Kim Book hỗ trợ đổi trả sách trong vòng 7 ngày kể từ ngày nhận hàng nếu sách bị lỗi in, rách trang, thiếu trang hoặc giao sai sách. Sách đổi trả phải còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ phiếu mua hàng. Quý khách vui lòng liên hệ hotline 1900 1234 để được hướng dẫn chi tiết.")
                        .category("CHINH_SACH")
                        .keywords("doi tra, tra hang, doi hang, khong vua, bao hanh, loi, hu hong")
                        .sortOrder(1)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Thời gian giao hàng bao lâu?")
                        .answer("Hoàng Kim Book giao hàng từ 2-5 ngày làm việc đối với nội thành TP.HCM và Hà Nội, từ 4-7 ngày đối với các tỉnh thành khác. Đơn hàng trên 500.000đ được miễn phí vận chuyển toàn quốc. Thời gian giao hàng có thể thay đổi vào các dịp lễ, Tết hoặc do điều kiện thời tiết.")
                        .category("CHINH_SACH")
                        .keywords("giao hang, van chuyen, bao lau, ngay, thoi gian, du tien, phi ship, mien phi")
                        .sortOrder(2)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Làm sao để theo dõi đơn hàng?")
                        .answer("Sau khi đặt hàng thành công, bạn sẽ nhận được email và SMS xác nhận kèm mã đơn hàng. Bạn có thể theo dõi trạng thái đơn hàng tại trang 'Đơn hàng' trong tài khoản của mình. Nếu có thắc mắc, hãy gọi hotline 1900 1234.")
                        .category("CHINH_SACH")
                        .keywords("theo doi, trang thai, truy van, xem don, ma don, order")
                        .sortOrder(3)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Tôi có thể hủy đơn hàng không?")
                        .answer("Bạn có thể hủy đơn hàng trước khi đơn được xác nhận 'Đang xử lý'. Truy cập trang 'Đơn hàng', chọn đơn cần hủy và nhấn 'Hủy đơn'. Nếu đơn đã chuyển sang trạng thái 'Đang giao', bạn vui lòng liên hệ hotline để được hỗ trợ. Đơn đã thanh toán online sẽ được hoàn tiền trong 5-7 ngày làm việc.")
                        .category("CHINH_SACH")
                        .keywords("huy don, huy, cancel, huy don hang")
                        .sortOrder(4)
                        .active(true)
                        .build(),

                // TAI_KHOAN
                Faq.builder()
                        .question("Quên mật khẩu thì làm sao?")
                        .answer("Tại trang đăng nhập, nhấn 'Quên mật khẩu', nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email trong vòng 5 phút. Nếu không nhận được email, hãy kiểm tra hộp thư spam hoặc liên hệ hotline 1900 1234.")
                        .category("TAI_KHOAN")
                        .keywords("quen mat khau, reset password, khoi phuc mat khau, lay lai mat khau, forgot password")
                        .sortOrder(5)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Làm sao để đổi mật khẩu?")
                        .answer("Đăng nhập vào tài khoản, vào trang 'Tài khoản' > nhấn 'Đổi mật khẩu'. Nhập mật khẩu hiện tại và mật khẩu mới (ít nhất 8 ký tự). Nhấn 'Lưu' để cập nhật. Đảm bảo mật khẩu mới khác mật khẩu cũ.")
                        .category("TAI_KHOAN")
                        .keywords("doi mat khau, change password, mat khau moi, cap nhat mat khau")
                        .sortOrder(6)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Đăng ký tài khoản như thế nào?")
                        .answer("Nhấn 'Đăng ký' ở góc phải màn hình, điền họ tên, email và mật khẩu (ít nhất 8 ký tự). Sau khi đăng ký, hệ thống sẽ gửi email xác thực. Nhấn link trong email để kích hoạt tài khoản và bắt đầu mua sắm.")
                        .category("TAI_KHOAN")
                        .keywords("dang ky, register, tao tai khoan, tao tk, sign up, tao tai khoan moi")
                        .sortOrder(7)
                        .active(true)
                        .build(),

                // SAN_PHAM
                Faq.builder()
                        .question("Sách có được bọc plastic không?")
                        .answer("Hầu hết các đầu sách tại Hoàng Kim Book đều được đóng gói cẩn thận trong túi plastic hoặc hộp carton chống sốc. Một số sách hiếm hoặc sách cũ có thể không có vỏ bọc plastic. Thông tin chi tiết về tình trạng đóng gói được ghi chú trong trang sản phẩm.")
                        .category("SAN_PHAM")
                        .keywords("boc plastic, dong goi, quy cuon, bao bi, goi hang, dong goi san pham")
                        .sortOrder(8)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Làm sao biết sách còn hàng không?")
                        .answer("Trên trang chi tiết sản phẩm, bạn sẽ thấy thông báo 'Còn hàng' màu xanh hoặc 'Hết hàng' màu đỏ. Nếu sách hết hàng, bạn có thể để lại email để nhận thông báo khi sách được nhập về. Hoàng Kim Book cập nhật tồn kho theo thời gian thực.")
                        .category("SAN_PHAM")
                        .keywords("con hang, het hang, ton kho, available, in stock, out of stock, het hang")
                        .sortOrder(9)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Tôi muốn mua sách số lượng lớn?")
                        .answer("Hoàng Kim Book hỗ trợ bán sỉ với giá chiết khấu hấp dẫn cho đơn hàng từ 20 cuốn trở lên. Vui lòng liên hệ phòng kinh doanh qua email buysell@hoangkimbook.vn hoặc hotline 1900 1234 (giờ hành chính) để được báo giá riêng.")
                        .category("SAN_PHAM")
                        .keywords("mua nhieu, ban si, wholesale, so luong lon, mua buon, chiet khau, ban buon")
                        .sortOrder(10)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Sách mới nhất của nhà sách là gì?")
                        .answer("Hoàng Kim Book cập nhật sách mới liên tục hàng tuần. Bạn có thể xem danh sách sách mới nhất tại trang 'Sách mới' trên website hoặc truy cập trang chủ để xem mục sách mới. Đăng ký nhận newsletter để không bỏ lỡ các tựa sách mới.")
                        .category("SAN_PHAM")
                        .keywords("sach moi, new book, sach xuat ban, new release, dau sach moi, sach gan day")
                        .sortOrder(11)
                        .active(true)
                        .build(),

                // DON_HANG
                Faq.builder()
                        .question("Tôi chưa nhận được đơn hàng?")
                        .answer("Nếu đơn hàng đã quá thời gian giao hàng dự kiến mà bạn chưa nhận được, vui lòng kiểm tra lại địa chỉ giao hàng trong 'Đơn hàng của tôi'. Gọi hotline 1900 1234 hoặc nhắn tin qua Zalo OA Hoàng Kim Book để được kiểm tra và hỗ trợ nhanh nhất.")
                        .category("DON_HANG")
                        .keywords("chua nhan duoc, tre han, chua den, giao cham, chua nhan hang, chua nhan duoc hang")
                        .sortOrder(12)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Cần làm gì khi nhận sai sách?")
                        .answer("Khi nhận hàng, quý khách vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán. Nếu nhận sai sách hoặc thiếu sách, hãy chụp ảnh và liên hệ hotline 1900 1234 trong vòng 24 giờ. Chúng tôi sẽ sắp xếp đổi/trả và giao lại đúng sách cho bạn trong thời gian sớm nhất.")
                        .category("DON_HANG")
                        .keywords("sai sach, nhan sai, loi, sai lam, thieu sach, giao sai, khac san pham")
                        .sortOrder(13)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Tôi có thể thanh toán bằng những cách nào?")
                        .answer("Hoàng Kim Book hỗ trợ các hình thức thanh toán: 1) Thanh toán khi nhận hàng (COD). 2) Thẻ ATM/Visa/Mastercard qua cổng VNPay. 3) Ví điện tử (VNPay Wallet). 4) Chuyển khoản ngân hàng. Đơn hàng trên 1.000.000đ khuyến khích thanh toán online trước.")
                        .category("DON_HANG")
                        .keywords("thanh toan, thanh toan online, COD, chuyen khoan, the, Visa, thanh toan khi nhan hang")
                        .sortOrder(14)
                        .active(true)
                        .build(),

                // KHAC
                Faq.builder()
                        .question("Số điện thoại liên hệ là gì?")
                        .answer("Hotline hỗ trợ khách hàng: 1900 1234 (8:00 - 21:00, thứ 2 - thứ 7). Bạn cũng có thể liên hệ qua Zalo OA 'Hoàng Kim Book', email cskh@hoangkimbook.vn, hoặc chat trực tiếp trên website. Đội ngũ tư vấn sẵn sàng hỗ trợ 24/7 qua các kênh này.")
                        .category("KHAC")
                        .keywords("lien he, hotline, phone, goi dien, so dien thoai, ho tro, tu van, cskh")
                        .sortOrder(15)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Giờ làm việc của nhà sách?")
                        .answer("Hoàng Kim Book mở cửa từ 8:00 đến 21:00 các ngày thứ 2 đến thứ 7, và 9:00 đến 20:00 ngày Chủ nhật. Website hoangkimbook.vn hoạt động 24/7 — bạn có thể đặt hàng online mọi lúc, đơn hàng sẽ được xử lý và giao trong giờ làm việc.")
                        .category("KHAC")
                        .keywords("gio lam viec, gio mo cua, thoi gian mo cua, lam viec, van phong, ngay lam viec")
                        .sortOrder(16)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Nhà sách có cửa hàng trực tiếp không?")
                        .answer("Hoàng Kim Book có hệ thống 5 cửa hàng tại TP.HCM (quận 1, quận 3, quận Bình Thạnh) và Hà Nội (quận Hoàn Kiếm, quận Đống Đa). Xem địa chỉ chi tiết tại trang 'Liên hệ'. Bạn có thể đến trực tiếp để xem và mua sách, được hỗ trợ tư vấn tại chỗ.")
                        .category("KHAC")
                        .keywords("cua hang, dia chi, showroom, cua hang truc tiep, shop, store, dia chi cua hang")
                        .sortOrder(17)
                        .active(true)
                        .build(),

                Faq.builder()
                        .question("Cách đặt hàng trên website?")
                        .answer("Đặt hàng tại Hoàng Kim Book rất đơn giản: 1) Chọn sách và nhấn 'Thêm vào giỏ'. 2) Xem giỏ hàng, điều chỉnh số lượng nếu cần. 3) Nhấn 'Thanh toán', điền thông tin giao hàng. 4) Chọn phương thức thanh toán. 5) Nhấn 'Đặt hàng' — bạn sẽ nhận email xác nhận ngay lập tức.")
                        .category("KHAC")
                        .keywords("dat hang, mua hang, order, ordering, mua, dat mua, mua sach, order online")
                        .sortOrder(18)
                        .active(true)
                        .build()
        );

        faqRepository.saveAll(faqs);
        log.info("Da seed {} FAQ entries", faqs.size());
    }
}
