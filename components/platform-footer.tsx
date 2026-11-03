"use client";
import { usePathname } from "next/navigation";
export function PlatformFooter({ children }: { children: React.ReactNode }) {
  return /^\/stores\/[^/]+/.test(usePathname()) ? null : children;
}
