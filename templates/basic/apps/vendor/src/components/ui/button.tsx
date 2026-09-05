import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-black/10",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#dfdfdf]",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        ghost: "bg-transparent text-foreground hover:bg-secondary",
        outline: "border-0 bg-secondary text-foreground hover:bg-[#dfdfdf]",
      },
      size: {
        default: "h-[39px] px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "size-[39px] p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
function Button({ className, variant, size, ...props }: Props) {
  return <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { Button, buttonVariants }
