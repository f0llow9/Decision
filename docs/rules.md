# Cursor System Rules -- Decision Project

This file defines the development rules for the Decision project.

All AI-generated code must follow these rules.

Do not introduce alternative frameworks or architectures unless
explicitly requested.

------------------------------------------------------------------------

# 1 Project Overview

Decision is a web application for managing consumer decision making.

The system manages three types of objects:

-   Decision
-   Subscription
-   Expense

All objects are displayed as cards on the Home Dashboard.

Users can create, update, and track these cards.

------------------------------------------------------------------------

# 2 Technology Stack

The project must use the following stack.

Frontend - Next.js (App Router) - React - TypeScript - TailwindCSS -
dnd-kit (for drag and drop)

Backend - Next.js API Routes

Database - PostgreSQL

ORM - Prisma

State Management - React state - Server Actions

Do not introduce other frameworks unless explicitly requested.

------------------------------------------------------------------------

# 3 Architecture Principles

Follow these rules when generating code:

1.  Use Next.js App Router.
2.  Prefer Server Components where possible.
3.  Use Client Components only when interactivity is required.
4.  Use Prisma for all database access.
5.  Avoid raw SQL unless necessary.
6.  Keep API routes simple and REST-like.

------------------------------------------------------------------------

# 4 Project Structure

The project must follow this directory structure.

/app page.tsx

/decision /create page.tsx /\[id\] page.tsx

/subscription /create page.tsx /\[id\] page.tsx

/expense /create page.tsx /\[id\] page.tsx

/app/api /decision /subscription /expense /heartbeat /behavior

/components CreateBar.tsx CardBoard.tsx Card.tsx DecisionCard.tsx
SubscriptionCard.tsx ExpenseCard.tsx

/lib prisma.ts

/prisma schema.prisma

------------------------------------------------------------------------

# 5 Data Models

The system must implement the following models.

Decision - id - name - score - status - created_at - updated_at -
heartbeat_count - behavior_total_amount

HeartbeatRecord - id - decision_id - created_at

BehaviorRecord - id - decision_id - amount - created_at

Subscription - id - name - price - billing_cycle - next_billing_date -
usage_frequency - auto_renew - note - created_at

ExpenseCategory - id - name - note - created_at

ExpenseRecord - id - category_id - amount - date - note - created_at

All database operations must use Prisma.

------------------------------------------------------------------------

# 6 Home Dashboard

The Home page must contain two main components.

CreateBar\
CardBoard

------------------------------------------------------------------------

## CreateBar

CreateBar must include:

-   Select
-   Input
-   CreateButton

Select options:

-   New Decision
-   New Subscription
-   New Expense

Creating an item navigates to the correct creation flow.

------------------------------------------------------------------------

## CardBoard

CardBoard displays all cards.

Card types:

-   DecisionCard
-   SubscriptionCard
-   ExpenseCard

Required features:

-   Drag and drop
-   Delete card
-   Open detail page

Drag-and-drop must use dnd-kit.

------------------------------------------------------------------------

# 7 Decision Module

Decision represents a consumer purchase decision.

Features:

-   decision questionnaire
-   heartbeat check-in
-   behavior check-in

Decision detail page must display:

-   decision information
-   heartbeat history
-   behavior history

------------------------------------------------------------------------

## Heartbeat

Heartbeat records purchase desire.

Fields:

-   decision_id
-   created_at

Heartbeat increases heartbeat_count.

------------------------------------------------------------------------

## Behavior

Behavior records spending caused by not buying the item.

Fields:

-   decision_id
-   amount
-   created_at

Behavior increases behavior_total_amount.

------------------------------------------------------------------------

# 8 Subscription Module

Subscription represents recurring payments.

Fields:

-   name
-   price
-   billing_cycle
-   next_billing_date
-   usage_frequency
-   auto_renew
-   note

Subscriptions appear as cards on the Home Dashboard.

------------------------------------------------------------------------

# 9 Expense Module

Expense tracks high-value spending categories.

ExpenseCategory represents a spending type.

ExpenseRecord represents a single spending event.

Expense detail pages must show record history.

------------------------------------------------------------------------

# 10 UI Principles

The UI must follow these rules.

-   Card-based layout
-   Clean minimal interface
-   Use TailwindCSS utility classes
-   Avoid complex CSS frameworks

All cards must have consistent styling.

------------------------------------------------------------------------

# 11 Code Style

Use the following standards.

-   TypeScript strict mode
-   Functional React components
-   Clear component separation
-   Small reusable components

Avoid large monolithic components.

------------------------------------------------------------------------

# 12 Development Priority

When generating code, implement features in this order:

1.  Database schema
2.  Prisma setup
3.  API routes
4.  Home dashboard
5.  CreateBar
6.  CardBoard
7.  Decision module
8.  Subscription module
9.  Expense module
10. Drag and drop
