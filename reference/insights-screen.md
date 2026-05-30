Build the Insights screen exactly like the provided reference screenshot.

IMPORTANT:

The visual design, spacing, information hierarchy, card sizes, chart placement, and layout should closely match the reference image.

However, the application uses an **Account-based architecture**, not a Credit Card-only architecture.

Do not build the logic around cards.

Everything must work with:

- Credit Cards
- Debit Cards
- Bank Accounts
- UPI Accounts
- Wallets
- Other Accounts

---

# Screen Name

Insights

---

# Layout Structure

The screen contains:

1. Header
2. Summary Cards
3. Time Range Selector
4. Spending Trend Chart
5. Spend By Account
6. Spend By Merchant
7. Category Breakdown
8. Bottom Navigation

---

# Header

Top:

Small Label

Examples:

Your Money

Financial Insights

Analytics

Large Title:

Insights

Material 3 Typography.

---

# Summary Section

Large summary card.

Match screenshot style.

Display:

Total Spend

Example:

₹9,85,047

Subtitle:

Selected Period

Right Side:

Number of Accounts

Example:

6 Accounts

---

# Secondary Stats Cards

Two cards below summary.

Card 1:

Transactions

Example:

54

Card 2:

Accounts

Example:

6

---

# Time Range Selector

Add segmented control.

Options:

- Current Month
- Last Month
- Last 3 Months
- Last 6 Months
- Last 12 Months

Default:

Current Month

Selection updates:

- Summary
- Charts
- Account Rankings
- Merchant Rankings
- Categories

---

# Analytics Calculations

Current Month:

Current calendar month only.

Last Month:

Previous completed month.

Last 3 Months:

Rolling 3 month period.

Last 6 Months:

Rolling 6 month period.

Last 12 Months:

Rolling 12 month period.

---

# Spending Trend Chart

Use:

react-native-gifted-charts

Chart Type:

Line Chart

Area Fill

Match screenshot styling.

Data Source:

Transactions

Filters:

transactionType = DEBIT

status = ACTIVE

Display:

Monthly spending totals.

---

# Chart Section Title

Examples:

Current Month

Last 3 Months

Last 12 Months

Based on selected filter.

---

# Chart Metrics

Show:

- Total Spend
- Average Monthly Spend
- Highest Spend Month
- Lowest Spend Month

---

# Spend By Account

Section Title:

Spend By Account

Scrollable List.

Sort:

Highest Spend First.

---

# Account Spend Row

Display:

Account Icon

Account Name

Monthly Spend

Percentage Contribution

Progress Bar

Example:

HDFC Swiggy

₹45,000

32%

████████░░

---

# Supported Account Types

- Credit Card
- Debit Card
- Bank Account
- UPI
- Wallet

All appear in ranking.

Not limited to cards.

---

# Spend By Merchant

Section Title:

Spend By Merchant

Examples:

- Swiggy
- Zomato
- Amazon
- Uber
- Ola
- Netflix
- YouTube Premium

Display:

Merchant Icon

Merchant Name

Total Spend

Percentage

Progress Bar

---

# Category Breakdown

Section Title:

Spend By Category

Examples:

Food

Shopping

Travel

Bills

Subscriptions

Entertainment

Utilities

Other

Use:

Pie Chart

or

Horizontal Progress Bars

---

# Category Detection

Future Merchant Mapping:

Netflix

→ Subscription

Swiggy

→ Food

Amazon

→ Shopping

Uber

→ Travel

---

# Credits & Income Section

Display:

Total Credits

Examples:

Salary

Refunds

Transfers

UPI Incoming

Show:

Total Credit Amount

Selected Time Period

---

# Net Flow Section

Display:

Credits - Debits

Example:

Income

₹1,20,000

Expenses

₹75,000

Net

₹45,000

---

# Data Sources

Transactions Table

Accounts Table

Merchants Table (Future)

Statements Table (Future)

---

# Filtering Rules

Include:

status = ACTIVE

Exclude:

status = ARCHIVED

status = DUPLICATE

status = IGNORED

---

# Empty State

No Transactions:

Show:

"No financial data available"

Action:

Sync SMS

---

# Future Compatibility

Must support:

- Merchant Detection
- Subscription Tracking
- Recurring Payments
- Salary Tracking
- Refund Analytics
- Category Analytics
- Yearly Analytics

without redesign.

---

# Component Structure

components/insights/

InsightsHeader.tsx

SummaryCard.tsx

TimeRangeSelector.tsx

SpendingTrendChart.tsx

AccountSpendList.tsx

AccountSpendRow.tsx

MerchantSpendList.tsx

MerchantSpendRow.tsx

CategoryBreakdown.tsx

NetFlowCard.tsx

---

# Deliverables

Generate:

- Complete Insights Screen
- TypeScript Types
- Mock Data
- Material 3 Styles
- Gifted Charts Integration
- SQLite Repository Stubs
- Zustand Store Stubs

The final result should visually match the provided screenshot while using the Account architecture instead of a Credit Card-only architecture.

---

# Future Notes

The ranking sections should support:

Account

↓

Merchant

↓

Category

drill-down navigation.

Example:

HDFC Swiggy
↓
Transactions
↓
Swiggy Orders
↓
Individual SMS-backed Transactions

This architecture must scale from a simple credit card tracker to a complete personal finance analytics application.
