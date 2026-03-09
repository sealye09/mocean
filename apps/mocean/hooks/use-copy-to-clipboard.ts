"use client";

import * as React from "react";

export function useCopyToClipboard({
  duration = 2000,
  onCopy
}: {
  duration?: number;
  onCopy?: () => void;
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), duration);
    } catch (e) {
      console.error(e);
    }
  };

  return { isCopied, copyToClipboard };
}
