# Decision 问答映射文档

## 1. 文档目标

本文档用于把 `decision_algorithm.md` 中的抽象评分规则，细化为**可直接供 Cursor / 前后端实现的字段、选项、分值映射与计算规则**。

本文档解决以下问题：

- 新建决策页每道题到底问什么
- 每道题的字段名是什么
- 选项值如何存储
- 每个选项对应多少分
- 四大模块（UV / SP / PP / PS）如何计算
- 最终 `score` 和 `status` 如何输出

---

## 2. 总体实现原则

### 2.1 存储原则

数据库建议同时保存：

- `score`：最终分（0–100）
- `status`：最终状态文案
- `uv_score`
- `sp_score`
- `pp_score`
- `ps_score`
- `heartbeat_count`
- `behavior_total_amount`

说明：

- 对外统一展示字段名为 `score`
- 内部分项分数单独保存，便于详情页解释与后续调试
- 所有分数保留 1 位小数

### 2.2 计算顺序

创建决策或打卡后，统一按以下顺序重算：

1. 计算 UV
2. 计算 SP
3. 计算 PP
4. 计算 PS
5. `decision_raw_score = uv_score + sp_score + ps_score - pp_score`
6. `score = clamp(decision_raw_score + 35, 0, 100)`
7. 根据 `score` 输出 `status`

### 2.3 clamp 规则

```ts
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
```

---

## 3. 决策问答字段清单

新建 Decision 时，前端应收集以下字段。

| 字段名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `name` | string | 是 | 商品 / 服务名称 |
| `price` | number | 是 | 商品价格，必须 > 0 |
| `usage_duration` | enum | 是 | 预计会用多久 |
| `usage_frequency` | enum | 是 | 预计使用频率 |
| `certainty_level` | enum | 是 | 你有多确定自己会持续使用 |
| `consumption_type` | enum | 是 | 消费类型 |
| `has_alternative` | boolean | 是 | 是否存在可接受替代方案 |
| `alternative_cost_level` | enum | 是 | 继续使用替代方案的代价 |
| `non_purchase_impact` | enum | 是 | 不买会造成多大影响 |
| `affected_people_count` | enum | 是 | 影响人数 |
| `desire_duration` | enum | 是 | 想买这件东西已经持续多久 |
| `note` | string | 否 | 备注 |

---

## 4. 字段枚举与分值映射

以下是**推荐直接落库的枚举值**。前端展示文案可以本地化，但提交值请尽量固定为英文枚举，避免后续改文案影响计算。

---

## 5. 使用价值 UV 映射

UV 的目标范围：`0–40`

公式：

```text
uv_base = usage_duration_score × usage_frequency_score × certainty_score × type_weight
uv_score = clamp(round1(uv_base), 0, 40)
```

说明：

- 这里通过较小数值乘法，天然把结果控制在 40 附近
- `round1(x)` 表示保留 1 位小数

### 5.1 usage_duration（使用时长）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `one_time` | 一次性 / 很快就不用了 | 0.8 |
| `less_than_3m` | 少于 3 个月 | 1.2 |
| `three_to_twelve_m` | 3–12 个月 | 1.8 |
| `one_to_three_y` | 1–3 年 | 2.6 |
| `more_than_three_y` | 3 年以上 | 3.2 |

### 5.2 usage_frequency（使用频率）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `rarely` | 很少使用 | 1.0 |
| `monthly` | 每月几次 | 1.6 |
| `weekly` | 每周使用 | 2.4 |
| `several_per_week` | 每周多次 | 3.0 |
| `daily` | 几乎每天 | 3.8 |

### 5.3 certainty_level（确定程度）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `very_uncertain` | 很不确定 | 0.7 |
| `somewhat_uncertain` | 有点不确定 | 0.9 |
| `neutral` | 一般 | 1.0 |
| `somewhat_certain` | 比较确定 | 1.2 |
| `very_certain` | 非常确定 | 1.4 |

### 5.4 consumption_type（消费类型）

| 枚举值 | 展示文案 | 权重 |
|---|---|---:|
| `luxury` | 纯享受 / 冲动型消费 | 0.8 |
| `improvement` | 提升体验型消费 | 1.0 |
| `productivity` | 效率 / 生产力工具 | 1.15 |
| `health_safety` | 健康 / 安全相关 | 1.25 |
| `essential` | 刚需型消费 | 1.35 |

### 5.5 UV 计算示例

例如：

- 使用时长：`one_to_three_y = 2.6`
- 使用频率：`daily = 3.8`
- 确定程度：`somewhat_certain = 1.2`
- 消费类型：`productivity = 1.15`

则：

