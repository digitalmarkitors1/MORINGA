"use client";

/**
 * ContactPopup — a modal enquiry form that appears a few seconds after load.
 * Shows once per session and respects a 7-day dismissal cooldown (localStorage),
 * so returning visitors aren't nagged. Closes on ✕, backdrop click, Escape, or
 * after the WhatsApp hand-off fires.
 */

import { useEffect, useState } from "react";
import { MoringaMark } from "./MoringaMark";
import { ContactForm } from "./ContactForm";

const SHOW_DELAY_MS = 5_000; // 5 s after load
const DISMISS_KEY = "gm-contact-popup-dismissed-at";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_KEY = "gm-contact-popup-shown";

function isInCooldown() {
  if (typeof window === "undefined") return true;
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return true;
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage blocked — fail silently
  }
}

export function ContactPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isInCooldown()) return;
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    markDismissed();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-popup-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg bg-paper border border-clay/60 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 size-9 flex items-center justify-center text-warm-500 hover:text-clay transition"
          aria-label="Close"
        >
          <span className="text-2xl leading-none" aria-hidden="true">×</span>
        </button>

        <div className="p-7 md:p-9">
          <MoringaMark className="size-9 text-clay mb-4" />
          <div className="text-eyebrow text-clay mb-3 flex items-center gap-3">
            <span className="block h-px w-10 bg-clay" />
            Talk to Dt. Priyatama
          </div>
          <h2
            id="contact-popup-title"
            className="font-display tracking-[-0.02em] font-medium text-ink leading-[1.05]"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)" }}
          >
            Tell us <em className="italic-clay">about your goal</em>.
          </h2>
          <p className="mt-3 mb-6 text-sm text-warm-700 leading-[1.6]">
            Leave your details and we&rsquo;ll reply on WhatsApp — a fifteen-minute first conversation, no commitment.
          </p>

          <ContactForm source="popup" onSent={close} />
        </div>
      </div>
    </div>
  );
}
