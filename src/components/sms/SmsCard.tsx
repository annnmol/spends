import AppText from "@mobile/components/ui/text";
import {
  parseTransactionSms,
  type ParsedTransactionSms,
  type SmsCategory,
} from "@mobile/lib/parseTransactionSms";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import type { SmsMessage } from "../../../modules/sms-module";

type Props = { item: SmsMessage };

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

const CATEGORY_LABEL: Record<SmsCategory, string> = {
  financial:   "Financial",
  otp:         "OTP",
  promotional: "Promo",
  unknown:     "Other",
};

const CATEGORY_COLORS: Record<SmsCategory, { bg: string; text: string }> = {
  financial:   { bg: "#dcfce7", text: "#15803d" },
  otp:         { bg: "#fef9c3", text: "#854d0e" },
  promotional: { bg: "#fce7f3", text: "#9d174d" },
  unknown:     { bg: "#f3f4f6", text: "#6b7280" },
};

function renderParsed(p: ParsedTransactionSms): string | null {
  const parts: string[] = [];
  if (p.amount !== undefined) parts.push(`₹${p.amount}`);
  if (p.merchant) parts.push(`@ ${p.merchant}`);
  if (p.cardLast4) parts.push(`card xx${p.cardLast4}`);
  if (p.upiRef) parts.push(`ref ${p.upiRef}`);
  return parts.length ? parts.join("  •  ") : null;
}

function SmsCardBase({ item }: Props) {
  const parsed = parseTransactionSms(item.body, item.sender);
  const summary = renderParsed(parsed);
  const colors = CATEGORY_COLORS[parsed.category];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <AppText
          variant="defaultSemiBold"
          numberOfLines={1}
          style={styles.sender}
        >
          {item.sender || "Unknown"}
        </AppText>
        <View style={styles.headerRight}>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <AppText
              variant="caption"
              style={[styles.badgeText, { color: colors.text }]}
            >
              {CATEGORY_LABEL[parsed.category]}
            </AppText>
          </View>
          <AppText variant="small" style={styles.date}>
            {formatDate(item.timestamp)}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" numberOfLines={6} style={styles.body}>
        {item.body}
      </AppText>
      {summary ? (
        <AppText variant="captionSemiBold" style={styles.parsed}>
          {summary}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  sender: { flexShrink: 1 },
  date: { color: "#6b7280" },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },
  body: { color: "#111827" },
  parsed: { color: "#2563eb", marginTop: 4 },
});

export default memo(SmsCardBase);
