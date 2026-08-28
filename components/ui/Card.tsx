import * as React from "react";
import { cn } from "./cn";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-lg border border-line-200 bg-canvas transition-shadow transition-transform duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  aspect?: string;
}

export function CardMedia({
  className,
  aspect = "aspect-[4/3]",
  children,
  ...props
}: CardMediaProps) {
  return (
    <div className={cn("relative overflow-hidden", aspect, className)} {...props}>
      <div className="h-full w-full transition-transform duration-[var(--duration-base)] group-hover:scale-[1.03]">
        {children}
      </div>
    </div>
  );
}

type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, ...props }: CardBodyProps) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("px-5 pt-0 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}
