import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Check,
  CreditCard,
  Download,
  FileText,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Badge, Empty, Pagination } from "../components/ui";
import {
  dateLabel,
  exportCsv,
  initials,
  methods,
  money,
  TODAY,
  type Payment,
  type PaymentMethod,
  type StudentRow,
} from "../lib/data";
export function Transactions({
  payments,
  rows,
  onReceipt,
  compact = false,
}: {
  payments: Payment[];
  rows: StudentRow[];
  onReceipt: (p: Payment) => void;
  compact?: boolean;
}) {
  const [search, setSearch] = useState(""),
    [method, setMethod] = useState(""),
    [classFilter, setClassFilter] = useState(""),
    [month, setMonth] = useState(""),
    [page, setPage] = useState(1);
  const studentMap = useMemo(() => new Map(rows.map((s) => [s.id, s])), [rows]);
  useEffect(() => setPage(1), [search, method, classFilter, month]);
  const filtered = payments
    .filter((p) => {
      const s = studentMap.get(p.studentId);
      return (
        (!method || p.method === method) &&
        (!classFilter || s?.classNo === Number(classFilter)) &&
        (!month || p.date.startsWith(month)) &&
        `${s?.name} ${p.id} ${p.receipt} ${p.studentId}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const visible = compact
    ? filtered.slice(0, 5)
    : filtered.slice((safePage - 1) * 10, safePage * 10);
  return (
    <>
      {!compact && (
        <div className="table-toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              aria-label="Search transactions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, transaction or receipt…"
            />
          </div>
          <div className="table-filters">
            <select
              aria-label="Transaction class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All classes</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Class {i + 1}
                </option>
              ))}
            </select>
            <select
              aria-label="Payment method filter"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="">All methods</option>
              {methods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <input
              aria-label="Transaction month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button
              className="button small"
              disabled={!filtered.length}
              onClick={() =>
                exportCsv(
                  "payment-history.csv",
                  filtered.map((p) => ({
                    "Transaction ID": p.id,
                    Student: studentMap.get(p.studentId)?.name ?? "",
                    Class: studentMap.get(p.studentId)?.classNo ?? "",
                    Amount: p.amount,
                    Method: p.method,
                    Date: p.date,
                    Receipt: p.receipt,
                    Status: "Success",
                  })),
                )
              }
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {!compact && <th>Transaction ID</th>}
              <th>Student</th>
              <th>Class</th>
              <th>Amount</th>
              <th>Payment method</th>
              <th>Date</th>
              <th>Status</th>
              <th>{compact ? "" : "Receipt"}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              const s = studentMap.get(p.studentId);
              return (
                <tr key={p.id}>
                  {!compact && <td className="mono muted">{p.id}</td>}
                  <td>
                    <div className="student-link">
                      <span
                        className={`avatar avatar-${(s?.classNo ?? 0) % 4}`}
                      >
                        {initials(s?.name ?? "?")}
                      </span>
                      <span>
                        <strong>{s?.name}</strong>
                        <small>{p.studentId}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="class-tag">
                      {s?.classNo} – {s?.section}
                    </span>
                  </td>
                  <td className="table-money">{money(p.amount)}</td>
                  <td>
                    <span className="method-label">
                      {p.method === "UPI" ? (
                        <Smartphone size={13} />
                      ) : p.method === "Cash" ? (
                        <Banknote size={14} />
                      ) : (
                        <CreditCard size={14} />
                      )}{" "}
                      {p.method}
                    </span>
                  </td>
                  <td className="muted">{dateLabel(p.date)}</td>
                  <td>
                    <Badge status="Success" />
                  </td>
                  <td>
                    <button
                      className={compact ? "icon-button" : "receipt-link"}
                      aria-label={`Preview receipt ${p.receipt}`}
                      onClick={() => onReceipt(p)}
                    >
                      {compact ? (
                        <ArrowUpRight size={17} />
                      ) : (
                        <>
                          <FileText size={13} />
                          {p.receipt}
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!filtered.length && <Empty />}
      {!compact && (
        <Pagination
          page={safePage}
          total={filtered.length}
          size={10}
          setPage={setPage}
        />
      )}
    </>
  );
}
export function PaymentHistory(props: {
  payments: Payment[];
  rows: StudentRow[];
  onReceipt: (p: Payment) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">A RECORD OF EVERY PAYMENT</div>
          <h1>Payment history</h1>
          <p>
            View transactions, track payment methods, and access student
            receipts.
          </p>
        </div>
        <span className="soft-label">
          <ShieldCheck size={16} />
          {props.payments.length.toLocaleString()} successful transactions
        </span>
      </div>
      <div className="panel">
        <Transactions {...props} />
      </div>
    </>
  );
}
export function FeeCollection({
  rows,
  selectedId,
  onPayment,
}: {
  rows: StudentRow[];
  selectedId: string;
  onPayment: (
    studentId: string,
    amount: number,
    method: PaymentMethod,
    date: string,
  ) => void;
}) {
  const [search, setSearch] = useState(""),
    [id, setId] = useState(selectedId),
    [amount, setAmount] = useState(""),
    [method, setMethod] = useState<PaymentMethod>("UPI"),
    [date, setDate] = useState(TODAY),
    [error, setError] = useState("");
  useEffect(() => {
    setId(selectedId);
    setAmount("");
  }, [selectedId]);
  const student = rows.find((s) => s.id === id);
  const matches = rows
    .filter((s) =>
      `${s.name} ${s.id}`.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 6);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) return;
    const n = Number(amount);
    if (
      !Number.isFinite(n) ||
      n <= 0 ||
      n > student.pending ||
      !Number.isInteger(n)
    ) {
      setError(
        "Enter a whole rupee amount between ₹1 and the outstanding balance.",
      );
      return;
    }
    if (date < student.joined || date > TODAY) {
      setError(
        "Choose a payment date within the current academic year, up to today.",
      );
      return;
    }
    onPayment(student.id, n, method, date);
    setAmount("");
    setError("");
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKE EVERY PAYMENT COUNT</div>
          <h1>Fee collection</h1>
          <p>
            Find a student, record a payment, and issue a receipt in a few
            simple steps.
          </p>
        </div>
        <span className="demo-tag">
          <i />
          Demo payments
        </span>
      </div>
      <div className="collection-layout">
        <div className="panel collection-form">
          <div className="section-title">
            <h3>
              <span className="step">1</span>Find a student
            </h3>
            <Search size={18} />
          </div>
          <div className="collection-search">
            <div className="search-input">
              <Search size={17} />
              <input
                aria-label="Find student for payment"
                placeholder="Search student name or admission number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {(search || !student) && (
              <div className="student-results">
                {matches.length ? (
                  matches.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setId(s.id);
                        setSearch("");
                        setAmount("");
                        setError("");
                      }}
                    >
                      <span className="avatar">{initials(s.name)}</span>
                      <span>
                        <strong>{s.name}</strong>
                        <small>
                          {s.id} · Class {s.classNo} – {s.section}
                        </small>
                      </span>
                      <span>
                        {s.pending ? (
                          money(s.pending)
                        ) : (
                          <Badge status="Fully paid" />
                        )}
                      </span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))
                ) : (
                  <Empty text="No student matches this name or admission number." />
                )}
              </div>
            )}
          </div>
          {student && (
            <>
              <div className="selected-student">
                <span className="avatar large">{initials(student.name)}</span>
                <div>
                  <h3>{student.name}</h3>
                  <p>
                    {student.id} · Class {student.classNo} – {student.section}
                  </p>
                </div>
                <Badge status={student.status} />
              </div>
              <div className="fee-summary">
                <div>
                  <span>Total annual fee</span>
                  <strong>{money(student.totalFee)}</strong>
                </div>
                <div>
                  <span>Already paid</span>
                  <strong className="positive">{money(student.paid)}</strong>
                </div>
                <div>
                  <span>Outstanding balance</span>
                  <strong>{money(student.pending)}</strong>
                </div>
              </div>
              <form onSubmit={submit}>
                <div className="section-title form-divider">
                  <h3>
                    <span className="step">2</span>Payment details
                  </h3>
                  <Wallet size={18} />
                </div>
                {student.pending > 0 ? (
                  <>
                    <label>
                      Amount to collect (₹)
                      <div className="amount-input">
                        <span>₹</span>
                        <input
                          aria-label="Payment amount"
                          type="number"
                          min="1"
                          step="1"
                          max={student.pending}
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setError("");
                          }}
                          placeholder="0"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setAmount(String(student.pending))}
                        >
                          Pay full balance
                        </button>
                      </div>
                    </label>
                    <div className="field-grid">
                      <label>
                        Payment method
                        <select
                          value={method}
                          onChange={(e) =>
                            setMethod(e.target.value as PaymentMethod)
                          }
                        >
                          {methods.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Payment date
                        <input
                          type="date"
                          min={student.joined}
                          max={TODAY}
                          value={date}
                          required
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </label>
                    </div>
                    {error && (
                      <p role="alert" className="form-error">
                        {error}
                      </p>
                    )}
                    <div className="collection-total">
                      <span>Balance after payment</span>
                      <strong>
                        {money(student.pending - (Number(amount) || 0))}
                      </strong>
                    </div>
                    <button className="button primary full" type="submit">
                      <Check size={17} />
                      Record payment & generate receipt
                    </button>
                    <p className="form-hint">
                      <ShieldCheck size={13} /> Simulated payment. No real money
                      is transferred.
                    </p>
                  </>
                ) : (
                  <div className="paid-notice">
                    <Check size={24} />
                    <h3>All fees are paid</h3>
                    <p>This student has no outstanding balance.</p>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
        <aside>
          <div className="panel collection-guide">
            <span className="guide-icon">
              <ArrowDownLeft size={25} />
            </span>
            <h2>
              A little less admin.
              <br />A lot more clarity.
            </h2>
            <p>
              Every payment is immediately reflected across your dashboard,
              class reports, and student records.
            </p>
            <div>
              <Check size={16} />
              Automatic balance updates
            </div>
            <div>
              <Check size={16} />
              Instant payment receipts
            </div>
            <div>
              <Check size={16} />
              Saved in this browser
            </div>
          </div>
          <div className="info-note">
            <ShieldCheck size={19} />
            <p>
              <strong>A safe space to explore</strong>This is a frontend demo.
              All student information is fictional and changes are saved only on
              this device.
            </p>
          </div>
          {student && (
            <div className="panel payment-contact">
              <h3>Parent / Guardian</h3>
              <p>{student.guardian}</p>
              <span>{student.contact}</span>
              <small>Fee due: {dateLabel(student.dueDate)}</small>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
