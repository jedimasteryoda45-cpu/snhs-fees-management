import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  compactMoney,
  money,
  type Payment,
  type StudentRow,
} from "../lib/data";
const tick = { fill: "#929b9b", fontSize: 11, fontFamily: "inherit" };
const tooltipStyle = {
  border: "1px solid #e4e9e5",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 6px 24px #132c2a12",
};
export function MonthlyChart({
  payments,
  expected,
  months,
}: {
  payments: Payment[];
  expected: number;
  months: number;
}) {
  const data = Array.from({ length: 8 }, (_, i) => {
    const prefix = `2026-${String(i + 4).padStart(2, "0")}`;
    return {
      name: new Date(2026, i + 3, 1).toLocaleString("en", { month: "short" }),
      collected: payments
        .filter((p) => p.date.startsWith(prefix))
        .reduce((s, p) => s + p.amount, 0),
      outstanding: Math.max(
        0,
        expected -
          payments
            .filter((p) => p.date.slice(0, 7) <= prefix)
            .reduce((s, p) => s + p.amount, 0),
      ),
    };
  }).slice(-months);
  return (
    <ResponsiveContainer width="100%" height={238}>
      <AreaChart
        data={data}
        margin={{ top: 15, right: 8, left: -8, bottom: 0 }}
      >
        <defs>
          <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e8b74" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#2e8b74" stopOpacity={0.015} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="#edf0ed"
          strokeDasharray="3 4"
        />
        <XAxis
          dataKey="name"
          tick={tick}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={tick}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => money(Number(v))}
        />
        <Area
          type="monotone"
          name="Outstanding"
          dataKey="outstanding"
          stroke="#c6cbbd"
          fill="none"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Area
          type="monotone"
          name="Collected"
          dataKey="collected"
          stroke="#25816a"
          strokeWidth={2.5}
          fill="url(#collectedFill)"
          activeDot={{ r: 5, strokeWidth: 3, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function ClassChart({
  rows,
  onClass,
}: {
  rows: StudentRow[];
  onClass: (n: number) => void;
}) {
  const data = Array.from({ length: 10 }, (_, i) => {
    const group = rows.filter((s) => s.classNo === i + 1);
    return {
      name: `${i + 1}`,
      classNo: i + 1,
      expected: group.reduce((a, s) => a + s.totalFee, 0),
      collected: group.reduce((a, s) => a + s.paid, 0),
    };
  });
  return (
    <ResponsiveContainer width="100%" height={218}>
      <BarChart
        data={data}
        barGap={3}
        margin={{ top: 10, right: 0, left: -12, bottom: 0 }}
        onClick={(state) => {
          if (state?.activeLabel) onClass(Number(state.activeLabel));
        }}
      >
        <CartesianGrid
          vertical={false}
          stroke="#edf0ed"
          strokeDasharray="3 4"
        />
        <XAxis
          dataKey="name"
          tick={tick}
          axisLine={false}
          tickLine={false}
          dy={5}
        />
        <YAxis
          tick={tick}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => compactMoney(v)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(v) => `Class ${v}`}
          formatter={(v) => money(Number(v))}
        />
        <Bar
          name="Expected"
          dataKey="expected"
          fill="#e7ede5"
          radius={[3, 3, 0, 0]}
          maxBarSize={12}
        />
        <Bar
          name="Collected"
          dataKey="collected"
          fill="#388b74"
          radius={[3, 3, 0, 0]}
          maxBarSize={12}
          cursor="pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function Distribution({
  full,
  partial,
  unpaid,
  onStatus,
}: {
  full: number;
  partial: number;
  unpaid: number;
  onStatus: (s: string) => void;
}) {
  const data = [
    { name: "Fully paid", value: full, color: "#327f69" },
    { name: "Partially paid", value: partial, color: "#e8b96f" },
    { name: "Unpaid", value: unpaid, color: "#dce3dc" },
  ];
  const total = full + partial + unpaid;
  return (
    <div className="distribution">
      <div className="donut">
        <ResponsiveContainer width="100%" height={174}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={62}
              outerRadius={79}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              onClick={(d) => {
                if (d.name) onStatus(d.name);
              }}
              cursor="pointer"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`${v} students`, "Students"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>students</span>
        </div>
      </div>
      <div className="distribution-legend">
        {data.map((d) => (
          <button key={d.name} onClick={() => onStatus(d.name)}>
            <span>
              <i style={{ background: d.color }} />
              {d.name}
            </span>
            <strong>{total ? Math.round((d.value / total) * 100) : 0}%</strong>
            <small>{d.value}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
