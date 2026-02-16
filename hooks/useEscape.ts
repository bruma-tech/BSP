import { useEffect } from "react";

interface UseEscapeCloseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useEscape = ({ isOpen, onClose }: UseEscapeCloseProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);
};
