export const sampleServices = [
  {
    id: "svc-bath",
    name: "Tắm sạch, thơm lâu",
    slug: "tam-sach-thom-lau",
    category: "Spa & Grooming",
    icon: "bath",
    price: 180000,
    durationMinutes: 60,
    description:
      "Một buổi tắm thư giãn với sản phẩm dịu nhẹ, sấy khô kỹ và vệ sinh tai, móng. Để bé sạch sẽ, còn bạn yên tâm ôm thật lâu.",
    process: [
      "Trao đổi tình trạng da, lông của bé",
      "Tắm với sản phẩm phù hợp",
      "Sấy khô, chải lông và vệ sinh tai",
      "Cắt móng, kiểm tra trước khi đón bé",
    ],
    isActive: true,
  },
  {
    id: "svc-groom",
    name: "Một diện mạo mới",
    slug: "cat-tia-tao-kieu",
    category: "Spa & Grooming",
    icon: "scissors",
    price: 350000,
    durationMinutes: 90,
    description:
      "Tỉa gọn gàng hoặc tạo kiểu theo dáng mặt và chất lông. Chúng mình luôn ưu tiên sự thoải mái của bé trong suốt buổi chăm sóc.",
    process: [
      "Thống nhất kiểu dáng với ba mẹ",
      "Tắm, sấy và gỡ rối nhẹ nhàng",
      "Cắt tỉa theo đặc điểm của bé",
      "Hoàn thiện và hướng dẫn chăm sóc tại nhà",
    ],
    isActive: true,
  },
  {
    id: "svc-health",
    name: "Kiểm tra sức khỏe",
    slug: "kiem-tra-suc-khoe",
    category: "Sức khỏe",
    icon: "health",
    price: 250000,
    durationMinutes: 30,
    description:
      "Kiểm tra tổng quát và trao đổi về dinh dưỡng, vận động, lịch tiêm phòng. Trường hợp cần xét nghiệm hoặc điều trị sẽ được tư vấn riêng.",
    process: [
      "Ghi nhận tiền sử và biểu hiện gần đây",
      "Kiểm tra tổng quát",
      "Trao đổi kết quả và tư vấn",
      "Lên lịch theo dõi khi cần",
    ],
    isActive: true,
  },
  {
    id: "svc-nails",
    name: "Chăm chút đôi chân",
    slug: "cham-soc-mong",
    category: "Chăm sóc cơ bản",
    icon: "paw",
    price: 80000,
    durationMinutes: 30,
    description:
      "Cắt móng, làm sạch bàn chân và tỉa lông kẽ chân nhẹ nhàng, giúp bé chạy nhảy thoải mái hơn mỗi ngày.",
    process: [
      "Làm quen và kiểm tra bàn chân",
      "Cắt móng an toàn",
      "Tỉa gọn lông kẽ chân",
      "Vệ sinh và dưỡng đệm chân",
    ],
    isActive: true,
  },
];
export const sampleProducts = [
  {
    id: "prd-food",
    name: "Hạt cá hồi cho mèo trưởng thành",
    slug: "hat-ca-hoi-cho-meo",
    category: "Thức ăn",
    price: 285000,
    stock: 35,
    color: "peach",
    description:
      "Thức ăn khô vị cá hồi dành cho mèo trưởng thành. Túi 1,5 kg. Đổi thức ăn từ từ trong 7–10 ngày và luôn chuẩn bị nước sạch.",
    isActive: true,
  },
  {
    id: "prd-shampoo",
    name: "Sữa tắm dịu nhẹ Oat & Care",
    slug: "sua-tam-diu-nhe",
    category: "Vệ sinh",
    price: 195000,
    stock: 28,
    color: "sage",
    description:
      "Sữa tắm chăm sóc da và lông cho chó, mèo. Chai 250 ml. Tránh tiếp xúc mắt, tai và đọc kỹ hướng dẫn trên nhãn.",
    isActive: true,
  },
  {
    id: "prd-toy",
    name: "Đồ chơi vòng dây cotton",
    slug: "do-choi-vong-day",
    category: "Đồ chơi",
    price: 89000,
    stock: 42,
    color: "butter",
    description:
      "Vòng dây cotton mềm cho những giờ chơi cùng chó. Chọn kích cỡ phù hợp, quan sát khi chơi và thay khi bị sờn rách.",
    isActive: true,
  },
  {
    id: "prd-bowl",
    name: "Bát ăn gốm Everyday",
    slug: "bat-an-gom",
    category: "Phụ kiện",
    price: 165000,
    stock: 20,
    color: "lilac",
    description:
      "Bát gốm màu kem, dung tích 400 ml, đế chắc chắn. Dễ vệ sinh sau mỗi bữa ăn. Phù hợp cho mèo và chó nhỏ.",
    isActive: true,
  },
  {
    id: "prd-brush",
    name: "Lược chải lông Soft Touch",
    slug: "luoc-chai-long",
    category: "Vệ sinh",
    price: 125000,
    stock: 24,
    color: "sage",
    description:
      "Lược đầu tròn với tay cầm dễ nắm, hỗ trợ chải lông rụng. Chải nhẹ theo chiều lông và tránh vùng da đang tổn thương.",
    isActive: true,
  },
  {
    id: "prd-treat",
    name: "Bánh thưởng gà mềm",
    slug: "banh-thuong-ga",
    category: "Thức ăn",
    price: 75000,
    stock: 38,
    color: "peach",
    description:
      "Bánh thưởng vị gà, túi 100 g. Dùng bổ sung khi huấn luyện hoặc vui chơi, không thay thế bữa chính của bé.",
    isActive: true,
  },
];
export const samplePosts = [
  {
    id: "post-first",
    slug: "lan-dau-di-spa",
    title: "Lần đầu đưa bé đi spa: cần chuẩn bị gì?",
    category: "Chăm sóc",
    excerpt:
      "Vài món đồ quen thuộc và một chút chuẩn bị giúp buổi spa đầu tiên nhẹ nhàng hơn.",
    content:
      "Hãy cho bé làm quen với lồng hoặc túi vận chuyển trước ngày hẹn. Chuẩn bị dây dắt, khăn và một món đồ có mùi quen thuộc.\n\nKhi đến nơi, chia sẻ với nhân viên về tình trạng da, các vùng nhạy cảm và phản ứng của bé với tiếng máy sấy. Không ép bé nếu bé quá căng thẳng.\n\nSau buổi chăm sóc, dành thời gian cho bé nghỉ ngơi và theo dõi da, lông. Nếu có dấu hiệu bất thường kéo dài, hãy trao đổi với bác sĩ thú y.",
  },
  {
    id: "post-food",
    slug: "doi-thuc-an-cho-be",
    title: "Đổi thức ăn cho bé, chậm một chút cũng được",
    category: "Dinh dưỡng",
    excerpt:
      "Thay đổi từng chút một để hệ tiêu hóa của bé có thời gian thích nghi.",
    content:
      "Khi đổi thức ăn, hãy trộn một phần nhỏ loại mới vào thức ăn đang dùng rồi tăng dần qua nhiều ngày. Theo dõi phân, khẩu vị và mức năng lượng của bé.\n\nMỗi bé có nhu cầu riêng theo tuổi, thể trạng và bệnh nền. Nếu bé đang điều trị hoặc có vấn đề tiêu hóa, hãy hỏi bác sĩ thú y trước khi thay đổi khẩu phần.",
  },
  {
    id: "post-vaccine",
    slug: "ghi-nho-lich-cham-soc",
    title: "Một cuốn sổ nhỏ cho những lịch chăm sóc lớn",
    category: "Sống cùng thú cưng",
    excerpt:
      "Ghi lại lịch tiêm, tẩy giun và những điều cần hỏi trong lần khám tiếp theo.",
    content:
      "Giữ lại thông tin về loại vaccine, ngày thực hiện và lịch hẹn do bác sĩ cung cấp. Hồ sơ của TailUp cho phép bạn lưu ghi chú cùng ngày chăm sóc tiếp theo.\n\nLịch hiển thị trên website là thông tin do bạn nhập, không tự thay thế chỉ định chuyên môn. Hãy xác nhận lịch phù hợp với bác sĩ thú y của bé.",
  },
];
