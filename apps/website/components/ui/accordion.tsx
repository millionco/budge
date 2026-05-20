"use client";

import { useState } from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { motion, AnimatePresence } from "motion/react";
import { TextMorph } from "torph/react";

import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";
import { useWebHaptics } from "web-haptics/react";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={cn("", className)} {...props} />
  );
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger [font-synthesis:none] flex flex-1 justify-between items-center gap-0 rounded-[12px] pt-2.5 pb-2.5 pl-4 pr-3.5 sm:pt-1.75 sm:pb-1.75 sm:pl-3.5 sm:pr-3 antialiased outline-none transition-opacity duration-100",
          "[box-shadow:color(display-p3_1_1_1)_0px_0px_9px_inset,color(display-p3_0_0_0/16%)_0px_0px_0px_0.5px] dark:[box-shadow:color(display-p3_1_1_1/17%)_0px_0px_0px_0.5px] aria-expanded:[box-shadow:none] dark:aria-expanded:[box-shadow:none]",
          "bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_65%)_0%,oklab(98.2%_0_0)_82.16%,oklab(100%_0_0_/_0%)_100%)] dark:bg-none",
          "tracking-[-0.01em] text-[color(display-p3_0.033_0.033_0.033)] dark:text-[color(display-p3_1_1_1)] font-['ABC_Diatype',system-ui,sans-serif] text-[14px]/5 sm:text-xs/4.5",
          className,
        )}
        {...props}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          className="shrink-0 text-black dark:text-white size-[17px] sm:size-[15px]"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M12 4V20"
            className="transition-opacity duration-150 group-aria-expanded/accordion-trigger:opacity-0"
          />
          <path d="M20 12H4" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  open,
  ...props
}: AccordionPrimitive.Panel.Props & { open?: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <AccordionPrimitive.Panel
          data-slot="accordion-content"
          className="overflow-visible text-sm"
          keepMounted
          {...props}
        >
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className={cn(
                "pb-3 pl-4 pr-3.5 sm:pb-2.5 sm:pl-3.5 sm:pr-2.5 flex items-start justify-between gap-3 tracking-[-0.01em] text-[color(display-p3_0.435_0.435_0.435)] dark:text-[color(display-p3_0.655_0.655_0.655)] font-['ABC_Diatype',system-ui,sans-serif] text-[14px]/5 sm:text-xs/4.5",
                className,
              )}
            >
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                className="cursor-pointer"
                onClick={(e) => {
                  const range = document.createRange();
                  range.selectNodeContents(e.currentTarget);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
                }}
              >
                {children}
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <CopyButton text={typeof children === "string" ? children : ""} />
              </motion.div>
            </div>
          </motion.div>
        </AccordionPrimitive.Panel>
      )}
    </AnimatePresence>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [playCopy] = useSound();
  const { trigger: haptic } = useWebHaptics();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        playCopy();
        haptic("soft");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="[font-synthesis:none] rounded-full flex items-center px-1.5 py-[0.5px] antialiased tracking-[-0.01em] text-[color(display-p3_0.033_0.033_0.033)] dark:text-[color(display-p3_0.832_0.832_0.832)] text-[13px]/4.75 sm:text-[11px]/4.5 hover:opacity-70 transition-opacity duration-75 cursor-pointer"
    >
      <TextMorph>{copied ? "Copied" : "Copy"}</TextMorph>
    </button>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
