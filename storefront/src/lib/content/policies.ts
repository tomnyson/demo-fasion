export interface PolicySection {
  readonly id: 'bao-mat' | 'giao-nhan' | 'doi-tra' | 'thanh-toan'
  readonly title: string
  readonly paragraphs: readonly string[]
}

export const POLICY_SECTIONS: readonly PolicySection[] = Object.freeze([
  {
    id: 'bao-mat',
    title: 'Chính sách bảo mật',
    paragraphs: [
      'Chúng tôi chỉ thu thập thông tin cần thiết để xử lý đơn hàng và báo giá: họ tên, số điện thoại, địa chỉ nhận hàng và nội dung yêu cầu.',
      'Thông tin của bạn không được bán hoặc chia sẻ cho bên thứ ba, ngoại trừ đơn vị vận chuyển khi cần giao hàng.',
      'Bạn có thể yêu cầu xoá thông tin cá nhân bất cứ lúc nào bằng cách liên hệ qua email hoặc hotline trên trang Liên hệ.',
    ],
  },
  {
    id: 'giao-nhan',
    title: 'Chính sách giao nhận và kiểm hàng',
    paragraphs: [
      'Đơn hàng có sẵn được giao toàn quốc, thời gian dự kiến từ hai đến năm ngày làm việc tuỳ khu vực.',
      'Đơn thiết kế theo yêu cầu được giao sau khi hoàn tất sản xuất. Thời gian cụ thể được xác nhận trong báo giá.',
      'Bạn được kiểm tra ngoại quan và số lượng sản phẩm khi nhận hàng. Nếu có sai lệch, vui lòng báo ngay cho chúng tôi trong ngày nhận.',
    ],
  },
  {
    id: 'doi-tra',
    title: 'Chính sách đổi trả',
    paragraphs: [
      'Hàng có sẵn được đổi size hoặc đổi mẫu trong vòng bảy ngày nếu sản phẩm còn nguyên tem, chưa giặt và chưa qua sử dụng.',
      'Sản phẩm lỗi do nhà sản xuất được đổi mới hoặc hoàn tiền, chi phí vận chuyển do chúng tôi chịu.',
      'Hàng in tên, số hoặc thiết kế riêng chỉ được đổi khi lỗi thuộc về sản xuất, vì sản phẩm được làm riêng cho đội của bạn.',
    ],
  },
  {
    id: 'thanh-toan',
    title: 'Chính sách thanh toán',
    paragraphs: [
      'Chúng tôi hỗ trợ thanh toán khi nhận hàng và chuyển khoản ngân hàng. Chưa hỗ trợ thanh toán trực tuyến bằng thẻ.',
      'Với đơn thiết kế theo yêu cầu, bạn đặt cọc theo thoả thuận trong báo giá và thanh toán phần còn lại khi nhận hàng.',
      'Sau khi chuyển khoản, vui lòng ghi mã đơn hàng trong nội dung để chúng tôi đối soát nhanh hơn.',
    ],
  },
])
