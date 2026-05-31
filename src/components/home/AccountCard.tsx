import { memo, useMemo } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@mobile/components/ui/text";
import BrandIcon from "@mobile/components/ui/brand-icon";
import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import type { Account } from "@mobile/db/accounts";
import type { Transaction } from "@mobile/db/transcations";
import AccountStatusBadge from "./AccountStatusBadge";

type Props = {
  account: Account;
  transactions: Transaction[];
};

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatInr(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDueDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Updated just now";
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Updated yesterday";
  return `Updated ${diffDays} days ago`;
}

function getDaysLeft(dueDate: number | null): number | null {
  if (dueDate === null) return null;
  const diff = dueDate - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getMonthBounds(): { start: number; end: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

function AccountCard({ account, transactions }: Props) {
  const { theme } = useTheme();

  const accountTxns = useMemo(() => {
    const { start, end } = getMonthBounds();
    return transactions.filter(
      (t) =>
        t.accountId === account.id &&
        ["DEBIT", "CREDIT", "REFUND", "PAYMENT"].includes(t.transactionType) &&
        t.timestamp >= start &&
        t.timestamp <= end,
    );
  }, [transactions, account.id]);

  const monthlyDebit = useMemo(
    () =>
      accountTxns
        .filter((t) => t.transactionType === "DEBIT")
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [accountTxns],
  );

  const monthlyCredit = useMemo(
    () =>
      accountTxns
        .filter(
          (t) =>
            t.transactionType === "CREDIT" ||
            t.transactionType === "REFUND" ||
            t.transactionType === "PAYMENT",
        )
        .reduce((sum, t) => sum + (t.amount ?? 0), 0),
    [accountTxns],
  );

  const daysLeft = getDaysLeft(account.dueDate);
  const lastUpdated = account.updatedAt;

  const displayName = account.bankName ?? account.name;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <BrandIcon iconKey={account.iconKey} size={44} />
        <View style={styles.headerInfo}>
          <AppText
            variant="defaultSemiBold"
            themeKey="text"
            numberOfLines={1}
            style={styles.accountName}
          >
            {account.name}
          </AppText>
          {account.last4digits ? (
            <AppText variant="caption" themeKey="textMuted">
              ••{account.last4digits}
            </AppText>
          ) : (
            <AppText variant="caption" themeKey="textMuted">
              {displayName}
            </AppText>
          )}
        </View>
        <AccountStatusBadge daysLeft={daysLeft} />
      </View>

      <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />

      {account.type === "credit_card" && (
        <CreditCardBody
          theme={theme}
          totalDue={monthlyDebit}
          minDue={Math.ceil(monthlyDebit * 0.05)}
          dueDate={account.dueDate}
          lastUpdated={lastUpdated}
        />
      )}

      {(account.type === "bank_account" || account.type === "debit_card") && (
        <BankAccountBody
          theme={theme}
          monthlyDebit={monthlyDebit}
          monthlyCredit={monthlyCredit}
          lastUpdated={lastUpdated}
        />
      )}

      {(account.type === "upi" || account.type === "wallet") && (
        <UpiWalletBody
          theme={theme}
          monthlySpend={monthlyDebit}
          incoming={monthlyCredit}
          txnCount={accountTxns.length}
          lastUpdated={lastUpdated}
        />
      )}

      {account.type === "other" && (
        <OtherBody
          theme={theme}
          monthlyDebit={monthlyDebit}
          monthlyCredit={monthlyCredit}
          lastUpdated={lastUpdated}
        />
      )}

      {account.type === "credit_card" && account.dueDate !== null && (
        <MarkAsPaidFooter theme={theme} />
      )}
    </View>
  );
}

type ThemeObj = ReturnType<typeof useTheme>["theme"];

type CreditCardBodyProps = {
  theme: ThemeObj;
  totalDue: number;
  minDue: number;
  dueDate: number | null;
  lastUpdated: number;
};

const CreditCardBody = memo(function CreditCardBody({
  theme,
  totalDue,
  minDue,
  dueDate,
  lastUpdated,
}: CreditCardBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.twoCol}>
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            TOTAL DUE
          </AppText>
          <AppText
            style={[styles.colValue, { color: theme.danger }]}
          >
            {formatInr(totalDue)}
          </AppText>
        </View>
        <View style={[styles.colDivider, { backgroundColor: theme.border }]} />
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            MINIMUM DUE
          </AppText>
          <AppText
            style={[styles.colValue, { color: theme.warning }]}
          >
            {formatInr(minDue)}
          </AppText>
        </View>
      </View>
      <View style={styles.footerMeta}>
        {dueDate !== null && (
          <View style={styles.dueDateRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
            <AppText variant="small" themeKey="textMuted" style={styles.dueDateText}>
              Due {formatDueDate(dueDate)}
            </AppText>
          </View>
        )}
        <AppText variant="small" themeKey="textMuted">
          {timeAgo(lastUpdated)}
        </AppText>
      </View>
    </View>
  );
});

