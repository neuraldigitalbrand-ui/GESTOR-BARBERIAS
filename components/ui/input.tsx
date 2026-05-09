import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-9 w-full rounded-lg bg-bg border border-white/[0.10] px-3 text-sm text-text-1",
      "placeholder:text-text-3 transition-all duration-150",
      "focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-lg bg-bg border border-white/[0.10] px-3 py-2.5 text-sm text-text-1",
      "placeholder:text-text-3 transition-all duration-150 resize-none",
      "focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
