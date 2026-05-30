import { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@mobile/components/ui/button";
import MerchantIcon from "@mobile/components/ui/merchant-icon";
import AppText from "@mobile/components/ui/text";
import type {
  CreateMerchantInput,
  Merchant,
  MerchantCategory,
} from "@mobile/lib/merchants";
import { useMerchantsStore } from "@mobile/store/slices/merchants";

const MERCHANT_CATEGORIES: MerchantCategory[] = [
  "food",
  "transport",
  "entertainment",
  "subscription",
  "utilities",
  "shopping",
  "other",
];

const CATEGORY_LABELS: Record<MerchantCategory, string> = {
  food: "Food",
  transport: "Transport",
  entertainment: "Entertainment",
  subscription: "Subscription",
  utilities: "Utilities",
  shopping: "Shopping",
  other: "Other",
};

type Mode = "list" | "add" | "edit";

const EMPTY_FORM = {
  name: "",
  category: "other" as MerchantCategory,
  slugs: "",
  notes: "",
};

function parseForm(f: typeof EMPTY_FORM): CreateMerchantInput | null {
  if (!f.name.trim()) return null;
  return {
    name: f.name.trim(),
    category: f.category,
    slugs: f.slugs
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
    notes: f.notes.trim() || null,
  };
}

export default function MerchantsScreen() {
  const merchants = useMerchantsStore((s) => s.merchants);
  const loading = useMerchantsStore((s) => s.loading);
  const error = useMerchantsStore((s) => s.error);
  const store = useMerchantsStore.getState;

  const [mode, setMode] = useState<Mode>("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMode("add");
  }

  function openEdit(m: Merchant) {
    setForm({
      name: m.name,
      category: m.category,
      slugs: m.slugs.join(", "),
      notes: m.notes ?? "",
    });
    setEditId(m.id);
    setMode("edit");
  }

  async function handleSave() {
    const data = parseForm(form);
    if (!data) {
      Alert.alert("Name is required");
      return;
    }
    setSaving(true);
    if (mode === "edit" && editId !== null) {
      await store().updateMerchant(editId, data);
    } else {
      await store().createMerchant(data);
    }
    setSaving(false);
    setMode("list");
  }

  function handleDelete(m: Merchant) {
    Alert.alert(
      "Delete Merchant",
      `Delete "${m.name}"? Linked transactions will be unlinked.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => store().deleteMerchant(m.id),
        },
      ],
    );
  }

  if (mode === "add" || mode === "edit") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <AppText variant="title">
            {mode === "add" ? "Add Merchant" : "Edit Merchant"}
          </AppText>
        </View>
        <ScrollView contentContainerStyle={styles.form}>
          <AppText variant="caption" style={styles.label}>Name *</AppText>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="e.g. Swiggy"
          />

          <AppText variant="caption" style={styles.label}>Category</AppText>
          <View style={styles.chipRow}>
            {MERCHANT_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.category === c && styles.chipActive]}
                onPress={() => setForm((f) => ({ ...f, category: c }))}
              >
                <AppText
                  variant="caption"
                  style={form.category === c ? styles.chipLabelActive : undefined}
                >
                  {CATEGORY_LABELS[c]}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          <AppText variant="caption" style={styles.label}>
            Slugs (comma-separated)
          </AppText>
          <TextInput
            style={styles.input}
            value={form.slugs}
            onChangeText={(v) => setForm((f) => ({ ...f, slugs: v }))}
            placeholder="e.g. SWIGGY, BUNDL"
          />

          <AppText variant="caption" style={styles.label}>Notes</AppText>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={form.notes}
            onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
            placeholder="Optional notes"
            multiline
          />

          <View style={styles.actionRow}>
            <AppButton onPress={() => setMode("list")} variant="outline">
              Cancel
            </AppButton>
            <AppButton onPress={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </AppButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">Merchants</AppText>
        {merchants.length > 0 && (
          <AppText variant="caption" style={styles.dim}>
            {merchants.length} merchants
          </AppText>
        )}
      </View>

      <View style={styles.topActions}>
        <AppButton onPress={openAdd}>Add Merchant</AppButton>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="caption" style={styles.errorText}>{error}</AppText>
        </View>
      ) : null}

      <FlatList
        data={merchants}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <AppText variant="caption" style={styles.dim}>
              No merchants yet. Tap "Add Merchant" to create one.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <MerchantIcon
              name={item.name}
              slugs={item.slugs}
              size={44}
            />
            <View style={styles.cardMain}>
              <AppText variant="default">{item.name}</AppText>
              <AppText variant="caption" style={styles.dim}>
                {CATEGORY_LABELS[item.category]}
              </AppText>
              {item.slugs.length > 0 && (
                <AppText variant="caption" style={styles.dim}>
                  Slugs: {item.slugs.join(", ")}
                </AppText>
              )}
              {item.notes ? (
                <AppText variant="caption" style={styles.dim}>{item.notes}</AppText>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => openEdit(item)}
                style={styles.actionBtn}
              >
                <AppText variant="caption" style={styles.editLabel}>Edit</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.actionBtn}
              >
                <AppText variant="caption" style={styles.deleteLabel}>Delete</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16, gap: 4 },
  topActions: { paddingHorizontal: 16, gap: 8 },
  list: { padding: 16, paddingTop: 8, flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  dim: { color: "#6b7280" },
  form: { padding: 16, gap: 4 },
  label: { color: "#6b7280", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
    marginTop: 4,
  },
  inputMultiline: { height: 72, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipActive: { borderColor: "#111827", backgroundColor: "#111827" },
  chipLabelActive: { color: "#fff" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardMain: { flex: 1, gap: 2 },
  cardActions: { gap: 8 },
  actionBtn: { paddingVertical: 4 },
  editLabel: { color: "#2563eb" },
  deleteLabel: { color: "#dc2626" },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  errorText: { color: "#991b1b" },
});
