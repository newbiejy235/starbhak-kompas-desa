"use client";

import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const baseField =
  "w-full rounded-xl border bg-white text-sm text-neutral-900 placeholder:text-gray-400 transition-all duration-200 ease-out focus:outline-none disabled:bg-neutral-100";

function errorShake(error?: string) {
  // Field yang salah bergetar ringan saat error muncul (PRD 8.2)
  return error ? "animate-shake" : "";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className={errorShake(error)}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-semibold text-neutral-900 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-err` : undefined}
          // Focus glow: border + ring primary 200ms (PRD 9.2)
          className={`${baseField} h-11 px-3.5 ${
            error
              ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/15"
              : "border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/15"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p id={`${fieldId}-err`} role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className={errorShake(error)}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-semibold text-neutral-900 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={`${baseField} px-3.5 py-2.5 min-h-24 resize-y ${
            error
              ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/15"
              : "border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/15"
          } ${className}`}
          {...props}
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
