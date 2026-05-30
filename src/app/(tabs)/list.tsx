import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SmsCard from "@mobile/components/sms/SmsCard";
import AppText from "@mobile/components/ui/text";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";

type Filter = "all" | "unlinked" | number;

export default function ListScreen() {
  const messages = useSmsStore((s) => s.messages);
  const loading = useSmsStore((s) => s.loading);
  const permission = useSmsStore((s) => s.permission);
  const readSince = useSmsStore((s) => s.readSince);
  const accounts = useAccountsStore((s) => s.accounts);

  const [filter, setFilter] = useState<Filter>("all");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    () => messages.filter((m) => m.category === "financial" && m.accountId === null).length,
    [messages],
  );

  const filtered = useMemo(() => {
    let list = messages;
    if (filter === "unlinked")
      list = list.filter((m) => m.category === "financial" && m.accountId === null);
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <AppText variant="title">Transactions</AppText>
          <TouchableOpacity
            onPress={() => {
              setShowSearch((s) => !s);
              setSearchQuery("");
            }}
            hitSlop={8}
          >
            <AppText style={styles.searchIcon}>{showSearch ? "✕" : "🔍"}</AppText>
          </TouchableOpacity>
        </View>
        {showSearch && (
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search sender or message…"
            placeholderTextColor="#9ca3af"
            autoFocus
          />
        )}
        {messages.length > 0 && (
          <AppText variant="caption" style={styles.dim}>
            {filtered.length === messages.length
              ? `${messages.length} messages`
              : `${filtered.length} of ${messages.length}`}
          </AppText>
        )}
      </View>

      {showChips && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipBar}
          contentContainerStyle={styles.chipContent}
        >
          <TouchableOpacity
            style={[styles.chip, filter === "all" && styles.chipActive]}
            onPress={() => setFilter("all")}
          >
            <AppText
              variant="caption"
              style={filter === "all" ? styles.chipTextActive : styles.chipText}
            >
              All ({messages.length})
            </AppText>
          </TouchableOpacity>

          {accountsWithMessages.map((a) => {
            const count = messages.filter((m) => m.accountId === a.id).length;
            const active = filter === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(a.id)}
              >
                <AppText
                  variant="caption"
                  style={active ? styles.chipTextActive : styles.chipText}
                >
                  {a.name} ({count})
                </AppText>
              </TouchableOpacity>
            );
          })}

          {unlinkedCount > 0 && (
            <TouchableOpacity
              style={[styles.chip, filter === "unlinked" && styles.chipActive]}
              onPress={() => setFilter("unlinked")}
            >
              <AppText
                variant="caption"
                style={filter === "unlinked" ? styles.chipTextActive : styles.chipText}
              >
                Unlinked ({unlinkedCount})
              </AppText>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={readSince} />}
        renderItem={({ item }) => {
          const accountName = item.accountId
            ? accounts.find((a) => a.id === item.accountId)?.name
            : undefined;
          return <SmsCard item={item} accountName={accountName} />;
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <AppText variant="caption" style={styles.dim}>
                {permission !== "granted"
                  ? "Grant SMS permission on the Home tab"
                  : filter !== "all"
                  ? "No messages for this filter"
                  : "No messages — use Home tab to read SMS"}
              </AppText>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 6 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  searchIcon: { fontSize: 18 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#111827",
  },
  list: { padding: 16, paddingTop: 4, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  dim: { color: "#6b7280" },
  chipBar: { flexGrow: 0 },
  chipContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 6, flexDirection: "row" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  chipText: { color: "#374151" },
  chipTextActive: { color: "#fff" },
});
