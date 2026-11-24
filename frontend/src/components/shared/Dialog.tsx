"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native modal: focus trapping, inert background, Escape, and focus restoration. */
export function Dialog({
  open,
  onClose,
  labelledBy,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;

  useEffect(() => {
    const node = dialog.current;
    if (!node || !open) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={`ssq-dialog ${className}`}
      aria-labelledby={labelledBy}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        // Explicitly wrap the ends as some browser/native-dialog combinations
        // otherwise send reverse-tab focus into browser chrome.
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter(
          (node) =>
            node.getClientRects().length > 0 &&
            getComputedStyle(node).visibility !== "hidden",
        );
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        } else if (!first) event.preventDefault();
      }}
      onCancel={(event) => {
        event.preventDefault();
        closeHandler.current();
      }}
      onClick={(event) => {
        // Only close on the backdrop, not empty space inside the panel.
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        ) {
          closeHandler.current();
        }
      }}
    >
      {children}
    </dialog>
  );
}
