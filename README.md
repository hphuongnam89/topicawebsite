# Topica Uni Website

Next.js 16 App Router website for Topica University.

## Requirements
- Node.js >= 22.5
- npm >= 10

## Setup
```bash
npm install
npm run dev
```

## Environment Variables
Copy `.env.example` to `.env.local` and configure your API keys.

## Scripts
- `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm run start -- --hostname 127.0.0.1 --port 3001`: Preview a completed production build locally
- `npm run test`: Unit tests
- `npm run test:e2e`: Playwright E2E tests
- `npm run verify`: Run all checks (lint, typecheck, format, tests, build)

## Kiểm tra tốc độ chuyển trang

Chạy `npm run build`, sau đó `npm run start -- --hostname 127.0.0.1 --port 3001`.
Đo lần đầu và lần lặp lại trên cùng URL; `next dev` có chi phí biên dịch theo route.
Layout gốc dùng `connection()` nên các trang được render theo request; `revalidate = 300`
không biến chúng thành HTML tĩnh. Dữ liệu WordPress dùng cache 300 giây mặc định,
và các request giống nhau được gộp trong một lần render (kể cả metadata).
Loading UI được stream trước nội dung; bài liên quan tải riêng. Phân biệt thời gian
nhận phản hồi đầu tiên với thời gian tải xong toàn bộ nội dung và ảnh.
