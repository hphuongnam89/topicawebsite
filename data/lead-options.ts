// Stable values shared by the public form and API. Legacy labels are read aliases.
export const leadPrograms = [
  { id: "ba", label: "Quản trị kinh doanh" },
  { id: "tourism", label: "Quản trị du lịch và lữ hành" },
  { id: "it", label: "Công nghệ thông tin - chuyên ngành Đồ hoạ kỹ thuật số" },
  { id: "english", label: "Ngôn ngữ Anh" },
  { id: "chinese", label: "Ngôn ngữ Trung Quốc" },
  { id: "undecided", label: "Chưa xác định ngành" },
] as const;
export const leadProgramIds = ["ba", "tourism", "it", "english", "chinese", "undecided"] as const;
