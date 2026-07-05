import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  containerClassName?: string
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    return (
      <div className={cn("relative", containerClassName)}>
        <Search
          className={cn(
            "absolute left-3 top-1/2 size-5 -translate-y-1/2 transition-colors duration-200",
            focused ? "text-accent-teal" : "text-text-muted"
          )}
          aria-hidden
        />
        <Input
          ref={ref}
          className={cn("pl-10", className)}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
