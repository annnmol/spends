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

**Styling convention:** `StyleSheet.create()` for all styles, inline style objects only for dynamic/computed values.

**NOT installed:** react-native-paper, react-native-big-calendar, react-native-calendars. Do not use these.

**Why:** The original calendar screen used react-native-big-calendar which is being replaced with a custom pixel-perfect grid.
**How to apply:** Always use custom components, StyleSheet, and the project's own theme/text/icon primitives.
