"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const INJECT_SCRIPT = "https://cdn.botpress.cloud/webchat/v5.0/inject.js";
const CONFIG_SCRIPT_ID = "tailup-botpress-config";
const CONFIG_SCRIPT =
  "https://files.bpcontent.cloud/2026/11/03/14/20261103144747-1N7NDLKL.js";

declare global {
  interface Window {
    __tailupBotpressConfigLoaded?: boolean;
  }
}

function loadBotpressConfig() {
  if (
    window.__tailupBotpressConfigLoaded ||
    document.getElementById(CONFIG_SCRIPT_ID)
  )
    return;

  window.__tailupBotpressConfigLoaded = true;
  const script = document.createElement("script");
  script.id = CONFIG_SCRIPT_ID;
  script.src = CONFIG_SCRIPT;
  script.defer = true;
  script.onerror = () => {
    window.__tailupBotpressConfigLoaded = false;
    script.remove();
    console.error("Unable to load the Botpress chat configuration.");
  };
  document.head.appendChild(script);
}

export function BotpressChat() {
  const pathname = usePathname();
  const isInternalPage = /^\/(admin|platform)(\/|$)/.test(pathname);

  useEffect(() => {
    document.body.classList.toggle("botpress-disabled", isInternalPage);
    return () => document.body.classList.remove("botpress-disabled");
  }, [isInternalPage]);

  if (isInternalPage) return null;

  return (
    <Script
      id="tailup-botpress-inject"
      src={INJECT_SCRIPT}
      strategy="afterInteractive"
      onReady={loadBotpressConfig}
      onError={(error) =>
        console.error("Unable to load Botpress webchat.", error)
      }
    />
  );
}
