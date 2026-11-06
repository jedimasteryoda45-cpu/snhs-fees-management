import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CalendarDays,
  FileBarChart2,
  FileSpreadsheet,
  ReceiptText,
} from "lucide-react";
import { ClassChart, MonthlyChart } from "../components/Charts";
import {
  compactMoney,
  dateLabel,
  exportCsv,
  methods,
  money,
  summarize,
  TODAY,
  type Database,
} from "../lib/data";
export function Reports({
  db,
  onClass,
}: {
  db: Database;
  onClass: (n: number) => void;
}) {
  const [report, setReport] = useState("Monthly collection"),
    [date, setDate] = useState(TODAY),
    [month, setMonth] = useState("2026-11");
  const stats = useMemo(() => summarize(db.students, db.payments), [db]);
  const payments = db.payments.filter((p) =>
    report === "Daily collection"
      ? p.date === date
      : report === "Monthly collection"
        ? p.date.startsWith(month)
        : true,
  );
  const total = payments.reduce((a, p) => a + p.amount, 0);
  const classRows = Array.from({ length: 10 }, (_, i) => {
    const group = stats.rows.filter((s) => s.classNo === i + 1),
      ids = new Set(group.map((s) => s.id));
    return {
      Class: `Class ${i + 1}`,
      Students: group.length,
      Expected: group.reduce((a, s) => a + s.totalFee, 0),
      Collected: report.includes("collection")
        ? payments
            .filter((p) => ids.has(p.studentId))
            .reduce((a, p) => a + p.amount, 0)
        : group.reduce((a, s) => a + s.paid, 0),
      Outstanding: group.reduce((a, s) => a + s.pending, 0),
    };
  });
  function download() {
    if (report === "Payment methods")
      exportCsv(
        "payment-method-report.csv",
        methods.map((m) => ({
          Method: m,
          Transactions: payments.filter((p) => p.method === m).length,
          Collected: payments
            .filter((p) => p.method === m)
            .reduce((a, p) => a + p.amount, 0),
        })),
      );
    else if (report === "Outstanding fees")
      exportCsv(
        "outstanding-fee-report.csv",
        stats.rows
          .filter((s) => s.pending > 0)
          .map((s) => ({
            Student: s.name,
            Admission: s.id,
            Class: s.classNo,
            Expected: s.totalFee,
            Paid: s.paid,
            Outstanding: s.pending,
            "Due date": s.dueDate,
            Overdue: s.overdue ? "Yes" : "No",
          })),
      );
    else
      exportCsv(
        `${report.toLowerCase().replaceAll(" ", "-")}-${report === "Daily collection" ? date : report === "Monthly collection" ? month : "2026-27"}.csv`,
        classRows,
      );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TURN YOUR NUMBERS INTO INSIGHT</div>
          <h1>Reports & analytics</h1>
          <p>
            Understand collections, spot patterns, and share the bigger picture.
          </p>
        </div>
        <button className="button primary" onClick={download}>
          <ArrowDownToLine size={16} />
          Export report
        </button>
      </div>
      <div className="report-tabs">
        {[
          "Daily collection",
          "Monthly collection",
          "Annual collection",
          "Class-wise fees",
          "Outstanding fees",
          "Payment methods",
        ].map((r) => (
          <button
            key={r}
            className={report === r ? "active" : ""}
            onClick={() => setReport(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="report-title">
        <div>
          <FileBarChart2 size={20} />
          <h2>{report}</h2>
          <span>
            {report === "Daily collection"
              ? dateLabel(date)
              : report === "Monthly collection"
                ? new Date(month + "-01T12:00:00").toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : "Academic year 2026–27"}
          </span>
        </div>
        {report === "Daily collection" && (
          <input
            aria-label="Report date"
            type="date"
            min="2026-04-01"
            max={TODAY}
            value={date}
            onChange={(e) => setDate(e.target.value || TODAY)}
          />
        )}{" "}
        {report === "Monthly collection" && (
          <input
            aria-label="Report month"
            type="month"
            min="2026-04"
            max="2026-11"
            value={month}
            onChange={(e) => setMonth(e.target.value || "2026-11")}
          />
        )}
      </div>
      <div className="summary-grid">
        <div className="mini-stat">
          <span>
            {report === "Outstanding fees"
              ? "Outstanding balance"
              : "Collected in selected period"}
          </span>
          <strong>
            {money(report === "Outstanding fees" ? stats.outstanding : total)}
          </strong>
          <small>
            {report.includes("collection")
              ? "Based on actual transaction dates"
              : "Academic year totals"}
          </small>
        </div>
        <div className="mini-stat">
          <span>
            {report === "Outstanding fees"
              ? "Students with a balance"
              : "Payment transactions"}
          </span>
          <strong>
            {report === "Outstanding fees"
              ? stats.rows.filter((s) => s.pending > 0).length
              : payments.length}
            <ReceiptText size={22} />
          </strong>
          <small>
            {report === "Outstanding fees"
              ? `${stats.defaulters.length} students are overdue`
              : "Successful payments recorded"}
          </small>
        </div>
        <div className="mini-stat">
          <span>Annual collection efficiency</span>
          <strong>{stats.efficiency.toFixed(1)}%</strong>
          <small>
            {compactMoney(stats.collected)} of {compactMoney(stats.expected)}{" "}
            collected
          </small>
        </div>
      </div>
      {report === "Payment methods" ? (
        <div className="methods-grid">
          {methods.map((m) => {
            const group = payments.filter((p) => p.method === m),
              value = group.reduce((a, p) => a + p.amount, 0);
            return (
              <div className="panel method-card" key={m}>
                <span className="class-symbol">
                  <FileSpreadsheet size={23} />
                </span>
                <h2>{m}</h2>
                <strong>{money(value)}</strong>
                <p>
                  {group.length} transactions ·{" "}
                  {total ? ((value / total) * 100).toFixed(1) : 0}% of
                  collections
                </p>
                <div className="progress">
                  <i
                    style={{ width: `${total ? (value / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="panel report-chart">
            <div className="panel-heading">
              <div>
                <h3>
                  {report.includes("collection")
                    ? "Monthly collection trend"
                    : "Class performance"}
                </h3>
                <p>
                  {report.includes("collection")
                    ? "Annual context · April to November 2026"
                    : "Expected and collected annual fees across all classes"}
                </p>
              </div>
              <CalendarDays size={18} />
            </div>
            {report.includes("collection") ? (
              <MonthlyChart
                payments={db.payments}
                expected={stats.expected}
                months={8}
              />
            ) : (
              <ClassChart rows={stats.rows} onClass={onClass} />
            )}
          </div>
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Class-wise breakdown</h3>
                <p>
                  Collections reflect the selected period. Expected and
                  outstanding are annual totals.
                </p>
              </div>
              <button className="text-button" onClick={download}>
                <ArrowDownToLine size={14} />
                Download CSV
              </button>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Students</th>
                    <th>Annual expected</th>
                    <th>
                      Collected{" "}
                      {report.includes("collection") ? "in period" : ""}
                    </th>
                    <th>Annual outstanding</th>
                    <th>Annual progress</th>
                  </tr>
                </thead>
                <tbody>
                  {classRows.map((r) => {
                    const annual = stats.rows
                      .filter((s) => `Class ${s.classNo}` === r.Class)
                      .reduce((a, s) => a + s.paid, 0);
                    return (
                      <tr key={r.Class}>
                        <td>
                          <button
                            className="text-button"
                            onClick={() =>
                              onClass(Number(r.Class.split(" ")[1]))
                            }
                          >
                            {r.Class}
                          </button>
                        </td>
                        <td>{r.Students}</td>
                        <td>{money(r.Expected)}</td>
                        <td className="positive">{money(r.Collected)}</td>
                        <td>{money(r.Outstanding)}</td>
                        <td>
                          <div className="inline-progress">
                            <div className="progress">
                              <i
                                style={{
                                  width: `${r.Expected ? (annual / r.Expected) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span>
                              {r.Expected
                                ? ((annual / r.Expected) * 100).toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{db.students.length}</td>
                    <td>{money(stats.expected)}</td>
                    <td>
                      {money(classRows.reduce((a, r) => a + r.Collected, 0))}
                    </td>
                    <td>{money(stats.outstanding)}</td>
                    <td>{stats.efficiency.toFixed(1)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