```text
uv_base = 2.6 × 3.8 × 1.2 × 1.15 = 13.6
uv_score = 13.6
```

---

## 6. 替代压力 SP 映射

SP 的目标范围：`0–25`

公式：

```text
sp_raw = alternative_presence_score + alternative_cost_score + non_purchase_impact_score + affected_people_score
sp_score = clamp(round1(sp_raw), 0, 25)
```

### 6.1 has_alternative（是否存在替代方案）

| 条件 | 分值 |
|---|---:|
| `true` | 0 |
| `false` | 8 |

说明：

- 有替代方案，说明“不买也能凑合”，因此这里不给额外压力分
- 没有替代方案，说明不买的现实阻力较高，直接给 8 分

### 6.2 alternative_cost_level（替代成本）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `none` | 几乎没有代价 | 0 |
| `low` | 有点麻烦，但能接受 | 3 |
| `medium` | 比较麻烦，持续消耗时间/精力 | 6 |
| `high` | 很麻烦，长期明显影响体验 | 9 |

实现约束：

- 若 `has_alternative = false`，则前端仍提交 `alternative_cost_level = high`
- 或后端直接忽略该字段并强制按 `high = 9` 计算
- 推荐后端兜底，避免前端漏处理

### 6.3 non_purchase_impact（不购买影响）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `almost_none` | 几乎没影响 | 0 |
| `minor` | 有一点影响 | 2 |
| `moderate` | 有明显不便 | 5 |
| `major` | 影响很大 | 8 |

### 6.4 affected_people_count（影响人数）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `self_only` | 只影响我自己 | 0 |
| `two_people` | 影响 2 个人 | 2 |
| `family_small` | 影响 3–4 个人 | 4 |
| `family_large` | 影响 5 人及以上 | 6 |

### 6.5 SP 计算示例

例如：

- 无替代：`false → 8`
- 替代成本：`high → 9`
- 不买影响：`moderate → 5`
- 影响人数：`two_people → 2`

则：

```text
sp_raw = 8 + 9 + 5 + 2 = 24
sp_score = 24
```

---

## 7. 价格压力 PP 映射

PP 的目标范围：`5–35`

为了避免“价格 ÷ 使用价值”过于失控，这里定义一个明确的**使用价值指数 UVI**。

### 7.1 使用价值指数 UVI

```text
uvi = max(uv_score * 10, 1)
```

说明：

- `uv_score` 越高，说明长期使用价值越强
- 乘以 10 是为了让价格比值更平滑
- 最小值强制为 1，避免除零

### 7.2 PP 公式

```text
pp_ratio = price / uvi
pp_score = clamp(round1(5 + pp_ratio * 3), 5, 35)
```

解释：

- 低价且 UV 高，`pp_score` 会接近 5
- 高价且 UV 低，`pp_score` 会接近 35
- `* 3` 用于让价格敏感性更符合消费决策场景

### 7.3 PP 计算示例

例如：

- `price = 2999`
- `uv_score = 13.6`

则：

```text
uvi = 13.6 × 10 = 136
pp_ratio = 2999 / 136 = 22.1
pp_score = 5 + 22.1 × 3 = 71.3
pp_score = clamp(71.3, 5, 35) = 35
```

另一个例子：

- `price = 299`
- `uv_score = 13.6`

则：

```text
uvi = 136
pp_ratio = 299 / 136 = 2.2
pp_score = 5 + 2.2 × 3 = 11.6
pp_score = 11.6
```

---

## 8. 持续需求 PS 映射

PS 的目标范围：`0–20`

公式：

```text
ps_score = desire_duration_score + heartbeat_score + behavior_score
ps_score = clamp(round1(ps_score), 0, 20)
```

---

### 8.1 desire_duration（想买持续时间）

| 枚举值 | 展示文案 | 分值 |
|---|---|---:|
| `less_than_3d` | 不到 3 天 | 0 |
| `three_to_seven_d` | 3–7 天 | 2 |
| `one_to_four_w` | 1–4 周 | 4 |
| `one_to_three_m` | 1–3 个月 | 6 |
| `more_than_three_m` | 3 个月以上 | 8 |

---

### 8.2 heartbeat 打卡分

规则：

- 每天最多 1 次
- 每次 `+1.5`
- 最高 `+10`

公式：

```text
heartbeat_score = min(heartbeat_count * 1.5, 10)
```

数据库建议：

- `HeartbeatRecord` 单独存表
- `Decision` 冗余存 `heartbeat_count`
- 新增 heartbeat 后重算 `ps_score`

---

### 8.3 behavior 打卡分

规则：

