// ─── TESTING: SwipeableCard ───────────────────────────────────────────────────
// Original home screen is commented out below. Restore when done testing.

import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import { theme, useTheme } from "@mobile/lib/theme";
import { useSmsStore } from "@mobile/store/slices/sms";
import TransactionCard from "@mobile/components/ui/card";
import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/db/transcations";

export default function HomeScreen() {
  const { theme } = useTheme();
  const transactions = useSmsStore((s) => s.messages);

  console.log(`🚀 ~ HomeScreen ~ transactions:`, transactions[2],"\n",transactions[1]);


  const handleEdit = useCallback((t: Transaction) => console.log("edit", t.id), []);
  const handleDelete = useCallback((t: Transaction) => console.log("delete", t.id), []);
  const handleDuplicate = useCallback((t: Transaction) => console.log("duplicate", t.id), []);
  const handleCategory = useCallback((t: Transaction) => console.log("category", t.id), []);
  const handleMore = useCallback((t: Transaction) => console.log("more", t.id), []);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionCard
        transaction={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onCategory={handleCategory}
        onMore={handleMore}
      />
    ),
    [handleEdit, handleDelete, handleDuplicate, handleCategory, handleMore],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      <FlashList
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        estimatedItemSize={70}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="caption" themeKey="textMuted" style={styles.emptyText}>
              No transactions yet. Import from the List tab.
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: 0, paddingTop: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: "center", paddingTop: 80,backgroundColor: "yellow" },
  emptyText: { textAlign: "center" },
});

// ─── Original HomeScreen (commented out) ─────────────────────────────────────

// import { useMemo } from "react";
// import { ScrollView, StyleSheet, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useTheme } from "@mobile/lib/theme";
// import { useAccountsStore } from "@mobile/store/slices/accounts";
// import { useSmsStore } from "@mobile/store/slices/sms";
// import HomeHeader from "@mobile/components/home/HomeHeader";
// import MonthlySummaryCard from "@mobile/components/home/MonthlySummaryCard";
// import AccountStats from "@mobile/components/home/AccountStats";
// import MonthlyOverview from "@mobile/components/home/MonthlyOverview";
// import AccountList from "@mobile/components/home/AccountList";
// import AppText from "@mobile/components/ui/text";
//
// function getMonthBounds() { ... }
//
// export default function HomeScreen() {
//   const { theme } = useTheme();
//   const accounts = useAccountsStore((s) => s.accounts);
//   const transactions = useSmsStore((s) => s.messages);
//   ... (full original implementation)
// }
