export interface Post {
  readonly slug: string
  readonly title: string
  readonly excerpt: string
  readonly date: string
  readonly tag: string
  readonly image: string
  readonly body: readonly string[]
}

const POSTS: readonly Post[] = Object.freeze([
  {
    slug: 'chon-vai-ao-dong-phuc-doi-nhom',
    title: 'Cách chọn loại vải cho áo đồng phục đội nhóm',
    excerpt: 'Thun lạnh, thun mè hay microfiber: mỗi loại vải hợp với một môn và một mức ngân sách khác nhau.',
    date: '2026-11-10',
    tag: 'Chất liệu',
    image: 'https://picsum.photos/seed/vai-ao/800/500',
    body: [
      'Chất liệu quyết định cảm giác mặc của cả đội trong suốt trận đấu. Vải càng thoáng và thấm hút tốt thì người chơi càng ít bị bí và nặng áo.',
      'Thun lạnh nhẹ, mát và co giãn bốn chiều nên phù hợp cho bóng đá, bóng chuyền. Thun mè có bề mặt nhiều lỗ nhỏ, thoát mồ hôi nhanh và bền màu khi giặt nhiều.',
      'Nếu đội chơi ngoài trời nắng nhiều, hãy ưu tiên vải có khả năng khô nhanh. Với áo polo của doanh nghiệp, vải cá sấu cho cảm giác lịch sự và ít nhăn hơn.',
      'Trước khi đặt cả đội, bạn nên xin một mẫu vải nhỏ hoặc áo mặc thử để cảm nhận trực tiếp.',
    ],
  },
  {
    slug: 'cach-chot-size-khi-dat-ao-cho-ca-doi',
    title: 'Cách chốt size khi đặt áo cho cả đội',
    excerpt: 'Một bảng đo đơn giản giúp cả đội chọn đúng size ngay lần đầu và tránh phải đổi.',
    date: '2026-10-28',
    tag: 'Kích thước',
    image: 'https://picsum.photos/seed/chot-size/800/500',
    body: [
      'Đặt sai size là lý do phổ biến nhất khiến đơn đồng phục phải làm lại. Cách tốt nhất là cho từng thành viên tự đo hoặc mặc thử áo mẫu.',
      'Hãy đo vòng ngực và chiều dài thân áo mong muốn, sau đó đối chiếu với bảng size của sản phẩm. Nếu nằm giữa hai size, người chơi thích áo ôm nên chọn size nhỏ hơn.',
      'Lập một bảng tính ghi tên, số áo, size và vị trí thi đấu. Bảng này cũng là căn cứ để in tên và số chính xác.',
    ],
  },
  {
    slug: 'cac-phuong-phap-in-ten-so-tren-ao',
    title: 'So sánh các phương pháp in tên và số trên áo',
    excerpt: 'In chuyển nhiệt, in lụa và thêu: ưu nhược điểm và khi nào nên chọn từng loại.',
    date: '2026-10-15',
    tag: 'In ấn',
    image: 'https://picsum.photos/seed/in-ten-so/800/500',
    body: [
      'In chuyển nhiệt cho hình ảnh sắc nét, phù hợp với logo nhiều màu và số lượng ít. In lụa tiết kiệm hơn khi đặt số lượng lớn và có màu đồng nhất.',
      'Thêu tạo cảm giác cao cấp cho áo polo và áo khoác nhưng không phù hợp với chi tiết quá nhỏ hoặc vải mỏng co giãn.',
      'Với áo thi đấu, hãy chọn lớp in mỏng, mềm để không cản trở thoát mồ hôi của vải.',
    ],
  },
  {
    slug: 'thiet-ke-ao-doi-de-nhan-dien',
    title: 'Mẹo thiết kế áo đội dễ nhận diện trên sân',
    excerpt: 'Phối màu tương phản, số áo đủ lớn và logo gọn gàng giúp đội nổi bật hơn.',
    date: '2026-09-30',
    tag: 'Thiết kế',
    image: 'https://picsum.photos/seed/thiet-ke-ao/800/500',
    body: [
      'Một mẫu áo dễ nhận diện thường chỉ dùng hai đến ba màu chủ đạo. Màu quá nhiều sẽ làm số áo và logo bị rối mắt.',
      'Số áo phía sau nên cao ít nhất hai mươi lăm centimet và tương phản mạnh với màu nền để trọng tài và khán giả dễ đọc.',
      'Hãy chuẩn bị logo dạng vector nếu có. Tệp rõ nét giúp in ra sắc cạnh và tiết kiệm thời gian chỉnh sửa.',
    ],
  },
  {
    slug: 'bao-quan-ao-the-thao-ben-mau',
    title: 'Bảo quản áo thể thao để giữ màu và form áo',
    excerpt: 'Vài thói quen giặt phơi đơn giản giúp áo bền hơn qua nhiều mùa giải.',
    date: '2026-09-12',
    tag: 'Chăm sóc',
    image: 'https://picsum.photos/seed/bao-quan-ao/800/500',
    body: [
      'Lộn trái áo trước khi giặt để bảo vệ lớp in. Dùng nước lạnh hoặc nước ấm nhẹ và tránh chất tẩy mạnh.',
      'Không vắt xoắn và không sấy nhiệt cao vì có thể làm bong lớp in và biến dạng sợi vải.',
      'Phơi áo trong bóng râm, thoáng gió. Áo khô tự nhiên giữ form tốt hơn nhiều so với áo sấy.',
    ],
  },
  {
    slug: 'lich-san-xuat-dong-phuc-doi-nhom',
    title: 'Quy trình và thời gian sản xuất một đơn đồng phục',
    excerpt: 'Từ lúc gửi yêu cầu đến khi nhận hàng, đơn thường đi qua năm bước rõ ràng.',
    date: '2026-08-25',
    tag: 'Quy trình',
    image: 'https://picsum.photos/seed/quy-trinh/800/500',
    body: [
      'Sau khi nhận yêu cầu, bộ phận tư vấn gửi báo giá và mẫu thiết kế để bạn duyệt. Chỉ sau khi chốt mẫu và danh sách size, đơn mới được đưa vào sản xuất.',
      'Thời gian sản xuất phụ thuộc số lượng và độ phức tạp của thiết kế, thường từ bảy đến mười hai ngày làm việc.',
      'Bạn nên chốt mẫu sớm trước ngày thi đấu ít nhất hai tuần để còn thời gian xử lý nếu cần chỉnh sửa.',
    ],
  },
])

export function getPosts(): readonly Post[] {
  return POSTS
}

export function getPost(slug: string): Post | null {
  return POSTS.find((post) => post.slug === slug) ?? null
}
