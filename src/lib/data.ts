export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer";
export type Student = {
  id: string;
  name: string;
  classNo: number;
  section: string;
  guardian: string;
  contact: string;
  totalFee: number;
  dueDate: string;
  joined: string;
};
export type Payment = {
  id: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  receipt: string;
};
export type SchoolSettings = {
  name: string;
  shortName: string;
  admin: string;
  email: string;
  address: string;
};
export type Database = {
  version: 1;
  students: Student[];
  payments: Payment[];
  settings: SchoolSettings;
};
export const TODAY = "2026-11-06";
export const STORE_KEY = "snhs-fees-demo-v1";
export const methods: PaymentMethod[] = ["UPI", "Cash", "Bank Transfer"];
export const defaultSettings: SchoolSettings = {
  name: "Shanthinikethan High School",
  shortName: "SNHS",
  admin: "Priya Mehta",
  email: "admin@snhs.edu.in",
  address: "Hyderabad, Telangana",
};
export function seedDatabase(): Database {
  const first = [
    "Aarav",
    "Ananya",
    "Vihaan",
    "Diya",
    "Arjun",
    "Ishita",
    "Aditya",
    "Kavya",
    "Reyansh",
    "Saanvi",
    "Krishna",
    "Aadhya",
    "Sai",
    "Meera",
    "Rohan",
    "Anika",
    "Dhruv",
    "Tara",
    "Ishaan",
    "Riya",
    "Kabir",
    "Avni",
    "Atharv",
    "Myra",
    "Dev",
    "Nitya",
    "Vivaan",
    "Pihu",
    "Shaurya",
    "Kiara",
    "Aryan",
    "Sneha",
  ];
  const last = [
    "Sharma",
    "Reddy",
    "Patel",
    "Nair",
    "Rao",
    "Mehta",
    "Verma",
    "Iyer",
    "Gupta",
    "Singh",
    "Menon",
    "Joshi",
    "Kumar",
    "Desai",
    "Shah",
  ];
  const students: Student[] = [],
    payments: Payment[] = [];
  for (let i = 0; i < 480; i++) {
    const classNo = Math.floor(i / 48) + 1,
      totalFee = 28000 + classNo * 2400;
    const id = `SN${String(2026001 + i).slice(2)}`;
    students.push({
      id,
      name: `${first[i % 32]} ${last[Math.floor(i / 32)]}`,
      classNo,
      section: i % 2 ? "B" : "A",
      guardian: `${["Rajesh", "Sunita", "Suresh", "Lakshmi", "Vikram", "Deepa"][i % 6]} ${last[Math.floor(i / 32)]}`,
      contact: `98${String(65400000 + i * 137)}`,
      totalFee,
      dueDate:
        i % 4 === 0
          ? "2026-12-10"
          : ["2026-07-10", "2026-09-10", "2026-10-10"][i % 3],
      joined: "2026-04-01",
    });
    const group = (i * 17) % 100;
    const paid =
      group < 61
        ? totalFee
        : group < 88
          ? Math.round(totalFee * [0.25, 0.5, 0.75][i % 3])
          : 0;
    if (paid) {
      const count = group < 61 ? 3 : 2;
      let remaining = paid;
      for (let j = 0; j < count; j++) {
        const amount = j === count - 1 ? remaining : Math.floor(paid / count);
        remaining -= amount;
        const month =
          j === 0 ? 4 + (i % 2) : j === 1 ? 6 + (i % 3) : 9 + (i % 3);
        const day = month === 11 ? 1 + (i % 6) : 1 + ((i * 7 + j * 3) % 27);
        const number = payments.length + 1;
        payments.push({
          id: `TXN-${String(number).padStart(5, "0")}`,
          studentId: id,
          amount,
          method: methods[(i + j) % 3],
          date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          receipt: `SNHS/26/${String(number).padStart(5, "0")}`,
        });
      }
    }
  }
  return { version: 1, students, payments, settings: defaultSettings };
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const compactMoney = (value: number) =>
  value >= 100000 ? `₹${(value / 100000).toFixed(2)}L` : money(value);
export const dateLabel = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
export function studentBalance(student: Student, payments: Payment[]) {
  const history = payments
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const paid = history.reduce((sum, p) => sum + p.amount, 0);
  const pending = student.totalFee - paid;
  return {
    ...student,
    paid,
    pending,
    history,
    status:
      pending <= 0 ? "Fully paid" : paid > 0 ? "Partially paid" : "Unpaid",
    overdue: pending > 0 && student.dueDate < TODAY,
    lastPayment: history[0]?.date ?? "",
  };
}
export type StudentRow = ReturnType<typeof studentBalance>;
export function summarize(students: Student[], payments: Payment[]) {
  const rows = students.map((s) => studentBalance(s, payments));
  const expected = rows.reduce((sum, s) => sum + s.totalFee, 0);
  const collected = rows.reduce((sum, s) => sum + s.paid, 0);
  return {
    rows,
    expected,
    collected,
    outstanding: expected - collected,
    efficiency: expected ? (collected / expected) * 100 : 0,
    defaulters: rows.filter((s) => s.overdue),
    fullyPaid: rows.filter((s) => s.pending <= 0).length,
    partial: rows.filter((s) => s.pending > 0 && s.paid > 0).length,
    unpaid: rows.filter((s) => s.paid === 0).length,
  };
}
export function exportCsv(
  filename: string,
  rows: Record<string, string | number>[],
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) =>
    `"${String(v)
      .replace(/^[=+@\t\r-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const csv =
    "\ufeff" +
    [
      headers.map(escape).join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
    ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
