"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  UserPlus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Users,
} from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export default function AdminAccountPage() {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // User management state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("editor");
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUsers();
    })();
  }, []);

  

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự." });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đổi mật khẩu thất bại.");

      setPasswordMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Lỗi đổi mật khẩu." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newUserPassword,
          name: newUserName,
          role: newUserRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo tài khoản thất bại.");

      setUserMessage({ type: "success", text: `Đã tạo tài khoản "${newUsername}" thành công!` });
      setNewUsername("");
      setNewUserName("");
      setNewUserPassword("");
      fetchUsers();
    } catch (err: any) {
      setUserMessage({ type: "error", text: err.message || "Lỗi tạo tài khoản." });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${username}" không?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa tài khoản thất bại.");

      setUserMessage({ type: "success", text: `Đã xóa tài khoản "${username}".` });
      fetchUsers();
    } catch (err: any) {
      setUserMessage({ type: "error", text: err.message || "Lỗi xóa tài khoản." });
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-brand-700" />
          <h1 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">
            Tài khoản & Bảo mật
          </h1>
        </div>
        <p className="mt-1 text-body-sm text-ink-500">
          Đổi mật khẩu tài khoản quản trị và phân quyền thành viên trong hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Change Password Card */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-brand-700" />
            <span>Đổi Mật Khẩu Cá Nhân</span>
          </h2>

          {passwordMessage && (
            <div
              className={`flex items-start gap-3 rounded-lg p-3.5 text-body-sm border ${
                passwordMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Mật khẩu hiện tại <span className="text-error">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Mật khẩu mới <span className="text-error">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Xác nhận mật khẩu mới <span className="text-error">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 py-2.5 text-body-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70 transition-colors"
            >
              {passwordLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              <span>{passwordLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
            </button>
          </form>
        </div>

        {/* Create Sub-Account Form */}
        <div className="rounded-xl border border-line-200 bg-white p-6 shadow-xs space-y-5">
          <h2 className="font-display text-base font-bold text-ink-950 border-b border-line-100 pb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-brand-700" />
            <span>Thêm Tài Khoản Thành Viên / Biên Tập Viên</span>
          </h2>

          {userMessage && (
            <div
              className={`flex items-start gap-3 rounded-lg p-3.5 text-body-sm border ${
                userMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {userMessage.type === "success" ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              )}
              <span>{userMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Họ và tên nhân viên <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                  Username <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().trim())}
                  placeholder="editor01"
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                  Vai trò (Role)
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
                >
                  <option value="editor">Biên tập viên (Editor)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-ink-900 mb-1">
                Mật khẩu khởi tạo <span className="text-error">*</span>
              </label>
              <input
                type="password"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-line-200 bg-white px-3 text-body-sm text-ink-950 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creatingUser}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 py-2.5 text-body-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70 transition-colors"
            >
              {creatingUser ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span>{creatingUser ? "Đang tạo..." : "Tạo tài khoản mới"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Users List Table */}
      <div className="rounded-xl border border-line-200 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-line-200 bg-slate-50 px-6 py-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-700" />
          <h2 className="font-display text-base font-bold text-ink-950">
            Danh sách Tài khoản Quản trị ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-line-200 bg-slate-50/50 text-xs font-semibold uppercase text-ink-500">
              <tr>
                <th className="px-6 py-3.5">Họ tên & Username</th>
                <th className="px-4 py-3.5">Vai trò</th>
                <th className="px-4 py-3.5">Ngày tạo</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-brand-700" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink-950">{u.name}</div>
                      <div className="text-xs text-ink-500">@{u.username}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {u.role === "admin" ? "Quản trị viên" : "Biên tập viên"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-500">
                      {new Date(u.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== "admin_root" ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="rounded p-1.5 text-ink-500 hover:bg-red-50 hover:text-error transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-ink-400 font-medium">Mặc định</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
