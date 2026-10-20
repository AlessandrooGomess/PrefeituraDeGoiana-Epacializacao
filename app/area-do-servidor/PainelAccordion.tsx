"use client";

import { ReactNode, useEffect, useState } from "react";
import styles from "./prefeito-dashboard.module.css";

interface PainelAccordionProps {
  title: string;
  count?: number;
  children: ReactNode;
}

export default function PainelAccordion({
  title,
  count,
  children,
}: PainelAccordionProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const syncWithViewport = () => setOpen(!mediaQuery.matches);
    queueMicrotask(syncWithViewport);
    mediaQuery.addEventListener("change", syncWithViewport);
    return () => mediaQuery.removeEventListener("change", syncWithViewport);
  }, []);

  return (
    <details
      className={styles.accordionPanel}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className={styles.accordionSummary}>
        <span>{title}</span>
        {count !== undefined && <b>{count}</b>}
      </summary>
      <div className={styles.accordionContent}>{children}</div>
    </details>
  );
}
