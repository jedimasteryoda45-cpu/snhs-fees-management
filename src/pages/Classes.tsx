import { ArrowUpRight, Users, GraduationCap } from "lucide-react";
import { money, type StudentRow } from "../lib/data";
export function Classes({
  rows,
  onClass,
}: {
  rows: StudentRow[];
  onClass: (n: number) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EVERY CLASS. EVERY COLLECTION.</div>
          <h1>Classes</h1>
          <p>Track financial performance across all ten classes.</p>
        </div>
        <span className="soft-label">
          <GraduationCap size={16} />
          10 classes · {rows.length} students
        </span>
      </div>
      <div className="classes-grid">
        {Array.from({ length: 10 }, (_, i) => {
          const students = rows.filter((s) => s.classNo === i + 1),
            expected = students.reduce((a, s) => a + s.totalFee, 0),
            collected = students.reduce((a, s) => a + s.paid, 0),
            percent = expected ? (collected / expected) * 100 : 0;
          return (
            <button
              className="panel class-card"
              key={i}
              onClick={() => onClass(i + 1)}
            >
              <div className="class-card-top">
                <span className="class-symbol">
                  <GraduationCap size={22} />
                </span>
                <span className="icon-button">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <h2>Class {i + 1}</h2>
              <p>
                <Users size={14} />
                {students.length} students <span>Sections A & B</span>
              </p>
              <dl>
                <div>
                  <dt>Expected fees</dt>
                  <dd>{money(expected)}</dd>
                </div>
                <div>
                  <dt>Collected</dt>
                  <dd className="positive">{money(collected)}</dd>
                </div>
                <div>
                  <dt>Outstanding</dt>
                  <dd>{money(expected - collected)}</dd>
                </div>
              </dl>
              <div className="progress-label">
                <span>Collection progress</span>
                <strong>{percent.toFixed(1)}%</strong>
              </div>
              <div className="progress">
                <i style={{ width: `${percent}%` }} />
              </div>
              <div className="class-card-footer">
                View students <ArrowUpRight size={14} />
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
