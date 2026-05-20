import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="mt-10 flex items-center justify-between text-neutral-500 dark:text-neutral-500 text-sm">
      <p>&copy; 2025 Million Software Inc.</p>
      <Link
        href="/"
        className="underline underline-offset-2 hover:text-neutral-950 dark:hover:text-white transition-colors"
      >
        Home
      </Link>
    </footer>
  );
}
