import * as React from "react"
import { cn } from "cn"
function Textarea({className,...props}:React.ComponentProps<"textarea">){return <textarea data-slot="textarea" className={cn("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-[18px] border bg-background px-3 py-2 text-sm shadow-none outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",className)} {...props}/>}
export {Textarea}
