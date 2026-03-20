# API Contract – Decision Project

This document defines the MVP API contract for the Decision project.

Its purpose is to give Cursor and developers a single implementation reference for:

- request shape
- response shape
- validation rules
- error handling
- revalidation / redirect behavior
- score recalculation rules

This file should be read together with:

- `decision_prd.md`
- `architecture.md`
- `rules.md`
- `decision_algorithm.md`
- `decision_question_mapping.md`
- `schema.prisma`

---

# 1. MVP implementation rule

To reduce ambiguity, use this implementation split:

- **Create / update form submissions**: prefer **Server Actions**
- **Delete / quick actions / check-in actions / drag reorder**: use **REST-like API routes**

However, this document defines the **data contract** in HTTP style so that:

- API Routes can implement it directly
- Server Actions can internally follow the same payload and return shape

---

# 2. Global conventions

## 2.1 Base path

```txt
/app/api
```

Suggested route set:

```txt
POST   /api/decision
GET    /api/decision/[id]
PATCH  /api/decision/[id]
DELETE /api/decision/[id]

POST   /api/decision/recalculate
POST   /api/heartbeat
POST   /api/behavior
DELETE /api/heartbeat/[id]
DELETE /api/behavior/[id]

POST   /api/subscription
GET    /api/subscription/[id]
PATCH  /api/subscription/[id]
DELETE /api/subscription/[id]

POST   /api/expense
GET    /api/expense/[id]
PATCH  /api/expense/[id]
DELETE /api/expense/[id]

POST   /api/expense-record
PATCH  /api/expense-record/[id]
DELETE /api/expense-record/[id]

POST   /api/card-order
```

Notes:

- `/api/expense` refers to the `ExpenseCategory` domain object
- `/api/expense-record` refers to a record under one expense category
- `GET list` endpoints are optional for MVP because Home and detail pages can load directly through Prisma in server components

---

## 2.2 Content type

All JSON requests and responses use:

```txt
Content-Type: application/json
```

---

## 2.3 Success response envelope

For mutation endpoints, use a unified shape:

```json
{
  "success": true,
  "data": {},
  "message": "optional human-readable message"
}
```

For reads:

```json
{
  "success": true,
  "data": {}
}
```

---

## 2.4 Error response envelope

