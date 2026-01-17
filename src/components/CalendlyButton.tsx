"use client";

import { ReactNode } from "react";
import Link from "next/link";

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
  const href = source ? `/call?source=${encodeURIComponent(source)}` : "/call";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