type BankAccountBodyProps = {
  theme: ThemeObj;
  monthlyDebit: number;
  monthlyCredit: number;
  lastUpdated: number;
};

const BankAccountBody = memo(function BankAccountBody({
  theme,
  monthlyDebit,
  monthlyCredit,
  lastUpdated,
}: BankAccountBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.twoCol}>
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            MONTHLY DEBIT
          </AppText>
          <AppText style={[styles.colValue, { color: theme.danger }]}>
            {formatInr(monthlyDebit)}
          </AppText>
        </View>
        <View style={[styles.colDivider, { backgroundColor: theme.border }]} />
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            MONTHLY CREDIT
          </AppText>
          <AppText style={[styles.colValue, { color: theme.success }]}>
            {formatInr(monthlyCredit)}
          </AppText>
        </View>
      </View>
      <AppText variant="small" themeKey="textMuted">
        {timeAgo(lastUpdated)}
      </AppText>
    </View>
  );
});

type UpiWalletBodyProps = {
  theme: ThemeObj;
  monthlySpend: number;
  incoming: number;
  txnCount: number;
  lastUpdated: number;
};

const UpiWalletBody = memo(function UpiWalletBody({
  theme,
  monthlySpend,
  incoming,
  txnCount,
  lastUpdated,
}: UpiWalletBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.threeCol}>
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            MONTHLY SPEND
          </AppText>
          <AppText style={[styles.colValue, { color: theme.danger }]}>
            {formatInr(monthlySpend)}
          </AppText>
        </View>
        <View style={[styles.colDivider, { backgroundColor: theme.border }]} />
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            INCOMING
          </AppText>
          <AppText style={[styles.colValue, { color: theme.success }]}>
            {formatInr(incoming)}
          </AppText>
        </View>
        <View style={[styles.colDivider, { backgroundColor: theme.border }]} />
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            TXN COUNT
          </AppText>
          <AppText style={[styles.colValue, { color: theme.text }]}>
            {txnCount}
          </AppText>
        </View>
      </View>
      <AppText variant="small" themeKey="textMuted">
        {timeAgo(lastUpdated)}
      </AppText>
    </View>
  );
});

type OtherBodyProps = {
  theme: ThemeObj;
  monthlyDebit: number;
  monthlyCredit: number;
  lastUpdated: number;
};

const OtherBody = memo(function OtherBody({
  theme,
  monthlyDebit,
  monthlyCredit,
  lastUpdated,
}: OtherBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.twoCol}>
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            DEBIT
          </AppText>
          <AppText style={[styles.colValue, { color: theme.danger }]}>
            {formatInr(monthlyDebit)}
          </AppText>
        </View>
        <View style={[styles.colDivider, { backgroundColor: theme.border }]} />
        <View style={styles.col}>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            CREDIT
          </AppText>
          <AppText style={[styles.colValue, { color: theme.success }]}>
            {formatInr(monthlyCredit)}
          </AppText>
        </View>
      </View>
      <AppText variant="small" themeKey="textMuted">
        {timeAgo(lastUpdated)}
      </AppText>
    </View>
  );
});

type MarkAsPaidFooterProps = {
  theme: ThemeObj;
};

const MarkAsPaidFooter = memo(function MarkAsPaidFooter({
  theme,
}: MarkAsPaidFooterProps) {
  return (
    <TouchableOpacity
      style={[styles.markPaidRow, { borderTopColor: theme.border }]}
      activeOpacity={0.6}
      accessibilityLabel="Mark as paid"
      accessibilityRole="button"
    >
      <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
      <AppText variant="captionSemiBold" style={{ color: theme.success }}>
        Mark as paid
      </AppText>
    </TouchableOpacity>
  );
});

export default memo(AccountCard);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  accountName: {
    fontSize: 15,
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  twoCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  threeCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  col: {
    flex: 1,
    gap: 3,
  },
  colLabel: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  colValue: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
  },
  colDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
  },
  footerMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
  },
  markPaidRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