All handled API errors should return:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A human-readable error message",
    "fieldErrors": {
      "name": ["Name is required"]
    }
  }
}
```

### Standard error codes

Use these error codes consistently:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `BAD_REQUEST`
- `INTERNAL_ERROR`

---

## 2.5 HTTP status code conventions

- `200 OK` – read success, update success, delete success
- `201 Created` – create success
- `400 Bad Request` – malformed body or invalid action
- `404 Not Found` – record does not exist
- `409 Conflict` – uniqueness conflict, duplicate daily heartbeat, illegal state conflict
- `500 Internal Server Error` – unexpected failure

---

## 2.6 Date conventions

Use ISO 8601 strings in transport.

Examples:

- `2026-03-10`
- `2026-03-10T12:30:00.000Z`

Rules:

- `recordedOn` for heartbeat should be sent as date-only string when possible
- `nextBillingDate` should be sent as full ISO string or a date-only string normalized on the server
- `ExpenseRecord.date` should represent the user’s intended spending date, not necessarily `createdAt`

---

## 2.7 Money conventions

MVP uses numeric JSON fields.

Rules:

- transport type: `number`
- stored in Prisma MVP schema as `Float`
- must be `>= 0`
- UI displays formatting separately

Recommended future upgrade:

- migrate to `Decimal` in database if accounting precision becomes important

---

# 3. Shared response models

## 3.1 Decision summary

```json
{
  "id": "uuid",
  "name": "Sony WH-1000XM6",
  "score": 68.4,
  "status": "BUY",
  "heartbeatCount": 3,
  "behaviorTotalAmount": 219.5,
  "createdAt": "2026-03-01T08:00:00.000Z",
  "updatedAt": "2026-03-10T08:00:00.000Z"
}
```

## 3.2 Decision detail

```json
{
  "id": "uuid",
  "name": "Sony WH-1000XM6",
  "note": "Need for commute and work calls",
  "price": 2499,
  "usageDuration": "ONE_TO_THREE_Y",
  "usageFrequency": "DAILY",
  "certaintyLevel": "SOMEWHAT_CERTAIN",
  "consumptionType": "PRODUCTIVITY",
  "hasAlternative": true,
  "alternativeCostLevel": "MEDIUM",
  "nonPurchaseImpact": "MODERATE",
  "affectedPeopleCount": "SELF_ONLY",
  "desireDuration": "ONE_TO_THREE_M",
  "score": 68.4,
  "status": "BUY",
  "uvScore": 13.6,
  "spScore": 11,
  "ppScore": 18.2,
  "psScore": 6,
  "heartbeatCount": 3,
  "behaviorTotalAmount": 219.5,
  "createdAt": "2026-03-01T08:00:00.000Z",
  "updatedAt": "2026-03-10T08:00:00.000Z",
  "heartbeats": [],
  "behaviors": []
}
```

## 3.3 Subscription detail

```json
{
  "id": "uuid",
  "name": "Spotify",
  "price": 15,
  "billingCycle": "MONTHLY",
  "nextBillingDate": "2026-03-25T00:00:00.000Z",
  "usageFrequency": "DAILY",
  "autoRenew": true,
  "note": "Family plan",
  "createdAt": "2026-03-01T08:00:00.000Z",
  "updatedAt": "2026-03-05T10:00:00.000Z"
}
```

## 3.4 Expense category detail

```json
{
  "id": "uuid",
  "name": "Travel",
  "note": "Long-distance trips and vacations",
  "createdAt": "2026-01-01T08:00:00.000Z",
  "updatedAt": "2026-03-01T08:00:00.000Z",
  "records": [
    {
      "id": "uuid",
      "amount": 4200,
      "date": "2026-02-18T00:00:00.000Z",
      "note": "Kyoto trip",
      "createdAt": "2026-02-18T11:00:00.000Z"
    }
  ]
}
```

---

# 4. Decision endpoints

# 4.1 Create decision

## Endpoint

```txt
POST /api/decision
```

## Purpose

Create one Decision record from the questionnaire, immediately calculate score, and persist derived fields.

## Request body

```json
{
  "name": "Sony WH-1000XM6",
  "note": "Need for commute and work calls",
  "price": 2499,
  "usageDuration": "ONE_TO_THREE_Y",
  "usageFrequency": "DAILY",
  "certaintyLevel": "SOMEWHAT_CERTAIN",
  "consumptionType": "PRODUCTIVITY",
  "hasAlternative": true,
  "alternativeCostLevel": "MEDIUM",
  "nonPurchaseImpact": "MODERATE",
  "affectedPeopleCount": "SELF_ONLY",
  "desireDuration": "ONE_TO_THREE_M"
}
```

## Validation rules

Required:

- `name`: non-empty string, trim before validate, max recommended length `120`
- `price`: number, `>= 0`
- all questionnaire enum fields are required
- `note`: optional string, max recommended length `1000`

Special rule:

- if `hasAlternative = false`, backend should still accept any incoming `alternativeCostLevel`, but normalize it to `HIGH` during calculation and persistence if that is the agreed rule in implementation

## Server behavior

1. Validate payload
2. Map questionnaire values to numeric factors using `decision_question_mapping.md`
3. Calculate `uvScore`, `spScore`, `ppScore`, `psScore`
4. Calculate final `score`
5. Derive `status`
6. Persist decision with:
   - raw questionnaire fields
   - score breakdown fields
   - `heartbeatCount = 0`
   - `behaviorTotalAmount = 0`
7. Revalidate Home and relevant pages

## Success response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "score": 68.4,
    "status": "BUY"
  },
  "message": "Decision created"
}
```

## Revalidate / redirect

Revalidate:

- `/`
- `/decision/[id]`

Redirect recommendation for form flow:

- redirect to `/decision/[id]`

---

# 4.2 Get decision detail

## Endpoint

```txt
GET /api/decision/[id]
```

## Purpose

Return one decision and its child records.

