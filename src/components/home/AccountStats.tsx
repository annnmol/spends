import { memo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";

type Props = {
  total: number;
  due: number;
  overdue: number;
  paid: number;
};

type StatBlock = {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
  labelColor: string;
};

function AccountStats({ total, due, overdue, paid }: Props) {
  const { theme } = useTheme();

  const blocks: StatBlock[] = [
    {
      label: "Total",
      value: total,
      bgColor: theme.primary,
      textColor: "#FFFFFF",
      labelColor: "rgba(255,255,255,0.7)",
    },
    {
      label: "Due",
      value: due,
      bgColor: "#FEF3C7",
      textColor: "#D97706",
      labelColor: "#92400E",
    },
    {
      label: "Overdue",
      value: overdue,
      bgColor: "#FEE2E2",
      textColor: "#DC2626",
      labelColor: "#991B1B",
    },
    {
      label: "Paid",
      value: paid,
      bgColor: "#DCFCE7",
      textColor: "#059669",
      labelColor: "#065F46",
    },
  ];

  return (
    <View style={styles.row}>
      {blocks.map((block) => (
        <View
          key={block.label}
          style={[styles.block, { backgroundColor: block.bgColor }]}
        >
          <AppText style={[styles.value, { color: block.textColor }]}>
            {block.value}
          </AppText>
          <AppText style={[styles.label, { color: block.labelColor }]}>
            {block.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export default memo(AccountStats);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  block: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2,
  },
  value: {
    fontSize: 22,
    fontFamily: Fonts.semibold,
    lineHeight: 26,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    lineHeight: 14,
  },
});
