import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[39px] w-full min-w-0 rounded-full border-0 bg-input px-4 py-2 text-base text-foreground outline-none transition-shadow placeholder:text-[#bdbdbd] focus-visible:ring-3 focus-visible:ring-black/5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-foreground md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
