import { useMemo } from "react";

import type { Account } from "@mobile/db/accounts";
import type { Transaction } from "@mobile/db/transcations";
import type { AccountMap } from "./types";

export type CalendarData = {
  monthTxns: Transaction[];
  byDay: Map<number, Transaction[]>;
  accountMap: AccountMap;
};

export function useCalendarData(
  transactions: Transaction[],
  accounts: Account[],
  year: number,
  month: number,
): CalendarData {
  const accountMap = useMemo<AccountMap>(() => {
    const m = new Map<number, Account>();
    for (const a of accounts) m.set(a.id, a);
    return m;
  }, [accounts]);

  const monthTxns = useMemo<Transaction[]>(() => {
    const start = new Date(year, month, 1).getTime();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    return transactions
      .filter((t) => t.timestamp >= start && t.timestamp <= end)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions, year, month]);

  const byDay = useMemo<Map<number, Transaction[]>>(() => {
    const map = new Map<number, Transaction[]>();
    for (const t of monthTxns) {
      const day = new Date(t.timestamp).getDate();
      const existing = map.get(day);
      if (existing) {
        existing.push(t);
      } else {
        map.set(day, [t]);
      }
    }
    return map;
  }, [monthTxns]);

  return { monthTxns, byDay, accountMap };
}
