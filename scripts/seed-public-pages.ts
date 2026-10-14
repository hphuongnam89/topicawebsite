import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/topica.db");

const now = new Date().toISOString();

const pagesToInsert = [
  {
    slug: "chat-luong-dao-tao",
    title: "Chất lượng Đào tạo & Báo cáo Ba Công khai",
    excerpt:
      "Thông tin công khai về kiểm định chất lượng giáo dục, chuẩn đầu ra, điều kiện bảo đảm chất lượng và giá trị văn bằng tốt nghiệp của Trường Đại học Phú Xuân.",
    seo_title: "Chất lượng Đào tạo & Báo cáo Ba Công khai | Topica Uni & ĐH Phú Xuân",
    seo_description:
      "Cam kết chất lượng đào tạo, kiểm định giáo dục đại học quốc gia và giá trị văn bằng cử nhân của Trường Đại học Phú Xuân.",
    content_html: `
      <div class="academic-public-disclosure">
        <h2>1. Cơ sở Pháp lý & Kiểm định Chất lượng Giáo dục</h2>
        <p>Chương trình đào tạo cử nhân trực tuyến do <strong>Trường Đại học Phú Xuân (PXU)</strong> – Thành viên Tập đoàn Giáo dục EQuest cấp bằng, phối hợp triển khai cùng <strong>Viện Đào tạo Quốc tế Topica</strong>.</p>
        <p>Trường Đại học Phú Xuân là cơ sở giáo dục đại học đã đạt <strong>Chứng nhận Kiểm định Chất lượng Giáo dục Đại học</strong> theo bộ tiêu chuẩn của Bộ Giáo dục và Đào tạo. Toàn bộ chương trình đào tạo được xây dựng tuân thủ Khung trình độ quốc gia Việt Nam (VQF) và các quy chế đào tạo hiện hành.</p>

        <h2>2. Giá trị Văn bằng Tốt nghiệp theo Thông tư 27/2019/TT-BGDĐT</h2>
        <p>Căn cứ <strong>Thông tư số 27/2019/TT-BGDĐT</strong> ngày 30/12/2019 của Bộ Giáo dục và Đào tạo quy định về nội dung chính ghi trên văn bằng và phụ lục văn bằng:</p>
        <ul>
          <li><strong>Không ghi hình thức đào tạo</strong>: Trên bằng tốt nghiệp đại học chỉ ghi học vị Cử nhân và tên ngành đào tạo, không phân biệt "chính quy", "từ xa" hay "vừa làm vừa học".</li>
          <li><strong>Giá trị pháp lý tương đương</strong>: Người tốt nghiệp có đầy đủ quyền lợi và giá trị pháp lý để dự thi công chức, viên chức nhà nước, nâng bậc lương, bổ nhiệm chức vụ và tiếp tục học lên các bậc học cao hơn (Thạc sĩ, Tiến sĩ) tại các trường đại học trong nước và quốc tế.</li>
          <li><strong>Phụ lục văn bằng chi tiết</strong>: Thể hiện đầy đủ kết quả học tập, số tín chỉ tích lũy (126 tín chỉ) và chuẩn đầu ra chuyên môn.</li>
        </ul>

        <h2>3. Báo cáo Ba Công khai theo Quy định</h2>
        <p>Thực hiện Thông tư số 36/2017/TT-BGDĐT và Thông tư số 09/2024/TT-BGDĐT của Bộ Giáo dục và Đào tạo, Nhà trường công khai đầy đủ các điều kiện bảo đảm chất lượng giáo dục:</p>
        
        <h3>3.1. Cam kết Chất lượng Đào tạo & Chuẩn đầu ra</h3>
        <p>Nhà trường công bố công khai mục tiêu đào tạo, chuẩn đầu ra về kiến thức, kỹ năng, mức độ tự chủ và trách nhiệm cho 5 ngành đào tạo chính thức:</p>
        <ul>
          <li>Quản trị kinh doanh (Mã ngành: 7340101)</li>
          <li>Quản trị dịch vụ du lịch và lữ hành (Mã ngành: 7810103)</li>
          <li>Công nghệ thông tin – chuyên ngành Đồ hoạ kỹ thuật số (Mã ngành: 7480201)</li>
          <li>Ngôn ngữ Anh (Mã ngành: 7220201)</li>
          <li>Ngôn ngữ Trung Quốc (Mã ngành: 7220204)</li>
        </ul>

        <h3>3.2. Điều kiện Cơ sở Vật chất & Nền tảng Công nghệ E-Learning</h3>
        <p>Hệ thống máy chủ đào tạo trực tuyến chuẩn quốc tế, băng thông cao bảo đảm hoạt động 24/7 cho hàng nghìn học viên đồng thời. Thư viện học liệu số trực tuyến (E-Library) và cổng Elearning sinh viên được cập nhật liên tục.</p>

        <h3>3.3. Đội ngũ Giảng viên & Cố vấn Học thuật</h3>
        <p>100% giảng viên tham gia giảng dạy có trình độ Thạc sĩ, Tiến sĩ đúng chuyên ngành, có kinh nghiệm thực tiễn từ các doanh nghiệp, tập đoàn hàng đầu kết hợp phương pháp sư phạm số tiên tiến.</p>

        <h3>3.4. Công khai Học phí & Chính sách Tài chính</h3>
        <p>Biểu phí niêm yết minh bạch: <strong>600.000 đ / tín chỉ</strong> cho toàn bộ 5 ngành đào tạo. Học phí thu theo số tín chỉ thực tế sinh viên đăng ký trong từng học kỳ. Nhà trường cam kết chính sách học phí ổn định suốt khóa học.</p>

        <h2>4. Tra cứu Văn bằng Tốt nghiệp Trực tuyến</h2>
        <p>Học viên, cơ quan tuyển dụng và các bên liên quan có thể tra cứu và xác thực tính hợp pháp của văn bằng tốt nghiệp qua cổng thông tin chính thức của Trường Đại học Phú Xuân:</p>
        <p><a href="https://elib.pxu.edu.vn/" target="_blank" rel="noopener noreferrer">Cổng thông tin & Thư viện số ĐH Phú Xuân: https://elib.pxu.edu.vn/</a></p>
      </div>
    `,
  },
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách Bảo mật Thông tin Cá nhân",
    excerpt:
      "Quy chuẩn bảo vệ dữ liệu cá nhân của người học và khách hàng tuân thủ Nghị định 13/2023/NĐ-CP của Chính phủ.",
    seo_title: "Chính sách Bảo mật Thông tin Người học | Topica Uni",
    seo_description:
      "Cam kết bảo vệ dữ liệu cá nhân và quyền riêng tư của người học theo quy định pháp luật Việt Nam.",
    content_html: `
      <div class="privacy-policy-content">
        <h2>1. Mục đích và Phạm vi Thu thập Thông tin</h2>
        <p>Viện Đào tạo Quốc tế Topica và Trường Đại học Phú Xuân cam kết bảo vệ sự riêng tư và bảo mật dữ liệu cá nhân của học viên, phụ huynh và người đăng ký tư vấn theo <strong>Nghị định 13/2023/NĐ-CP</strong> của Chính phủ về Bảo vệ dữ liệu cá nhân.</p>
        <p>Các thông tin thu thập bao gồm:</p>
        <ul>
          <li>Thông tin liên hệ: Họ và tên, số điện thoại, địa chỉ email, tỉnh/thành phố sinh sống.</li>
          <li>Thông tin học vấn: Trình độ tốt nghiệp (THPT, Trung cấp, Cao đẳng, Đại học), ngành học quan tâm.</li>
          <li>Dữ liệu kỹ thuật: Địa chỉ IP, thời gian truy cập nhằm mục đích bảo đảm an toàn hệ thống và cải thiện trải nghiệm học tập.</li>
        </ul>

        <h2>2. Mục đích Sử dụng Dữ liệu</h2>
        <p>Thông tin thu thập chỉ được sử dụng cho các mục đích chính đáng sau:</p>
        <ul>
          <li>Cung cấp thông tin tư vấn tuyển sinh, lộ trình học tập và học phí theo đúng yêu cầu của người đăng ký.</li>
          <li>Hỗ trợ thực hiện thủ tục đăng ký xét tuyển, nhập học và quản lý học tập tại Trường Đại học Phú Xuân.</li>
          <li>Gửi thông báo quan trọng về lịch khai giảng, học liệu số và các chính sách học bổng áp dụng.</li>
          <li>Nâng cao chất lượng dịch vụ giáo dục và bảo đảm an toàn hệ thống đào tạo trực tuyến.</li>
        </ul>

        <h2>3. Cam kết Không Chia sẻ cho Bên Thứ Ba</h2>
        <p>Chúng tôi cam kết <strong>tuyệt đối không bán, cho thuê, trao đổi hoặc tiết lộ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào</strong> vì mục đích thương mại hoặc quảng cáo ngoài hệ thống đào tạo Topica và Đại học Phú Xuân, trừ trường hợp cơ quan nhà nước có thẩm quyền yêu cầu theo quy định của pháp luật.</p>

        <h2>4. Thời hạn Lưu trữ và Biện pháp Bảo vệ</h2>
        <p>Dữ liệu cá nhân được lưu trữ an toàn trên hệ thống máy chủ được bảo mật nhiều lớp tại Việt Nam. Dữ liệu chỉ được lưu trữ trong thời gian cần thiết để thực hiện các mục đích đã nêu hoặc cho đến khi người học có yêu cầu hủy bỏ hợp lệ.</p>

        <h2>5. Quyền của Chủ thể Dữ liệu</h2>
        <p>Bạn có đầy đủ các quyền theo quy định của Nghị định 13/2023/NĐ-CP:</p>
        <ul>
          <li>Quyền được biết và đồng ý về việc xử lý dữ liệu cá nhân.</li>
          <li>Quyền yêu cầu tra cứu, chỉnh sửa hoặc cập nhật thông tin cá nhân của mình.</li>
          <li>Quyền yêu cầu xóa hoặc rút lại sự đồng ý xử lý dữ liệu bất cứ lúc nào bằng cách liên hệ với chúng tôi.</li>
        </ul>

        <h2>6. Đầu mối Liên hệ Bảo vệ Dữ liệu</h2>
        <p>Mọi thắc mắc hoặc yêu cầu liên quan đến chính sách bảo mật dữ liệu cá nhân, xin vui lòng liên hệ:</p>
        <ul>
          <li><strong>Hotline miễn cước:</strong> 1800 646 857 (hoặc 0901 795 580)</li>
          <li><strong>Email:</strong> tuyensinh@topicauni.edu.vn / info@topicauni.edu.vn</li>
          <li><strong>Địa chỉ tiếp nhận:</strong> 27 Lê Văn Lương, Phường Nhân Chính, Quận Thanh Xuân, Hà Nội</li>
        </ul>
      </div>
    `,
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản Sử dụng & Quy định Dịch vụ",
    excerpt:
      "Quy định về quyền và nghĩa vụ của người học khi tham gia các dịch vụ trực tuyến và nền tảng đào tạo E-Learning Topica.",
    seo_title: "Điều khoản Sử dụng & Quy định Dịch vụ | Topica Uni",
    seo_description:
      "Điều khoản sử dụng dịch vụ học tập trực tuyến, bản quyền học liệu và quy chế đào tạo tại Topica Uni.",
    content_html: `
      <div class="terms-of-service-content">
        <h2>1. Chấp thuận Điều khoản</h2>
        <p>Bằng việc truy cập website hoặc sử dụng hệ thống đào tạo trực tuyến của Viện Đào tạo Quốc tế Topica và Trường Đại học Phú Xuân, bạn đồng ý tuân thủ toàn bộ các điều khoản và quy định được nêu tại văn bản này.</p>

        <h2>2. Quyền Sở hữu Trí tuệ & Bản quyền Học liệu</h2>
        <p>Toàn bộ tài nguyên trên website và hệ thống học tập bao gồm bài giảng video, bài tập số, tài liệu học liệu, đề thi, logo, biểu tượng, hình ảnh và mã nguồn đều thuộc quyền sở hữu trí tuệ của Viện Đào tạo Quốc tế Topica và Trường Đại học Phú Xuân:</p>
        <ul>
          <li>Học viên chỉ được phép sử dụng học liệu cho mục đích học tập cá nhân trong thời gian tham gia khóa học.</li>
          <li>Nghiêm cấm mọi hành vi sao chép, ghi hình, phát tán, bán lại hoặc sử dụng học liệu vì mục đích thương mại khi chưa có sự đồng ý bằng văn bản.</li>
        </ul>

        <h2>3. Liêm chính Học thuật & Trách nhiệm Học viên</h2>
        <p>Học viên tham gia chương trình đào tạo cam kết tuân thủ nghiêm ngặt chuẩn mực liêm chính học thuật:</p>
        <ul>
          <li>Tự giác hoàn thành các bài kiểm tra, bài tập và bài thi kết thúc học phần theo đúng quy chế đào tạo của Trường Đại học Phú Xuân.</li>
          <li>Tuyệt đối không thực hiện các hành vi gian lận thi cử, nhờ người khác học hộ hoặc làm bài kiểm tra hộ dưới mọi hình thức.</li>
          <li>Bảo mật tài khoản và mật khẩu truy cập hệ thống LMS. Học viên chịu hoàn toàn trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình.</li>
        </ul>

        <h2>4. Quy định về Học phí và Hoàn trả</h2>
        <p>Học phí được áp dụng theo đúng biểu phí niêm yết công khai (600.000 đ / tín chỉ). Quy định về miễn giảm học phí, hoàn trả hoặc bảo lưu kết quả học tập được thực hiện theo Quy chế Đào tạo và Quản lý tài chính hiện hành của Trường Đại học Phú Xuân.</p>

        <h2>5. Giải quyết Tranh chấp</h2>
        <p>Mọi tranh chấp phát sinh trong quá trình sử dụng dịch vụ sẽ được ưu tiên giải quyết thông qua thương lượng và hòa giải trên tinh thần tôn trọng quyền lợi của người học và uy tín của nhà trường. Trường hợp không đạt được thỏa thuận, vụ việc sẽ được đưa ra giải quyết tại Tòa án có thẩm quyền theo pháp luật Việt Nam.</p>
      </div>
    `,
  },
  {
    slug: "trai-nghiem-hoc-tap",
    title: "Trải nghiệm Học tập Trực tuyến Chuẩn Hiện đại",
    excerpt:
      "Mô hình học tập trực tuyến hiện đại, chủ động thời gian 24/7 với sự đồng hành của đội ngũ giảng viên và cố vấn học tập tận tâm.",
    seo_title: "Trải nghiệm Học tập Trực tuyến Chuẩn Hiện đại | Topica Uni",
    seo_description:
      "Tìm hiểu phương pháp học E-Learning linh hoạt, lịch một tuần học tập và hệ thống hỗ trợ 24/7 tại Topica Uni.",
    content_html: `
      <div class="learning-experience-content">
        <h2>1. Mô hình Học tập Trực tuyến Linh hoạt 24/7</h2>
        <p>Chương trình cử nhân trực tuyến Topica được thiết kế đặc thù dành cho người đi làm bận rộn, người có nhu cầu học văn bằng hai hoặc vừa đi làm vừa nâng cao trình độ đại học:</p>
        <ul>
          <li><strong>Học mọi lúc, mọi nơi:</strong> Truy cập bài giảng qua máy tính, máy tính bảng hoặc điện thoại thông minh 24/7, không giới hạn không gian địa lý.</li>
          <li><strong>Chủ động tốc độ học:</strong> Người học tự điều chỉnh tiến độ học tập phù hợp với lịch làm việc và gia đình. Có thể tua lại bài giảng, xem lại nhiều lần những phần kiến thức chưa hiểu rõ.</li>
          <li><strong>Học liệu đa phương tiện hiện đại:</strong> Bài giảng video chất lượng cao, bài tập tương tác tức thì, tài liệu tóm tắt súc tích giúp nắm bắt kiến thức nhanh chóng.</li>
        </ul>

        <h2>2. Một Tuần Học tập Điển hình tại Topica</h2>
        <p>Phương pháp học được chia nhỏ khoa học giúp học viên duy trì động lực và không bị quá tải:</p>
        <ul>
          <li><strong>Từ Thứ 2 đến Thứ 6 (Chủ động 20–30 phút/ngày):</strong> Xem các video bài giảng ngắn (10–15 phút), đọc học liệu số và làm các bài luyện tập trắc nghiệm ngắn để củng cố kiến thức.</li>
          <li><strong>Thứ 7 & Chủ nhật (Lớp thảo luận trực tuyến):</strong> Tham gia các buổi thảo luận trực tuyến trực tiếp với giảng viên chuyên gia, trao đổi giải quyết các case study thực tế và bài tập tình huống.</li>
          <li><strong>Diễn đàn học tập 24/7:</strong> Đặt câu hỏi bất cứ lúc nào trên diễn đàn lớp học để được giảng viên và trợ giảng giải đáp trong vòng 24 giờ.</li>
        </ul>

        <h2>3. Đội ngũ Cố vấn Học tập & Hỗ trợ Kỹ thuật 24/7</h2>
        <p>Người học không bao giờ đơn độc trên hành trình chinh phục bằng đại học:</p>
        <ul>
          <li><strong>Cố vấn học tập (Academic Advisor):</strong> Mỗi học viên có một cố vấn học tập theo sát trong suốt 9 học kỳ, nhắc nhở lịch học, hỗ trợ đăng ký môn và giải quyết các vướng mắc cá nhân.</li>
          <li><strong>Giảng viên doanh nghiệp & Giảng viên cơ hữu:</strong> Đội ngũ giảng viên giàu kinh nghiệm thực chiến từ các tập đoàn lớn, vừa truyền đạt kiến thức học thuật vừa chia sẻ kinh nghiệm nghề nghiệp thực tế.</li>
          <li><strong>Hỗ trợ kỹ thuật 24/7:</strong> Đội ngũ IT luôn sẵn sàng trợ giúp xử lý các sự cố về tài khoản, phần mềm học tập và đường truyền.</li>
        </ul>

        <h2>4. Đánh giá và Thi Kết thúc Học phần Minh bạch</h2>
        <p>Điểm số học phần được đánh giá toàn diện qua cả quá trình:</p>
        <ul>
          <li><strong>Điểm quá trình (30–40%):</strong> Đánh giá mức độ chuyên cần qua hệ thống, điểm bài tập luyện tập và thảo luận trên diễn đàn.</li>
          <li><strong>Điểm thi kết thúc học phần (60–70%):</strong> Tổ chức thi trắc nghiệm hoặc vấn đáp trực tuyến có giám sát, hoặc thi tập trung linh hoạt tại các trạm thi của trường trên toàn quốc (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng).</li>
        </ul>
      </div>
    `,
  },
];

console.log("Bắt đầu cập nhật các trang công khai cốt lõi...");

for (const p of pagesToInsert) {
  const existing = db.prepare("SELECT id FROM pages WHERE slug = ?").get(p.slug) as
    { id: number } | undefined;
  if (existing) {
    db.prepare(
      `
      UPDATE pages
      SET title = ?, excerpt = ?, content_html = ?, seo_title = ?, seo_description = ?, updated_at = ?
      WHERE id = ?
    `,
    ).run(p.title, p.excerpt, p.content_html, p.seo_title, p.seo_description, now, existing.id);
    console.log(`✓ Đã cập nhật trang: ${p.slug} (ID: ${existing.id})`);
  } else {
    const res = db
      .prepare(
        `
      INSERT INTO pages (title, slug, excerpt, content_html, featured_image, status, seo_title, seo_description, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, NULL, 'published', ?, ?, ?, ?, ?)
    `,
      )
      .run(
        p.title,
        p.slug,
        p.excerpt,
        p.content_html,
        p.seo_title,
        p.seo_description,
        now,
        now,
        now,
      );
    console.log(`+ Đã tạo mới trang: ${p.slug} (ID: ${res.lastInsertRowid})`);
  }
}

console.log("Hoàn tất thêm các trang công khai!");
