import { describe, expect, it } from "vitest";
import {
  seedDatabase,
  studentBalance,
  summarize,
  TODAY,
  type Payment,
} from "./data";
describe("Shared school fee ledger", () => {
  it("creates 480 unique students, ten classes, and unique transactions and receipts", () => {
    const db = seedDatabase();
    expect(db.students).toHaveLength(480);
    expect(new Set(db.students.map((s) => s.id)).size).toBe(480);
    expect(new Set(db.students.map((s) => s.name)).size).toBe(480);
    expect(new Set(db.students.map((s) => s.classNo)).size).toBe(10);
    expect(new Set(db.payments.map((p) => p.id)).size).toBe(db.payments.length);
    expect(new Set(db.payments.map((p) => p.receipt)).size).toBe(
      db.payments.length,
    );
  });
  it("reconciles every balance and all dashboard categories with the payment ledger", () => {
    const db = seedDatabase(),
      stats = summarize(db.students, db.payments);
    expect(stats.expected).toBe(stats.collected + stats.outstanding);
    expect(stats.collected).toBe(db.payments.reduce((a, p) => a + p.amount, 0));
    expect(stats.fullyPaid + stats.partial + stats.unpaid).toBe(480);
    for (const s of stats.rows) {
      expect(s.pending).toBeGreaterThanOrEqual(0);
      expect(s.paid + s.pending).toBe(s.totalFee);
    }
    expect(stats.fullyPaid).toBeGreaterThan(0);
    expect(stats.partial).toBeGreaterThan(0);
    expect(stats.unpaid).toBeGreaterThan(0);
  });
  it("keeps all payments within the demo timeline and linked to a student", () => {
    const db = seedDatabase(),
      ids = new Set(db.students.map((s) => s.id));
    for (const p of db.payments) {
      expect(ids.has(p.studentId)).toBe(true);
      expect(p.amount).toBeGreaterThan(0);
      expect(Number.isInteger(p.amount)).toBe(true);
      expect(p.date >= "2026-04-01" && p.date <= TODAY).toBe(true);
    }
    expect(new Set(db.payments.map((p) => p.date.slice(0, 7))).size).toBe(8);
  });
  it("updates totals, status, history, and overdue counts after a full payment", () => {
    const db = seedDatabase(),
      before = summarize(db.students, db.payments),
      s = before.defaulters[0];
    const payment: Payment = {
      id: "TXN-99999",
      studentId: s.id,
      amount: s.pending,
      method: "UPI",
      date: TODAY,
      receipt: "TEST",
    };
    const after = summarize(db.students, [...db.payments, payment]),
      updated = after.rows.find((r) => r.id === s.id)!;
    expect(after.expected).toBe(before.expected);
    expect(after.collected).toBe(before.collected + s.pending);
    expect(after.outstanding).toBe(before.outstanding - s.pending);
    expect(after.defaulters.length).toBe(before.defaulters.length - 1);
    expect(after.fullyPaid).toBe(before.fullyPaid + 1);
    expect(updated.status).toBe("Fully paid");
    expect(updated.overdue).toBe(false);
    expect(updated.history[0]).toEqual(payment);
  });
  it("distinguishes unpaid, partial, overdue, and not-yet-due balances", () => {
    const s = seedDatabase().students[0],
      unpaid = studentBalance({ ...s, dueDate: "2026-12-10" }, []);
    expect(unpaid.status).toBe("Unpaid");
    expect(unpaid.overdue).toBe(false);
    const partial = studentBalance({ ...s, dueDate: "2026-07-10" }, [
      {
        id: "TXN-1",
        studentId: s.id,
        amount: 1000,
        method: "Cash",
        date: TODAY,
        receipt: "TEST",
      },
    ]);
    expect(partial.status).toBe("Partially paid");
    expect(partial.overdue).toBe(true);
    expect(partial.pending).toBe(s.totalFee - 1000);
  });
  it("keeps totals consistent when a student is added or their annual fee changes", () => {
    const db = seedDatabase(),
      before = summarize(db.students, db.payments),
      added = { ...db.students[0], id: "NEW", totalFee: 50000 };
    const after = summarize([...db.students, added], db.payments);
    expect(after.expected).toBe(before.expected + 50000);
    expect(after.outstanding).toBe(before.outstanding + 50000);
    expect(after.collected).toBe(before.collected);
    const updated = summarize(
      db.students.map((s, i) =>
        i ? s : { ...s, totalFee: s.totalFee + 5000 },
      ),
      db.payments,
    );
    expect(updated.expected).toBe(before.expected + 5000);
    expect(updated.outstanding).toBe(before.outstanding + 5000);
  });
  it("handles an empty school without invalid percentages or negative balances", () => {
    expect(summarize([], [])).toMatchObject({
      expected: 0,
      collected: 0,
      outstanding: 0,
      efficiency: 0,
      fullyPaid: 0,
      unpaid: 0,
    });
  });
});
