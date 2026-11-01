"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/client";
export function ProfileForm({
  user,
}: {
  user: { name: string; phone: string | null; email: string };
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const router = useRouter();
  return (
    <form
      className="panel form-stack profile-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setSaved(false);
        setError("");
        try {
          await request("/api/account", {
            method: "PATCH",
            body: JSON.stringify(
              Object.fromEntries(new FormData(e.currentTarget)),
            ),
          });
          setSaved(true);
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Họ và tên
        <input
          name="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={user.name}
        />
      </label>
      <label>
        Email
        <input type="email" value={user.email} disabled />
      </label>
      <label>
        Số điện thoại
        <input
          name="phone"
          required
          pattern="0[0-9]{9}"
          title="10 chữ số, bắt đầu bằng 0"
          defaultValue={user.phone ?? ""}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="success-message" role="status">
          Đã cập nhật thông tin của bạn.
        </p>
      )}
      <button className="button" disabled={busy}>
        {busy ? "Đang lưu…" : "Lưu thay đổi"}
      </button>
    </form>
  );
}
