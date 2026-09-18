import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AdminLoginPage from '@/app/(admin)/admin/login/page';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('Admin login accessibility', () => {
  beforeEach(() => {
    replace.mockReset();
    vi.restoreAllMocks();
  });

  test('connects labels to credential fields', () => {
    render(<AdminLoginPage />);
    expect(screen.getByLabelText('Tên đăng nhập')).toHaveAttribute('id', 'admin-username');
    expect(screen.getByLabelText('Mật khẩu')).toHaveAttribute('id', 'admin-password');
  });

  test('announces validation errors', () => {
    render(<AdminLoginPage />);
    fireEvent.submit(screen.getByRole('button', { name: /đăng nhập hệ thống/i }).closest('form')!);
    expect(screen.getByRole('alert')).toHaveTextContent('Vui lòng nhập đầy đủ');
  });
});
