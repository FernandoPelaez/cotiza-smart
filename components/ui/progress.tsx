"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { gsap, useGSAP, reducedMotion } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const indicator = React.useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.to(indicator.current, {
        scaleX: (value ?? 0) / 100,
        duration: reducedMotion() ? 0 : 0.4,
        ease: "power2.out",
      });
    },
    { scope: indicator, dependencies: [value] },
  );
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        ref={indicator}
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary "
        style={{ transformOrigin: "left", transform: "scaleX(0)" }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
