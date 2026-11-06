import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Plus,
  ArrowUpDown,
  ArrowUpRight,
  SlidersHorizontal,
  Clock3,
} from "lucide-react";
import { Badge, Empty, Pagination } from "../components/ui";
import {
  compactMoney,
  exportCsv,
  dateLabel,
  initials,
  money,
  TODAY,
  type StudentRow,
} from "../lib/data";
export function Students({
  rows,
  pending = false,
  initialClass = "",
  initialStatus = "",
  onView,
  onAdd,
}: {
  rows: StudentRow[];
  pending?: boolean;
  initialClass?: string;
  initialStatus?: string;
  onView: (id: string) => void;
  onAdd: () => void;
}) {
  const [search, setSearch] = useState(""),
    [classFilter, setClassFilter] = useState(initialClass),
    [status, setStatus] = useState(initialStatus),
    [amount, setAmount] = useState(""),
    [duration, setDuration] = useState(""),
    [sort, setSort] = useState<{ key: keyof StudentRow; asc: boolean }>({
      key: pending ? "pending" : "id",
      asc: !pending,
    }),
    [page, setPage] = useState(1);
  useEffect(() => {
    setClassFilter(initialClass);
    setStatus(initialStatus);
  }, [initialClass, initialStatus]);
  useEffect(
    () => setPage(1),
    [search, classFilter, status, amount, duration, pending],
  );
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (s) =>
            (!pending || s.pending > 0) &&
            (!classFilter || s.classNo === Number(classFilter)) &&
            (!status || s.status === status) &&
            (!amount || s.pending >= Number(amount)) &&
            (!duration ||
              (s.overdue &&
                Math.floor(
                  (new Date(TODAY).getTime() - new Date(s.dueDate).getTime()) /
                    86400000,
                ) >= Number(duration))) &&
            `${s.name} ${s.id} ${s.guardian} ${s.contact}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) => {
          const av = a[sort.key],
            bv = b[sort.key];
          return (
            (typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv))) * (sort.asc ? 1 : -1)
          );
        }),
    [rows, pending, classFilter, status, amount, duration, search, sort],
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  function sortBy(key: keyof StudentRow) {
    setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }));
  }
  const exportStudents = () =>
    exportCsv(
      pending ? "outstanding-fees.csv" : "students.csv",
      filtered.map((s) => ({
        "Admission no.": s.id,
        Student: s.name,
        Class: s.classNo,
        Section: s.section,
        Guardian: s.guardian,
        Contact: s.contact,
        "Total fee": s.totalFee,
        Paid: s.paid,
        Pending: s.pending,
        Status: s.status,
        "Due date": s.dueDate,
        "Last payment": s.lastPayment,
      })),
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {pending
              ? "STAY ON TOP OF OUTSTANDING FEES"
              : "YOUR SCHOOL, AT A GLANCE"}
          </div>
          <h1>
            {pending ? "Pending fees" : "Students"}
            <span className="heading-count">
              {pending ? rows.filter((s) => s.pending > 0).length : rows.length}
            </span>
          </h1>
          <p>
            {pending
              ? "A clear view of outstanding balances and students who need a follow-up."
              : "Manage student records, fee details, and payment activity in one place."}
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button"
            onClick={exportStudents}
            disabled={!filtered.length}
          >
            <Download size={16} />
            Export CSV
          </button>
          {!pending && (
            <button className="button primary" onClick={onAdd}>
              <Plus size={17} />
              Add student
            </button>
          )}
        </div>
      </div>
      {pending && (
        <>
          <div className="summary-grid">
            <div className="mini-stat">
              <span>Outstanding balance</span>
              <strong>{money(rows.reduce((a, s) => a + s.pending, 0))}</strong>
              <small>
                Across {rows.filter((s) => s.pending > 0).length} students
              </small>
            </div>
            <div className="mini-stat">
              <span>Overdue students</span>
              <strong>
                {rows.filter((s) => s.overdue).length}
                <Clock3 size={22} />
              </strong>
              <small>
                {money(
                  rows
                    .filter((s) => s.overdue)
                    .reduce((a, s) => a + s.pending, 0),
                )}{" "}
                past the due date
              </small>
            </div>
            <div className="mini-stat">
              <span>Highest outstanding</span>
              <strong>
                {money(Math.max(0, ...rows.map((s) => s.pending)))}
              </strong>
              <small>
                {[...rows].sort((a, b) => b.pending - a.pending)[0]?.name}
              </small>
            </div>
          </div>
          <div className="panel pending-breakdown">
            <div className="section-title">
              <h3>Outstanding by class</h3>
              <span>Click a class to filter</span>
            </div>
            <div className="class-pills">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  className={classFilter === String(i + 1) ? "selected" : ""}
                  key={i}
                  onClick={() =>
                    setClassFilter(
                      classFilter === String(i + 1) ? "" : String(i + 1),
                    )
                  }
                >
                  <span>Class {i + 1}</span>
                  <strong>
                    {compactMoney(
                      rows
                        .filter((s) => s.classNo === i + 1)
                        .reduce((a, s) => a + s.pending, 0),
                    )}
                  </strong>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="panel student-panel">
        <div className="table-toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              aria-label="Search students"
              placeholder="Search by name, admission no. or parent…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-filters">
            <select
              aria-label="Filter by class"
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
              aria-label="Filter by payment status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {["Fully paid", "Partially paid", "Unpaid"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {pending && (
          <div className="extra-filters">
            <SlidersHorizontal size={15} />
            <span>More filters</span>
            <select
              aria-label="Minimum pending amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            >
              <option value="">Any pending amount</option>
              <option value="10000">₹10,000 or more</option>
              <option value="25000">₹25,000 or more</option>
              <option value="40000">₹40,000 or more</option>
            </select>
            <select
              aria-label="Overdue duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="">Any due date</option>
              <option value="1">Overdue</option>
              <option value="30">30+ days overdue</option>
              <option value="60">60+ days overdue</option>
              <option value="90">90+ days overdue</option>
            </select>
            {(search || status || classFilter || amount || duration) && (
              <button
                className="text-button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setClassFilter("");
                  setAmount("");
                  setDuration("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        <div className="table-scroll">
          <table className="students-table">
            <thead>
              <tr>
                <th>
                  <button onClick={() => sortBy("name")}>
                    Student <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>
                  <button onClick={() => sortBy("classNo")}>
                    Class <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>Parent / Guardian</th>
                <th>
                  <button onClick={() => sortBy("totalFee")}>
                    Total fee <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>
                  <button onClick={() => sortBy("paid")}>
                    Paid <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>
                  <button onClick={() => sortBy("pending")}>
                    Pending <ArrowUpDown size={12} />
                  </button>
                </th>
                <th>Status</th>
                <th>
                  <button onClick={() => sortBy("lastPayment")}>
                    Last payment <ArrowUpDown size={12} />
                  </button>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.slice((safePage - 1) * 10, safePage * 10).map((s) => (
                <tr key={s.id}>
                  <td>
                    <button
                      className="student-link"
                      onClick={() => onView(s.id)}
                    >
                      <span className={`avatar avatar-${s.classNo % 4}`}>
                        {initials(s.name)}
                      </span>
                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.id}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="class-tag">
                      {s.classNo} – {s.section}
                    </span>
                  </td>
                  <td>
                    <span>{s.guardian}</span>
                    <small className="block muted">{s.contact}</small>
                  </td>
                  <td>{money(s.totalFee)}</td>
                  <td>{money(s.paid)}</td>
                  <td className={s.pending ? "amount-pending" : "muted"}>
                    {money(s.pending)}
                    {pending && s.overdue && (
                      <small className="block overdue">
                        Overdue · {dateLabel(s.dueDate)}
                      </small>
                    )}
                  </td>
                  <td>
                    <Badge status={s.status} />
                  </td>
                  <td className="muted">
                    {s.lastPayment ? dateLabel(s.lastPayment) : "No payments"}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`View ${s.name}`}
                      onClick={() => onView(s.id)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty />}
        <Pagination
          page={safePage}
          total={filtered.length}
          size={10}
          setPage={setPage}
        />
      </div>
      <div className="page-footnote">
        All fee amounts are for the academic year 2026–27.{" "}
        <span>Amounts in INR (₹)</span>
      </div>
    </>
  );
}
