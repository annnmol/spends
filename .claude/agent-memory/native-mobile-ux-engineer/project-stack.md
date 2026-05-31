---
name: project-stack
description: Core tech stack, path aliases, and project conventions for the spends Expo app
metadata:
  type: project
---

This is a React Native + Expo SDK 56 app using Expo Router (file-based tabs at `src/app/(tabs)/`).

**Path aliases:**
- `@mobile/` → `./src/`
- `@root/` → `./` (project root)

**Theme system:** `useTheme()` from `@mobile/lib/theme` returns `{ theme, mode, isDark }`. Theme tokens are in `src/tokens/colors.json` with `light` and `dark` palettes. All semantic keys: background, surface, surfaceSecondary, primary, accent, text, textSecondary, textMuted, border, success, warning, danger.

**Key UI components:**
- `AppText` from `@mobile/components/ui/text` — accepts `variant`, `themeKey`, `lightColor`, `darkColor`
- `BankIcon` from `@mobile/components/ui/bank-icon` — accepts `bankName: string|null`, `slugs?: string[]`, `size?: number`
- `SafeAreaView` imported from `react-native-safe-area-context` (not RN core)

**State:** Zustand stores at `src/store/slices/`. `useAccountsStore` exposes `{ accounts, loading, error }`. `useSmsStore` exposes `{ messages: Transaction[], loading, listening, pendingCount }` — `messages` is the full transaction list loaded from SQLite.

**Transaction filtering pattern:** Filter by `category === "financial"` first, then by `transactionType` ("debit" | "credit" | "refund" | "payment"). Month bounds via `new Date(y, m, 1).getTime()` / `new Date(y, m+1, 0, 23,59,59,999).getTime()`.

**Home screen components:** Built at `src/components/home/` — HomeHeader, MonthlySummaryCard, AccountStats, MonthlyOverview, AccountStatusBadge, AccountCard, AccountList. All `memo()`-wrapped. AccountCard handles 5 account types (credit_card, debit_card, bank_account, upi/wallet, other) with conditional body rendering.

**Insights screen components:** Built at `src/components/insights/` — InsightsHeader, SummaryCard, TimeRangeSelector, SpendingTrendChart, AccountSpendList, AccountSpendRow, MerchantSpendList, NetFlowCard. Screen at `src/app/(tabs)/insights.tsx`. Uses `react-native-gifted-charts` `LineChart` with `areaChart` + `curved` props for the spend trend. TimeRange type and `getRangeBounds()` util in `src/components/insights/types.ts`.

**List / Transactions screen:** `src/app/(tabs)/list.tsx` uses `TransactionCard` from `src/components/sms/TransactionCard.tsx` (NOT `SmsCard`). SmsCard is kept but no longer used by the list screen. TransactionCard: circular icon (38×38, borderRadius 19), merchant on line 1 / sender on line 2, amount+date right column, account pill on line 3. Non-financial categories (otp, promotional, unknown) get surfaceSecondary bg + 0.75 opacity. Header pattern: small ALL-CAPS label + large title + icon button — matches InsightsHeader convention.

**`useSmsStore` pull-to-refresh:** `readSince` (not `readRecent`) is the action for pull-to-refresh on the list screen.

**Styling convention:** `StyleSheet.create()` for all styles, inline style objects only for dynamic/computed values.

**Icon library:** `@expo/vector-icons` is installed (`^15.1.1`). Use `Feather` for most icons, `MaterialCommunityIcons` for icons not in Feather (fingerprint, palette, etc). `react-native-svg` (`15.15.4`) is also available.

**System store:** `useSystemStore` from `@mobile/store/slices/system` — exposes `{ colorScheme: "light"|"dark"|"system", setColorScheme }`. Persisted via secureStorage. Theme toggle pattern: compare `colorScheme === "dark" || (colorScheme === "system" && isDark)` for effective dark state.

**SMS store actions:** `grantPermission`, `readRecent`, `readAll`, `readSince`, `toggleListening`, `fakeFinancial`, `fakeOtp`, `fakePromo`, `fakeDelayed`, `checkQueue`, `clearQueue`, `clearTransactions`. Access via `useSmsStore.getState()` for imperative calls.

**Accounts store actions:** `clearAccounts` (async). Access via `useAccountsStore.getState()` for imperative calls.

**Settings screen:** Built at `src/app/(tabs)/settings.tsx`. Sections: Appearance (theme toggle), Security & Privacy (biometric + hide cards), Notifications (reminders), Data & Storage (SMS listener + read + clear all), About (version + privacy). Developer tools section collapses by default via `useState(false)`. Switch active color: `#0D9488` (teal-600). Section cards: `borderRadius: 16, borderWidth: 1, shadowRadius: 8, elevation: 2`. Row dividers: `StyleSheet.hairlineWidth`, inset from left at 60px (after icon).

**useThemeColor hook:** Located at `src/components/hooks/useThemeColor.ts` — reads from the static `colorScheme` export (not reactive). AppText/AppView use this internally. For reactive screens, always use `useTheme()` directly and pass `theme.*` values.

**NOT installed:** react-native-paper, react-native-big-calendar, react-native-calendars. Do not use these.

**Why:** The original calendar screen used react-native-big-calendar which is being replaced with a custom pixel-perfect grid.
**How to apply:** Always use custom components, StyleSheet, and the project's own theme/text/icon primitives.