## Success response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "decision": {}
  }
}
```

Recommended payload:

- `decision`: full decision detail object
- `heartbeats`: newest first
- `behaviors`: newest first

## Not found

Status: `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found"
  }
}
```

---

# 4.3 Update decision

## Endpoint

```txt
PATCH /api/decision/[id]
```

## Purpose

Update decision base info and questionnaire inputs, then recompute all derived scores.

## Request body

Partial update is allowed, but implementation should recompute using the full latest state.

Example:

```json
{
  "price": 2299,
  "usageFrequency": "SEVERAL_PER_WEEK",
  "desireDuration": "MORE_THAN_THREE_M",
  "note": "Price dropped during promotion"
}
```

## Server behavior

1. Load existing decision
2. If not found, return `404`
3. Merge existing data with patch payload
4. Validate merged result as a full decision questionnaire
5. Recalculate `uvScore`, `spScore`, `ppScore`, `psScore`, `score`, `status`
6. Update row
7. Revalidate affected pages

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "score": 72.1,
    "status": "BUY"
  },
  "message": "Decision updated"
}
```

## Revalidate / redirect

Revalidate:

- `/`
- `/decision/[id]`

Redirect recommendation:

- no forced redirect for inline edit flow

---

# 4.4 Delete decision

## Endpoint

```txt
DELETE /api/decision/[id]
```

## Purpose

Delete one decision and cascade-delete heartbeat / behavior records.

## Server behavior

- if record exists, delete it
- child records should be removed through Prisma relation cascade
- revalidate Home

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Decision deleted"
}
```

## Revalidate

- `/`

---

# 4.5 Recalculate decision explicitly

## Endpoint

```txt
POST /api/decision/recalculate
```

## Purpose

Optional endpoint for explicit recalculation. Useful if you want a dedicated action instead of relying only on create/update/check-in flows.

## Request body

```json
{
  "decisionId": "uuid"
}
```

## Server behavior

1. Load decision
2. Load aggregate counts needed for PS behavior contributions
3. Recompute scores from persisted fields and child record aggregates
4. Save new derived fields

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "score": 70.2,
    "status": "BUY"
  },
  "message": "Decision recalculated"
}
```

---

# 5. Heartbeat endpoints

# 5.1 Create heartbeat

## Endpoint

```txt
POST /api/heartbeat
```

## Purpose

Create one heartbeat record for a decision and refresh derived decision fields.

## Request body

```json
{
  "decisionId": "uuid",
  "recordedOn": "2026-03-10"
}
```

## Validation rules

- `decisionId`: required uuid
- `recordedOn`: required date string for deterministic uniqueness

If frontend omits `recordedOn`, backend may default to current local day, but explicit input is preferred.

## Conflict rule

Only one heartbeat per decision per day.

Uniqueness basis:

```txt
(decisionId, recordedOn)
```

## Server behavior

1. Validate payload
2. Ensure decision exists
3. Try to insert heartbeat
4. If duplicate same-day heartbeat exists, return `409 CONFLICT`
5. Recompute:
   - `heartbeatCount`
   - `psScore`
   - final `score`
   - `status`
6. Update decision row
7. Revalidate Home and detail page

## Success response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "heartbeatId": "uuid",
    "decisionId": "uuid",
    "heartbeatCount": 4,
    "score": 69.1,
    "status": "BUY"
  },
  "message": "Heartbeat recorded"
}
```

## Conflict response

Status: `409 Conflict`

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A heartbeat already exists for this decision on this date"
  }
}
```

## Revalidate

- `/`
- `/decision/[id]`

---

# 5.2 Delete heartbeat

## Endpoint

```txt
DELETE /api/heartbeat/[id]
```

## Purpose

Delete one heartbeat record and recompute decision aggregates.

## Server behavior

1. Find heartbeat
2. If not found, return `404`
3. Delete heartbeat
4. Recompute parent decision:
   - `heartbeatCount`
   - `psScore`
   - `score`
   - `status`
5. Revalidate pages

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "decisionId": "uuid"
  },
  "message": "Heartbeat deleted"
}
```

---

# 6. Behavior endpoints

# 6.1 Create behavior record

## Endpoint

```txt
POST /api/behavior
```

## Purpose

Record spending caused by not buying the target item, then recompute decision aggregates.

## Request body

```json
{
  "decisionId": "uuid",
  "amount": 89.5,
  "note": "Bought cheaper stopgap accessories instead"
}
```

## Validation rules

- `decisionId`: required uuid
- `amount`: required number, must be `> 0`
- `note`: optional string, max recommended length `500`

## Server behavior

1. Validate payload
2. Ensure decision exists
3. Create behavior record
4. Recompute parent decision:
   - `behaviorTotalAmount`
   - `psScore`
   - `score`
   - `status`
5. Revalidate pages

## Success response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "behaviorId": "uuid",
    "decisionId": "uuid",
    "behaviorTotalAmount": 219.5,
    "score": 71.4,
    "status": "BUY"
  },
  "message": "Behavior recorded"
}
```

