import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BrandIcon from "@mobile/components/ui/brand-icon";
import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import type {
  Account,
  AccountType,
  CreateAccountInput,
} from "@mobile/db/accounts";
import type { DetectedAccount } from "@mobile/lib/detectAccountsFromSms";
import { useAccountsStore } from "@mobile/store/slices/accounts";

const ACCOUNT_TYPES: AccountType[] = [
  "credit_card",
  "debit_card",
  "bank_account",
  "upi",
  "wallet",
  "other",
];

const TYPE_LABELS: Record<AccountType, string> = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  bank_account: "Bank Account",
  upi: "UPI",
  wallet: "Wallet",
  other: "Other",
};

type Mode = "list" | "add" | "edit" | "scan";

const EMPTY_FORM = {
  name: "",
  type: "credit_card" as AccountType,
  bankName: "",
  last4: "",
  slugs: "",
  billingDate: "",
  dueDate: "",
  notes: "",
};

function parseForm(f: typeof EMPTY_FORM): CreateAccountInput {
  return {
    name: f.name.trim(),
    type: f.type,
    bankName: f.bankName.trim() || null,
    last4digits: f.last4.trim() || null,
    slugs: f.slugs
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
    billingDate: f.billingDate ? parseInt(f.billingDate, 10) || null : null,
    dueDate: f.dueDate ? parseInt(f.dueDate, 10) || null : null,
    notes: f.notes.trim() || null,
  };
}

