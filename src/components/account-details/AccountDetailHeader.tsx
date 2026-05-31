import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import type { Account } from "@mobile/db/accounts";

type Props = {
  account: Account;
  onBack: () => void;
};

function AccountDetailHeader({ account, onBack }: Props) {
  const { theme } = useTheme();

  const subtitle =
    account.bankName && account.last4digits
      ? `${account.bankName} ··${account.last4digits}`
      : account.bankName ?? "";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        <AppText variant="defaultSemiBold" themeKey="text" numberOfLines={1} style={styles.title}>
          {account.name}
        </AppText>
        {subtitle.length > 0 && (
          <AppText variant="small" themeKey="textMuted" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

export default memo(AccountDetailHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {},
  spacer: {
    width: 36,
  },
});