---

# 6.2 Delete behavior record

## Endpoint

```txt
DELETE /api/behavior/[id]
```

## Purpose

Delete one behavior record and recompute decision aggregates.

## Server behavior

1. Find behavior record
2. If not found, return `404`
3. Delete it
4. Recompute parent decision aggregates and score
5. Revalidate pages

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "decisionId": "uuid"
  },
  "message": "Behavior deleted"
}
```

---

# 7. Subscription endpoints

# 7.1 Create subscription

## Endpoint

```txt
POST /api/subscription
```

## Request body

```json
{
  "name": "Spotify",
  "price": 15,
  "billingCycle": "MONTHLY",
  "nextBillingDate": "2026-03-25",
  "usageFrequency": "DAILY",
  "autoRenew": true,
  "note": "Family plan"
}
```

## Validation rules

Required:

- `name`: non-empty string
- `price`: number, `>= 0`
- `billingCycle`: enum
- `nextBillingDate`: valid date

Optional:

- `usageFrequency`
- `autoRenew` default `true`
- `note`

## Success response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Subscription created"
}
```

## Revalidate / redirect

Revalidate:

- `/`
- `/subscription/[id]`

Redirect recommendation:

- `/subscription/[id]`

---

# 7.2 Get subscription detail

## Endpoint

```txt
GET /api/subscription/[id]
```

## Success response

```json
{
  "success": true,
  "data": {
    "subscription": {}
  }
}
```

---

# 7.3 Update subscription

## Endpoint

```txt
PATCH /api/subscription/[id]
```

## Request body

Partial update allowed.

Example:

```json
{
  "price": 18,
  "usageFrequency": "WEEKLY",
  "autoRenew": false
}
```

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Subscription updated"
}
```

## Revalidate

- `/`
- `/subscription/[id]`

---

# 7.4 Delete subscription

## Endpoint

```txt
DELETE /api/subscription/[id]
```

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Subscription deleted"
}
```

## Revalidate

- `/`

---

# 8. Expense endpoints

# 8.1 Create expense category

## Endpoint

```txt
POST /api/expense
```

## Purpose

Create one expense category card.

## Request body

```json
{
  "name": "Travel",
  "note": "Long-distance trips and vacations"
}
```

## Validation rules

- `name`: required non-empty string
- `note`: optional string

## Success response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Expense category created"
}
```

## Revalidate / redirect

Revalidate:

- `/`
- `/expense/[id]`

Redirect recommendation:

- `/expense/[id]`

---

# 8.2 Get expense category detail

## Endpoint

```txt
GET /api/expense/[id]
```

## Purpose

Return one expense category and its records.

## Success response

```json
{
  "success": true,
  "data": {
    "expenseCategory": {}
  }
}
```

Recommended ordering:

- `records` sorted by `date desc`, then `createdAt desc`

---

# 8.3 Update expense category

## Endpoint

```txt
PATCH /api/expense/[id]
```

## Request body

```json
{
  "name": "Travel & Vacation",
  "note": "Flights, hotels, and major trips"
}
```

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Expense category updated"
}
```

## Revalidate

- `/`
- `/expense/[id]`

---

# 8.4 Delete expense category

## Endpoint

```txt
DELETE /api/expense/[id]
```

## Purpose

Delete category and cascade-delete all records.

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Expense category deleted"
}
```

## Revalidate

- `/`

---

# 9. Expense record endpoints

# 9.1 Create expense record

## Endpoint

```txt
POST /api/expense-record
```

## Request body

```json
{
  "categoryId": "uuid",
  "amount": 4200,
  "date": "2026-02-18",
  "note": "Kyoto trip"
}
```

## Validation rules

- `categoryId`: required uuid
- `amount`: required number, must be `> 0`
- `date`: required valid date
- `note`: optional string

## Server behavior

1. Ensure category exists
2. Create record
3. Revalidate Home and expense detail

## Success response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "categoryId": "uuid"
  },
  "message": "Expense record created"
}
```

## Revalidate

- `/`
- `/expense/[id]`

---

# 9.2 Update expense record

## Endpoint

```txt
PATCH /api/expense-record/[id]
```

## Request body

