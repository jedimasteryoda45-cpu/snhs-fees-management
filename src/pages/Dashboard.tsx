import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  GraduationCap,
  Plus,
  TrendingUp,
  Users,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Kpi } from "../components/ui";
import { MonthlyChart, ClassChart, Distribution } from "../components/Charts";
import { Transactions } from "./Payments";
import {
  compactMoney,
  exportCsv,
  money,
  summarize,
  TODAY,
  type Database,
  type Payment,
} from "../lib/data";
export function Dashboard({
  db,
  onNavigate,
  onClass,
  onStatus,
  onCollect,
  onReceipt,
}: {
  db: Database;
  onNavigate: (s: string) => void;
  onClass: (n: number) => void;
  onStatus: (s: string) => void;
  onCollect: () => void;
  onReceipt: (p: Payment) => void;
}) {
  const [months, setMonths] = useState(8);
  const stats = summarize(db.students, db.payments);
  const prev = summarize(
    db.students.filter((s) => s.joined < "2026-11-01"),
    db.payments.filter((p) => p.date < "2026-11-01"),
  );
  const current = db.payments
    .filter((p) => p.date.startsWith("2026-11"))
    .reduce((a, p) => a + p.amount, 0);
  const last = db.payments
    .filter((p) => p.date >= "2026-10-01" && p.date <= "2026-10-06")
    .reduce((a, p) => a + p.amount, 0);
  const today = db.payments.filter((p) => p.date === TODAY);
  const overduePrev = prev.rows.filter(
    (s) => s.pending > 0 && s.dueDate < "2026-11-01",
  ).length;
  const collectionGrowth = prev.collected
    ? ((stats.collected - prev.collected) / prev.collected) * 100
    : 0;
  const change = current - last;
  const exportSummary = () =>
    exportCsv("dashboard-summary.csv", [
      {
        Period: "2026–27",
        Students: db.students.length,
        "Expected fees": stats.expected,
        "Collected fees": stats.collected,
        Outstanding: stats.outstanding,
        "Collection efficiency": stats.efficiency.toFixed(2),
        "Overdue students": stats.defaulters.length,
      },
    ]);
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <div className="eyebrow">
            <span className="tiny-sun">☀</span> FRIDAY, 6 NOVEMBER 2026
          </div>
          <h1>A clear view of your school.</h1>
          <p>
            Welcome back, {db.settings.admin.split(" ")[0]}. Here’s where your
            collections stand.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button" onClick={exportSummary}>
            <ArrowDownToLine size={16} />
            Export report
          </button>
          <button className="button primary" onClick={onCollect}>
            <Plus size={18} />
            Collect fee
          </button>
        </div>
      </div>
      <div className="overview-row">
        <div className="overview-tabs">
          <span className="active">Overview</span>
          <button onClick={() => onNavigate("Reports")}>
            Analytics <ArrowUpRight size={13} />
          </button>
        </div>
        <span className="period-label">
          <CalendarDays size={14} />
          Academic year 2026–27
          <span className="live-dot" />
          Live overview
        </span>
      </div>
      <div className="kpi-grid">
        <Kpi
          label="Total students"
          value={String(db.students.length)}
          icon={<Users size={17} />}
          change={`${db.students.filter((s) => s.joined > "2026-10-31").length} new`}
          sub="this month"
        />
        <Kpi
          label="Expected fees"
          value={compactMoney(stats.expected)}
          icon={<Wallet size={17} />}
          change={`${prev.expected ? (((stats.expected - prev.expected) / prev.expected) * 100).toFixed(1) : 0}%`}
          sub="vs. last month"
        />
        <Kpi
          label="Collected fees"
          value={compactMoney(stats.collected)}
          icon={<CircleDollarSign size={17} />}
          change={`+${collectionGrowth.toFixed(1)}%`}
          sub="vs. last month"
          accent
        />
        <Kpi
          label="Outstanding fees"
          value={compactMoney(stats.outstanding)}
          icon={<Clock3 size={17} />}
          change={`${prev.outstanding ? (((prev.outstanding - stats.outstanding) / prev.outstanding) * 100).toFixed(1) : "0"}% less`}
          sub="vs. last month"
        />
        <Kpi
          label="Collection efficiency"
          value={`${stats.efficiency.toFixed(1)}%`}
          icon={<TrendingUp size={17} />}
          change={`+${(stats.efficiency - prev.efficiency).toFixed(1)} pts`}
          sub="vs. last month"
        />
        <Kpi
          label="Total defaulters"
          value={String(stats.defaulters.length)}
          icon={<GraduationCap size={17} />}
          change={`${Math.abs(overduePrev - stats.defaulters.length)} ${stats.defaulters.length <= overduePrev ? "fewer" : "more"}`}
          good={stats.defaulters.length <= overduePrev}
          sub="vs. last month"
        />
      </div>
      <div className="analytics-top">
        <section className="panel monthly-panel">
          <div className="panel-heading">
            <div>
              <h3>Fee collection overview</h3>
              <p>Monthly collections and outstanding balances</p>
            </div>
            <select
              aria-label="Chart time range"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              <option value={8}>Apr – Nov 2026</option>
              <option value={6}>Last 6 months</option>
              <option value={3}>Last 3 months</option>
            </select>
          </div>
          <div className="chart-key">
            <span>
              <i className="green-dot" />
              Collected fees
            </span>
            <span>
              <i className="pale-dot" />
              Outstanding fees
            </span>
          </div>
          <MonthlyChart
            payments={db.payments}
            expected={stats.expected}
            months={months}
          />
          <div className="chart-footnote">
            <span className="positive">
              <TrendingUp size={14} />
              {money(Math.abs(change))} {change >= 0 ? "more" : "less"}{" "}
              collected
            </span>
            <span>vs. the first 6 days of October</span>
            <CircleHelp size={13} />
          </div>
        </section>
        <section className="panel performance-panel">
          <div className="panel-heading">
            <div>
              <h3>A strong year in progress</h3>
              <p>Every payment makes a difference.</p>
            </div>
            <span className="sparkle">✦</span>
          </div>
          <div className="performance-number">
            {stats.efficiency.toFixed(1)}
            <span>%</span>
          </div>
          <div className="performance-label">of annual fees collected</div>
          <div className="performance-progress">
            <i style={{ width: `${stats.efficiency}%` }} />
            <span style={{ left: "90%" }} />
          </div>
          <div className="performance-goal">
            <span>0%</span>
            <span>90% target</span>
            <span>100%</span>
          </div>
          <div className="performance-amounts">
            <div>
              <span>Collected so far</span>
              <strong>{compactMoney(stats.collected)}</strong>
            </div>
            <div>
              <span>Annual expected</span>
              <strong>{compactMoney(stats.expected)}</strong>
            </div>
          </div>
          <div className="performance-callout">
            <span className="callout-icon">
              <TrendingUp size={17} />
            </span>
            <p>
              {stats.efficiency >= 90 ? (
                <>
                  <strong>Target achieved. Keep it going!</strong>You've crossed
                  the 90% collection goal.
                </>
              ) : (
                <>
                  <strong>
                    {compactMoney(
                      Math.max(0, stats.expected * 0.9 - stats.collected),
                    )}{" "}
                    to reach your target
                  </strong>
                  A few follow-ups can go a long way.
                </>
              )}
            </p>
          </div>
          <button
            className="performance-link"
            onClick={() => onNavigate("Pending Fees")}
          >
            Review outstanding fees <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <div className="analytics-bottom">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Class-wise collection</h3>
              <p>A little perspective, class by class</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Classes")}
            >
              View classes <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="chart-key">
            <span>
              <i className="green-dot" />
              Collected
            </span>
            <span>
              <i className="light-dot" />
              Expected
            </span>
            <small>Click a bar to explore</small>
          </div>
          <ClassChart rows={stats.rows} onClass={onClass} />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Payment distribution</h3>
              <p>Student fee payment status</p>
            </div>
            <span className="subtle-icon">
              <Users size={17} />
            </span>
          </div>
          <Distribution
            full={stats.fullyPaid}
            partial={stats.partial}
            unpaid={stats.unpaid}
            onStatus={onStatus}
          />
        </section>
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <h3>Needs your attention</h3>
              <p>Small actions. Meaningful impact.</p>
            </div>
            <span className="attention-dot" />
          </div>
          <div className="attention-item">
            <span className="attention-icon amber">
              <Clock3 size={18} />
            </span>
            <div>
              <strong>
                {stats.defaulters.length} students have overdue fees
              </strong>
              <p>
                {compactMoney(
                  stats.defaulters.reduce((a, s) => a + s.pending, 0),
                )}{" "}
                is past its due date.
              </p>
              <button
                className="text-button"
                onClick={() => onNavigate("Pending Fees")}
              >
                Review defaulters <ArrowRight size={13} />
              </button>
            </div>
          </div>
          <div className="attention-item">
            <span className="attention-icon mint">
              <CircleDollarSign size={18} />
            </span>
            <div>
              <strong>{today.length} payments received today</strong>
              <p>
                {money(today.reduce((a, p) => a + p.amount, 0))} added to your
                collections.
              </p>
              <button
                className="text-button"
                onClick={() => onNavigate("Payment History")}
              >
                View transactions <ArrowRight size={13} />
              </button>
            </div>
          </div>
          <div className="attention-footer">
            <span className="live-dot" />
            You're up to date. Keep it going.
          </div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h3>
              Recent transactions{" "}
              <span className="small-count">
                {db.payments.length.toLocaleString()}
              </span>
            </h3>
            <p>The latest payments across your school</p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("Payment History")}
          >
            View all transactions <ChevronRight size={15} />
          </button>
        </div>
        <Transactions
          payments={db.payments}
          rows={stats.rows}
          onReceipt={onReceipt}
          compact
        />
      </section>
      <div className="page-footnote">
        <span>
          <span className="live-dot" />
          All systems looking good. Your changes are saved in this browser.
        </span>
        <span>Made for more meaningful school days.</span>
      </div>
    </>
  );
}
