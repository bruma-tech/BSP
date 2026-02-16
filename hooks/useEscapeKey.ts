import { useEffect, useRef } from "react";

export const useEscapeKey = (
  isActive: boolean,
  callback: () => void
) => {
  const callbackRef = useRef(callback);

  // always keep latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callbackRef.current();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActive]);
};
