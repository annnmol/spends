import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { memo } from "react";
import { Platform, Pressable, StyleSheet, ToastAndroid, View } from "react-native";

import BankIcon from "@mobile/components/ui/bank-icon";
import AppText from "@mobile/components/ui/text";
import { Fonts } from "@mobile/lib/fonts";
import { useTheme } from "@mobile/lib/theme";
import type { Account } from "@mobile/lib/accounts";
import type { Transaction } from "@mobile/lib/transactions";

type Props = {
  item: Transaction;
  account?: Account | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

function formatAmount(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

async function copyBody(body: string) {
  await Clipboard.setStringAsync(body);
  ToastAndroid.show("SMS copied", ToastAndroid.SHORT);
}

// ─── Type badge config ───────────────────────────────────────────────────────

type BadgeConfig = {
  label: string;
  bg: string;
  fg: string;
};

function getBadge(effectiveType: string): BadgeConfig | null {
  switch (effectiveType) {
    case "debit":      return { label: "Debit",     bg: "#FEE2E2", fg: "#DC2626" };
    case "credit":     return { label: "Credit",    bg: "#DCFCE7", fg: "#16A34A" };
    case "payment":    return { label: "Payment",   bg: "#EDE9FE", fg: "#7C3AED" };
    case "refund":     return { label: "Refund",    bg: "#DBEAFE", fg: "#2563EB" };
    case "statement":  return { label: "Statement", bg: "#F1F5F9", fg: "#64748B" };
    case "otp":        return { label: "OTP",       bg: "#FEF9C3", fg: "#854D0E" };
    case "promotional":return { label: "Promo",     bg: "#FCE7F3", fg: "#9D174D" };
    default:           return null;
  }
}

function getAmountStyle(transactionType: string): { color: string; prefix: string } {
  switch (transactionType) {
    case "debit":   return { color: "#DC2626", prefix: "−" };
    case "credit":  return { color: "#16A34A", prefix: "+" };
    case "payment": return { color: "#16A34A", prefix: "+" };
    case "refund":  return { color: "#2563EB", prefix: "↩" };
    default:        return { color: "#0F172A", prefix: ""  };
  }
}

// ─── Fallback icon for unlinked transactions ─────────────────────────────────

function SenderIcon({ sender, size }: { sender: string; size: number }) {
  // Derive a stable letter + color from the sender string
  const letter = (sender || "?").replace(/[^a-zA-Z]/g, "")[0]?.toUpperCase() ?? "?";
  // Simple hash → one of 6 muted tones
  const TONES = ["#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  let h = 0;
  for (let i = 0; i < sender.length; i++) h = (h * 31 + sender.charCodeAt(i)) >>> 0;
  const bg = TONES[h % TONES.length];
  const radius = size / 2;
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, backgroundColor: bg, alignItems: "center", justifyContent: "center" }]}>
      <AppText style={{ color: "#fff", fontSize: size * 0.38, fontFamily: Fonts.semibold, lineHeight: size }}>
        {letter}
      </AppText>
    </View>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function TransactionCard({ item, account }: Props) {
  const { theme } = useTheme();

  const { transactionType, category, amount, sender, body, timestamp } = item;
  const effectiveType = category === "financial" ? transactionType : category;
  const isNonFinancial = category === "otp" || category === "promotional";

  const badge = getBadge(effectiveType);
  const { color: amountColor, prefix } = getAmountStyle(transactionType);

  // Title: account name if linked, otherwise sender (user said they'll replace later)
  const title = account?.name ?? sender;
  // Subtitle: bank name or sender raw
  const subtitle = account
    ? [account.bankName, account.last4 ? `••${account.last4}` : null].filter(Boolean).join(" ")
    : sender;

  return (
    <Pressable
      onLongPress={() => copyBody(body)}
      accessibilityRole="button"
      style={[
        styles.card,
        {
          backgroundColor: isNonFinancial ? theme.surfaceSecondary : theme.surface,
          borderColor: theme.border,
          shadowColor: theme.black,
        },
        isNonFinancial && styles.cardMuted,
      ]}
    >
      {/* Left: bank/sender logo */}
      <View style={styles.logoWrap}>
        {account ? (
          <BankIcon
            bankName={account.bankName}
            slugs={account.slugs}
            size={44}
          />
        ) : (
          <SenderIcon sender={sender} size={44} />
        )}
        {/* Type dot indicator */}
        {badge && (
          <View style={[styles.typeDot, { backgroundColor: badge.fg }]} />
        )}
      </View>

      {/* Center: title + subtitle */}
      <View style={styles.center}>
        <AppText
          variant="captionSemiBold"
          themeKey="text"
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </AppText>
        <View style={styles.metaRow}>
          {subtitle ? (
            <AppText variant="small" themeKey="textMuted" numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
          {subtitle ? <View style={[styles.metaDot, { backgroundColor: theme.textMuted }]} /> : null}
          <AppText variant="small" themeKey="textMuted" numberOfLines={1} style={styles.dateText}>
            {formatDate(timestamp)}
          </AppText>
        </View>
      </View>

      {/* Right: amount + type badge */}
      <View style={styles.right}>
        {amount != null ? (
          <AppText style={[styles.amount, { color: amountColor }]}>
            {prefix} {formatAmount(amount)}
          </AppText>
        ) : null}
        {badge ? (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <AppText style={[styles.badgeText, { color: badge.fg }]}>
              {badge.label}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(TransactionCard);

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardMuted: {
    opacity: 0.7,
  },

  // Logo
  logoWrap: {
    position: "relative",
    flexShrink: 0,
  },
  typeDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  // Center
  center: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  subtitle: {
    flexShrink: 1,
    maxWidth: 80,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.5,
    flexShrink: 0,
  },
  dateText: {
    flexShrink: 1,
  },

  // Right
  right: {
    alignItems: "flex-end",
    gap: 5,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Fonts.medium,
  },
});
