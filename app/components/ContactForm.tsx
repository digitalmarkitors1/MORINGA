"use client";

/**
 * ContactForm — reusable enquiry form used on the home page, the contact page,
 * and inside the timed popup. Collects name / phone / email / message and hands
 * off to WhatsApp via a pre-filled wa.me deeplink. No data leaves the browser
 * until the user presses "send" inside WhatsApp itself.
 *
 * Same secure, backend-free pattern as the booking + diet-report forms — no
 * `mailto:` action (which makes browsers flag the form as insecure and disable
 * autofill), and WhatsApp is where the clinic actually replies fastest.
 *
 * Uses useId() so ids stay unique when the form is rendered more than once on a
 * page (e.g. the inline section AND the popup on the home page).
 */

import { useId } from "react";
import { CONTACT } from "@/lib/site";
import { MoringaMark } from "./MoringaMark";

const inputClass =
  "w-full p-3 bg-paper border border-[#d8c8a8]/70 focus:outline-none focus:border-clay text-ink font-display";

type Props = {
  /** Fired after the WhatsApp hand-off opens — lets the popup close itself. */
  onSent?: () => void;
  /** Analytics label so we can tell where a lead came from. */
  source?: string;
  className?: string;
};

type GtagFn = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export function ContactForm({ onSent, source = "contact_form", className }: Props) {
  const uid = useId();
  const nameId = `${uid}-name`;
  const phoneId = `${uid}-phone`;
  const emailId = `${uid}-email`;
  const messageId = `${uid}-message`;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const lines = [
      "Hi Dt. Priyatama, I'd like to get in touch with Go Moringa.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      message ? `Message: ${message}` : null,
    ].filter(Boolean) as string[];

    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "contact_form_submit", { event_category: "lead", event_label: source });
    }

    window.open(url, "_blank", "noopener,noreferrer");
    onSent?.();
  }

  return (
    <form onSubmit={onSubmit} className={className ?? "space-y-3"}>
      <div>
        <label htmlFor={nameId} className="block text-eyebrow text-warm-500 mb-1">Your name</label>
        <input id={nameId} type="text" name="name" required autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor={phoneId} className="block text-eyebrow text-warm-500 mb-1">Phone (WhatsApp preferred)</label>
        <input id={phoneId} type="tel" name="phone" required autoComplete="tel" inputMode="tel" className={inputClass} />
      </div>
      <div>
        <label htmlFor={emailId} className="block text-eyebrow text-warm-500 mb-1">Email (optional)</label>
        <input id={emailId} type="email" name="email" autoComplete="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor={messageId} className="block text-eyebrow text-warm-500 mb-1">A few words about your goal</label>
        <textarea id={messageId} name="message" rows={3} className={inputClass} />
      </div>
      <button type="submit" className="group w-full p-3 bg-ink text-paper hover:bg-ink-deep transition flex items-center justify-center gap-3">
        <MoringaMark className="size-4 text-clay" />
        <span className="font-display font-medium">Send on WhatsApp</span>
        <span className="text-clay" aria-hidden="true">→</span>
      </button>
      <p className="text-eyebrow text-warm-500 text-center">
        Opens WhatsApp with your details filled in — nothing sends until you press send.
      </p>
    </form>
  );
}
