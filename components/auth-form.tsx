"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { request } from "@/lib/client";
export function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  const router = useRouter();
  return (
    <div className="container auth-layout">
      <div className="auth-art">
        <span className="eyebrow">CHÀO MỪNG ĐẾN VỚI TAILUP</span>
        <h1>
          Một tài khoản.
          <br />
          Thật nhiều
          <br />
          <em>chăm chút.</em>
        </h1>
        <img src="/pawly-cat.svg" alt="Chú mèo đang nghỉ ngơi" />
        <p>
          Lưu hồ sơ của bé, chủ động lịch hẹn
          <br />
          và theo dõi đơn hàng trong một nơi.
        </p>
      </div>
      <div className="auth-form-wrap">
        <PawPrint className="auth-paw" />
        <h2>{register ? "Mình làm quen nhé!" : "Rất vui được gặp lại bạn."}</h2>
        <p className="muted">
          {register
            ? "Tạo tài khoản để bắt đầu chăm sóc người bạn nhỏ."
            : "Đăng nhập để tiếp tục hành trình cùng bé."}
        </p>
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            const data = Object.fromEntries(new FormData(e.currentTarget));
            try {
              const result = await request<{ user: { role: string } }>(
                `/api/auth/${register ? "register" : "login"}`,
                { method: "POST", body: JSON.stringify(data) },
              );
              router.push(
                result.user.role === "CUSTOMER" ? "/dashboard/pets" : "/admin",
              );
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {register && (
            <>
              <label>
                Họ và tên
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Nguyễn Minh Anh"
                />
              </label>
              <label>
                Số điện thoại
                <input
                  name="phone"
                  required
                  pattern="0[0-9]{9}"
                  title="10 chữ số, bắt đầu bằng 0"
                  autoComplete="tel"
                  placeholder="09xxxxxxxx"
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={191}
              autoComplete="email"
              placeholder="ban@email.com"
            />
          </label>
          <label>
            Mật khẩu
            <div className="password-field">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                minLength={register ? 10 : 1}
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={
                  register ? "Ít nhất 10 ký tự" : "Nhập mật khẩu của bạn"
                }
              />
              <button
                type="button"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Đã có tài khoản?" : "Lần đầu bạn ghé TailUp?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Đăng nhập" : "Đăng ký ngay"}
          </Link>
        </p>
      </div>
    </div>
  );
}
