import { memo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { Fonts } from "@mobile/lib/fonts";

type Props = {
  daysLeft: number | null;
};

function AccountStatusBadge({ daysLeft }: Props) {
  if (daysLeft === null) return null;

  if (daysLeft < 0) {
    return (
      <View style={[styles.badge, styles.overdueBadge]}>
        <AppText style={[styles.badgeText, styles.overdueText]}>
          OVERDUE
        </AppText>
      </View>
    );
  }

  if (daysLeft === 0) {
    return (
      <View style={[styles.badge, styles.todayBadge]}>
        <AppText style={[styles.badgeText, styles.todayText]}>
          DUE TODAY
        </AppText>
      </View>
    );
  }

  if (daysLeft <= 7) {
    return (
      <View style={[styles.badge, styles.urgentBadge]}>
        <AppText style={[styles.badgeText, styles.urgentText]}>
          {daysLeft} {daysLeft === 1 ? "DAY" : "DAYS"} LEFT
        </AppText>
      </View>
    );
  }

  return (
    <AppText style={[styles.badgeText, styles.mutedText]}>
      {daysLeft} DAYS LEFT
    </AppText>
  );
}

export default memo(AccountStatusBadge);

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.semibold,
    letterSpacing: 0.3,
  },
  overdueBadge: {
    backgroundColor: "#FEE2E2",
  },
  overdueText: {
    color: "#DC2626",
  },
  todayBadge: {
    backgroundColor: "#FFEDD5",
  },
  todayText: {
    color: "#EA580C",
  },
  urgentBadge: {
    backgroundColor: "#FEF3C7",
  },
  urgentText: {
    color: "#D97706",
  },
  mutedText: {
    color: "#94A3B8",
  },
});
