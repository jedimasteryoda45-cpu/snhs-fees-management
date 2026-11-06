import { useState } from "react";
import {
  ArrowRight,
  Download,
  GraduationCap,
  Pencil,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  UserRound,
  Wallet,
} from "lucide-react";
import { Badge, Modal } from "./ui";
import {
  dateLabel,
  exportCsv,
  initials,
  money,
  TODAY,
  type Payment,
  type SchoolSettings,
  type Student,
  type StudentRow,
} from "../lib/data";
export function StudentForm({
  student,
  paid = 0,
  onSave,
  onClose,
}: {
  student?: Student;
  paid?: number;
  onSave: (student: Student) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(student?.name ?? ""),
    [classNo, setClassNo] = useState(student?.classNo ?? 1),
    [section, setSection] = useState(student?.section ?? "A"),
    [guardian, setGuardian] = useState(student?.guardian ?? ""),
    [contact, setContact] = useState(student?.contact ?? ""),
    [fee, setFee] = useState(student?.totalFee ?? 30400),
    [dueDate, setDueDate] = useState(student?.dueDate ?? "2026-12-10"),
    [error, setError] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !guardian.trim())
      return setError("Enter a student name and guardian name.");
    if (!/^[6-9]\d{9}$/.test(contact))
      return setError("Enter a valid 10-digit Indian mobile number.");
    if (!Number.isInteger(fee) || fee <= 0 || fee < paid)
      return setError(
        `The annual fee must be a whole rupee amount, at least ${money(Math.max(1, paid))}.`,
      );
    onSave({
      id: student?.id ?? `SN${Date.now().toString().slice(-9)}`,
      name: name.trim(),
      classNo,
      section,
      guardian: guardian.trim(),
      contact,
      totalFee: fee,
      dueDate,
      joined: student?.joined ?? TODAY,
    });
  }
  return (
    <Modal
      title={student ? "Edit student" : "Add a new student"}
      subtitle={
        student
          ? `Update the record for ${student.id}.`
          : "A fresh start. Add a student to your school records."
      }
      onClose={onClose}
    >
      <form className="student-form" onSubmit={submit}>
        <label>
          Student name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={70}
            placeholder="e.g. Aarav Sharma"
          />
        </label>
        <div className="field-grid">
          <label>
            Class
            <select
              value={classNo}
              onChange={(e) => {
                const n = Number(e.target.value);
                setClassNo(n);
                if (!student) setFee(28000 + n * 2400);
              }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i + 1}>
                  Class {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Section
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option>A</option>
              <option>B</option>
            </select>
          </label>
        </div>
        <label>
          Parent / Guardian name
          <input
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            maxLength={70}
            placeholder="Parent or guardian’s full name"
            required
          />
        </label>
        <label>
          Contact number
          <input
            type="tel"
            inputMode="numeric"
            value={contact}
            onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
            maxLength={10}
            placeholder="10-digit mobile number"
            required
          />
        </label>
        <div className="field-grid">
          <label>
            Total annual fee (₹)
            <input
              type="number"
              min={Math.max(1, paid)}
              step="1"
              value={fee || ""}
              onChange={(e) => setFee(Number(e.target.value))}
              required
            />
          </label>
          <label>
            Fee due date
            <input
              type="date"
              min="2026-04-01"
              max="2027-03-31"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </label>
        </div>
        {paid > 0 && (
          <p className="form-hint">
            Already paid: {money(paid)}. Fee changes update the outstanding
            balance.
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            <Plus size={16} />
            {student ? "Save changes" : "Add student"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function StudentDetails({
  student: s,
  onClose,
  onEdit,
  onCollect,
  onReceipt,
}: {
  student: StudentRow;
  onClose: () => void;
  onEdit: () => void;
  onCollect: () => void;
  onReceipt: (p: Payment) => void;
}) {
  const [tab, setTab] = useState("Overview");
  return (
    <Modal
      title="Student details"
      subtitle={`Admission number ${s.id}`}
      onClose={onClose}
      wide
    >
      <div className="detail-identity">
        <span className="avatar extra-large">{initials(s.name)}</span>
        <div>
          <h2>{s.name}</h2>
          <p>
            Class {s.classNo} · Section {s.section}
          </p>
        </div>
        <Badge status={s.status} />
      </div>
      <div className="detail-stats">
        <div>
          <span>Total annual fee</span>
          <strong>{money(s.totalFee)}</strong>
        </div>
        <div>
          <span>Amount paid</span>
          <strong className="positive">{money(s.paid)}</strong>
        </div>
        <div>
          <span>Outstanding</span>
          <strong>{money(s.pending)}</strong>
        </div>
      </div>
      <div className="detail-tabs">
        {["Overview", "Payment history"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Payment history" && <span>{s.history.length}</span>}
          </button>
        ))}
      </div>
      {tab === "Overview" ? (
        <div className="detail-info">
          <div>
            <UserRound size={17} />
            <span>
              Parent / Guardian<strong>{s.guardian}</strong>
            </span>
          </div>
          <div>
            <Phone size={17} />
            <span>
              Contact number<strong>{s.contact}</strong>
            </span>
          </div>
          <div>
            <GraduationCap size={17} />
            <span>
              Academic year<strong>2026–27</strong>
            </span>
          </div>
          <div>
            <Wallet size={17} />
            <span>
              Fee due date
              <strong className={s.overdue ? "overdue" : ""}>
                {dateLabel(s.dueDate)}
                {s.overdue ? " · Overdue" : ""}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="detail-history">
          {s.history.length ? (
            s.history.map((p) => (
              <button key={p.id} onClick={() => onReceipt(p)}>
                <span className="receipt-icon">
                  <ReceiptText size={18} />
                </span>
                <span>
                  <strong>{money(p.amount)}</strong>
                  <small>
                    {dateLabel(p.date)} · {p.method}
                  </small>
                </span>
                <span>{p.receipt}</span>
                <ArrowRight size={16} />
              </button>
            ))
          ) : (
            <div className="empty">
              <ReceiptText size={24} />
              <h3>No payments yet</h3>
              <p>Record the first payment to get started.</p>
            </div>
          )}
        </div>
      )}
      <div className="modal-actions">
        <button className="button" onClick={onEdit}>
          <Pencil size={15} />
          Edit student
        </button>
        <button
          className="button primary"
          onClick={onCollect}
          disabled={s.pending <= 0}
        >
          <Plus size={16} />
          Collect fee
        </button>
      </div>
    </Modal>
  );
}
export function Receipt({
  payment: p,
  student: s,
  settings,
  onClose,
}: {
  payment: Payment;
  student: StudentRow;
  settings: SchoolSettings;
  onClose: () => void;
}) {
  const paidAtTime = s.history
    .filter((h) => h.date < p.date || (h.date === p.date && h.id <= p.id))
    .reduce((a, h) => a + h.amount, 0);
  return (
    <Modal
      title="Payment receipt"
      subtitle="A successful payment, neatly recorded."
      onClose={onClose}
    >
      <div className="receipt-print">
        <div className="receipt-school">
          <span className="school-logo">
            <GraduationCap size={26} />
          </span>
          <h2>{settings.name}</h2>
          <p>{settings.address}</p>
          <span className="sample-watermark">
            SAMPLE RECEIPT · FRONTEND DEMO
          </span>
        </div>
        <div className="receipt-heading">
          <div>
            <small>RECEIPT NUMBER</small>
            <strong>{p.receipt}</strong>
          </div>
          <Badge status="Success" />
        </div>
        <dl className="receipt-dl">
          <div>
            <dt>Student</dt>
            <dd>{s.name}</dd>
          </div>
          <div>
            <dt>Admission number</dt>
            <dd>{s.id}</dd>
          </div>
          <div>
            <dt>Class / Section</dt>
            <dd>
              {s.classNo} – {s.section}
            </dd>
          </div>
          <div>
            <dt>Academic year</dt>
            <dd>2026–27</dd>
          </div>
          <div>
            <dt>Payment date</dt>
            <dd>{dateLabel(p.date)}</dd>
          </div>
          <div>
            <dt>Payment method</dt>
            <dd>{p.method}</dd>
          </div>
          <div>
            <dt>Transaction ID</dt>
            <dd>{p.id}</dd>
          </div>
        </dl>
        <div className="receipt-total">
          <span>Amount received</span>
          <strong>{money(p.amount)}</strong>
        </div>
        <div className="receipt-balance">
          Balance after this transaction{" "}
          <strong>{money(Math.max(0, s.totalFee - paidAtTime))}</strong>
        </div>
        <p className="receipt-thanks">
          Thank you for investing in a brighter future.
          <br />
          <small>
            This is a simulated receipt. No real payment was processed.
          </small>
        </p>
      </div>
      <div className="modal-actions">
        <button
          className="button"
          onClick={() =>
            exportCsv(`receipt-${p.id}.csv`, [
              {
                School: settings.name,
                Receipt: p.receipt,
                Transaction: p.id,
                Student: s.name,
                Admission: s.id,
                Class: s.classNo,
                Amount: p.amount,
                Method: p.method,
                Date: p.date,
                Type: "Sample demo receipt",
              },
            ])
          }
        >
          <Download size={15} />
          Download CSV
        </button>
        <button className="button primary" onClick={() => window.print()}>
          <Printer size={15} />
          Print receipt
        </button>
      </div>
    </Modal>
  );
}
