import * as React from "react";
import { cn } from "./cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  size?: "default" | "narrow";
}

export function Container({
  as: Component = "div",
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "default" && "max-w-[77.5rem]",
        size === "narrow" && "max-w-[47.5rem]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