- 记录“因为没买这个东西，而产生的替代性消费”
- 例如没买咖啡机，于是不断买咖啡

数据库建议：

- `BehaviorRecord.amount > 0`
- `Decision` 冗余存 `behavior_total_amount`

公式：

```text
behavior_ratio = behavior_total_amount / price
behavior_score = min(round1(behavior_ratio * 10), 10)
```

解释：

- 如果替代性消费已经接近商品价格，则行为分接近上限
- 当累计替代消费 >= 商品价格时，行为分直接封顶 10

示例：

- 商品价格 `1000`
- 行为累计金额 `250`

则：

```text
behavior_ratio = 250 / 1000 = 0.25
behavior_score = 2.5
```

---

## 9. 最终总分与状态映射

### 9.1 Final Score 公式

```text
decision_raw_score = uv_score + sp_score + ps_score - pp_score
score = clamp(round1(decision_raw_score + 35), 0, 100)
```

说明：

- `+35` 是基线修正项，用于让大部分正常消费场景落入更符合直觉的分布区间
- 页面展示分数统一使用 `score`

### 9.2 status 映射

| score 区间 | status |
|---|---|
| `0–39.9` | `not_recommended` |
| `40–64.9` | `wait` |
| `65–100` | `buy` |

### 9.3 status 展示文案

| status | 中文文案 |
|---|---|
| `not_recommended` | 不建议购买 |
| `wait` | 建议暂缓 |
| `buy` | 建议购买 |

---

## 10. 前端问答页推荐题目文案

下面是一版适合直接用于 UI 的中文题目文案。

### Q1 商品价格
- 题目：这个商品现在多少钱？
- 字段：`price`
- 组件：数字输入框

### Q2 使用时长
- 题目：你预计会使用它多久？
- 字段：`usage_duration`
- 组件：单选

### Q3 使用频率
- 题目：你预计会多频繁使用它？
- 字段：`usage_frequency`
- 组件：单选

### Q4 确定程度
- 题目：你有多确定自己会持续使用它？
- 字段：`certainty_level`
- 组件：单选

### Q5 消费类型
- 题目：这次购买更接近哪种类型？
- 字段：`consumption_type`
- 组件：单选

### Q6 替代方案
- 题目：现在有没有可以接受的替代方案？
- 字段：`has_alternative`
- 组件：单选（有 / 没有）

### Q7 替代成本
- 题目：继续依赖替代方案，会有多麻烦？
- 字段：`alternative_cost_level`
- 组件：单选

### Q8 不购买影响
- 题目：如果现在不买，会对你的生活或工作造成多大影响？
- 字段：`non_purchase_impact`
- 组件：单选

### Q9 影响人数
- 题目：这件事会影响到几个人？
- 字段：`affected_people_count`
- 组件：单选

### Q10 想买持续时间
- 题目：你想买这件东西已经多久了？
- 字段：`desire_duration`
- 组件：单选

---

## 11. 后端伪代码

