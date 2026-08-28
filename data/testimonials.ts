export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  quote: string;
  program: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    id: "pham-duy-khanh",
    name: "Phạm Duy Khánh",
    role: "Sinh viên",
    program: "Học trực tuyến",
    quote:
      "Việc tham gia học trực tuyến tại Viện Topica là một trải nghiệm tuyệt vời. Tôi đánh giá cao sự đầu tư của Viện vào hệ thống công nghệ hiện đại và sự tận tâm của đội ngũ giảng viên. Phương pháp học này không chỉ hiệu quả mà còn giúp tôi rèn luyện được tính tự học, tự quản lý thời gian và kỹ năng công nghệ thông tin, những kỹ năng vô cùng cần thiết trong thời đại số.",
  },
  {
    id: "nguyen-tran-thanh-duy",
    name: "Nguyễn Trần Thanh Duy",
    role: "Sinh viên",
    program: "Học trực tuyến",
    quote:
      "Ngay từ buổi học đầu tiên, mình đã cảm nhận được không khí lớp học rất vui tươi. Thầy cô và sinh viên tương tác liên tục, tạo nên một môi trường học năng động, tự nhiên và sát với thực tế – rất khác so với mô hình học truyền thống. Ngoài ra, thời gian học rất chủ động và phù hợp cho những bạn đi làm như mình, đa số các bài tập phải dành thời gian làm cũng đảm bảo được khối lượng kiến thức.",
  },
  {
    id: "tran-thi-minh-nguyet",
    name: "Trần Thị Minh Nguyệt",
    role: "Sinh viên",
    program: "Học trực tuyến",
    quote:
      "Hãy tin rằng, bất kỳ ai cũng có thể phát triển và đạt được thành công nếu biết tận dụng cơ hội và chọn đúng con đường. Tôi rất vui vì đã chọn Topica - nơi giúp tôi tự tin bước xa hơn trên hành trình chinh phục tri thức và phát triển sự nghiệp.",
  },
];
