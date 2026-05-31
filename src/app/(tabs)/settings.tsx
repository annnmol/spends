import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import useSystemStore from "@mobile/store/slices/system";
import { useSmsStore } from "@mobile/store/slices/sms";
import { useAccountsStore } from "@mobile/store/slices/accounts";

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAL = "#0D9488";
const APP_VERSION = "1.0.0";

// ─── Sub-components ──────────────────────────────────────────────────────────

type IconBoxProps = {
  color: string;
  children: React.ReactNode;
};

function IconBox({ color, children }: IconBoxProps) {
  return (
    <View style={[styles.iconBox, { backgroundColor: color + "22" }]}>
      {children}
    </View>
  );
}

type SectionHeaderProps = {
  label: string;
  iconColor: string;
  iconName: string;
  iconLib?: "feather" | "material";
};

function SectionLabel({ label, iconColor, iconName, iconLib = "feather" }: SectionHeaderProps) {
  const { theme } = useTheme();
  const Icon = iconLib === "material" ? MaterialCommunityIcons : Feather;
  return (
    <View style={styles.sectionLabelRow}>
      <Icon name={iconName as any} size={13} color={theme.textMuted} style={styles.sectionLabelIcon} />
      <AppText variant="caption" themeKey="textMuted" style={styles.sectionLabelText}>
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

type RowDividerProps = { borderColor: string };
function RowDivider({ borderColor }: RowDividerProps) {
  return <View style={[styles.divider, { backgroundColor: borderColor }]} />;
}

type SettingRowProps = {
  iconName: string;
  iconLib?: "feather" | "material";
  iconColor: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  borderColor: string;
  danger?: boolean;
  disabled?: boolean;
};

function SettingRow({
  iconName,
  iconLib = "feather",
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  isLast = false,
  borderColor,
  danger = false,
  disabled = false,
}: SettingRowProps) {
  const { theme } = useTheme();
  const Icon = iconLib === "material" ? MaterialCommunityIcons : Feather;

  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={onPress ? 0.65 : 1}
        disabled={!onPress || disabled}
        accessibilityRole={onPress ? "button" : "none"}
        accessibilityLabel={title}
        accessibilityHint={subtitle}
      >
        <View style={styles.rowLeft}>
          <IconBox color={iconColor}>
            <Icon name={iconName as any} size={17} color={iconColor} />
          </IconBox>
          <View style={styles.rowText}>
            <AppText
              variant="defaultSemiBold"
              themeKey={danger ? "danger" : "text"}
              style={danger ? styles.dangerTitle : undefined}
            >
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="small" themeKey="textMuted" style={styles.rowSubtitle}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {right ? <View style={styles.rowRight}>{right}</View> : null}
      </TouchableOpacity>
      {!isLast && <RowDivider borderColor={borderColor} />}
    </>
  );
}

type SectionCardProps = {
  children: React.ReactNode;
  theme: any;
  isDark: boolean;
};

function SectionCard({ children, theme, isDark }: SectionCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowOpacity: isDark ? 0.3 : 0.06,
        },
      ]}
    >
      {children}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const colorScheme = useSystemStore((s) => s.colorScheme);
  const setColorScheme = useSystemStore((s) => s.setColorScheme);

  const permission = useSmsStore((s) => s.permission);
  const loading = useSmsStore((s) => s.loading);
  const listening = useSmsStore((s) => s.listening);
  const pendingCount = useSmsStore((s) => s.pendingCount);

  const [devExpanded, setDevExpanded] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hideCards, setHideCards] = useState(false);
  const [paymentReminders, setPaymentReminders] = useState(false);

  const canRead = permission === "granted";
  const smsStore = useSmsStore.getState;
  const accountsStore = useAccountsStore.getState;

  const isDarkMode = colorScheme === "dark" || (colorScheme === "system" && isDark);

  const handleThemeToggle = useCallback(
    (value: boolean) => {
      setColorScheme(value ? "dark" : "light");
    },
    [setColorScheme],
  );

  const handleClearAllData = useCallback(() => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all transactions and accounts. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            await smsStore().clearTransactions();
            await accountsStore().clearAccounts();
          },
        },
      ],
    );
  }, [smsStore, accountsStore]);

  const handleReadSms = useCallback(() => {
    smsStore().readRecent();
  }, [smsStore]);

  const handleToggleListening = useCallback(() => {
    smsStore().toggleListening();
  }, [smsStore]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ── */}
        <View style={styles.header}>
          <AppText variant="title" themeKey="text">
            Settings
          </AppText>
        </View>

        {/* ─────────────────────────────── APPEARANCE ─────────────────────────────── */}
        <SectionLabel label="Appearance" iconName="palette" iconLib="material" iconColor={theme.accent} />
        <SectionCard theme={theme} isDark={isDark}>
          <SettingRow
            iconName="sun"
            iconColor="#F59E0B"
            title="Theme"
            subtitle={isDarkMode ? "Dark mode enabled" : "Light mode enabled"}
            isLast
            borderColor={theme.border}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeToggle}
                trackColor={{ false: theme.border, true: TEAL }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.border}
                accessibilityLabel="Toggle dark mode"
              />
            }
          />
        </SectionCard>

        {/* ─────────────────────────────── SECURITY ─────────────────────────────── */}
        <SectionLabel label="Security & Privacy" iconName="shield" iconLib="feather" iconColor={theme.accent} />
        <SectionCard theme={theme} isDark={isDark}>
          <SettingRow
            iconName="fingerprint"
            iconLib="material"
            iconColor="#6366F1"
            title="Biometric Lock"
            subtitle="Require authentication to open the app"
            borderColor={theme.border}
            right={
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: theme.border, true: TEAL }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.border}
                accessibilityLabel="Toggle biometric lock"
              />
            }
          />
          <SettingRow
            iconName="eye-off"
            iconLib="feather"
            iconColor="#8B5CF6"
            title="Hide Card Numbers"
            subtitle="Mask card numbers on home screen"
            isLast
            borderColor={theme.border}
            right={
              <Switch
                value={hideCards}
                onValueChange={setHideCards}
                trackColor={{ false: theme.border, true: TEAL }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.border}
                accessibilityLabel="Toggle hide card numbers"
              />
            }
          />
        </SectionCard>

        {/* ─────────────────────────────── NOTIFICATIONS ─────────────────────────────── */}
        <SectionLabel label="Notifications" iconName="bell" iconLib="feather" iconColor={theme.accent} />
        <SectionCard theme={theme} isDark={isDark}>
          <SettingRow
            iconName="bell"
            iconLib="feather"
            iconColor="#3B82F6"
            title="Payment Reminders"
            subtitle="Receive bill reminder notifications"
            borderColor={theme.border}
            right={
              <Switch
                value={paymentReminders}
                onValueChange={setPaymentReminders}
                trackColor={{ false: theme.border, true: TEAL }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.border}
                accessibilityLabel="Toggle payment reminders"
              />
            }
          />
          <SettingRow
            iconName="clock"
            iconLib="feather"
            iconColor="#10B981"
            title="Reminder Time"
            subtitle="Will notify around 10:00 AM"
            onPress={() => {}}
            borderColor={theme.border}
            right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
          />
          <SettingRow
            iconName="calendar"
            iconLib="feather"
            iconColor="#F59E0B"
            title="Reminder Window"
            subtitle="Start reminders 7 days before due date"
            onPress={() => {}}
            isLast
            borderColor={theme.border}
            right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
          />
        </SectionCard>

        {/* ─────────────────────────────── DATA & STORAGE ─────────────────────────────── */}
        <SectionLabel label="Data & Storage" iconName="database" iconLib="feather" iconColor={theme.accent} />
        <SectionCard theme={theme} isDark={isDark}>
          <SettingRow
            iconName="message-square"
            iconLib="feather"
            iconColor="#0D9488"
            title="SMS Listener"
            subtitle={listening ? "Active — monitoring incoming SMS" : "Inactive"}
            borderColor={theme.border}
            right={
              <Switch
                value={listening}
                onValueChange={handleToggleListening}
                disabled={!canRead}
                trackColor={{ false: theme.border, true: TEAL }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.border}
                accessibilityLabel="Toggle SMS listener"
              />
            }
          />
          <SettingRow
            iconName="download"
            iconLib="feather"
            iconColor="#3B82F6"
            title="Read SMS"
            subtitle={loading ? "Reading messages…" : "Import recent financial SMS"}
            onPress={canRead && !loading ? handleReadSms : undefined}
            borderColor={theme.border}
            disabled={!canRead || loading}
            right={
              loading ? (
                <Feather name="loader" size={18} color={theme.textMuted} />
              ) : (
                <Feather name="chevron-right" size={18} color={canRead ? theme.textMuted : theme.border} />
              )
            }
          />
          <SettingRow
            iconName="trash-2"
            iconLib="feather"
            iconColor="#EF4444"
            title="Clear All Data"
            subtitle="Permanently delete all transactions and accounts"
            onPress={handleClearAllData}
            isLast
            borderColor={theme.border}
            danger
            right={<Feather name="chevron-right" size={18} color={theme.danger} />}
          />
        </SectionCard>

        {/* ─────────────────────────────── ABOUT ─────────────────────────────── */}
        <SectionLabel label="About" iconName="info" iconLib="feather" iconColor={theme.accent} />
        <SectionCard theme={theme} isDark={isDark}>
          <SettingRow
            iconName="package"
            iconLib="feather"
            iconColor="#6366F1"
            title="Version"
            subtitle={`Spends v${APP_VERSION}`}
            isLast={false}
            borderColor={theme.border}
            right={
              <AppText variant="small" themeKey="textMuted">
                {APP_VERSION}
              </AppText>
            }
          />
          <SettingRow
            iconName="file-text"
            iconLib="feather"
            iconColor="#94A3B8"
            title="Privacy Policy"
            subtitle="View our data usage and privacy terms"
            onPress={() => {}}
            isLast
            borderColor={theme.border}
            right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
          />
        </SectionCard>

        {/* ─────────────────────────────── DEVELOPER TOOLS (collapsible) ─────────────────────────────── */}
        <TouchableOpacity
          style={styles.devHeader}
          onPress={() => setDevExpanded((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle developer tools"
          accessibilityState={{ expanded: devExpanded }}
        >
          <View style={styles.devHeaderLeft}>
            <Feather name="terminal" size={13} color={theme.textMuted} style={styles.sectionLabelIcon} />
            <AppText variant="caption" themeKey="textMuted" style={styles.sectionLabelText}>
              DEVELOPER TOOLS
            </AppText>
          </View>
          <Feather
            name={devExpanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        {devExpanded && (
          <SectionCard theme={theme} isDark={isDark}>
            <SettingRow
              iconName="zap"
              iconLib="feather"
              iconColor="#F59E0B"
              title="Fake Financial SMS"
              subtitle="Inject a test financial transaction"
              onPress={() => smsStore().fakeFinancial()}
              borderColor={theme.border}
              right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
            />
            <SettingRow
              iconName="hash"
              iconLib="feather"
              iconColor="#94A3B8"
              title="Fake OTP SMS"
              subtitle="Inject a test OTP message"
              onPress={() => smsStore().fakeOtp()}
              borderColor={theme.border}
              right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
            />
            <SettingRow
              iconName="tag"
              iconLib="feather"
              iconColor="#94A3B8"
              title="Fake Promo SMS"
              subtitle="Inject a test promotional message"
              onPress={() => smsStore().fakePromo()}
              borderColor={theme.border}
              right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
            />
            <SettingRow
              iconName="clock"
              iconLib="feather"
              iconColor="#6366F1"
              title="Fake Delayed SMS"
              subtitle="Inject a test SMS in 20 seconds"
              onPress={() => smsStore().fakeDelayed()}
              borderColor={theme.border}
              right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
            />
            <SettingRow
              iconName="list"
              iconLib="feather"
              iconColor="#3B82F6"
              title={`Check Queue${pendingCount !== null ? `  ·  ${pendingCount} pending` : ""}`}
              subtitle="Inspect background processing queue"
              onPress={() => smsStore().checkQueue()}
              borderColor={theme.border}
              right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
            />
            <SettingRow
              iconName="x-circle"
              iconLib="feather"
              iconColor="#EF4444"
              title="Clear Queue"
              subtitle="Remove all pending background jobs"
              onPress={() => smsStore().clearQueue()}
              isLast
              borderColor={theme.border}
              right={<Feather name="chevron-right" size={18} color={theme.textMuted} />}
            />
          </SectionCard>
        )}

        <View style={styles.footer}>
          <AppText variant="small" themeKey="textMuted" style={styles.footerText}>
            Spends · Finance Tracker
          </AppText>
          <AppText variant="small" themeKey="textMuted" style={styles.footerText}>
            v{APP_VERSION}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  // Section label row (sits above card)
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 6,
    marginTop: 8,
  },
  sectionLabelIcon: {
    marginRight: 5,
  },
  sectionLabelText: {
    letterSpacing: 0.8,
    fontSize: 11,
  },
  // Card container
  card: {
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  // Row layout
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowSubtitle: {
    lineHeight: 16,
  },
  rowRight: {
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  // Icon box
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  // Divider between rows
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
    marginRight: 0,
  },
  // Danger row
  dangerTitle: {
    // color comes from themeKey="danger" on AppText — no additional style needed
  },
  // Developer section header
  devHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 6,
    marginTop: 8,
  },
  devHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Footer
  footer: {
    alignItems: "center",
    gap: 2,
    marginTop: 24,
    marginBottom: 8,
  },
  footerText: {
    letterSpacing: 0.3,
  },
});
