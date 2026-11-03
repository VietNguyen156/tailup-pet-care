"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PawPrint,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  CalendarDays,
} from "lucide-react";
import { accountHome } from "@/lib/permissions";
import { request } from "@/lib/client";

export function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  return (
    <div className="container auth-layout">
      <aside className="auth-story" aria-label="Chăm sóc cùng TailUp">
        <div className="auth-story-copy">
          <span className="eyebrow">CHO BẠN VÀ NGƯỜI BẠN NHỎ</span>
          <h2>
            Mỗi ngày bên bé,
            <br />
            <em>thêm một chút yêu thương.</em>
          </h2>
          <p>
            Một nơi để lưu những điều về bé và sắp xếp những buổi chăm sóc thật
            dễ dàng.
          </p>
        </div>
        <img
          src="/tailup-companions.webp"
          alt="Chú chó Golden và mèo nhỏ ngồi cạnh nhau trên chiếc chăn mềm"
          width={1100}
          height={1100}
        />
        <div className="auth-story-note">
          <Heart size={21} />
          <span>
            Những điều nhỏ bé.
            <br />
            <strong>Một tình yêu thật lớn.</strong>
          </span>
          <PawPrint size={24} />
        </div>
      </aside>

      <section className="auth-form-wrap" aria-labelledby="auth-title">
        <Link className="auth-back" href="/">
          <ArrowLeft size={16} /> Về trang chủ
        </Link>
        <span className="auth-mark">
          <PawPrint size={26} />
        </span>
        <span className="eyebrow">
          {register ? "CHÀO MỪNG BẠN ĐẾN VỚI TAILUP" : "CHÀO MỪNG BẠN TRỞ LẠI"}
        </span>
        <h1 id="auth-title">
          {register ? "Mình làm quen nhé." : "Rất vui được gặp lại bạn."}
        </h1>
        <p className="auth-description">
          {register
            ? "Tạo tài khoản để lưu hồ sơ của bé và đặt lịch chăm sóc khi cần."
            : "Đăng nhập để xem hồ sơ, lịch hẹn và những điều cần chăm chút cho bé."}
        </p>
        <form
          className="form-stack auth-form"
          aria-busy={busy}
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setError("");
            setBusy(true);
            const data = Object.fromEntries(new FormData(event.currentTarget));
            try {
              const result = await request<{ user: { role: string } }>(
                `/api/auth/${register ? "register" : "login"}`,
                { method: "POST", body: JSON.stringify(data) },
              );
              router.push(accountHome(result.user.role));
              router.refresh();
            } catch (error) {
              setError((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {register && (
            <div className="auth-name-phone">
              <div className="auth-field">
                <label htmlFor="auth-name">Họ và tên</label>
                <input
                  id="auth-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Nguyễn Minh Anh"
                  disabled={busy}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="auth-phone">Số điện thoại</label>
                <input
                  id="auth-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  pattern="0[0-9]{9}"
                  title="10 chữ số, bắt đầu bằng 0"
                  autoComplete="tel"
                  placeholder="0912345678"
                  aria-describedby="phone-hint"
                  disabled={busy}
                />
                <small id="phone-hint">
                  10 chữ số, viết liền, bắt đầu bằng 0.
                </small>
              </div>
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              maxLength={191}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="ban@email.com"
              disabled={busy}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Mật khẩu</label>
            <div className="password-field">
              <input
                id="auth-password"
                name="password"
                type={show ? "text" : "password"}
                required
                minLength={register ? 10 : 1}
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={
                  register ? "Tạo mật khẩu của bạn" : "Nhập mật khẩu của bạn"
                }
                aria-describedby={register ? "password-hint" : undefined}
                disabled={busy}
              />
              <button
                type="button"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={show}
                aria-controls="auth-password"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {register && (
              <small id="password-hint">
                Dùng ít nhất 10 ký tự để bảo vệ tài khoản.
              </small>
            )}
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button full" disabled={busy}>
            {busy ? "Đang xử lý…" : register ? "Tạo tài khoản" : "Đăng nhập"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Bạn đã có tài khoản?" : "Bạn chưa có tài khoản?"}{" "}
          <Link href={register ? "/login" : "/register"}>
            {register ? "Đăng nhập" : "Đăng ký ngay"}
          </Link>
        </p>
        <div className="auth-benefits">
          <span>
            <PawPrint size={16} /> Hồ sơ của bé
          </span>
          <span>
            <CalendarDays size={16} /> Đặt lịch thuận tiện
          </span>
        </div>
      </section>
    </div>
  );
}
