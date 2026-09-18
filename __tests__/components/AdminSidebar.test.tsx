import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));

describe('AdminSidebar accessibility', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    push.mockReset();
  });

  test('exposes mobile menu state and closes with Escape', () => {
    render(<AdminSidebar user={{ name: 'Admin', username: 'admin', role: 'admin' }} />);
    const trigger = screen.getByRole('button', { name: 'Mở menu quản trị' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'admin-sidebar');

    fireEvent.click(trigger);
    expect(screen.getAllByRole('button', { name: 'Đóng menu quản trị' })[0]).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Mở menu quản trị' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(document.body.style.overflow).toBe('');
  });
});
