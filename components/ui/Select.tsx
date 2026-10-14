import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
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
  (
    { className, label, error, helperText, id, options, placeholder, required, disabled, ...props },
    ref,
  ) => {
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const isInvalid = !!error;

    return (
      <div className={className}>
        <label htmlFor={id} className="mb-1.5 block text-body-sm font-medium text-ink-800">
          <LocalizedText>{label}</LocalizedText>
          {required && (
            <span className="ml-1 text-error" aria-hidden="true">
              <LocalizedText>*</LocalizedText>
            </span>
          )}
        </label>
        <div className="relative">
          <LocalizedElement
            as="select"
            id={id}
            ref={ref}
            required={required}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : helperText ? helperId : undefined}
            className={cn(
              "h-12 w-full appearance-none rounded-md border bg-canvas pr-10 pl-4 text-body text-ink-800 transition-colors",
              "focus:outline-2 focus:outline-offset-2 focus:outline-navy-700",
              isInvalid
                ? "border-error text-error hover:border-error focus:border-error focus:outline-error"
                : "border-line-200 hover:border-navy-500 focus:border-navy-900",
              disabled && "cursor-not-allowed border-line-200 bg-paper text-ink-400",
            )}
            {...props}
          >
            <LocalizedText>
              {placeholder && (
                <option value="" disabled>
                  <LocalizedText>{placeholder}</LocalizedText>
                </option>
              )}
            </LocalizedText>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                <LocalizedText>{option.label}</LocalizedText>
              </option>
            ))}
          </LocalizedElement>
          <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-400">
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <LocalizedText>
          {error && (
            <div id={errorId} className="mt-1.5 flex items-center gap-1.5 text-body-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <LocalizedText>{error}</LocalizedText>
              </span>
            </div>
          )}
        </LocalizedText>
        <LocalizedText>
          {!error && helperText && (
            <p id={helperId} className="mt-1.5 text-body-sm text-ink-600">
              <LocalizedText>{helperText}</LocalizedText>
            </p>
          )}
        </LocalizedText>
      </div>
    );
  },
);

Select.displayName = "Select";
