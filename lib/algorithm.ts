import { Decision } from "@prisma/client";

// Types based on decision_question_mapping.md
export type UsageDuration = 'one_time' | 'less_than_3m' | 'three_to_twelve_m' | 'one_to_three_y' | 'more_than_three_y';
export type UsageFrequency = 'rarely' | 'monthly' | 'weekly' | 'several_per_week' | 'daily';
export type CertaintyLevel = 'very_uncertain' | 'somewhat_uncertain' | 'neutral' | 'somewhat_certain' | 'very_certain';
export type ConsumptionType = 'luxury' | 'improvement' | 'productivity' | 'health_safety' | 'essential';
export type AlternativeCostLevel = 'none' | 'low' | 'medium' | 'high';
export type NonPurchaseImpact = 'almost_none' | 'minor' | 'moderate' | 'major';
export type AffectedPeopleCount = 'self_only' | 'two_people' | 'family_small' | 'family_large';
export type DesireDuration = 'less_than_3d' | 'three_to_seven_d' | 'one_to_four_w' | 'one_to_three_m' | 'more_than_three_m';

export interface DecisionInput {
  price: number;
  usageDuration: UsageDuration;
  usageFrequency: UsageFrequency;
  certaintyLevel: CertaintyLevel;
  consumptionType: ConsumptionType;
  hasAlternative: boolean;
  alternativeCostLevel: AlternativeCostLevel;
  nonPurchaseImpact: NonPurchaseImpact;
  affectedPeopleCount: AffectedPeopleCount;
  desireDuration: DesireDuration;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round1(num: number) {
  return Math.round(num * 10) / 10;
}

// Helper to safely get mapped value with case-insensitivity
function getMapValue(map: Record<string, number>, key: string, defaultValue: number = 0): number {
  if (!key) return defaultValue;
  const val = map[key.toLowerCase()];
  return val !== undefined ? val : defaultValue;
}

function getUvScore(input: DecisionInput) {
  const durationMap: Record<string, number> = {
    one_time: 0.8,
    less_than_3m: 1.2,
    three_to_twelve_m: 1.8,
    one_to_three_y: 2.6,
    more_than_three_y: 3.2,
  };

  const frequencyMap: Record<string, number> = {
    rarely: 1.0,
    monthly: 1.6,
    weekly: 2.4,
    several_per_week: 3.0,
    daily: 3.8,
  };

  const certaintyMap: Record<string, number> = {
    very_uncertain: 0.7,
    somewhat_uncertain: 0.9,
    neutral: 1.0,
    somewhat_certain: 1.2,
    very_certain: 1.4,
  };

  const typeMap: Record<string, number> = {
    luxury: 0.8,
    improvement: 1.0,
    productivity: 1.15,
    health_safety: 1.25,
    essential: 1.35,
  };

  const uv =
    getMapValue(durationMap, input.usageDuration, 1.0) *
    getMapValue(frequencyMap, input.usageFrequency, 1.0) *
    getMapValue(certaintyMap, input.certaintyLevel, 1.0) *
    getMapValue(typeMap, input.consumptionType, 1.0);

  return clamp(round1(uv), 0, 40);
}

function getSpScore(input: DecisionInput) {
  const alternativePresenceScore = input.hasAlternative ? 0 : 8;

  const alternativeCostMap: Record<string, number> = {
    none: 0,
    low: 3,
    medium: 6,
    high: 9,
  };

  const nonPurchaseImpactMap: Record<string, number> = {
    almost_none: 0,
    minor: 2,
    moderate: 5,
    major: 8,
  };

  const affectedPeopleMap: Record<string, number> = {
    self_only: 0,
    two_people: 2,
    family_small: 4,
    family_large: 6,
  };

  const alternativeCostScore = input.hasAlternative
    ? getMapValue(alternativeCostMap, input.alternativeCostLevel, 9)
    : 9;

  const sp =
    alternativePresenceScore +
    alternativeCostScore +
    getMapValue(nonPurchaseImpactMap, input.nonPurchaseImpact, 0) +
    getMapValue(affectedPeopleMap, input.affectedPeopleCount, 0);

  return clamp(round1(sp), 0, 25);
}

function getPpScore(price: number, uvScore: number) {
  const uvi = Math.max(uvScore * 10, 1);
  const ratio = price / uvi;
  return clamp(round1(5 + ratio * 3), 5, 35);
}

function getPsScore(input: DecisionInput, heartbeatCount: number, behaviorTotalAmount: number) {
  const desireDurationMap: Record<string, number> = {
    less_than_3d: 0,
    three_to_seven_d: 2,
    one_to_four_w: 4,
    one_to_three_m: 6,
    more_than_three_m: 8,
  };

  const heartbeatScore = Math.min(heartbeatCount * 1.5, 10);
  
  const behaviorScoreRaw = input.price > 0 
    ? (behaviorTotalAmount / input.price) * 10
    : 0;
  
  const behaviorScore = Math.min(round1(behaviorScoreRaw), 10);

  const ps = getMapValue(desireDurationMap, input.desireDuration, 0) + heartbeatScore + behaviorScore;
  return clamp(round1(ps), 0, 20);
}

function getDecisionStatus(score: number) {
  if (score < 40) return 'NOT_RECOMMENDED';
  if (score < 65) return 'WAIT';
  return 'RECOMMENDED';
}

export function calculateScore(
  input: DecisionInput,
  heartbeatCount: number = 0,
  behaviorTotalAmount: number = 0
) {
  const uvScore = getUvScore(input);
  const spScore = getSpScore(input);
  const ppScore = getPpScore(input.price, uvScore);
  const psScore = getPsScore(input, heartbeatCount, behaviorTotalAmount);

  const decisionRawScore = uvScore + spScore + psScore - ppScore;
  const score = clamp(round1(decisionRawScore + 35), 0, 100);
  const status = getDecisionStatus(score);

  return {
    score,
    status,
    uvScore,
    spScore,
    ppScore,
    psScore,
  };
}
