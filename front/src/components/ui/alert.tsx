import * as React from "react"

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "warning" | "success" }>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white text-gray-950 border-gray-200 dark:bg-gray-950 dark:text-gray-50 dark:border-gray-800",
      destructive: "border-red-200 text-red-800 bg-red-50 dark:border-red-800 dark:text-red-50 dark:bg-red-950",
      warning: "border-yellow-200 text-yellow-800 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-50 dark:bg-yellow-950",
      success: "border-green-200 text-green-800 bg-green-50 dark:border-green-800 dark:text-green-50 dark:bg-green-950"
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border px-4 py-3 text-sm ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h5
      ref={ref}
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

export { Alert, AlertTitle, AlertDescription }
