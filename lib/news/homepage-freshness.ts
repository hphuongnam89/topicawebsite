export function shouldHideExpiredUrgentNotice(title: string, excerpt: string, now = new Date()) {
  const content = `${title} ${excerpt}`;
  const isDeadlineOrEnrollmentNotice =
    /còn\s+\d+\s+ngày|hạn\s+(?:cuối|đăng ký)|đăng ký.{0,30}(?:đến|trước)|(?:thông báo )?nhập học/i.test(
      content,
    );
  if (!isDeadlineOrEnrollmentNotice) return false;

  const dateMatch = content.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})\b/);
  if (!dateMatch) return false;

  const [, day, month, year] = dateMatch;
  const deadline = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    Number.isNaN(deadline.getTime()) ||
    deadline.getDate() !== Number(day) ||
    deadline.getMonth() !== Number(month) - 1 ||
    deadline.getFullYear() !== Number(year)
  ) {
    return false;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return deadline < today;
}
