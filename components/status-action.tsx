"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/lib/client";
export function StatusAction({
  url,
  status,
  label,
  confirmMessage,
}: {
  url: string;
  status: string;
  label: string;
  confirmMessage?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <span>
      <button
        type="button"
        className="button outline"
        disabled={busy}
        onClick={async () => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          setBusy(true);
          setError("");
          try {
            await request(url, {
              method: "PATCH",
              body: JSON.stringify({ status }),
            });
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Đang lưu…" : label}
      </button>
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
