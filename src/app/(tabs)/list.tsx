import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TransactionCard from "@mobile/components/sms/TransactionCard";
import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";

type Filter = "all" | "unlinked" | number;

// ─── Filter chip ────────────────────────────────────────────────────────────

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const FilterChip = memo(function FilterChip({ label, active, onPress }: ChipProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <AppText
        variant="captionSemiBold"
        style={[styles.chipText, { color: active ? theme.onPrimary : theme.textSecondary }]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
});

// ─── Empty state ─────────────────────────────────────────────────────────────

type EmptyProps = {
  loading: boolean;
  permission: string;
  filter: Filter;
};

const EmptyState = memo(function EmptyState({ loading, permission, filter }: EmptyProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  const subtitle =
    permission !== "granted"
      ? "Grant SMS permission on the Home tab to get started"
      : filter !== "all"
      ? "No transactions match this filter"
      : "Use the Home tab to read your SMS transactions";

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrapper, { backgroundColor: theme.surfaceSecondary }]}>
        <Ionicons name="receipt-outline" size={32} color={theme.textMuted} />
      </View>
      <AppText variant="captionSemiBold" themeKey="text" style={styles.emptyTitle}>
        No transactions yet
      </AppText>
      <AppText variant="small" themeKey="textMuted" style={styles.emptySubtitle}>
        {subtitle}
      </AppText>
    </View>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ListScreen() {
  const { theme } = useTheme();

  const messages = useSmsStore((s) => s.messages);
  const loading = useSmsStore((s) => s.loading);
  const permission = useSmsStore((s) => s.permission);
  const readSince = useSmsStore((s) => s.readSince);
  const accounts = useAccountsStore((s) => s.accounts);

  const [filter, setFilter] = useState<Filter>("all");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<TextInput>(null);

  // Reset filter if the selected account no longer exists
  useEffect(() => {
    if (typeof filter === "number") {
      const exists = accounts.some((a) => a.id === filter);
      if (!exists) setFilter("all");
    }
  }, [accounts, filter]);

  const accountsWithMessages = useMemo(
    () => accounts.filter((a) => messages.some((m) => m.accountId === a.id)),
    [accounts, messages],
  );

  const unlinkedCount = useMemo(
    () => messages.filter((m) => ["DEBIT","CREDIT","REFUND","PAYMENT"].includes(m.transactionType) && m.accountId === null).length,
    [messages],
  );

  const filtered = useMemo(() => {
    let list = messages;
    if (filter === "unlinked")
      list = list.filter((m) => ["DEBIT","CREDIT","REFUND","PAYMENT"].includes(m.transactionType) && m.accountId === null);
    else if (typeof filter === "number")
      list = list.filter((m) => m.accountId === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) => m.body.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q),
      );
    }
    return list;
  }, [messages, filter, searchQuery]);

  const showChips = accountsWithMessages.length > 0 || unlinkedCount > 0;

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof messages)[number] }) => {
      const account = item.accountId
        ? accounts.find((a) => a.id === item.accountId) ?? null
        : null;
      return <TransactionCard item={item} account={account} />;
    },
    [accounts],
  );

  const keyExtractor = useCallback((item: (typeof messages)[number]) => String(item.id), []);

  const countLabel =
    filtered.length === messages.length
      ? `${messages.length} transaction${messages.length !== 1 ? "s" : ""}`
      : `${filtered.length} of ${messages.length}`;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <AppText variant="small" themeKey="textMuted" style={styles.headerLabel}>
              YOUR ACTIVITY
            </AppText>
            <AppText variant="title" themeKey="text" style={styles.headerTitle}>
              Transactions
            </AppText>
          </View>
          <TouchableOpacity
            onPress={toggleSearch}
            style={[
              styles.iconButton,
              {
                backgroundColor: showSearch ? theme.primary : theme.surface,
                borderColor: showSearch ? theme.primary : theme.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={showSearch ? "Close search" : "Search transactions"}
          >
            <Ionicons
              name={showSearch ? "close-outline" : "search-outline"}
              size={20}
              color={showSearch ? theme.onPrimary : theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={[styles.searchBar, { backgroundColor: theme.surfaceSecondary }]}>
            <Ionicons name="search-outline" size={16} color={theme.textMuted} />
            <TextInput
              ref={searchRef}
              style={[styles.searchInput, { color: theme.text, fontFamily: "sans-serif" }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search sender or message…"
              placeholderTextColor={theme.textMuted}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={8}
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Count label */}
        {messages.length > 0 && (
          <AppText variant="small" themeKey="textMuted" style={styles.countLabel}>
            {countLabel}
          </AppText>
        )}
      </View>

      {/* ── Filter chips ── */}
      {showChips && (
        <View
          style={[
            styles.chipBarWrapper,
            {
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContent}
          >
            <FilterChip
              label={`All (${messages.length})`}
              active={filter === "all"}
              onPress={() => setFilter("all")}
            />
            {accountsWithMessages.map((a) => {
              const count = messages.filter((m) => m.accountId === a.id).length;
              return (
                <FilterChip
                  key={a.id}
                  label={`${a.name} (${count})`}
                  active={filter === a.id}
                  onPress={() => setFilter(a.id)}
                />
              );
            })}
            {unlinkedCount > 0 && (
              <FilterChip
                label={`Unlinked (${unlinkedCount})`}
                active={filter === "unlinked"}
                onPress={() => setFilter("unlinked")}
              />
            )}
          </ScrollView>
        </View>
      )}

      {/* ── Transaction list ── */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={readSince}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { flexGrow: 1 },
        ]}
        ItemSeparatorComponent={null}
        ListEmptyComponent={
          <EmptyState loading={loading} permission={permission} filter={filter} />
        }
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerLeft: {
    gap: 2,
  },
  headerLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    lineHeight: 14,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 40,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    padding: 0,
  },
  countLabel: {
    marginTop: 2,
  },

  // ── Filter chips ──
  chipBarWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chipContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 16,
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 10,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
  },
  emptySubtitle: {
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 18,
  },
});
