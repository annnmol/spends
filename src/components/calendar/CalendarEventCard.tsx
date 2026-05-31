import { memo } from "react";
import { Platform, StyleSheet, View } from "react-native";

import BrandIcon from "@mobile/components/ui/brand-icon";
import AppText from "@mobile/components/ui/text";
import type { Account } from "@mobile/db/accounts";
import { useTheme } from "@mobile/lib/theme";
import type { Transaction } from "@mobile/db/transcations";

type Props = {
  transaction: Transaction;
  account: Account | null;
};

function formatTime(ts: number): string {
  // const d = new Date(ts);
  // return d.toLocaleTimeString("en-IN", {
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   hour12: true,
  // });
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    // year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type TypeMeta = { label: string; color: string };

function txnTypeMeta(
  type: string,
  colors: {
    danger: string;
    success: string;
    accent: string;
    accentSecondary: string;
    textMuted: string;
  },
): TypeMeta {
  switch (type) {
    case "debit":
      return { label: "DEBIT", color: colors.danger };
    case "credit":
      return { label: "CREDIT", color: colors.success };
    case "refund":
      return { label: "REFUND", color: colors.accent };
    case "payment":
      return { label: "PAYMENT", color: colors.accentSecondary };
    default:
      return { label: type.toUpperCase(), color: colors.textMuted };
  }
}

function CalendarEventCard({ transaction: t, account }: Props) {
  const { theme } = useTheme();
  const meta = txnTypeMeta(t.transactionType, theme);

  const title = t.merchantName ?? account?.name ?? t.sender;
  const subtitle = account ? `${account.name}` : t.sender;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {account ? <BrandIcon iconKey={account.iconKey} size={44} /> : null}

      <View style={styles.info}>
        <AppText
          variant="captionSemiBold"
          style={{ color: theme.text }}
          numberOfLines={1}
        >
          {title}
        </AppText>
        {subtitle !== title && (
          <AppText
            variant="small"
            style={{ color: theme.textSecondary }}
            numberOfLines={1}
          >
            {subtitle}
          </AppText>
        )}
        <AppText variant="small" style={{ color: theme.textMuted }}>
          {formatTime(t.timestamp)}
        </AppText>
      </View>

      <View style={styles.right}>
        {t.amount != null && (
          <AppText variant="captionSemiBold" style={{ color: theme.text }}>
            {formatAmount(t.amount)}
          </AppText>
        )}
        <AppText
          variant="small"
          style={[styles.typeLabel, { color: meta.color }]}
        >
          {meta.label}
        </AppText>
      </View>
    </View>
  );
}

export default memo(CalendarEventCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  info: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: 3,
  },
  typeLabel: {
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
