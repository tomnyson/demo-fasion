import { FREE_SHIP_MIN_ITEMS, SHIPPING_FEE } from '@/config/commerce'
import { formatVnd } from '@/lib/format'

export interface PolicySection {
  readonly id: 'bao-mat' | 'van-chuyen' | 'doi-hang' | 'thanh-toan' | 'huong-dan-mua-hang'
  readonly title: string
  readonly paragraphs: readonly string[]
}

export const POLICY_SECTIONS: readonly PolicySection[] = Object.freeze([
  {
    id: 'bao-mat',
    title: 'Chính sách bảo mật',
    paragraphs: [
      'Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, số điện thoại, địa chỉ nhận hàng và ghi chú của bạn.',
      'Thông tin của bạn không được bán hoặc chia sẻ cho bên thứ ba, ngoại trừ đơn vị vận chuyển khi cần giao hàng.',
      'Bạn có thể yêu cầu xoá thông tin cá nhân bất cứ lúc nào bằng cách liên hệ qua email hoặc hotline trên trang Liên hệ.',
    ],
  },
  {
    id: 'van-chuyen',
    title: 'Chính sách vận chuyển và giao nhận',
    paragraphs: [
      'Đơn hàng được giao toàn quốc, thời gian dự kiến từ hai đến năm ngày làm việc tuỳ khu vực.',
      `Phí vận chuyển đồng giá ${formatVnd(SHIPPING_FEE)} cho mỗi đơn. Đơn từ ${FREE_SHIP_MIN_ITEMS} sản phẩm trở lên được miễn phí vận chuyển.`,
      'Bạn được kiểm tra ngoại quan và số lượng sản phẩm khi nhận hàng. Nếu có sai lệch, vui lòng báo ngay cho chúng tôi trong ngày nhận.',
    ],
  },
  {
    id: 'doi-hang',
    title: 'Quy định đổi hàng',
    paragraphs: [
      'Sản phẩm được đổi size hoặc đổi mẫu trong vòng bảy ngày kể từ ngày nhận nếu còn nguyên tem, chưa giặt và chưa qua sử dụng.',
      'Sản phẩm lỗi do nhà sản xuất được đổi mới hoặc hoàn tiền, chi phí vận chuyển do chúng tôi chịu.',
      'Hàng giảm giá được áp dụng quy định đổi như hàng nguyên giá. Đồ lót và phụ kiện đã mở bao bì không được đổi vì lý do vệ sinh.',
    ],
  },
  {
    id: 'thanh-toan',
    title: 'Phương thức thanh toán',
    paragraphs: [
      'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản ngân hàng. Chưa hỗ trợ thanh toán trực tuyến bằng thẻ.',
      'Khi chọn chuyển khoản, bạn thanh toán sau khi đặt hàng theo thông tin tài khoản hiển thị ở trang xác nhận đơn.',
      'Sau khi chuyển khoản, vui lòng ghi mã đơn hàng trong nội dung để chúng tôi đối soát nhanh hơn.',
    ],
  },
  {
    id: 'huong-dan-mua-hang',
    title: 'Hướng dẫn mua hàng',
    paragraphs: [
      'Chọn sản phẩm bạn thích, chọn size và màu rồi bấm thêm vào giỏ hàng. Bạn có thể tham khảo bảng size ở trang sản phẩm trước khi chọn.',
      'Vào giỏ hàng để kiểm tra số lượng, sau đó bấm thanh toán, điền họ tên, số điện thoại, địa chỉ và chọn COD hoặc chuyển khoản.',
      'Sau khi đặt hàng, bạn nhận mã đơn hàng ngay trên màn hình. Cần hỗ trợ thêm, hãy liên hệ hotline hoặc nhắn qua Zalo, Messenger.',
    ],
  },
])
