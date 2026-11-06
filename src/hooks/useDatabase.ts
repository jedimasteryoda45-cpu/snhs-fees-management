import { useEffect, useState } from "react";
import { STORE_KEY, defaultSettings, seedDatabase, type Database } from "../lib/data";
export function useDatabase() {
  const [storageError, setStorageError] = useState("");
  const [db, setDb] = useState<Database>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (
          data.version === 1 &&
          Array.isArray(data.students) &&
          Array.isArray(data.payments) &&
          data.settings &&
          data.students.every(
            (s: any) =>
              typeof s.id === "string" && typeof s.totalFee === "number",
          ) &&
          data.payments.every(
            (p: any) =>
              typeof p.amount === "number" && typeof p.date === "string",
          )
        )
          return data;
      }
    } catch {
      /* Restore the deterministic demo if storage is malformed. */
    }
    return seedDatabase();
  });
  useEffect(() => {
    if (db.settings.name === "Sri Narayana High School") {
      setDb((current) => ({
        ...current,
        settings: { ...current.settings, name: defaultSettings.name },
      }));
      return;
    }
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable. Changes will last for this session only.",
      );
    }
  }, [db]);
  return { db, setDb, storageError };
}
