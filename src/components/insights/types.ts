export type TimeRange = "current_month" | "last_month" | "last_3" | "last_6" | "last_12";

export type RangeLabel = {
  key: TimeRange;
  label: string;
};

export const TIME_RANGES: RangeLabel[] = [
  { key: "current_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "last_3", label: "3 Months" },
  { key: "last_6", label: "6 Months" },
  { key: "last_12", label: "12 Months" },
];

export function getRangeBounds(range: TimeRange): { start: number; end: number } {
  const now = new Date();
  const end = now.getTime();
  switch (range) {
    case "current_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return { start, end };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
      return { start, end: e };
    }
    case "last_3": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { start: d.getTime(), end };
    }
    case "last_6": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return { start: d.getTime(), end };
    }
    case "last_12": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { start: d.getTime(), end };
    }
  }
}
