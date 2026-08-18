"use client";

import { useEffect, useRef, useState } from "react";

export default function CountUp({
  end,
  duration = 1200,
  prefix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
}) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [end, duration]);

  return (
    <>
      {prefix}
      {value.toLocaleString("en-US")}
    </>
  );
}
