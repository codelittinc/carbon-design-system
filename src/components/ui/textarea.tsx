"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { fieldChromeClass } from "@/lib/ui-classes";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          fieldChromeClass,
          "flex min-h-[80px] px-3 py-2",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
