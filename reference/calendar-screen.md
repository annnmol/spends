Build the Calendar screen exactly like the provided reference image.

IMPORTANT:

This is not a generic calendar screen.

The goal is to reproduce the layout, spacing, hierarchy, behavior, and information architecture shown in the reference screenshot as closely as possible.

Technology:

- React Native
- Expo SDK latest
- Expo Router
- TypeScript
- React Native Paper
- react-native-calendars

Do not use placeholder styles.
Do not use random spacing.
Match the screenshot closely.

Do not match the db schema from scheenshot. use our own data models and architecture. The screenshot is only for visual reference, not data structure.

---

# Screen Name

Calendar

---

# Layout Structure

Screen contains 3 sections:

1. Header
2. Month Calendar
3. Due Events List

---

# Header

Top left title:

Calendar

Typography:

- Large title
- Material 3 style
- High emphasis

---

# Month Navigation

Centered month title:

May 2026

Left:

Previous Month Button

Right:

Next Month Button

Behavior:

- Navigate between months
- Update calendar grid

---

# Calendar Grid

Requirements:

- Month view
- 7 columns
- Sunday first
- Rounded date cells
- Equal spacing
- Modern finance-app style

Display:

SUN MON TUE WED THU FRI SAT

---

# Day Cell Design

Each day is a rounded square.

States:

### Default

Normal border.

### Selected

Blue outline.

### Today

Material 3 accent style.

### Has Events

Show account icons inside day cell.

Example:

May 3

HDFC icon

May 5

Axis icon

May 6

American Express icon

May 11

Jupiter icon

May 30

ICICI icon

---

# Event Indicators

A day may contain:

- Account events
- Statement events
- Due date events
- Payment events

Support multiple indicators per day.

The system must allow future support for:

- Transaction events
- Subscription events
- Salary credits
- Refunds

---

# Calendar Data Model

Each day can contain:

{
date: string,
events: CalendarEvent[]
}

CalendarEvent:

{
id: string,
accountId: number,
eventType:
| "PAYMENT_DUE"
| "PAYMENT_COMPLETED"
| "STATEMENT"
| "TRANSACTION"
| "SUBSCRIPTION",

title: string,

amount: number | null,

status:
| "UPCOMING"
| "PAID"
| "OVERDUE",

icon: string | null
}

---

# Event List Below Calendar

Below calendar show all events for selected month.

Design exactly like screenshot.

Card layout:

Left:

- Account Logo
- Account Name
- Due Date

Right:

- Amount
- Status

Examples:

HDFC Bank - Card

Due:
May 3, 2026

₹8991.00

PAID

---

Axis Bank - Card

Due:
May 5, 2026

₹14530.00

PAID

---

American Express - Card

Due:
May 6, 2026

₹10745.00

PAID

---

# Event Card Design

Requirements:

- Rounded corners
- Material 3 card
- Elevated surface
- Proper spacing
- Finance-app appearance

Status colors:

PAID:

Green

UPCOMING:

Orange

OVERDUE:

Red

---

# Data Source

Do not hardcode UI.

Create interfaces and mock repository.

Future integration will come from SQLite.

Interfaces:

Account

CalendarEvent

Statement

Transaction

---

# Future Compatibility

Calendar architecture must support:

- Account-based events
- Merchant-based events
- Statement events
- Subscription events
- Salary events
- Refund events
- Monthly view
- Weekly view
- Daily timeline view

without redesign.

---

# Component Structure

components/calendar/

CalendarHeader.tsx

MonthNavigator.tsx

CalendarGrid.tsx

CalendarDayCell.tsx

CalendarEventIndicator.tsx

MonthlyEventsList.tsx

CalendarEventCard.tsx

---

# Deliverables

Generate:

- Complete screen
- All components
- TypeScript types
- Mock data
- Styles
- React Native Paper integration
- react-native-calendars integration

The final result should visually match the provided screenshot as closely as possible while following Material Design 3 principles and remaining production ready.
The calendar day cell must support rendering up to 4 account/merchant icons and show a "+N" overflow badge when more events exist for that date.
