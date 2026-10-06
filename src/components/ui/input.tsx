"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { fieldChromeClass } from "@/lib/ui-classes";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldChromeClass,
          "flex h-8 px-3 py-1",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
