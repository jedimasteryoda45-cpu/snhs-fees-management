import { useState } from "react";
import {
  Check,
  Database,
  GraduationCap,
  Info,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "../components/ui";
import { type SchoolSettings } from "../lib/data";
export function Settings({
  settings,
  onSave,
  onReset,
}: {
  settings: SchoolSettings;
  onSave: (s: SchoolSettings) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(settings),
    [reset, setReset] = useState(false),
    [saved, setSaved] = useState(false);
  function change(key: keyof SchoolSettings, value: string) {
    setDraft((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKE YOURSELF AT HOME</div>
          <h1>Settings</h1>
          <p>Manage your school profile and your demo workspace.</p>
        </div>
      </div>
      <div className="settings-layout">
        <form
          className="panel settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(
              Object.fromEntries(
                Object.entries(draft).map(([k, v]) => [k, v.trim()]),
              ) as SchoolSettings,
            );
            setSaved(true);
          }}
        >
          <div className="panel-heading">
            <div>
              <h3>
                <GraduationCap size={18} />
                School profile
              </h3>
              <p>
                These details appear on receipts and throughout your dashboard.
              </p>
            </div>
          </div>
          <div className="form-body">
            <label>
              School name
              <input
                value={draft.name}
                required
                maxLength={70}
                onChange={(e) => change("name", e.target.value)}
              />
            </label>
            <div className="field-grid">
              <label>
                Short name
                <input
                  value={draft.shortName}
                  required
                  maxLength={8}
                  onChange={(e) => change("shortName", e.target.value)}
                />
              </label>
              <label>
                Administrator name
                <input
                  value={draft.admin}
                  required
                  maxLength={50}
                  onChange={(e) => change("admin", e.target.value)}
                />
              </label>
            </div>
            <label>
              School email
              <input
                type="email"
                value={draft.email}
                required
                onChange={(e) => change("email", e.target.value)}
              />
            </label>
            <label>
              School address
              <input
                value={draft.address}
                required
                maxLength={180}
                onChange={(e) => change("address", e.target.value)}
              />
            </label>
            <div className="settings-year">
              <CalendarIcon />
              <div>
                <strong>Academic year 2026–27</strong>
                <p>1 April 2026 – 31 March 2027</p>
              </div>
              <span>Active</span>
            </div>
            <div className="modal-actions">
              {saved && (
                <span className="positive">
                  <Check size={15} />
                  Changes saved
                </span>
              )}
              <button type="submit" className="button primary">
                <Save size={16} />
                Save changes
              </button>
            </div>
          </div>
        </form>
        <aside>
          <div className="panel storage-card">
            <span className="class-symbol">
              <Database size={23} />
            </span>
            <h3>Your demo workspace</h3>
            <p>
              All changes are saved in your browser’s local storage. They
              persist when you refresh on this device.
            </p>
            <div>
              <ShieldCheck size={16} />
              <span>No backend or external services</span>
            </div>
            <div>
              <Check size={16} />
              <span>Fictional student information</span>
            </div>
            <div>
              <Info size={16} />
              <span>Clearing browser data resets the demo</span>
            </div>
          </div>
          <div className="panel reset-card">
            <h3>Start fresh</h3>
            <p>
              Restore the original 480 students, payment history, and school
              profile.
            </p>
            <button className="button danger" onClick={() => setReset(true)}>
              <RotateCcw size={15} />
              Reset demo data
            </button>
          </div>
        </aside>
      </div>
      {reset && (
        <Modal
          title="Reset your demo workspace?"
          subtitle="This removes added students, recorded payments, and profile changes from this browser. The original sample data will be restored."
          onClose={() => setReset(false)}
        >
          <div className="modal-actions">
            <button className="button" onClick={() => setReset(false)}>
              Keep my changes
            </button>
            <button
              className="button danger"
              onClick={() => {
                onReset();
                setReset(false);
              }}
            >
              Reset demo data
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function CalendarIcon() {
  return (
    <span className="class-symbol">
      <GraduationCap size={20} />
    </span>
  );
}
