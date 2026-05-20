"use client";

import { useState, useCallback } from "react";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 15C9 12.172 9 10.757 9.879 9.879C10.757 9 12.172 9 15 9L16 9C18.828 9 20.243 9 21.121 9.879C22 10.757 22 12.172 22 15V16C22 18.828 22 20.243 21.121 21.121C20.243 22 18.828 22 16 22H15C12.172 22 10.757 22 9.879 21.121C9 20.243 9 18.828 9 16L9 15Z" />
      <path d="M17 9C16.997 6.043 16.953 4.511 16.092 3.462C15.926 3.26 15.74 3.074 15.538 2.908C14.431 2 12.787 2 9.5 2C6.213 2 4.569 2 3.462 2.908C3.26 3.074 3.074 3.26 2.908 3.462C2 4.569 2 6.213 2 9.5C2 12.787 2 14.431 2.908 15.538C3.074 15.74 3.26 15.926 3.462 16.092C4.511 16.953 6.043 16.997 9 17" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function CommandBlock({ command, long }: { command: string; long?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [command]);

  return (
    <div className="relative [font-synthesis:none] flex justify-between items-center w-full rounded-[12px] pr-3.5 pl-4 pb-3 pt-3 sm:pr-3 sm:pl-3.5 sm:pb-2.75 sm:pt-2.75 bg-[color(display-p3_0.991_0.991_0.991)] border border-solid border-[color(display-p3_1_1_1)] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] antialiased cursor-text overflow-hidden">
      <div className="font-mono-override flex items-start gap-1 p-0 min-w-0">
        <div className="w-3.75 tracking-[-0.01em] text-[#5C5C5C] shrink-0 text-[14.5px]/5 sm:text-[12.5px]/4.5">
          $
        </div>
        <div className="relative min-w-0 overflow-hidden">
          <div
            className={`tracking-[-0.01em] text-[#323232] text-[14.5px]/5 sm:text-[12.5px]/4.5 whitespace-nowrap ${long ? "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-6" : ""}`}
          >
            {command}
          </div>
          {long && (
            <div className="absolute right-0 top-0 h-full w-12 pointer-events-none z-10 bg-[linear-gradient(to_left,color(display-p3_0.991_0.991_0.991)_0%,color(display-p3_0.991_0.991_0.991/0%)_100%)]" />
          )}
        </div>
      </div>
      <button
        type="button"
        className="cursor-pointer hover:opacity-70 transition-opacity duration-75 -m-2 p-2 shrink-0"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckIcon className="text-[#424242] size-[17px] sm:size-[15px] shrink-0" />
        ) : (
          <CopyIcon className="text-[#424242] size-[17px] sm:size-[15px] shrink-0" />
        )}
      </button>
    </div>
  );
}

export function CodeBlock() {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-4">
      <CommandBlock command="npx skills add https://github.com/ben-million/skills --skill budge" long />
    </div>
  );
}
