import { useEffect, useRef, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const list = ref.current?.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex="0"]',
        );
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = oldOverflow;
      before?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`badge ${status === "Fully paid" || status === "Success" ? "green" : status === "Partially paid" ? "amber" : "red"}`}
    >
      <i />
      {status}
    </span>
  );
}
export function Empty({
  text = "No results found. Try adjusting your filters.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <Search size={26} />
      <h3>No matching records</h3>
      <p>{text}</p>
    </div>
  );
}
export function Kpi({
  label,
  value,
  change,
  good = true,
  icon,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  change: string;
  good?: boolean;
  icon: ReactNode;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className={`kpi ${accent ? "kpi-accent" : ""}`}>
      <div className="kpi-top">
        <span>{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-bottom">
        <span className={good ? "positive" : "negative"}>
          {good ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}{" "}
          {change}
        </span>
        <span>{sub}</span>
      </div>
    </div>
  );
}
export function Pagination({
  page,
  total,
  size,
  setPage,
}: {
  page: number;
  total: number;
  size: number;
  setPage: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <span>
        Showing{" "}
        <b>
          {total ? (page - 1) * size + 1 : 0}–{Math.min(page * size, total)}
        </b>{" "}
        of <b>{total}</b> results
      </span>
      <div>
        <button
          className="icon-button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="icon-button"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
