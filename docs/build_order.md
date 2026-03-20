# Cursor Build Order Guide

A step‑by‑step development order to ensure Cursor builds the Decision
MVP efficiently and avoids architectural conflicts.

This guide defines **the exact order Cursor should implement the
system** so dependencies are satisfied and rework is minimized.

------------------------------------------------------------------------

# Phase 0 --- Project Initialization

## Goal

Create the basic Next.js project and install core dependencies.

### Tasks

1.  Initialize project

```{=html}
<!-- -->
```
    npx create-next-app@latest decision-app --typescript --tailwind --app

2.  Install dependencies

```{=html}
<!-- -->
```
    npm install prisma @prisma/client zod
    npm install date-fns clsx
    npm install lucide-react

3.  Initialize Prisma

```{=html}
<!-- -->
```
    npx prisma init

4.  Add environment file

`.env`

    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/decision"

------------------------------------------------------------------------

# Phase 1 --- Database Layer

## Goal

Establish database schema and seed demo data.

### Steps

1.  Replace Prisma schema with provided:

```{=html}
<!-- -->
```
    schema.prisma

2.  Run migration

```{=html}
<!-- -->
```
    npx prisma migrate dev --name init

3.  Add seed script

`prisma/seed.ts`

    import "../seed_data"

4.  Run seed

```{=html}
<!-- -->
```
    npx prisma db seed

5.  Verify tables exist

Tables expected:

-   Decision
-   HeartbeatRecord
-   BehaviorRecord
-   Subscription
-   ExpenseCategory
-   ExpenseRecord

------------------------------------------------------------------------

# Phase 2 --- Core Backend APIs

## Goal

Implement backend data mutation endpoints.

Follow **api_contract.md** strictly.

### APIs

Decision

    POST /api/decision
    GET /api/decision/[id]
    DELETE /api/decision/[id]

Heartbeat

    POST /api/heartbeat

Behavior

    POST /api/behavior

Subscription

    POST /api/subscription
    DELETE /api/subscription/[id]

Expense

    POST /api/expense-category
    POST /api/expense-record
    DELETE /api/expense-category/[id]

------------------------------------------------------------------------

# Phase 3 --- Shared UI Components

Create reusable UI components first.

Components directory

    /components

Required components:

DecisionCard.tsx

Displays - name - price - score - status badge

SubscriptionCard.tsx

Displays - name - monthly price - next payment date - usage status

ExpenseCard.tsx

Displays - category name - total spending - last expense

Other shared components

    Badge.tsx
    Card.tsx
    SectionHeader.tsx
    EmptyState.tsx

------------------------------------------------------------------------

# Phase 4 --- Home Dashboard

Route

    /app/page.tsx

Home shows three sections:

1️⃣ Decisions\
2️⃣ Subscriptions\
3️⃣ Expenses

Layout example

    Home
     ├ DecisionSection
     ├ SubscriptionSection
     └ ExpenseSection

Each section renders card lists.

------------------------------------------------------------------------

# Phase 5 --- Create Flows

Create pages

    /app/decision/new
    /app/subscription/new
    /app/expense/new

Decision creation form fields follow

    decision_question_mapping.md

Use Server Actions for submission.

------------------------------------------------------------------------

# Phase 6 --- Detail Pages

Routes

    /decision/[id]
    /subscription/[id]
    /expense/[id]

Decision detail page shows

-   Decision information
-   score breakdown
-   heartbeat history
-   behavior history

Subscription detail shows

-   price
-   billing cycle
-   next payment date

Expense detail shows

-   category info
-   expense records list

------------------------------------------------------------------------

# Phase 7 --- Decision Logic Integration

Implement algorithm from

    decision_algorithm.md

Calculation steps

    UV = usage_value
    SP = substitute_pressure
    PP = price_pressure
    PS = persistence_score

    decision_score = UV + SP + PP + PS
    final_score = clamp(decision_score + 35, 0, 100)

Status mapping

    0‑40     Not Recommended
    41‑60    Reconsider
    61‑80    Worth Considering
    81‑100   Strong Buy

------------------------------------------------------------------------

# Phase 8 --- Dashboard Enhancements

Add

-   score badges
-   sorting
-   loading states
-   empty states
-   delete confirmation

Optional enhancements

-   drag reorder cards
-   decision score visualization

------------------------------------------------------------------------

# Phase 9 --- Final QA

Checklist

Home page loads

Create flows work

Cards display correctly

Decision scoring updates

Heartbeat logs correctly

Behavior records stored

Expense tracking works

Seed data renders dashboard correctly

------------------------------------------------------------------------

# Final Folder Structure

    app
      api
      decision
      subscription
      expense

    components
    lib
    prisma

------------------------------------------------------------------------

# Summary

This build order ensures:

1️⃣ Database first\
2️⃣ APIs second\
3️⃣ UI components third\
4️⃣ Pages fourth\
5️⃣ Algorithms integrated last

Following this order allows Cursor to build the MVP with **minimal
architectural conflicts and fewer regeneration loops**.
