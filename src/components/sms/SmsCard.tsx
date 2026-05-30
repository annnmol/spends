import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/lib/transactions";
import * as Clipboard from "expo-clipboard";
import { memo } from "react";
import { Pressable, StyleSheet, ToastAndroid, View } from "react-native";

type Props = { item: Transaction; accountName?: string };

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

const TXN_TYPE: Record<
  string,
  { bg: string; fg: string; label: string } | undefined
> = {
  debit: { bg: "#fee2e2", fg: "#dc2626", label: "Debit" },
  credit: { bg: "#dcfce7", fg: "#16a34a", label: "Credit" },
  refund: { bg: "#dbeafe", fg: "#2563eb", label: "Refund" },
  payment: { bg: "#ede9fe", fg: "#7c3aed", label: "Payment" },
  statement: { bg: "#f3f4f6", fg: "#6b7280", label: "Statement" },
  otp: { bg: "#fef9c3", fg: "#854d0e", label: "OTP" },
  promotional: { bg: "#fce7f3", fg: "#9d174d", label: "Promo" },
};

const AMOUNT_COLOR: Record<string, string> = {
  debit: "#dc2626",
  credit: "#16a34a",
  payment: "#16a34a",
  refund: "#2563eb",
};

const AMOUNT_PREFIX: Record<string, string> = {
  debit: "- ",
  credit: "+ ",
  payment: "+ ",
  refund: "↩ ",
};

async function copyBody(body: string) {
  await Clipboard.setStringAsync(body);
  ToastAndroid.show("SMS copied", ToastAndroid.SHORT);
}

function SmsCardBase({ item, accountName }: Props) {
  const {
    category,
    transactionType,
    amount,
    merchant,
    sender,
    body,
    timestamp,
  } = item;

  const badge = TXN_TYPE[category === "financial" ? transactionType : category];
  const amountColor = AMOUNT_COLOR[transactionType] ?? "#111827";
  const amountStr =
    amount != null
      ? `${AMOUNT_PREFIX[transactionType] ?? ""}₹${amount.toLocaleString("en-IN")}`
      : null;

  return (
    <Pressable onLongPress={() => copyBody(body)} style={styles.card}>
      <View style={styles.row}>
        <AppText
          variant="defaultSemiBold"
          numberOfLines={1}
          style={styles.sender}
        >
          {sender || "Unknown"}
        </AppText>
        <AppText variant="small" style={styles.date}>
          {formatDate(timestamp)}
        </AppText>
      </View>

      <View style={styles.row}>
        <View style={styles.chips}>
          {badge && (
            <View style={[styles.chip, { backgroundColor: badge.bg }]}>
              <AppText
                variant="caption"
                style={[styles.chipText, { color: badge.fg }]}
              >
                {badge.label}
              </AppText>
            </View>
          )}
          {accountName && (
            <View style={[styles.chip, styles.accountChip]}>
              <AppText
                variant="caption"
                style={styles.accountChipText}
                numberOfLines={1}
              >
                {accountName}
              </AppText>
            </View>
          )}
        </View>
        {amountStr && (
          <AppText variant="defaultSemiBold" style={{ color: amountColor }}>
            {amountStr}
          </AppText>
        )}
      </View>

      <AppText variant="caption" numberOfLines={4} style={styles.body}>
        {body}
      </AppText>

      {/* v2: merchant display disabled
      {merchant && (
        <AppText variant="caption" style={styles.merchant}>
          @ {merchant}
        </AppText>
      )}
      */}
    </Pressable>
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
    gap: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sender: { flexShrink: 1 },
  date: { color: "#9ca3af", flexShrink: 0 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1 },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chipText: { fontSize: 10, fontWeight: "600" },
  accountChip: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    maxWidth: 140,
  },
  accountChipText: { fontSize: 10, fontWeight: "600", color: "#0369a1" },
  body: { color: "#374151", lineHeight: 18 },
  merchant: { color: "#6b7280", fontStyle: "italic" },
});

export default memo(SmsCardBase);
