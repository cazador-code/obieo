"use client";

import { ReactNode } from "react";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

interface CalendlyButtonProps {
  children: ReactNode;
  className?: string;
}

export default function CalendlyButton({
  children,
  className = "",
}: CalendlyButtonProps) {
  const openCalendly = () => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: "https://calendly.com/hello-obieo",
      });
    }
  };

  return (
    <button type="button" onClick={openCalendly} className={className}>
      {children}
    </button>
  );
}

