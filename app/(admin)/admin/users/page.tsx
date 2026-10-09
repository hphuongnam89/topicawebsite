"use client";

import React, { useState, useEffect } from "react";
import { Users, PlusCircle, Edit, Trash2, RefreshCw, Shield, ShieldCheck, X } from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    name: "",
    role: "editor",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data synchronization intentionally updates loading/users from the request lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  const handleOpenNew = () => {
    setIsEditMode(false);
    setFormData({ id: "", username: "", password: "", name: "", role: "editor" });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setIsEditMode(true);
    setFormData({
      id: user.id,
      username: user.username,
      password: "", // empty password means no change
      name: user.name,
      role: user.role,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, username: string) => {
    if (id === "admin_root") {
      alert("Bạn không thể xóa tài khoản Quản trị viên gốc.");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Có lỗi xảy ra khi xóa người dùng.");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi xóa.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const method = isEditMode ? "PUT" : "POST";
      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save user");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            <Users className="h-8 w-8 text-brand-700" />
            Quản lý Tài khoản (Users)
          </h1>
          <p className="text-ink-500 mt-1 text-body-sm">
            Quản lý quyền truy cập Admin và Biên tập viên của hệ thống
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-body-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Thêm người dùng</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-line-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="admin-data-table w-full text-left text-body-sm">
            <thead className="text-ink-500 border-b border-line-200 bg-slate-50 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3.5">Người dùng</th>
                <th className="px-4 py-3.5">Vai trò</th>
                <th className="hidden px-4 py-3.5 sm:table-cell">Ngày tạo</th>
                <th className="sticky right-0 z-10 bg-slate-50 px-6 py-3.5 text-right shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-ink-500 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-brand-700" />
                      <span>Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-ink-500 py-12 text-center">
                    Chưa có tài khoản nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink-950">{user.name}</span>
                        <span className="text-ink-500 text-xs">@{user.username}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        {user.role === "admin" ? "Quản trị viên" : "Biên tập viên"}
                      </span>
                    </td>

                    <td className="text-ink-500 hidden px-4 py-4 text-xs whitespace-nowrap sm:table-cell">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="sticky right-0 z-10 bg-white px-6 py-4 text-right whitespace-nowrap shadow-[-12px_0_15px_-3px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.id !== "admin_root" && (
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="rounded-md p-1.5 text-ink-600 transition-colors hover:bg-red-50 hover:text-error"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line-200 px-6 py-4">
              <h2 className="font-display text-lg font-bold text-ink-950">
                {isEditMode ? "Chỉnh sửa Tài khoản" : "Thêm Tài khoản mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-500 rounded-full p-1.5 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <div role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="user-name" className="text-sm font-semibold text-ink-950">
                  Họ và tên
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-username" className="text-sm font-semibold text-ink-950">
                  Tên đăng nhập
                </label>
                <input
                  id="user-username"
                  type="text"
                  required={!isEditMode}
                  disabled={isEditMode} // Cannot change username after creation
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="disabled:text-ink-500 h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-password" className="text-sm font-semibold text-ink-950">
                  {isEditMode ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                </label>
                <input
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  required={!isEditMode}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-role" className="text-sm font-semibold text-ink-950">
                  Phân quyền
                </label>
                <select
                  id="user-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={formData.id === "admin_root"}
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-sm text-ink-950 focus:border-brand-600 focus:outline-none disabled:bg-slate-100"
                >
                  <option value="admin">Quản trị viên (Toàn quyền)</option>
                  <option value="editor">Biên tập viên (Chỉ nội dung)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-ink-700 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-800 disabled:opacity-70"
                >
                  {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Lưu tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
