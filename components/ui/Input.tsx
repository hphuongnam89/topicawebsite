import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LocalizedElement } from "@/components/i18n/LocalizedElement";
import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  id: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, id, leftIcon, rightIcon, required, disabled, ...props },
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
          <LocalizedText>
            {leftIcon && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                <LocalizedText>{leftIcon}</LocalizedText>
              </div>
            )}
          </LocalizedText>
          <LocalizedElement
            as="input"
            id={id}
            ref={ref}
            required={required}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? errorId : helperText ? helperId : undefined}
            className={cn(
              "h-12 w-full rounded-md border bg-canvas text-body text-ink-800 transition-colors",
              leftIcon ? "pl-10" : "px-4",
              rightIcon ? "pr-10" : "px-4",
              "focus:outline-2 focus:outline-offset-2 focus:outline-navy-700",
              isInvalid
                ? "border-error text-error hover:border-error focus:border-error focus:outline-error"
                : "border-line-200 hover:border-navy-500 focus:border-navy-900",
              disabled && "cursor-not-allowed border-line-200 bg-paper text-ink-400",
            )}
            {...props}
          />
          <LocalizedText>
            {rightIcon && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400">
                <LocalizedText>{rightIcon}</LocalizedText>
              </div>
            )}
          </LocalizedText>
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

Input.displayName = "Input";
