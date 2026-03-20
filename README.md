# Decision

Decision 是一个用于帮助普通消费者进行消费决策管理的 Web 应用。

用户可以在系统中创建三类卡片：

-   决策卡片（Decision）
-   订阅卡片（Subscription）
-   大额支出卡片（Expense）

所有卡片统一展示在首页，并允许用户持续更新相关信息。

目标是构建一个
**可视化消费决策界面**，让用户在消费前查看和记录自己的决策信息。

------------------------------------------------------------------------

# Tech Stack

建议技术栈（MVP实现）：

Frontend - Next.js (App Router) - React - TypeScript - TailwindCSS -
dnd-kit (drag and drop)

Backend - Next.js API Routes

Database - PostgreSQL

ORM - Prisma

State Management - React state / server actions

------------------------------------------------------------------------

# Project Structure

    /app
      page.tsx

      /decision
        /create
          page.tsx
        /[id]
          page.tsx

      /subscription
        /create
          page.tsx
        /[id]
          page.tsx

      /expense
        /create
          page.tsx
        /[id]
          page.tsx

    /components
      CreateBar.tsx
      CardBoard.tsx
      Card.tsx
      DecisionCard.tsx
      SubscriptionCard.tsx
      ExpenseCard.tsx

    /lib
      prisma.ts

    /prisma
      schema.prisma

    /app/api
      /decision
      /subscription
      /expense
      /heartbeat
      /behavior

------------------------------------------------------------------------

# Core Features

## 1 Home Dashboard

首页展示所有卡片。

包含组件：

CreateBar\
CardBoard

------------------------------------------------------------------------

## CreateBar

CreateBar 组件包含：

Select\
Input\
CreateButton

Select 选项：

New Decision\
New Subscription\
New Expense

创建流程：

Home → Select Type → Input Name → Enter Create Flow

------------------------------------------------------------------------

## CardBoard

CardBoard 用于展示所有卡片。

支持功能：

-   Drag and drop
-   Delete card
-   Open detail page

卡片类型：

DecisionCard\
SubscriptionCard\
ExpenseCard

------------------------------------------------------------------------

# Decision Module

Decision 用于记录某个商品或消费行为的决策过程。

------------------------------------------------------------------------

## Decision Fields

    id
    name
    score
    status
    created_at
    updated_at
    heartbeat_count
    behavior_total_amount

------------------------------------------------------------------------

## HeartbeatRecord

记录用户再次产生购买冲动。

    id
    decision_id
    created_at

------------------------------------------------------------------------

## BehaviorRecord

记录因为没有购买该商品而产生的消费。

    id
    decision_id
    amount
    created_at

------------------------------------------------------------------------

# Subscription Module

Subscription 用于记录订阅服务。

------------------------------------------------------------------------

## Subscription Fields

    id
    name
    price
    billing_cycle
    next_billing_date
    usage_frequency
    auto_renew
    note
    created_at

------------------------------------------------------------------------

# Expense Module

Expense 用于记录某类大额消费行为。

------------------------------------------------------------------------

## ExpenseCategory

    id
    name
    note
    created_at

------------------------------------------------------------------------

## ExpenseRecord

    id
    category_id
    amount
    date
    note
    created_at

------------------------------------------------------------------------

# Database Schema (Prisma)

示例 Prisma schema：

    model Decision {
      id                    String   @id @default(uuid())
      name                  String
      score                 Int?
      status                String?
      created_at            DateTime @default(now())
      updated_at            DateTime @updatedAt
      heartbeat_count       Int      @default(0)
      behavior_total_amount Float    @default(0)
    }

    model HeartbeatRecord {
      id          String   @id @default(uuid())
      decision_id String
      created_at  DateTime @default(now())
    }

    model BehaviorRecord {
      id          String   @id @default(uuid())
      decision_id String
      amount      Float
      created_at  DateTime @default(now())
    }

    model Subscription {
      id                String   @id @default(uuid())
      name              String
      price             Float
      billing_cycle     String
      next_billing_date DateTime
      usage_frequency   String?
      auto_renew        Boolean
      note              String?
      created_at        DateTime @default(now())
    }

    model ExpenseCategory {
      id         String   @id @default(uuid())
      name       String
      note       String?
      created_at DateTime @default(now())
    }

    model ExpenseRecord {
      id          String   @id @default(uuid())
      category_id String
      amount      Float
      date        DateTime
      note        String?
      created_at  DateTime @default(now())
    }

------------------------------------------------------------------------

# API Routes

    POST /api/decision
    GET /api/decision
    GET /api/decision/[id]

    POST /api/heartbeat
    POST /api/behavior

    POST /api/subscription
    GET /api/subscription

    POST /api/expense-category
    POST /api/expense-record

------------------------------------------------------------------------

# Implementation Steps

1.  初始化 Next.js + TypeScript 项目
2.  配置 TailwindCSS
3.  安装 Prisma 并创建数据库
4.  创建 Prisma schema
5.  创建 API routes
6.  创建首页布局
7.  实现 CreateBar
8.  实现 CardBoard
9.  实现 DecisionCard / SubscriptionCard / ExpenseCard
10. 实现拖动排序
11. 实现详情页面
12. 实现 Heartbeat 和 Behavior 打卡

------------------------------------------------------------------------

# Development Goal

实现一个完整 MVP Web 应用。

必须包含：

-   首页卡片看板
-   创建三类卡片
-   卡片拖动
-   卡片删除
-   卡片详情页
-   Heartbeat 打卡
-   Behavior 打卡
-   Subscription 管理
-   Expense 记录