```ts
function round1(num: number) {
  return Math.round(num * 10) / 10
}

function getUvScore(input: DecisionInput) {
  const durationMap = {
    one_time: 0.8,
    less_than_3m: 1.2,
    three_to_twelve_m: 1.8,
    one_to_three_y: 2.6,
    more_than_three_y: 3.2,
  }

  const frequencyMap = {
    rarely: 1.0,
    monthly: 1.6,
    weekly: 2.4,
    several_per_week: 3.0,
    daily: 3.8,
  }

  const certaintyMap = {
    very_uncertain: 0.7,
    somewhat_uncertain: 0.9,
    neutral: 1.0,
    somewhat_certain: 1.2,
    very_certain: 1.4,
  }

  const typeMap = {
    luxury: 0.8,
    improvement: 1.0,
    productivity: 1.15,
    health_safety: 1.25,
    essential: 1.35,
  }

  const uv =
    durationMap[input.usage_duration] *
    frequencyMap[input.usage_frequency] *
    certaintyMap[input.certainty_level] *
    typeMap[input.consumption_type]

  return clamp(round1(uv), 0, 40)
}

function getSpScore(input: DecisionInput) {
  const alternativePresenceScore = input.has_alternative ? 0 : 8

  const alternativeCostMap = {
    none: 0,
    low: 3,
    medium: 6,
    high: 9,
  }

  const nonPurchaseImpactMap = {
    almost_none: 0,
    minor: 2,
    moderate: 5,
    major: 8,
  }

  const affectedPeopleMap = {
    self_only: 0,
    two_people: 2,
    family_small: 4,
    family_large: 6,
  }

  const alternativeCostScore = input.has_alternative
    ? alternativeCostMap[input.alternative_cost_level]
    : 9

  const sp =
    alternativePresenceScore +
    alternativeCostScore +
    nonPurchaseImpactMap[input.non_purchase_impact] +
    affectedPeopleMap[input.affected_people_count]

  return clamp(round1(sp), 0, 25)
}

function getPpScore(price: number, uvScore: number) {
  const uvi = Math.max(uvScore * 10, 1)
  const ratio = price / uvi
  return clamp(round1(5 + ratio * 3), 5, 35)
}

function getPsScore(input: DecisionInput, heartbeatCount: number, behaviorTotalAmount: number) {
  const desireDurationMap = {
    less_than_3d: 0,
    three_to_seven_d: 2,
    one_to_four_w: 4,
    one_to_three_m: 6,
    more_than_three_m: 8,
  }

  const heartbeatScore = Math.min(heartbeatCount * 1.5, 10)
  const behaviorScore = Math.min(round1((behaviorTotalAmount / input.price) * 10), 10)

  const ps = desireDurationMap[input.desire_duration] + heartbeatScore + behaviorScore
  return clamp(round1(ps), 0, 20)
}

function getDecisionStatus(score: number) {
  if (score < 40) return 'not_recommended'
  if (score < 65) return 'wait'
  return 'buy'
}

function calculateDecisionResult(
  input: DecisionInput,
  heartbeatCount: number,
  behaviorTotalAmount: number,
) {
  const uvScore = getUvScore(input)
  const spScore = getSpScore(input)
  const ppScore = getPpScore(input.price, uvScore)
  const psScore = getPsScore(input, heartbeatCount, behaviorTotalAmount)

  const decisionRawScore = uvScore + spScore + psScore - ppScore
  const score = clamp(round1(decisionRawScore + 35), 0, 100)
  const status = getDecisionStatus(score)

  return {
    score,
    status,
    uv_score: uvScore,
    sp_score: spScore,
    pp_score: ppScore,
    ps_score: psScore,
    heartbeat_count: heartbeatCount,
    behavior_total_amount: round1(behaviorTotalAmount),
  }
}
```

---

## 12. MVP 校验规则

### 创建决策

- `name` 必填
- `price > 0`
- 所有问答枚举字段必填

### heartbeat 打卡

- 每个 decision 每天最多 1 条
- 同一天重复提交应返回业务错误

### behavior 打卡

- `amount > 0`
- `amount` 建议限制为两位小数
- 允许多次新增，统一累加到 `behavior_total_amount`

---

## 13. 推荐 TypeScript 类型

```ts
export type UsageDuration =
  | 'one_time'
  | 'less_than_3m'
  | 'three_to_twelve_m'
  | 'one_to_three_y'
  | 'more_than_three_y'

export type UsageFrequency =
  | 'rarely'
  | 'monthly'
  | 'weekly'
  | 'several_per_week'
  | 'daily'

export type CertaintyLevel =
  | 'very_uncertain'
  | 'somewhat_uncertain'
  | 'neutral'
  | 'somewhat_certain'
  | 'very_certain'

export type ConsumptionType =
  | 'luxury'
  | 'improvement'
  | 'productivity'
  | 'health_safety'
  | 'essential'

export type AlternativeCostLevel = 'none' | 'low' | 'medium' | 'high'

export type NonPurchaseImpact =
  | 'almost_none'
  | 'minor'
  | 'moderate'
  | 'major'

export type AffectedPeopleCount =
  | 'self_only'
  | 'two_people'
  | 'family_small'
  | 'family_large'

export type DesireDuration =
  | 'less_than_3d'
  | 'three_to_seven_d'
  | 'one_to_four_w'
  | 'one_to_three_m'
  | 'more_than_three_m'

export type DecisionStatus = 'not_recommended' | 'wait' | 'buy'

export interface DecisionInput {
  name: string
  price: number
  usage_duration: UsageDuration
  usage_frequency: UsageFrequency
  certainty_level: CertaintyLevel
  consumption_type: ConsumptionType
  has_alternative: boolean
  alternative_cost_level: AlternativeCostLevel
  non_purchase_impact: NonPurchaseImpact
  affected_people_count: AffectedPeopleCount
  desire_duration: DesireDuration
  note?: string
}
```

---

## 14. 与现有文档的对齐说明

- 本文档是 `decision_algorithm.md` 的**实现层补充**
- 若抽象规则与实现映射冲突，以**本文档的枚举与数值映射**为准
- 若后续你要继续迭代算法，建议优先修改：
  - `consumption_type` 权重
  - `PP` 系数
  - `desire_duration / heartbeat / behavior` 的权重

