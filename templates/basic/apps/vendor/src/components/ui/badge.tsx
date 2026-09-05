import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-black text-white",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "border-border bg-white text-foreground",
        success: "border-transparent bg-emerald-50 text-emerald-700",
        warning: "border-transparent bg-amber-50 text-amber-700",
        info: "border-transparent bg-blue-50 text-blue-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

type Props = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>
function Badge({ className, variant, ...props }: Props) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
