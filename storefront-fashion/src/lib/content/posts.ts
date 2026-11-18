export type PostSection = 'tin-tuc' | 'thoi-trang'

export interface Post {
  readonly slug: string
  readonly section: PostSection
  readonly title: string
  readonly excerpt: string
  readonly date: string
  readonly tag: string
  readonly image: string
  readonly body: readonly string[]
}

export const POST_SECTIONS: Readonly<Record<PostSection, { readonly name: string; readonly path: string }>> =
  Object.freeze({
    'tin-tuc': Object.freeze({ name: 'Tin tức', path: '/tin-tuc' }),
    'thoi-trang': Object.freeze({ name: 'Thời trang', path: '/thoi-trang' }),
  })

const POSTS: readonly Post[] = Object.freeze([
  {
    slug: 'bo-suu-tap-moi-dam-vay-mua-he',
    section: 'tin-tuc',
    title: 'Bộ sưu tập mới: đầm và váy nhẹ cho những ngày nắng',
    excerpt: 'Lá Studio vừa cập nhật loạt đầm, váy chất liệu thoáng với gam màu trung tính dễ mặc.',
    date: '2026-11-10',
    tag: 'Hàng mới',
    image: 'https://picsum.photos/seed/bst-moi/800/500',
    body: [
      'Bộ sưu tập mới tập trung vào những thiết kế nhẹ nhàng, dễ mặc từ sáng đến tối: đầm suông, váy xếp ly và áo kiểu có phom rộng vừa phải.',
      'Bảng màu lấy cảm hứng từ sắc lá: trắng kem, xanh lá chuối, be và nâu đất. Các gam này dễ phối với nhau nên một vài món là đủ tạo nhiều bộ trang phục.',
      'Tất cả sản phẩm là hàng may sẵn, có đủ size từ S đến XXL. Bạn chọn size, thêm vào giỏ hàng và thanh toán khi nhận hàng hoặc chuyển khoản.',
    ],
  },
  {
    slug: 'cach-chon-size-khi-mua-do-online',
    section: 'tin-tuc',
    title: 'Cách chọn size khi mua đồ online để mặc vừa ngay lần đầu',
    excerpt: 'Ba số đo ngực, eo, mông và vài mẹo nhỏ giúp bạn chọn đúng size mà không cần thử.',
    date: '2026-10-28',
    tag: 'Kích thước',
    image: 'https://picsum.photos/seed/chon-size/800/500',
    body: [
      'Mua đồ online dễ vừa nhất khi bạn có sẵn ba số đo: vòng ngực, vòng eo và vòng mông. Đo sát người, đứng thẳng và không siết chặt thước.',
      'Đối chiếu số đo với bảng size ở trang sản phẩm. Nếu nằm giữa hai size, hãy chọn size lớn hơn với đầm suông và áo rộng, chọn size nhỏ hơn nếu bạn thích phom ôm.',
      'Nếu đặt xong mới thấy chưa vừa, bạn có thể đổi size theo quy định đổi hàng của cửa hàng.',
    ],
  },
  {
    slug: 'meo-bao-quan-do-vai-mem-khong-xu-form',
    section: 'tin-tuc',
    title: 'Mẹo giặt và bảo quản đồ vải mềm để không xù, không xô form',
    excerpt: 'Lộn trái, giặt nước lạnh và phơi trong bóng râm giúp quần áo giữ dáng qua nhiều lần mặc.',
    date: '2026-09-18',
    tag: 'Chăm sóc',
    image: 'https://picsum.photos/seed/bao-quan/800/500',
    body: [
      'Đồ vải mềm như voan, lụa tổng hợp hay thun mịn nên được lộn trái và cho vào túi giặt để hạn chế xù và móc sợi.',
      'Giặt bằng nước lạnh, chất tẩy nhẹ, không vắt xoắn. Đầm và váy nên được vắt nhẹ bằng khăn rồi phơi ngang hoặc treo trên móc có vai rộng.',
      'Tránh phơi trực tiếp dưới nắng gắt vì màu dễ phai. Khi ủi, dùng nhiệt thấp và ủi mặt trái.',
    ],
  },
  {
    slug: 'phoi-do-cong-so-voi-ba-mon-co-ban',
    section: 'thoi-trang',
    title: 'Phối đồ công sở với ba món cơ bản trong tủ',
    excerpt: 'Một chiếc sơ mi, một quần ống suông và một chân váy bút chì đủ cho cả tuần đi làm.',
    date: '2026-11-05',
    tag: 'Phối đồ',
    image: 'https://picsum.photos/seed/cong-so/800/500',
    body: [
      'Tủ đồ công sở gọn nhẹ bắt đầu từ ba món: áo sơ mi trắng, quần ống suông tối màu và chân váy bút chì. Từ đây bạn có thể ghép được nhiều bộ khác nhau.',
      'Thử đổi nhịp bằng phụ kiện: thắt lưng nhỏ, khăn lụa buộc cổ hoặc một đôi giày màu be. Những chi tiết này làm bộ đồ quen thuộc trông mới hơn.',
      'Chọn chất liệu ít nhăn và có độ đứng vừa phải để bạn vẫn gọn gàng sau cả ngày dài.',
    ],
  },
  {
    slug: 'chon-dam-hop-dang-nguoi',
    section: 'thoi-trang',
    title: 'Chọn đầm hợp dáng người: gợi ý cho từng vóc dáng',
    excerpt: 'Đầm xòe, đầm suông hay đầm ôm: mỗi kiểu tôn một vóc dáng khác nhau.',
    date: '2026-10-12',
    tag: 'Gợi ý',
    image: 'https://picsum.photos/seed/chon-dam/800/500',
    body: [
      'Với vóc dáng quả lê, đầm xòe từ eo giúp cân đối phần hông. Người có vai rộng nên chọn cổ chữ V hoặc cổ vuông để mềm hóa đường vai.',
      'Đầm suông phù hợp với hầu hết vóc dáng và đặc biệt thoải mái khi đi làm hay đi chơi cả ngày. Thêm thắt lưng nếu bạn muốn nhấn eo.',
      'Hãy chọn chiều dài đầm theo chiều cao: đầm qua gối cân đối cho người nhỏ nhắn, đầm dài chấm mắt cá tạo cảm giác thanh thoát cho người cao.',
    ],
  },
  {
    slug: 'xu-huong-mau-sac-thu-dong',
    section: 'thoi-trang',
    title: 'Gam màu dễ mặc cho mùa chuyển lạnh',
    excerpt: 'Xanh rêu, be, nâu caramel và trắng kem: các màu dễ phối và hợp làn da Á Đông.',
    date: '2026-09-20',
    tag: 'Xu hướng',
    image: 'https://picsum.photos/seed/mau-sac/800/500',
    body: [
      'Khi trời chuyển lạnh, những gam màu ấm và trầm lên ngôi: xanh rêu, be, nâu caramel và trắng kem. Chúng dễ phối với nhau mà vẫn có chiều sâu.',
      'Nếu ngại màu sắc, bạn có thể bắt đầu bằng phối hai màu cùng tông, ví dụ áo be với quần nâu nhạt, sau đó thêm một món xanh lá làm điểm nhấn.',
      'Giữ phần còn lại của bộ đồ đơn giản để món nổi bật được chú ý, và để phụ kiện cùng tông với một trong các màu chính.',
    ],
  },
])

export function getPosts(section?: PostSection): readonly Post[] {
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date))
  return section === undefined ? sorted : sorted.filter((post) => post.section === section)
}

export function getPost(slug: string): Post | null {
  return POSTS.find((post) => post.slug === slug) ?? null
}
