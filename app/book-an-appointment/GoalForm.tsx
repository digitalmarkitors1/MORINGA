"use client";

/**
 * Booking form — collects name/phone/email/programme/goal and hands off to
 * WhatsApp via a pre-filled wa.me deeplink. No data leaves the browser until
 * the user presses "send" inside WhatsApp itself.
 *
 * This replaces the old `action="mailto:"` form, which triggered Chrome's
 * "This form is not secure. Autofill has been turned off." warning (browsers
 * flag autofillable fields that submit to a mailto target) and gave a poor,
 * often-broken mobile experience. WhatsApp is already the primary channel on
 * this page, so the deeplink is also the faster path for the client.
 */

import { CONTACT } from "@/lib/site";
import { MoringaMark } from "@/app/components/MoringaMark";

const PROGRAMS = [
  "Healthy Weight Loss Program",
  "Diabetes Reversal Program",
  "PCOD / PCOS Management",
  "Corporate Health Plans",
  "Skin and Hair Program",
  "7 Day Cleanse Diet Program",
  "Online Trial Diet Plan",
  "Weight Gain Program",
  "Adolescent Obesity Weight Loss Program",
  "Post-Pregnancy Weight Loss Program",
  "Therapeutic Diets Program",
];

const inputClass =
  "w-full p-3 bg-paper border border-[#d8c8a8]/70 focus:outline-none focus:border-clay text-ink font-display";

export function GoalForm() {
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const program = String(data.get("program") || "").trim();
    const message = String(data.get("message") || "").trim();

    const lines = [
      "Hi Dt. Priyatama, I'd like to book an appointment.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      `Programme: ${program}`,
      message ? `Goal: ${message}` : null,
    ].filter(Boolean) as string[];

    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <div>
        <label htmlFor="name" className="block text-eyebrow text-warm-500 mb-1">Your name</label>
        <input id="name" type="text" name="name" required autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="phone" className="block text-eyebrow text-warm-500 mb-1">Phone (WhatsApp preferred)</label>
        <input id="phone" type="tel" name="phone" required autoComplete="tel" inputMode="tel" className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="block text-eyebrow text-warm-500 mb-1">Email (optional)</label>
        <input id="email" type="email" name="email" autoComplete="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor="program" className="block text-eyebrow text-warm-500 mb-1">Programme</label>
        <select id="program" name="program" required defaultValue="" className={inputClass}>
          <option value="" disabled>Select...</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value="Not sure / discuss">Not sure — let&rsquo;s discuss</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-eyebrow text-warm-500 mb-1">A few words about your goal</label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
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
