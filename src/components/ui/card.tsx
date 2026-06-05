import { memo, useCallback } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import type { Transaction } from "@mobile/db/transcations";
import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@root/src/lib/fonts";
import BrandIcon from "./brand-icon";
import { SwipeLeftActions, SwipeRightActions } from "./SwipeActions";
import AppText from "./text";
import { useSwipeableCard } from "./useSwipeableCard";



import * as Clipboard from "expo-clipboard";
import { ToastAndroid } from "react-native";

import type { Account } from "@mobile/db/accounts";
import type { Merchant } from "@mobile/db/merchants";

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
    case "DEBIT":     return { label: "Debit",     bg: "#FEE2E2", fg: "#DC2626" };
    case "CREDIT":    return { label: "Credit",    bg: "#DCFCE7", fg: "#16A34A" };
    case "PAYMENT":   return { label: "Payment",   bg: "#EDE9FE", fg: "#7C3AED" };
    case "REFUND":    return { label: "Refund",    bg: "#DBEAFE", fg: "#2563EB" };
    case "STATEMENT": return { label: "Statement", bg: "#F1F5F9", fg: "#64748B" };
    case "OTP":       return { label: "OTP",       bg: "#FEF9C3", fg: "#854D0E" };
    case "UNKNOWN":   return { label: "Other",     bg: "#FCE7F3", fg: "#9D174D" };
    default:          return null;
  }
}

function getAmountStyle(transactionType: string): { color: string; prefix: string } {
  switch (transactionType) {
    case "DEBIT":   return { color: "#DC2626", prefix: "−" };
    case "CREDIT":  return { color: "#16A34A", prefix: "+" };
    case "PAYMENT": return { color: "#16A34A", prefix: "+" };
    case "REFUND":  return { color: "#2563EB", prefix: "↩" };
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

// ─── Props ────────────────────────────────────────────────────────────────────

export type TransactionCardProps = {
  transaction: Transaction;
  account?: Account | null;
  merchant?: Merchant | null;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onDuplicate: (t: Transaction) => void;
  onCategory: (t: Transaction) => void;
  onMore: (t: Transaction) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

function TransactionCard({
  transaction,
  account,
  merchant,
  onEdit,
  onDelete,
  onDuplicate,
  onCategory,
  onMore,
}: TransactionCardProps) {
  const { theme } = useTheme();
  const { gesture, animatedCardStyle, swipeLeftProgress, swipeRightProgress } =
    useSwipeableCard();

  // Stable action handlers — avoids re-rendering memoized action panels in FlashList
  const handleDelete = useCallback(() => onDelete(transaction), [onDelete, transaction]);
  const handleCategory = useCallback(() => onCategory(transaction), [onCategory, transaction]);
  const handleMore = useCallback(() => onMore(transaction), [onMore, transaction]);
  const handleEdit = useCallback(() => onEdit(transaction), [onEdit, transaction]);
  const handleDuplicate = useCallback(() => onDuplicate(transaction), [onDuplicate, transaction]);



  const { transactionType, amount, sender, body, timestamp } = transaction;
  const effectiveType = transactionType;
  const isNonFinancial = transactionType === "STATEMENT" || transactionType === "UNKNOWN";

  const badge = getBadge(effectiveType);
  const { color: amountColor, prefix } = getAmountStyle(transactionType);

  const iconKey = merchant?.iconKey ?? account?.iconKey ?? null;
  const title = merchant?.name ?? transaction.merchantName ?? account?.name ?? sender;
  const subtitle = account
    ? [account.bankName, account.last4digits ? `••${account.last4digits}` : null].filter(Boolean).join(" ")
    : sender;
  

  return (
    // overflow: hidden clips the card as it slides, revealing fixed actions behind it
    <View style={styles.container}>

      {/* Fixed action panels — never move, live behind the card */}
      <SwipeLeftActions
        progress={swipeLeftProgress}
        onDelete={handleDelete}
        onCategory={handleCategory}
        onMore={handleMore}
      />
      <SwipeRightActions
        progress={swipeRightProgress}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
      />

      {/* Card surface — translates horizontally above the action panels */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.black,
            },
            animatedCardStyle,
          ]}
        >
          {/* Interior layout — next step */}
        {/* Left: merchant/account/sender icon */}
      <View style={styles.logoWrap}>
        {iconKey ? (
          <BrandIcon iconKey={iconKey} size={44} />
        ) : (
          <SenderIcon sender={title} size={44} />
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
        {/* {badge ? (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <AppText style={[styles.badgeText, { color: badge.fg }]}>
              {badge.label}
            </AppText>
          </View>
        ) : null} */}
      </View>
        </Animated.View>
      </GestureDetector>

    </View>
  );
}

export default memo(TransactionCard);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    // marginBottom: 8,
    // backgroundColor: "orange",
  },
  // card: {
  //   backgroundColor: "yellow",
  //   // borderRadius: 16,
  //   borderWidth: StyleSheet.hairlineWidth,
  //   paddingHorizontal: 14,
  //   paddingVertical: 13,
  //   minHeight: 70,
  //   ...Platform.select({
  //     ios: {
  //       shadowOffset: { width: 0, height: 1 },
  //       shadowOpacity: 0.06,
  //       shadowRadius: 6,
  //     },
  //     android: { elevation: 2 },
  //   }),
  // },



   card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      // borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 16,
      paddingVertical: 10,
      // marginBottom: 8,
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
      gap: 6,
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
      // maxWidth: 80,
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
      gap: 8,
      flexShrink: 0,
    },
    amount: {
      fontSize: 17,
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
      fontSize: 9,
      lineHeight: 14,
      fontFamily: Fonts.medium,
    },
});
