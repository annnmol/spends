# PRD v2 Dependency Rule

IMPORTANT:

The features in this section belong to PRD v2 and must NOT be started until all PRD v1 milestones are fully completed, tested, and stable on a real Android device.

PRD v1 Completion Checklist:

- Native SMS Reading works
- SMS Permission flow works
- SMS Categorization works
- Transaction Parsing works
- React Native ↔ Kotlin bridge works
- Real-Time SMS Listener (BroadcastReceiver) works
- SMS_RECEIVED event works
- App receives new SMS instantly
- Startup SMS Sync works
- SQLite persistence works
- Transactions survive app restart
- Background SMS processing works when app is not open

Only after the above items are verified and working should development move to:

- Card Management
- Statement Detection
- Dashboard
- Calendar
- Insights
- Card Analytics
- Reminder Engine
- Settings
- Advanced UI Screens

Rule:

Fix backend and data reliability first.
Build features second.
Polish UI last.

No PRD v2 work should begin while any PRD v1 core functionality remains incomplete or unstable.

If a PRD v1 feature breaks during PRD v2 development, development pauses and returns to fixing PRD v1 before continuing.

# Product Features Derived From Final UI Screens

These features are based on the target CardCue-style application screens.

The architecture remains:

SMS
↓
Native Kotlin Module
↓
Parser
↓
SQLite
↓
Cards
↓
Statements
↓
Calendar
↓
Analytics

No bank login, no bank APIs, and no backend server are required for MVP.

---

# Step 6: SQLite Data Layer

Goal:

Persist all parsed SMS transactions and card data locally.

Tables:

## transactions

- id
- amount
- merchant
- category
- cardLast4
- upiRef
- sender
- rawSms
- transactionDate

## cards

- id
- bankName
- cardName
- last4Digits
- billingDate
- dueDate

## statements

- id
- cardId
- statementMonth
- totalDue
- minimumDue
- dueDate
- status

## payments

- id
- statementId
- amount
- paymentDate

Status: Planned

---

# Step 7: Card Management

Add card screen.

Fields:

- Bank Name
- Card Name
- Last 4 Digits
- Billing Date
- Due Date

Example:

- HDFC Swiggy xxxx5678
- Axis Ace xxxx1234
- ICICI Amazon xxxx9012

Features:

- Add Card
- Edit Card
- Delete Card

Status: Planned

---

# Step 8: Statement Detection

Goal:

Automatically detect statement generation SMS.

Examples:

- Statement generated
- Total amount due
- Minimum amount due
- Payment due date

Extract:

- Total Due
- Minimum Due
- Due Date
- Statement Month

Store as Statement records.

Status: Planned

---

# Step 9: Auto Match SMS To Card

Goal:

Link SMS to cards using last 4 digits.

Example:

SMS:

Card xx5678 spent ₹499 at Swiggy

Matches:

HDFC Swiggy xxxx5678

Transaction becomes linked to that card.

Status: Planned

---

# Step 10: Home Dashboard

Target Screen:

Dashboard showing:

- Total Outstanding
- Total Cards
- Due Count
- Late Count
- Paid Count

Card Tiles:

- Card Logo
- Card Name
- Last 4 Digits
- Total Due
- Minimum Due
- Due Date
- Days Left
- Payment Status

Actions:

- Mark As Paid

Status: Planned

---

# Step 11: Calendar View

Target Screen:

Monthly calendar with card due dates.

Features:

- Previous Month
- Next Month
- Current Month
- Card Logos On Due Dates
- Paid Status
- Overdue Status

Below Calendar:

List all due cards for selected month.

Status: Planned

---

# Step 12: Card Detail Screen

Per-card analytics.

Show:

- Current Month Spend
- Average Monthly Spend
- Peak Spend Month
- Monthly Trend Graph
- Monthly Statements
- Due Dates
- Minimum Due

Status: Planned

---

# Step 13: Insights Screen

Global analytics.

Show:

- Total Billed
- Total Bills
- Total Cards
- Last 12 Months Graph
- Spend By Card
- Monthly Spending Trends

Derived from transactions table.

No AI required.

Status: Planned

---

# Step 14: Mark As Paid Workflow

User can manually mark statement as paid.

Updates:

- Statement Status
- Dashboard Counts
- Calendar Indicators

Statuses:

- Due
- Paid
- Late

Status: Planned

---

# Step 15: Reminder Engine

Local notifications only.

Reminder types:

- Due In 7 Days
- Due In 3 Days
- Due Tomorrow
- Due Today

Configurable by user.

Status: Planned

---

# Step 16: Settings Screen

Features:

## Appearance

- Light Theme
- Dark Theme

## Security

- Biometric Lock
- Hide Card Numbers

## Notifications

- Enable Reminders
- Reminder Time
- Reminder Window

## Card Management

- Manage Existing Cards

Status: Planned

---

# Step 17: Startup Sync

Whenever app launches:

Read latest SMS
↓
Compare with SQLite
↓
Import missing transactions
↓
Update statements

Prevents missing data.

Status: Planned

---

# MVP Definition

MVP is complete when:

- SMS Inbox Reading works
- Real-Time SMS Listener works
- Transactions are stored in SQLite
- Cards can be created
- Statement SMS can be parsed
- Dashboard works
- Calendar works
- Mark Paid works
- Local reminders work

Analytics, advanced insights, and premium visualizations can be added after MVP.
