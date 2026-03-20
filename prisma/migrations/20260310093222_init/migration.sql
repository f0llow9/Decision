-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "price" REAL NOT NULL,
    "usage_duration" TEXT NOT NULL,
    "usage_frequency" TEXT NOT NULL,
    "certainty_level" TEXT NOT NULL,
    "consumption_type" TEXT NOT NULL,
    "has_alternative" BOOLEAN NOT NULL,
    "alternative_cost_level" TEXT NOT NULL,
    "non_purchase_impact" TEXT NOT NULL,
    "affected_people_count" TEXT NOT NULL,
    "desire_duration" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "uv_score" REAL NOT NULL DEFAULT 0,
    "sp_score" REAL NOT NULL DEFAULT 0,
    "pp_score" REAL NOT NULL DEFAULT 0,
    "ps_score" REAL NOT NULL DEFAULT 0,
    "heartbeat_count" INTEGER NOT NULL DEFAULT 0,
    "behavior_total_amount" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "heartbeat_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decision_id" TEXT NOT NULL,
    "recorded_on" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "heartbeat_records_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "decisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "behavior_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "decision_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "behavior_records_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "decisions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "next_billing_date" DATETIME NOT NULL,
    "usage_frequency" TEXT,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "expense_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expense_records_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "decisions_status_idx" ON "decisions"("status");

-- CreateIndex
CREATE INDEX "decisions_updated_at_idx" ON "decisions"("updated_at");

-- CreateIndex
CREATE INDEX "heartbeat_records_decision_id_created_at_idx" ON "heartbeat_records"("decision_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "heartbeat_records_decision_id_recorded_on_key" ON "heartbeat_records"("decision_id", "recorded_on");

-- CreateIndex
CREATE INDEX "behavior_records_decision_id_created_at_idx" ON "behavior_records"("decision_id", "created_at");

-- CreateIndex
CREATE INDEX "subscriptions_next_billing_date_idx" ON "subscriptions"("next_billing_date");

-- CreateIndex
CREATE INDEX "expense_categories_updated_at_idx" ON "expense_categories"("updated_at");

-- CreateIndex
CREATE INDEX "expense_records_category_id_date_idx" ON "expense_records"("category_id", "date");
