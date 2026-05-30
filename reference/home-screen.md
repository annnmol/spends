Build the Home Dashboard screen exactly like the provided CardCue reference screenshot, but adapt the data model to use **Accounts** instead of only Credit Cards.

The visual design, spacing, hierarchy, information density, and layout should closely match the screenshot.

---

# Important Architecture Rule

Do NOT build the UI around Credit Cards.

The application uses the Account architecture.

An Account can be:

- Credit Card
- Debit Card
- Bank Account
- UPI Account
- Wallet
- Other

The UI should use the word:

Account

internally.

Only display bank/card specific labels when the account type requires it.

Examples:

- HDFC Swiggy Account
- ICICI Salary Account
- Personal UPI Account
- SBI Savings Account

---

# Screen Name

Home

---

# Layout Structure

Screen contains:

1. Greeting Header
2. Monthly Summary Card
3. Account Statistics Section
4. Monthly Spending Overview
5. Account List
6. Bottom Navigation

---

# Header

Top Left:

Greeting

Examples:

- Good Morning
- Good Afternoon
- Good Evening

Large Title:

AccountCue

or app name from configuration.

Top Right:

Sync Button

Purpose:

- Trigger SMS Sync
- Refresh Accounts
- Refresh Statements

Use circular icon button.

---

# Monthly Summary Card

Large Material 3 Card.

Shows:

Current Month Spend

Example:

₹70,025

Subtitle:

Current Month Spending

Right Side:

Number of Active Accounts

Example:

6 Accounts

Data Source:

Transactions table

Current Month Only

---

# Statistics Section

Four metric blocks.

Layout identical to screenshot.

Metrics:

### Total Accounts

Example:

6

---

### Due

Accounts with upcoming dues.

Example:

4

---

### Overdue

Accounts with overdue payments.

Example:

0

---

### Paid

Accounts already paid this cycle.

Example:

2

---

All values computed from SQLite.

---

# Monthly Spending Overview

Small section header.

Title:

Monthly Overview

Optional badge:

Current Month

Displays:

- Total Debit
- Total Credit
- Net Flow

Example:

Debit

₹45,000

Credit

₹80,000

Net

₹35,000

---

# Account List

Primary content area.

Scrollable.

Display all active accounts.

Sort:

Nearest Due Date First

---

# Account Card Design

Material 3 Elevated Card.

Rounded Corners.

Match screenshot spacing.

---

# Account Card Header

Left:

Account Icon

Examples:

- HDFC
- ICICI
- SBI
- Personal UPI

Center:

Account Name

Examples:

HDFC Swiggy

ICICI Salary

Personal UPI

Below:

Last 4 Digits

Examples:

••5678

••1234

---

Right:

Status Indicator

Examples:

5 DAYS LEFT

PAID

OVERDUE

---

# Account Card Body

Display values depending on account type.

---

## Credit Card

Show:

Total Due

Minimum Due

Due Date

Example:

Total Due

₹40,348

Minimum Due

₹2,320

Due Date

30 May 2026

---

## Bank Account

Show:

Current Balance

Monthly Debit

Monthly Credit

---

## UPI Account

Show:

Monthly Spend

Monthly Incoming

Transaction Count

---

# Account Card Footer

Actions:

### Mark As Paid

Visible for:

- Credit Cards
- Bills

---

### View Details

Visible for:

All Accounts

Navigates to Account Detail Screen.

---

# Account Detail Navigation

On Press:

Navigate to:

/account/[id]

Future screen.

---

# Data Model

Use existing Account schema.

Account:

{
id,
name,
type,
bankName,
last4Digits,
slugs,
billingDate,
dueDate
}

---

# Calculations

Current Month Spend:

SUM(
transactions.amount
)

WHERE:

transactionType = DEBIT

AND

month = currentMonth

---

Active Accounts:

COUNT(accounts)

---

Due Accounts:

Accounts with:

dueDate > today

---

Overdue Accounts:

Accounts with:

dueDate < today

AND

not paid

---

Paid Accounts:

Accounts with:

status = PAID

---

# Future Compatibility

Dashboard must support:

- Credit Cards
- Debit Cards
- Bank Accounts
- UPI Accounts
- Wallets

without redesign.

---

# Empty States

No Accounts:

Show:

"No accounts added yet"

Action:

Add Account

---

No Transactions:

Show:

"No transactions available"

Action:

Sync SMS

---

# Component Structure

components/home/

HomeHeader.tsx

MonthlySummaryCard.tsx

AccountStats.tsx

MonthlyOverview.tsx

AccountList.tsx

AccountCard.tsx

AccountStatusBadge.tsx

---

# Deliverables

Generate:

- Complete Home Screen
- All Components
- TypeScript Types
- Mock Data
- Material 3 Styles
- SQLite Repository Integration Stubs
- Zustand Integration Stubs

The final result should visually match the provided screenshot while using the Account architecture instead of a Credit Card-only architecture.
