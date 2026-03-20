# Architecture – Decision Project

This file defines the application architecture for the Decision project.

All implementation must follow this architecture.

Do not change architecture decisions unless explicitly requested.

---

# 1 System Goal

Decision is a card-based web application for consumer decision management.

The system manages three domains:

- Decision
- Subscription
- Expense

The application provides:

- Home dashboard
- Create flows
- Detail pages
- Card management
- Check-in records
- Persistent storage

---

# 2 Architecture Style

Use a single full-stack Next.js application.

Architecture requirements:

- Frontend and backend live in the same repository
- Next.js App Router is the primary application structure
- UI is component-based
- Database access uses Prisma
- Data persistence uses PostgreSQL
- Interactive UI uses client components only where needed
- Read-heavy pages should prefer server rendering
- Mutations should use Server Actions or API routes depending on implementation simplicity

---

# 3 Application Layers

The application is divided into the following layers.

## 3.1 UI Layer

Responsible for:

- page layout
- forms
- card rendering
- drag and drop interaction
- detail views
- loading and empty states
- user-triggered actions

Main UI building blocks:

- pages
- shared components
- domain-specific card components
- form components

---

## 3.2 Application Layer

Responsible for:

- create flows
- update flows
- delete flows
- mapping user actions to persistence logic
- aggregating data for pages
- validating required fields
- formatting output for UI

This layer should remain thin and explicit.

---

## 3.3 Data Layer

Responsible for:

- Prisma schema
- Prisma client access
- create/read/update/delete operations
- database relations
- aggregate calculations

All persistence logic must be implemented through Prisma.

---

# 4 Domain Model

The system contains three core domains.

## 4.1 Decision Domain

Purpose:

- represent a purchase decision item
- store current score and status
- track heartbeat check-ins
- track behavior check-ins

Entities:

- Decision
- HeartbeatRecord
- BehaviorRecord

Relationships:

- one Decision has many HeartbeatRecord
- one Decision has many BehaviorRecord

Derived fields:

- heartbeat_count
- behavior_total_amount

---

## 4.2 Subscription Domain

Purpose:

- represent a recurring paid service
- store billing information
- display subscription status on dashboard

Entities:

- Subscription

---

## 4.3 Expense Domain

Purpose:

- represent a high-value spending category
- store multiple records for the same category
- display latest spending information on dashboard

Entities:

- ExpenseCategory
- ExpenseRecord

Relationships:

- one ExpenseCategory has many ExpenseRecord

Derived display values:

- latest_amount
- latest_date
- card summary text

---

# 5 Routing Structure

Use the following route structure.

```txt
/
Home dashboard

/decision/create
Decision creation flow

/decision/[id]
Decision detail page

/subscription/create
Subscription creation flow

/subscription/[id]
Subscription detail page

/expense/create
Expense creation flow

/expense/[id]
Expense detail page
```

Dynamic routes must load data by id.

If a record does not exist, return a not-found state.

---

# 6 Page Responsibilities

## 6.1 Home Page

The Home page is the system entry point.

Responsibilities:

- render CreateBar
- render CardBoard
- load all cards
- group data by card type if needed
- display empty state when no cards exist

The Home page must not contain heavy business logic.

It should compose data and pass it to presentational components.

---

## 6.2 Create Pages

Each create page is responsible for:

- rendering the correct form
- validating required fields
- submitting data
- redirecting after success

Create pages:

- decision/create
- subscription/create
- expense/create

---

## 6.3 Detail Pages

Each detail page is responsible for:

- loading one object by id
- rendering object information
- rendering associated records
- supporting update actions
- supporting additional record creation

Detail pages:

- decision/[id]
- subscription/[id]
- expense/[id]

---

# 7 Component Architecture

Use small reusable components.

## 7.1 Shared Components

Shared components:

- Header
- CreateBar
- CardBoard
- Card
- EmptyState
- LoadingState
- DeleteButton

---

## 7.2 Domain Card Components

Domain card components:

- DecisionCard
- SubscriptionCard
- ExpenseCard

Each card component is responsible only for rendering.

Data preparation should happen before rendering.

---

## 7.3 Domain Form Components

Recommended form components:

- DecisionCreateForm
- SubscriptionCreateForm
- ExpenseCreateForm
- HeartbeatButton
- BehaviorForm
- ExpenseRecordForm

Forms must handle loading, success, and error states.

---

# 8 Data Flow

Data flow must stay simple and explicit.

## 8.1 Read Flow

Read flow:

1. Page loads
2. Server fetches data via Prisma
3. Data is mapped into UI-friendly shape
4. Components render data

Use server rendering for page-level reads where possible.

---

## 8.2 Write Flow

Write flow:

1. User submits form or clicks action
2. Client triggers Server Action or API request
3. Server validates input
4. Prisma writes to database
5. Server returns success or error
6. UI refreshes or redirects

All write operations must have explicit success and failure handling.

---

# 9 Mutation Rules

Mutations include:

- create decision
- create subscription
- create expense category
- create heartbeat record
- create behavior record
- create expense record
- delete cards where supported

