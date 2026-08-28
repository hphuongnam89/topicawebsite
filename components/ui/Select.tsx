import * as React from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  id: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, placeholder, ...props }, ref) => {
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const isInvalid = !!error;

    return (
      <div className={className}>
        <label htmlFor={id} className="mb-1.5 block text-body-sm font-medium text-ink-800">
          {label}
        </label>
        <div className="relative">
          <select
            id={id}
            ref={ref}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : helperText ? helperId : undefined}
            className={cn(
              "h-12 w-full appearance-none rounded-md border bg-canvas pr-10 pl-4 text-body text-ink-800 transition-colors",
              "focus:outline-2 focus:outline-offset-2 focus:outline-info",
              isInvalid
                ? "border-error hover:border-error focus:border-error"
                : "border-line-200 hover:border-ink-400 focus:border-info",
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-600">
            <ChevronDown className="h-5 w-5" />
          </div>
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

Select.displayName = "Select";
