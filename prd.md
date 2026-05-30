# SMS Finance Tracker - Development Roadmap

## Current Progress

### ✅ Step 1: Native SMS Reading

Completed.

Built a custom Kotlin Expo Module with:

- `getRecentSms(limit)`
- `getAllSms()`
- `getSmsAfterDate(timestamp)`

Reads SMS directly from Android's inbox using `ContentResolver`.

---

### ✅ Step 2: SMS Parsing

Completed.

Extracts:

- Amount
- Merchant
- Card Last 4 Digits
- UPI Reference
- Category

Categories:

- Financial
- OTP
- Promotional
- Other

---

### ✅ Step 3: React Native Integration

Completed.

Kotlin functions are exposed to React Native through a TypeScript bridge.

Example:

```ts
await SmsModule.getRecentSms(50);
```

---

### ✅ Step 4: Basic UI

Completed.

Current UI supports:

- Read recent SMS
- Read all SMS
- Read SMS after date
- View parsed transaction data

---

# Next Milestone

## 🔥 Step 5: Real-Time SMS Listener

Current State:

```txt
Open App
↓
Read Inbox
↓
Show Results
```

Target State:

```txt
New SMS Arrives
↓
BroadcastReceiver
↓
Kotlin Module
↓
React Native Event
↓
UI Updates Instantly
```

Tasks:

- Create Android BroadcastReceiver
- Register SMS_RECEIVED event
- Add startListening()
- Add stopListening()
- Emit events to React Native
- Update UI automatically

Success Criteria:

- Send SMS from another phone
- Message appears instantly
- No manual refresh required

Status: NEXT TASK

---

# Persistence Layer

## Step 6: SQLite Database

Current State:

```txt
SMS
↓
Displayed Only
```

Target State:

```txt
SMS
↓
Parsed
↓
Saved To SQLite
```

Tables:

### transactions

- id
- amount
- merchant
- cardLast4
- category
- timestamp
- sender
- rawSms

### cards

- id
- bankName
- cardName
- last4Digits
- billingDate
- dueDate

Success Criteria:

- Close app
- Reopen app
- Data still exists

Status: Pending

## Step 6.5 - Deduplication Layer

Store Android SMS ID.

Database Constraints:

- sms_id UNIQUE
- message_hash UNIQUE

Use:
INSERT OR IGNORE

Goals:

- Prevent duplicate imports
- Prevent duplicate realtime saves
- Prevent duplicate startup syncs
- Safe repeated rescans

Success Criteria:

User can press:

- Read Last 50 SMS
- Read All SMS
- Startup Sync

100 times and database count remains correct.

## Step 6.6 - Financial Transaction Classification

Goal:
Classify every financial SMS.

Types:

- DEBIT
- CREDIT
- REFUND
- STATEMENT
- PAYMENT
- OTP
- UNKNOWN

Rules:
Use sender patterns and message keywords.

Examples:

"spent", "debited" -> DEBIT

"credited" -> CREDIT

"refunded" -> REFUND

"statement generated" -> STATEMENT

"payment received" -> PAYMENT

OTP messages should never create transactions.

I would start with simple keyword rules:

spent
debited
withdrawn
→ DEBIT

credited
salary
deposit
→ CREDIT

refund
reversed
returned
→ REFUND

statement
minimum due
total due
→ STATEMENT

payment received
payment credited
→ PAYMENT

otp
one time password
→ OTP

---

## Step 7: Auto Save New SMS

Flow:

```txt
SMS Arrives
↓
BroadcastReceiver
↓
Parse Transaction
↓
Save To SQLite
↓
Notify React Native
```

No manual import required.

Status: Pending

---

# Account Management

# Step8: Account Management & Transaction Linking

## Goal

Create a flexible account system that is not limited to credit cards.

An Account can represent:

- Credit Card
- Debit Card
- Bank Account
- UPI Account
- Wallet
- Other Financial Source

All future transactions, statements, reminders, analytics, and calendar events will be linked to an Account.

---

### Account Model

### accounts

Fields:

- id
- name
- type
- bankName
- last4Digits
- slugs
- billingDate
- dueDate
- icon
- color
- notes
- createdAt
- updatedAt

---

### Supported Account Types

- credit_card
- debit_card
- bank_account
- upi
- wallet
- other

---

### Example Accounts

### Credit Card

Name:

HDFC Swiggy

Type:

credit_card

Last 4:

5678

Slugs:

- 5678
- HDFC
- SWIGGY

Billing Date:

12

Due Date:

3

---

### Bank Account

Name:

ICICI Salary

Type:

bank_account

Last 4:

1234

Slugs:

- 1234
- ICICI

---

### UPI Account

Name:

Personal UPI

Type:

upi

Slugs:

- anmol@oksbi
- OKSBI

---

### Account Creation