export default function AccountsScreen() {
  const accounts = useAccountsStore((s) => s.accounts);
  const loading = useAccountsStore((s) => s.loading);
  const error = useAccountsStore((s) => s.error);
  const store = useAccountsStore.getState;

  const [mode, setMode] = useState<Mode>("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [scanResults, setScanResults] = useState<DetectedAccount[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setMode("add");
  }

  function openEdit(account: Account) {
    setForm({
      name: account.name,
      type: account.type,
      bankName: account.bankName ?? "",
      last4: account.last4digits ?? "",
      slugs: account.slugs.join(", "),
      billingDate: account.billingDate?.toString() ?? "",
      dueDate: account.dueDate?.toString() ?? "",
      notes: account.notes ?? "",
    });
    setEditId(account.id);
    setMode("edit");
  }

  async function handleSave() {
    const data = parseForm(form);
    if (!data.name) {
      Alert.alert("Name is required");
      return;
    }
    setSaving(true);
    if (mode === "edit" && editId !== null) {
      await store().updateAccount(editId, data);
    } else {
      await store().createAccount(data);
    }
    setSaving(false);
    setMode("list");
  }

  function handleDelete(account: Account) {
    Alert.alert(
      "Delete Account",
      `Delete "${account.name}"? Linked transactions will be unlinked.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => store().deleteAccount(account.id),
        },
      ],
    );
  }

  async function handleScan() {
    setMode("scan");
    const results = await store().scanFromSms();
    setScanResults(results);
    setSelected(new Set(results.map((_, i) => i)));
  }

  async function handleImport() {
    const toImport = scanResults.filter((_, i) => selected.has(i));
    if (toImport.length === 0) return;
    setSaving(true);
    await store().importAccounts(toImport);
    setSaving(false);
    setMode("list");
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (mode === "add" || mode === "edit") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <AppText variant="title">
            {mode === "add" ? "Add Account" : "Edit Account"}
          </AppText>
        </View>
        <ScrollView contentContainerStyle={styles.form}>
          <AppText variant="caption" style={styles.label}>
            Name *
          </AppText>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="e.g. HDFC Swiggy"
          />

          <AppText variant="caption" style={styles.label}>
            Type
          </AppText>
          <View style={styles.typeRow}>
            {ACCOUNT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeBtn,
                  form.type === t && styles.typeBtnActive,
                ]}
                onPress={() => setForm((f) => ({ ...f, type: t }))}
              >
                <AppText
                  variant="caption"
                  style={form.type === t ? styles.typeLabelActive : undefined}
                >
                  {TYPE_LABELS[t]}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          <AppText variant="caption" style={styles.label}>
            Bank Name
          </AppText>
          <TextInput
            style={styles.input}
            value={form.bankName}
            onChangeText={(v) => setForm((f) => ({ ...f, bankName: v }))}
            placeholder="e.g. HDFC Bank"
          />

          <AppText variant="caption" style={styles.label}>
            Last 4 Digits
          </AppText>
          <TextInput
            style={styles.input}
            value={form.last4}
            onChangeText={(v) => setForm((f) => ({ ...f, last4: v }))}
            placeholder="e.g. 5678"
            keyboardType="number-pad"
            maxLength={4}
          />

          <AppText variant="caption" style={styles.label}>
            Slugs (comma-separated)
          </AppText>
          <TextInput
            style={styles.input}
            value={form.slugs}
            onChangeText={(v) => setForm((f) => ({ ...f, slugs: v }))}
            placeholder="e.g. HDFC, SWIGGY, 5678"
          />

          <AppText variant="caption" style={styles.label}>
            Billing Date (day of month)
          </AppText>
          <TextInput
            style={styles.input}
            value={form.billingDate}
            onChangeText={(v) => setForm((f) => ({ ...f, billingDate: v }))}
            placeholder="e.g. 12"
            keyboardType="number-pad"
            maxLength={2}
          />

          <AppText variant="caption" style={styles.label}>
            Due Date (day of month)
          </AppText>
          <TextInput
            style={styles.input}
            value={form.dueDate}
            onChangeText={(v) => setForm((f) => ({ ...f, dueDate: v }))}
            placeholder="e.g. 3"
            keyboardType="number-pad"
            maxLength={2}
          />

          <AppText variant="caption" style={styles.label}>
            Notes
          </AppText>
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

  if (mode === "scan") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <AppText variant="title">Scan from SMS</AppText>
        </View>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <AppText variant="caption" style={styles.dim}>
              Scanning transactions…
            </AppText>
          </View>
        ) : scanResults.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="caption" style={styles.dim}>
              No accounts detected. Read SMS first.
            </AppText>
            <AppButton onPress={() => setMode("list")} variant="outline">
              Back
            </AppButton>
          </View>
        ) : (
          <>
            <FlatList
              data={scanResults}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.list}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.scanItem,
                    selected.has(index) && styles.scanItemSelected,
                  ]}
                  onPress={() => toggleSelect(index)}
                >
                  <View style={styles.scanItemRow}>
                    <BrandIcon iconKey={item.iconKey} size={36} />
                    <View style={styles.scanItemInfo}>
                      <AppText variant="default">{item.name}</AppText>
                      <AppText variant="caption" style={styles.dim}>
                        {TYPE_LABELS[item.type]} · {item.txnCount} txns
                      </AppText>
                      {item && item?.slugs && item.slugs?.length > 0 && (
                        <AppText variant="caption" style={styles.dim}>
                          Slugs: {item?.slugs?.join(", ")}
                        </AppText>
                      )}
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selected.has(index) && styles.checkboxSelected,
                      ]}
                    >
                      {selected.has(index) && (
                        <AppText variant="caption" style={styles.checkmark}>
                          ✓
                        </AppText>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <View style={styles.scanActions}>
              <AppButton onPress={() => setMode("list")} variant="outline">
                Cancel
              </AppButton>
              <AppButton
                onPress={handleImport}
                disabled={saving || selected.size === 0}
              >
                {saving ? "Importing…" : `Import ${selected.size}`}
              </AppButton>
            </View>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">Accounts</AppText>
        {accounts.length > 0 && (
          <AppText variant="caption" style={styles.dim}>
            {accounts.length} accounts
          </AppText>
        )}
      </View>

      <View style={styles.topActions}>
        <AppButton onPress={openAdd}>Add Account</AppButton>
        <AppButton onPress={handleScan} variant="outline">
          Scan from SMS
        </AppButton>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="caption" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}

      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <AppText variant="caption" style={styles.dim}>
              No accounts yet. Add one manually or scan from SMS.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <BrandIcon iconKey={item.iconKey} size={44} />
            <View style={styles.cardMain}>
              <AppText variant="default">{item.name}</AppText>
              <AppText variant="caption" style={styles.dim}>
                {TYPE_LABELS[item.type]}
                {item.bankName ? ` · ${item.bankName}` : ""}
                {item.last4digits ? ` · xxxx${item.last4digits}` : ""}
              </AppText>
              {item.slugs.length > 0 && (
                <AppText variant="caption" style={styles.dim}>
                  Slugs: {item.slugs.join(", ")}
                </AppText>
              )}
              {item.billingDate || item.dueDate ? (
                <AppText variant="caption" style={styles.dim}>
                  {item.billingDate ? `Billing: ${item.billingDate}` : ""}
                  {item.billingDate && item.dueDate ? " · " : ""}
                  {item.dueDate ? `Due: ${item.dueDate}` : ""}
                </AppText>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => openEdit(item)}
                style={styles.actionBtn}
              >
                <AppText variant="caption" style={styles.editLabel}>
                  Edit
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.actionBtn}
              >
                <AppText variant="caption" style={styles.deleteLabel}>
                  Delete
                </AppText>
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
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  typeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  typeBtnActive: { borderColor: "#111827", backgroundColor: "#111827" },
  typeLabelActive: { color: "#fff" },
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
  scanItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  scanItemSelected: { borderColor: "#111827" },
  scanItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scanItemInfo: { flex: 1, gap: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: { backgroundColor: "#111827", borderColor: "#111827" },
  checkmark: { color: "#fff", fontSize: 12 },
  scanActions: { flexDirection: "row", gap: 8, padding: 16 },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  errorText: { color: "#991b1b" },
});
