"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { gsap, useGSAP, reducedMotion } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  const root = React.useRef<HTMLButtonElement>(null),
    thumb = React.useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const node = root.current;
      if (!node) return;
      const knob = thumb.current;
      let first = true;
      const update = () => {
        if (!thumb.current) return;
        const checked = node.dataset.state === "checked";
        gsap.to(thumb.current, {
          x: checked ? node.clientWidth - thumb.current.offsetWidth - 2 : 0,
          duration: first || reducedMotion() ? 0 : 0.22,
          ease: "power2.out",
          overwrite: true,
        });
        first = false;
      };
      const observer = new MutationObserver(update);
      observer.observe(node, {
        attributes: true,
        attributeFilter: ["data-state"],
      });
      update();
      return () => {
        observer.disconnect();
        if (knob) gsap.killTweensOf(knob);
      };
    },
    { scope: root },
  );
  return (
    <SwitchPrimitive.Root
      ref={root}
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs  outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        ref={thumb}
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0  group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
