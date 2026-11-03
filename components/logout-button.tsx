"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { request } from "@/lib/client";
export function LogoutButton({ returnTo = "/" }: { returnTo?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <span className="logout-control">
      <button
        disabled={busy}
        type="button"
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await request("/api/auth/logout", { method: "POST" });
            router.replace(returnTo);
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <LogOut size={16} />
        {busy ? "Đang thoát…" : "Đăng xuất"}
      </button>
      {error && <small role="alert">{error}</small>}
    </span>
  );
}
