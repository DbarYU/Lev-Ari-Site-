import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warning" | "danger" | "success";
}

const variantClasses = {
  default: "bg-white border border-gray-200",
  warning: "bg-amber-50 border border-amber-300",
  danger: "bg-red-50 border border-red-300",
  success: "bg-green-50 border border-green-300",
};

export function Card({ variant = "default", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl shadow-sm p-6 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
