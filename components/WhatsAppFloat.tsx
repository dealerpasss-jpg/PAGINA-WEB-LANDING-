"use client";

import { getWhatsappUrl, track } from "@/lib/analytics";

export default function WhatsAppFloat() {
  return (
    <a
      href={getWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hablar por WhatsApp"
      onClick={() => track("click_whatsapp", { source: "floating_button" })}
      className="whatsapp-float"
    >
      <span className="whatsapp-pulse" aria-hidden />
      <svg viewBox="0 0 24 24" fill="none" className="relative z-10 h-6 w-6" aria-hidden>
        <path
          d="M12 3C7.03 3 3 7.03 3 12c0 1.77.5 3.42 1.36 4.83L3 21l4.34-1.31A8.96 8.96 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.7 8.6c.2-.5.6-.5.9-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.1.3 0 .5.5 1 1.3 1.8 2.3 2.3.2.1.3.1.5 0l.6-.5c.2-.2.4-.2.6-.1l1.7.7c.3.1.4.3.4.5v.6c0 .3 0 .7-.5.9-.6.3-1.5.5-2.7-.1-1.5-.7-3-2.2-3.7-3.7-.6-1.2-.4-2.1-.1-2.7Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
