import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      aria-orientation={orientation}
      className={cn(
        " bg-gray-500 shrink-0 data-[orientation=horizontal]:h-[0.5px] data-[orientation=horizontal]:w-full" +
          " data-[orientation=vertical]:h-[-webkit-fill-available] data-[orientation=vertical]:w-px data-[orientation=vertical]:max-w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
