import type { Metadata } from "next";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Security Policy | Expect",
};

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-['ABC_Diatype',system-ui,sans-serif] text-sm/6 text-neutral-800 dark:text-neutral-200">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
        Security Policy
      </h1>

      <div className="mt-10 space-y-6 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-950 [&_h2]:dark:text-white [&_p]:text-neutral-600 [&_p]:dark:text-neutral-400">
        <p>Thank you for helping us keep Expect secure!</p>

        <h2>Reporting Security Issues</h2>
        <p>
          The security of our systems and user data is our top priority. We appreciate the work of
          security researchers acting in good faith in identifying and reporting potential
          vulnerabilities.
        </p>
        <p>Please report any security issues to support@million.dev.</p>

        <LegalFooter />
      </div>
    </main>
  );
}
