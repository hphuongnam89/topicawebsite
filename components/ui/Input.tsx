import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  id: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const isInvalid = !!error;

    return (
      <div className={className}>
        <label htmlFor={id} className="mb-1.5 block text-body-sm font-medium text-ink-800">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : helperText ? helperId : undefined}
            className={cn(
              "h-12 w-full rounded-md border bg-canvas px-4 text-body text-ink-800 transition-colors",
              "focus:outline-2 focus:outline-offset-2 focus:outline-info",
              isInvalid
                ? "border-error hover:border-error focus:border-error"
                : "border-line-200 hover:border-ink-400 focus:border-info",
            )}
            {...props}
          />
        </div>
        {error && (
          <div id={errorId} className="mt-1.5 flex items-center gap-1 text-body-sm text-error">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-body-sm text-ink-600">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