### Option 1: Manual Creation

User can:

- Create Account
- Edit Account
- Delete Account

Fields:

- Name
- Type
- Bank Name
- Last 4 Digits
- Slugs
- Billing Date
- Due Date

---

### Option 2: Auto Detection From SMS

Button:

Scan Accounts From SMS

Flow:

Read Financial SMS
↓
Extract Last 4 Digits
↓
Extract Sender
↓
Extract UPI IDs
↓
Detect Repeated Patterns
↓
Suggest Accounts

Example:

Detected:

- HDFC xxxx5678
- ICICI xxxx1234
- SBI xxxx9876

User selects:

Import

Accounts are automatically created.

---

### Account Matching Strategy

Transactions are linked to Accounts using:

### Priority 1

Last 4 Digits

Example:

SMS:

Card xx5678 spent ₹499

Match:

Account last4Digits = 5678

---

### Priority 2

UPI ID

Example:

UPI payment from anmol@oksbi

Match:

Account slug = anmol@oksbi

---

### Priority 3

Custom Slugs

Example:

SMS contains:

SWIGGY

Match:

Account slug = SWIGGY

---

### Auto Save New SMS

Flow:

SMS Arrives
↓
BroadcastReceiver
↓
Parse Financial SMS
↓
Classify Transaction Type
↓
Identify Account
↓
Save To SQLite
↓
Link To Account
↓
Notify React Native

No manual import required.

---

### Transaction Types

Every financial SMS should be classified as:

- DEBIT
- CREDIT
- REFUND
- PAYMENT
- STATEMENT
- OTP
- UNKNOWN

Examples:

spent
debited
withdrawn

→ DEBIT

credited
salary

→ CREDIT

refunded
reversed

→ REFUND

statement generated

→ STATEMENT

payment received

→ PAYMENT

otp

→ OTP

---

### Deduplication

Every SMS is stored using:

Android SMS `_id`

Database Constraint:

sms_id UNIQUE

Insert Strategy:

INSERT OR IGNORE

This prevents:

- Duplicate imports
- Duplicate startup syncs
- Duplicate realtime saves

---

### Permanent Transaction Rule

SMS is the import source.

SQLite is the source of truth.

If a user deletes the original SMS:

- Transaction remains
- Analytics remain
- Calendar history remains
- Statements remain

Deleting an SMS must never delete a financial transaction.

---

### Success Criteria

User can:

- Create Accounts
- Edit Accounts
- Delete Accounts
- Scan Accounts From SMS
- Receive New SMS
- Auto Detect Account
- Auto Classify Transaction
- Auto Save Transaction
- Avoid Duplicates
- Retain History Even If SMS Is Deleted

Status: Pending

---

## Step 9: Auto Match SMS To Accounts

Example:

```txt
SMS:
Rs.499 spent on card xx5678
```

Match with:

```txt
HDFC Swiggy
Last 4: 5678
```

Transaction becomes linked to the account.

Status: Pending

---

# Calendar UI

## Step 10: Monthly Calendar

Features:

- Previous Month
- Current Month
- Next Month
- Daily Transactions

Example:

```txt
May 30
• ₹499 Swiggy

May 31
• ₹200 Uber
```

Status: Pending

---

## Step 11: Billing & Due Dates

Store:

- Billing Date
- Due Date

Calendar Indicators:

- Upcoming
- Paid
- Overdue

Target UI similar to finance calendar apps.

Status: Pending

---

# Background Reliability

## Step 12: App Closed Support

Scenario:

```txt
App Closed
↓
SMS Arrives
↓
Transaction Saved
```

Requirements:

- BroadcastReceiver
- SQLite write

Status: Pending

---

## Step 13: Startup Sync

When app launches:

```txt
Read Recent SMS
↓
Compare With Database
↓
Import Missing Entries
```

Prevents missing transactions.

Status: Pending

IMPORTANT: The one thing that will need revisiting as the app grows is Step 12 (App Closed Support) — when a BroadcastReceiver writes to SQLite while the app
is killed, Zustand in-memory state won't reflect it. The fix is the startup sync (Step 13) which re-hydrates the store from SQLite on next open.

---

# Analytics

## Step 14: Filters

Filters:

- Financial
- OTP
- Promotional
- Other

Status: Pending

---

## Step 15: Spending Analytics

Reports:

- Monthly Spend
- Category Spend
- Card Spend
- Merchant Spend

Status: Pending

---

## Step 16: Due Date Notifications

Examples:

- Due in 3 days
- Due tomorrow
- Bill generated

Status: Pending

---

# Immediate Focus

Current Sprint:

1. BroadcastReceiver
2. SMS_RECEIVED event
3. React Native listener
4. Real-time UI updates
5. Real device testing

Do not start Calendar, Analytics, or Notifications until Real-Time SMS Listener is working correctly.
