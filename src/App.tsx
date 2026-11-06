import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileBarChart2,
  GraduationCap,
  History,
  LayoutDashboard,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  X,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { useDatabase } from "./hooks/useDatabase";
import {
  initials,
  money,
  seedDatabase,
  summarize,
  type Payment,
  type PaymentMethod,
  type Student,
} from "./lib/data";
import { Modal } from "./components/ui";
import {
  StudentDetails,
  StudentForm,
  Receipt,
} from "./components/StudentDialogs";
import { Dashboard } from "./pages/Dashboard";
import { Students } from "./pages/Students";
import { Classes } from "./pages/Classes";
import { FeeCollection, PaymentHistory } from "./pages/Payments";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Students", icon: Users },
  { name: "Classes", icon: BookOpen },
  { name: "Fee Collection", icon: Wallet },
  { name: "Pending Fees", icon: Clock3 },
  { name: "Payment History", icon: History },
  { name: "Reports", icon: FileBarChart2 },
  { name: "Settings", icon: Settings2 },
];
const slug = (page: string) => page.toLowerCase().replaceAll(" ", "-");
function readPage() {
  return (
    navigation.find((n) => slug(n.name) === window.location.hash.slice(1))
      ?.name ?? "Dashboard"
  );
}
export default function App() {
  const { db, setDb, storageError } = useDatabase();
  const [page, setPage] = useState(readPage),
    [sidebar, setSidebar] = useState(false),
    [classFilter, setClassFilter] = useState(""),
    [statusFilter, setStatusFilter] = useState(""),
    [collectId, setCollectId] = useState(""),
    [detailId, setDetailId] = useState(""),
    [form, setForm] = useState<"add" | "edit" | null>(null),
    [editId, setEditId] = useState(""),
    [receipt, setReceipt] = useState<Payment | null>(null),
    [searchOpen, setSearchOpen] = useState(false),
    [search, setSearch] = useState(""),
    [notifications, setNotifications] = useState(false),
    [info, setInfo] = useState<"help" | "year" | null>(null),
    [toast, setToast] = useState("");
  const stats = useMemo(
    () => summarize(db.students, db.payments),
    [db.students, db.payments],
  );
  const notify = useCallback((text: string) => setToast(text), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const handler = () => {
      setPage(readPage());
      setSidebar(false);
      setNotifications(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSidebar(false);
        setNotifications(false);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  function navigate(next: string) {
    setPage(next);
    window.location.hash = slug(next);
    setSidebar(false);
    setNotifications(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function onClass(n: number) {
    setClassFilter(String(n));
    setStatusFilter("");
    navigate("Students");
  }
  function onStatus(s: string) {
    setClassFilter("");
    setStatusFilter(s);
    navigate("Students");
  }
  function collect(id = "") {
    setCollectId(id);
    setDetailId("");
    navigate("Fee Collection");
  }
  function saveStudent(student: Student) {
    setDb((old) => ({
      ...old,
      students:
        form === "edit"
          ? old.students.map((s) => (s.id === student.id ? student : s))
          : [...old.students, student],
    }));
    notify(
      form === "edit"
        ? "Student details updated."
        : "Student added to your school.",
    );
    setForm(null);
  }
  function recordPayment(
    studentId: string,
    amount: number,
    method: PaymentMethod,
    date: string,
  ) {
    const student = stats.rows.find((s) => s.id === studentId);
    if (
      !student ||
      amount > student.pending ||
      amount <= 0 ||
      !Number.isInteger(amount)
    ) {
      notify("Please check the payment amount.");
      return;
    }
    const num =
      Math.max(
        0,
        ...db.payments.map((p) => Number(p.id.replace("TXN-", "")) || 0),
      ) + 1;
    const payment: Payment = {
      id: `TXN-${String(num).padStart(5, "0")}`,
      studentId,
      amount,
      method,
      date,
      receipt: `SNHS/26/${String(num).padStart(5, "0")}`,
    };
    setDb((old) => ({ ...old, payments: [...old.payments, payment] }));
    setReceipt(payment);
    notify(`${money(amount)} payment recorded successfully.`);
  }
  const selected = stats.rows.find((s) => s.id === detailId),
    editing = stats.rows.find((s) => s.id === editId),
    receiptStudent = stats.rows.find((s) => s.id === receipt?.studentId);
  const searchResults = stats.rows
    .filter((s) =>
      `${s.name} ${s.id} ${s.guardian}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .slice(0, 7);
  const closeDetail = useCallback(() => setDetailId(""), []),
    closeForm = useCallback(() => setForm(null), []),
    closeReceipt = useCallback(() => setReceipt(null), []),
    closeSearch = useCallback(() => setSearchOpen(false), []),
    closeInfo = useCallback(() => setInfo(null), []);
  return (
    <div className="app-shell">
      {sidebar && (
        <div className="sidebar-overlay" onClick={() => setSidebar(false)} />
      )}
      <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#dashboard"
          onClick={() => navigate("Dashboard")}
        >
          <span className="school-logo">
            <GraduationCap size={25} />
          </span>
          <span>
            <strong>{db.settings.shortName}</strong>
            <small>SCHOOL MANAGEMENT</small>
          </span>
        </a>
        <div className="workspace-switch">
          <span className="workspace-icon">S</span>
          <div>
            <strong>{db.settings.name}</strong>
            <small>School workspace</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map((n, i) => (
            <button
              key={n.name}
              className={`nav-item ${page === n.name ? "active" : ""} ${i === 6 ? "nav-separated" : ""}`}
              onClick={() => {
                if (n.name === "Students") {
                  setClassFilter("");
                  setStatusFilter("");
                }
                navigate(n.name);
              }}
            >
              <n.icon size={18} />
              <span>{n.name}</span>
              {n.name === "Pending Fees" && (
                <span className="nav-count">{stats.defaulters.length}</span>
              )}
              {page === n.name && n.name !== "Pending Fees" && (
                <span className="nav-active-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-card-icon">
              <CircleHelp size={20} />
            </span>
            <h4>A little help goes a long way.</h4>
            <p>
              Everything you need to get started with your school workspace.
            </p>
            <button onClick={() => setInfo("help")}>
              Explore the guide <ArrowRight size={14} />
            </button>
          </div>
          <div className="sidebar-demo">
            <span className="live-dot" />
            Demo workspace <span>v1.0</span>
          </div>
          <button
            className="admin-profile"
            onClick={() => navigate("Settings")}
          >
            <span className="admin-avatar">{initials(db.settings.admin)}</span>
            <span>
              <strong>{db.settings.admin}</strong>
              <small>School administrator</small>
            </span>
            <Settings2 size={16} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebar(true)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="global-search"
              aria-label="Search students and pages"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={15} />
              <span>Search anything…</span>
              <kbd>Ctrl K</kbd>
            </button>
            <span className="topbar-divider" />
            <button className="year-button" onClick={() => setInfo("year")}>
              <CalendarDays size={15} />
              <span>2026 – 27</span>
              <ChevronDown size={13} />
            </button>
            <div className="notification-wrap">
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={notifications}
                onClick={() => setNotifications((v) => !v)}
              >
                <Bell size={19} />
                {stats.defaulters.length > 0 && <i />}
              </button>
              {notifications && (
                <>
                  <div
                    className="notification-dismiss"
                    onClick={() => setNotifications(false)}
                  />
                  <div className="notification-panel">
                    <div>
                      <h3>School updates</h3>
                      <button
                        className="icon-button"
                        onClick={() => setNotifications(false)}
                        aria-label="Close notifications"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <button onClick={() => navigate("Pending Fees")}>
                      <span className="attention-icon amber">
                        <Clock3 size={18} />
                      </span>
                      <span>
                        <strong>
                          {stats.defaulters.length} students have overdue fees
                        </strong>
                        <small>
                          Review outstanding balances and follow up.
                        </small>
                      </span>
                      <ChevronRight size={15} />
                    </button>
                    <button onClick={() => navigate("Payment History")}>
                      <span className="attention-icon mint">
                        <CreditCard size={18} />
                      </span>
                      <span>
                        <strong>Your payment records are up to date</strong>
                        <small>
                          {db.payments.length} successful transactions
                        </small>
                      </span>
                      <ChevronRight size={15} />
                    </button>
                    <p>Calculated from your current demo data.</p>
                  </div>
                </>
              )}
            </div>
            <button
              className="topbar-avatar"
              onClick={() => navigate("Settings")}
              aria-label="Open administrator settings"
            >
              {initials(db.settings.admin)}
            </button>
          </div>
        </header>
        <main>
          {storageError && (
            <div className="storage-warning">{storageError}</div>
          )}
          {page === "Dashboard" && (
            <Dashboard
              db={db}
              onNavigate={navigate}
              onClass={onClass}
              onStatus={onStatus}
              onCollect={() => collect()}
              onReceipt={setReceipt}
            />
          )}
          {page === "Students" && (
            <Students
              rows={stats.rows}
              initialClass={classFilter}
              initialStatus={statusFilter}
              onView={setDetailId}
              onAdd={() => {
                setEditId("");
                setForm("add");
              }}
            />
          )}
          {page === "Classes" && (
            <Classes rows={stats.rows} onClass={onClass} />
          )}
          {page === "Pending Fees" && (
            <Students
              key="pending"
              rows={stats.rows}
              pending
              onView={setDetailId}
              onAdd={() => setForm("add")}
            />
          )}
          {page === "Fee Collection" && (
            <FeeCollection
              rows={stats.rows}
              selectedId={collectId}
              onPayment={recordPayment}
            />
          )}
          {page === "Payment History" && (
            <PaymentHistory
              payments={db.payments}
              rows={stats.rows}
              onReceipt={setReceipt}
            />
          )}
          {page === "Reports" && <Reports db={db} onClass={onClass} />}
          {page === "Settings" && (
            <Settings
              key={db.settings.name + db.settings.admin}
              settings={db.settings}
              onSave={(settings) => {
                setDb((old) => ({ ...old, settings }));
                notify("School profile saved.");
              }}
              onReset={() => {
                setDb(seedDatabase());
                setClassFilter("");
                setStatusFilter("");
                setCollectId("");
                notify("Original demo data restored.");
              }}
            />
          )}
        </main>
      </div>
      {selected && !form && !receipt && (
        <StudentDetails
          student={selected}
          onClose={closeDetail}
          onEdit={() => {
            setEditId(selected.id);
            setForm("edit");
          }}
          onCollect={() => collect(selected.id)}
          onReceipt={setReceipt}
        />
      )}
      {form && (
        <StudentForm
          student={form === "edit" ? editing : undefined}
          paid={form === "edit" ? editing?.paid : 0}
          onClose={closeForm}
          onSave={saveStudent}
        />
      )}
      {receipt && receiptStudent && (
        <Receipt
          payment={receipt}
          student={receiptStudent}
          settings={db.settings}
          onClose={closeReceipt}
        />
      )}
      {searchOpen && (
        <Modal
          title="Find something in your school"
          subtitle="Search students, admission numbers, or jump to a page."
          onClose={closeSearch}
        >
          <div className="command-search">
            <Search size={18} />
            <input
              autoFocus
              aria-label="Global search"
              placeholder="Search students or pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd>ESC</kbd>
          </div>
          <div className="command-results">
            {navigation
              .filter((n) =>
                n.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((n) => (
                <button
                  key={n.name}
                  onClick={() => {
                    navigate(n.name);
                    setSearchOpen(false);
                  }}
                >
                  <n.icon size={17} />
                  <span>{n.name}</span>
                  <ArrowRight size={15} />
                </button>
              ))}
            <div className="nav-label">STUDENTS</div>
            {searchResults.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setDetailId(s.id);
                  setSearchOpen(false);
                }}
              >
                <span className="avatar small">{initials(s.name)}</span>
                <span>
                  <strong>{s.name}</strong>
                  <small>
                    {s.id} · Class {s.classNo} – {s.section}
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
            {!searchResults.length && (
              <p className="empty">
                No students found. Try another name or admission number.
              </p>
            )}
          </div>
        </Modal>
      )}
      {info && (
        <Modal
          title={
            info === "help"
              ? "Your school workspace, made simple"
              : "Academic year 2026–27"
          }
          subtitle={
            info === "help"
              ? "A quick guide to exploring the fee management demo."
              : "1 April 2026 through 31 March 2027"
          }
          onClose={closeInfo}
        >
          <div className="help-content">
            {info === "help" ? (
              <>
                <p>
                  Manage 480 fictional students across Classes 1–10. Every page
                  uses the same records, so your numbers stay connected.
                </p>
                {[
                  {
                    icon: Users,
                    title: "Start with a student",
                    text: "Use Students to search, filter, add or edit records. Click a name to see their fee details and payment history.",
                    page: "Students",
                  },
                  {
                    icon: Wallet,
                    title: "Record a fee payment",
                    text: "Find a student, enter an amount, and choose a payment method. A sample receipt opens after you record the payment.",
                    page: "Fee Collection",
                  },
                  {
                    icon: FileBarChart2,
                    title: "See the bigger picture",
                    text: "Review class performance, follow up on overdue fees, or export daily, monthly, and annual reports as CSV.",
                    page: "Reports",
                  },
                ].map((t) => (
                  <button
                    key={t.title}
                    onClick={() => {
                      navigate(t.page);
                      setInfo(null);
                    }}
                  >
                    <span className="class-symbol">
                      <t.icon size={19} />
                    </span>
                    <span>
                      <strong>{t.title}</strong>
                      <small>{t.text}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
                <div className="info-note">
                  <ShieldCheck size={19} />
                  <p>
                    Changes persist in this browser. Restore the original
                    dataset anytime from Settings.
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="class-symbol">
                  <CalendarDays size={28} />
                </span>
                <h3>One academic year. A complete picture.</h3>
                <p>
                  This workspace shows the 2026–27 academic year, with sample
                  payments recorded between April and 6 November 2026.
                </p>
                <p>
                  Expected fees represent the full annual fee. Collected fees
                  include all recorded payments. A student is overdue when their
                  balance is positive and their due date has passed.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    navigate("Reports");
                    setInfo(null);
                  }}
                >
                  Explore annual reports <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={16} />
          </span>
          {toast}
          <button onClick={() => setToast("")} aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
