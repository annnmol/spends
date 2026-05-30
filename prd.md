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

Step 6.5 - Deduplication Layer

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

# Card Management

## Step 8: Create Cards

Examples:

- HDFC Swiggy xxxx5678
- Axis Ace xxxx1234
- ICICI Amazon xxxx9012

Features:

- Add Card
- Edit Card
- Delete Card

Status: Pending

---

## Step 9: Auto Match SMS To Card

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

Transaction becomes linked to the card.

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