Rules:

- validate required fields before write
- reject invalid numeric values
- reject missing ids
- keep mutation handlers small
- return predictable results
- revalidate affected pages after successful mutation

---

# 10 API and Server Action Strategy

Either Server Actions or API routes may be used.

Preferred usage:

- form submission: Server Actions
- explicit client-side operations: API routes
- drag-and-drop order persistence: API route if needed

If both are used, keep responsibility clear and consistent.

Do not duplicate logic in multiple places.

Use shared helper functions for database operations where helpful.

---

# 11 Validation Rules

Validation must exist for all user input.

## Decision

Required:

- name

Optional for initial MVP:

- score
- status

## BehaviorRecord

Required:

- decision_id
- amount

Validation:

- amount must be greater than 0

## Subscription

Required:

- name
- price
- billing_cycle
- next_billing_date
- auto_renew

Validation:

- price must be greater than or equal to 0

## ExpenseCategory

Required:

- name

## ExpenseRecord

Required:

- category_id
- amount
- date

Validation:

- amount must be greater than 0

---

# 12 Display Mapping Rules

The UI should not directly depend on raw database structures where avoidable.

Map data into display-oriented shapes.

Examples:

## Decision Card

Display fields:

- title = decision.name
- score = decision.score
- status = decision.status
- updatedAt = decision.updated_at
- heartbeatCount = decision.heartbeat_count
- behaviorTotalAmount = decision.behavior_total_amount

## Subscription Card

Display fields:

- title = subscription.name
- price = subscription.price
- billingCycle = subscription.billing_cycle
- nextBillingDate = subscription.next_billing_date
- status = derived status text

## Expense Card

Display fields:

- title = expenseCategory.name
- latestAmount = latest expense record amount
- latestDate = latest expense record date
- summaryText = formatted card copy

---

# 13 Drag and Drop Architecture

Drag and drop is used on the Home dashboard.

Requirements:

- use dnd-kit
- card movement is handled in client components
- UI order updates immediately
- persistence of order is optional unless explicitly implemented

If persistence is implemented:

- add a dedicated order field
- save updated order through a mutation
- re-render board using saved order

Do not mix drag logic into card presentation components.

Keep drag state in CardBoard or a dedicated board-level client component.

---

# 14 Error Handling

Every page and mutation path must define error behavior.

Required error states:

- record not found
- validation failed
- database write failed
- database read failed
- empty list state

UI rules:

- show concise error messages
- do not expose internal stack traces
- keep error presentation consistent across forms

---

# 15 Loading States

Every async interaction must have a visible loading state.

Required loading states:

- initial page load where relevant
- form submission
- heartbeat submission
- behavior submission
- expense record creation
- drag action persistence if implemented

Loading states should prevent duplicate submissions.

---

# 16 Empty States

Show empty states when there is no data.

Required empty states:

- no cards on dashboard
- no heartbeat records
- no behavior records
- no expense records

Empty states should tell the user what can be created next.

---

# 17 Deletion Rules

Deletion is supported for cards on the Home dashboard.

Rules:

- delete action must target the correct object type
- after delete, dashboard data must refresh
- deleting a parent object should handle child records safely

Preferred approach:

- if relational cleanup is needed, configure cascading delete or explicit transactional cleanup

---

# 18 Database Design Rules

Use Prisma models as the single source of truth.

Requirements:

- every model has a stable primary key
- timestamps use DateTime
- relations are explicit
- optional fields are marked explicitly
- numeric money-like values use a consistent numeric type

For MVP, Float is acceptable for numeric values if used consistently.

---

# 19 Code Organization Rules

Organize code by responsibility.

Recommended pattern:

- page files for route entry
- component files for UI rendering
- lib files for shared utilities
- server logic separated from presentational logic when useful

Avoid:

- large page files with mixed concerns
- repeating Prisma queries in many places
- mixing formatting logic with low-level persistence logic

---

# 20 Return Shapes

Mutation handlers should return predictable objects.

Recommended success shape:

```ts
{ success: true, data?: unknown }
```

Recommended error shape:

```ts
{ success: false, error: string }
```

Use one consistent pattern across the project.

---

# 21 MVP Implementation Order

Implement in this order:

1. Prisma schema
2. Prisma client setup
3. Seed or test data support if needed
4. Home page data loading
5. CreateBar
6. Card components
7. Decision create flow
8. Decision detail page
9. Heartbeat mutation
10. Behavior mutation
11. Subscription create flow
12. Subscription detail page
13. Expense create flow
14. Expense detail page
15. Expense record mutation
16. Card deletion
17. Drag and drop

---

# 22 Non-Goals for Current MVP

Do not implement these unless explicitly requested:

- authentication
- multi-user collaboration
- advanced analytics
- recommendation engine logic
- payment integration
- notification system
- subscription auto-sync
- complex dashboard filtering
- mobile app build

---

# 23 Final Rule

When implementation choices are ambiguous, choose the simpler architecture that:

- matches the existing stack
- reduces moving parts
- improves readability
- is easier to maintain
- is easier for Cursor to extend
