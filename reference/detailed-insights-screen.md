Build the Account Details screen exactly like the provided reference screenshot.

IMPORTANT:

The visual design, spacing, card hierarchy, chart placement, statistics cards, and statement history layout should closely match the reference image.

However, the application uses an **Account architecture**, not a Credit Card-only architecture.

The screen must work for:

- Credit Cards
- Debit Cards
- Bank Accounts
- UPI Accounts
- Wallets
- Other Account Types

Do not hardcode credit-card-only assumptions.

---

# Screen Name

Insights Details - User can navigate to this screen by tapping on any account in the Insights screen.

Route:

/insights/account/[id]

---

# Goal

Show detailed analytics, history, statements, trends, and activity for a single account.

Examples:

- HDFC Swiggy Account
- ICICI Salary Account
- SBI Savings Account
- Personal UPI Account

---

# Layout Structure

Screen contains:

1. Header
2. Account Information
3. Statistics Cards
4. Time Range Selector
5. Trend Chart
6. Monthly History
7. Transaction List
8. Bottom Sheet Filters (Future)

---

# Header

Top Left:

Back Button

Action:

Navigate Back

---

Center:

Account Name

Examples:

HDFC Swiggy

ICICI Salary

Personal UPI

---

Subtitle:

Bank Name + Last 4 Digits

Examples:

HDFC ••5678

ICICI ••1234

UPI • anmol@oksbi

---

# Statistics Section

Three summary cards.

Match screenshot design.

---

## Current

Current Period Spend

Example:

₹7,702

Subtitle:

Current Month

---

## Average

Average Monthly Spend

Example:

₹11,100

Subtitle:

Per Month

---

## Peak

Highest Recorded Spend

Example:

₹29,700

Subtitle:

Feb 2026

---

# Time Range Selector

Segmented Control

Options:

- Current Month
- Last Month
- 3 Months
- 6 Months
- 12 Months
- All Time

Default:

12 Months

Changing selection updates:

- Statistics
- Charts
- History
- Transactions

---

# Trend Chart

Use:

react-native-gifted-charts

Chart Type:

Line Chart

Area Fill

Match screenshot appearance.

---

# Chart Data

Source:

Transactions

Filters:

accountId = currentAccount

transactionType = DEBIT

status = ACTIVE

---

# Chart Section

Title:

Monthly Trend

Display:

Month

↓

Total Spend

Example:

Jan 2026

₹8,500

Feb 2026

₹29,700

Mar 2026

₹10,100

---

# Account Specific Calculations

Current:

Current Period Spend

Average:

Average Monthly Spend

Peak:

Highest Monthly Spend

Lowest:

Lowest Monthly Spend

Transaction Count

Total Credits

Total Debits

Net Flow

---

# Monthly History Section

Match screenshot closely.

Section Title:

Monthly History

Right Side:

Number of Records

Example:

12 Months

---

# History Card

One card per month.

Layout:

Month

↓

Amount

↓

Metadata

Example:

June 2026

₹7,702

Due:

2 Jun 2026

Minimum:

₹390

---

# Display Rules By Account Type

## Credit Card

Show:

- Statement Amount
- Due Date
- Minimum Due
- Payment Status

---

## Debit Card

Show:

- Total Spend
- Total Credits
- Transaction Count

---

## Bank Account

Show:

- Total Debit
- Total Credit
- Net Flow

---

## UPI Account

Show:

- Outgoing
- Incoming
- Transaction Count

---

# Growth Indicators

Show percentage change.

Examples:

↑ 14%

↓ 7%

Compared to previous period.

---

# Transaction History Section

Below monthly history.

Display:

Recent Transactions

Grouped By Month

---

# Transaction Item

Show:

Merchant

Amount

Date

Transaction Type

Examples:

Swiggy

₹499

Debit

---

Netflix

₹649

Subscription

---

Salary

₹50,000

Credit

---

# Transaction Filtering

Support:

Transaction Type

- Debit
- Credit
- Refund
- Payment

Status

- Active
- Archived

Merchant

Account

Date Range

---

# Future Merchant Integration

Transactions may contain:

merchantId

Examples:

- Swiggy
- Amazon
- Netflix
- Uber
- Ola

Allow navigation:

Account

↓

Merchant

↓

Transactions

---

# Future Subscription Support

Examples:

Netflix

₹649 Monthly

YouTube Premium

₹149 Monthly

Google One

₹130 Monthly

Show recurring indicators.

---

# Database Sources

Accounts Table

Transactions Table

Statements Table

Merchants Table (Future)

---

# Empty States

No Transactions:

Show:

"No account activity available"

Action:

Sync SMS

---

# Future Compatibility

Screen must support:

- Account Analytics
- Merchant Analytics
- Subscription Tracking
- Salary Tracking
- Refund Tracking
- Category Tracking
- Spending Trends

without redesign.

---

# Component Structure

components/account-details/

AccountHeader.tsx

AccountInfoCard.tsx

AccountStatsCards.tsx

TimeRangeSelector.tsx

AccountTrendChart.tsx

MonthlyHistoryList.tsx

MonthlyHistoryCard.tsx

TransactionHistoryList.tsx

TransactionItem.tsx

AccountFiltersSheet.tsx

---

# Deliverables

Generate:

- Complete Account Details Screen
- Material 3 Styling
- TypeScript Types
- Mock Data
- Gifted Charts Integration
- SQLite Repository Stubs
- Zustand Store Stubs

The final result should visually match the provided screenshot while using the Account architecture instead of a Credit Card-only architecture.

---

# Navigation Flow

Home
↓
Account Card
↓
Account Details
↓
Monthly History
↓
Transactions

Example:

HDFC Swiggy Account
↓
June 2026
↓
Statement ₹7,702
↓
Individual Transactions

This screen should act as the primary drill-down page for any account in the application.
