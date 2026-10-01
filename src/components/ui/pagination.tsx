"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

interface PaginationProps {
  /** Current page, 1-based. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** With `pageSize`, shows "Showing 11–20 of 57". */
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

type PageSlot = number | "gap-start" | "gap-end";

/** Up to seven slots: first, last, the current page's neighbours, and gaps. */
function pageSlots(page: number, totalPages: number): PageSlot[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "gap-end", totalPages];
  if (page >= totalPages - 3)
    return [1, "gap-start", ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  return [1, "gap-start", page - 1, page, page + 1, "gap-end", totalPages];
}

/**
 * Page controls for a list split into pages. Renders nothing when there is only
 * one page.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}
    >
      {totalItems !== undefined && pageSize !== undefined ? (
        <p className="text-xs text-text-muted tabular-nums">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of{" "}
          {totalItems}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </Button>
        {pageSlots(page, totalPages).map((slot) =>
          typeof slot === "number" ? (
            <Button
              key={slot}
              variant={slot === page ? "outline" : "ghost"}
              size="icon"
              aria-label={`Page ${slot}`}
              aria-current={slot === page ? "page" : undefined}
              className={cn(slot === page && "border-accent text-accent-text")}
              onClick={() => onPageChange(slot)}
            >
              {slot}
            </Button>
          ) : (
            <span key={slot} className="px-1 text-sm text-text-faint" aria-hidden="true">
              …
            </span>
          ),
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </nav>
  );
}
