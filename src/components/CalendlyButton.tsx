"use client";

import { ReactNode } from "react";
import { useBookingModal } from "./BookingModalContext";

interface CalendlyButtonProps {
  children: ReactNode;
  className?: string;
  source?: string;
}

export default function CalendlyButton({
  children,
  className = "",
  source,
}: CalendlyButtonProps) {
  const { openModal } = useBookingModal();

  return (
    <button
      onClick={() => openModal(source)}
      className={className}
    >
      {children}
    </button>
  );
}