```json
{
  "amount": 4500,
  "note": "Trip budget updated"
}
```

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid"
  },
  "message": "Expense record updated"
}
```

## Revalidate

- `/`
- `/expense/[id]`

---

# 9.3 Delete expense record

## Endpoint

```txt
DELETE /api/expense-record/[id]
```

## Success response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "categoryId": "uuid"
  },
  "message": "Expense record deleted"
}
```

## Revalidate

- `/`
- `/expense/[id]`

---

# 10. Card ordering endpoint

This endpoint is only needed if drag-and-drop order should persist in database.

Because the current schema draft does **not yet** include order fields, this endpoint is optional and should only be implemented together with a schema update.

# 10.1 Save card order

## Endpoint

```txt
POST /api/card-order
```

## Request body

```json
{
  "items": [
    {
      "id": "uuid-1",
      "type": "decision",
      "order": 1
    },
    {
      "id": "uuid-2",
      "type": "subscription",
      "order": 2
    }
  ]
}
```

## Validation rules

- `items`: required array
- `type`: one of `decision | subscription | expense`
- `order`: integer `>= 0`

## Note

Do not implement this endpoint until order persistence is added to schema.

---

# 11. Recalculation rules for Decision

Any of the following actions must trigger decision recomputation:

- create decision
- update decision questionnaire fields
- create heartbeat
- delete heartbeat
- create behavior
- delete behavior
- explicit recalculate action

Recompute these fields together every time:

- `uvScore`
- `spScore`
- `ppScore`
- `psScore`
- `heartbeatCount`
- `behaviorTotalAmount`
- `score`
- `status`

Never update only one derived field in isolation.

---

# 12. Status derivation contract

Until a more detailed status system is introduced, standardize Decision status on these enum outputs:

- `NOT_RECOMMENDED`
- `WAIT`
- `BUY`

Recommended mapping:

```txt
score < 40        -> NOT_RECOMMENDED
40 <= score < 60  -> WAIT
score >= 60       -> BUY
```

Important:

- frontend badge text can be localized
- API transport must use enum value, not display text

---

# 13. Validation implementation recommendation

Recommended validation library:

- `zod`

Recommended pattern:

- one schema per endpoint payload
- shared enum definitions aligned with Prisma enums where possible
- convert empty string to `undefined` before validation for optional notes
- trim string inputs before persistence

---

# 14. Minimal TypeScript contract examples

## 14.1 Decision create payload

```ts
export type CreateDecisionPayload = {
  name: string;
  note?: string;
  price: number;
  usageDuration:
    | "ONE_TIME"
    | "LESS_THAN_3M"
    | "THREE_TO_TWELVE_M"
    | "ONE_TO_THREE_Y"
    | "MORE_THAN_THREE_Y";
  usageFrequency:
    | "RARELY"
    | "MONTHLY"
    | "WEEKLY"
    | "SEVERAL_PER_WEEK"
    | "DAILY";
  certaintyLevel:
    | "VERY_UNCERTAIN"
    | "SOMEWHAT_UNCERTAIN"
    | "NEUTRAL"
    | "SOMEWHAT_CERTAIN"
    | "VERY_CERTAIN";
  consumptionType:
    | "LUXURY"
    | "IMPROVEMENT"
    | "PRODUCTIVITY"
    | "HEALTH_SAFETY"
    | "ESSENTIAL";
  hasAlternative: boolean;
  alternativeCostLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  nonPurchaseImpact: "ALMOST_NONE" | "MINOR" | "MODERATE" | "MAJOR";
  affectedPeopleCount: "SELF_ONLY" | "TWO_PEOPLE" | "FAMILY_SMALL" | "FAMILY_LARGE";
  desireDuration:
    | "LESS_THAN_3D"
    | "THREE_TO_SEVEN_D"
    | "ONE_TO_FOUR_W"
    | "ONE_TO_THREE_M"
    | "MORE_THAN_THREE_M";
};
```

## 14.2 Unified mutation response

```ts
export type MutationResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
```

---

# 15. Final implementation notes for Cursor

1. Keep endpoint names stable.
2. Keep response envelope stable.
3. Revalidate Home after every successful mutation that changes card content.
4. Recompute Decision derived fields centrally in one shared service function.
5. Do not duplicate scoring logic across route handlers.
6. Do not let frontend compute the source-of-truth score.
7. Frontend may preview a score, but backend must be authoritative.

