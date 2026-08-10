import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  resend ??= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// Resend allows sending from this address without a verified domain, but
// only to the account owner's own inbox. Once a custom domain is verified
// in Resend, replace this with an address on that domain to email real
// customers and vendors.
export const EMAIL_FROM = "Iranian Marketplace <onboarding@resend.dev>";
