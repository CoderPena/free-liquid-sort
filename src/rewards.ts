import type { PhaseId } from './i18n';

export type StarRating = 1 | 2 | 3;
export type StoredStarRating = 0 | StarRating;

export const STAR_THRESHOLD_TWO = 80;
export const STAR_THRESHOLD_THREE = 100;

export const NORMAL_ROUND_BASE_COINS = 5;
export const TRAINING_ROUND_BASE_COINS = 2;
export const TWO_STARS_BONUS_COINS = 2;
export const THREE_STARS_BONUS_COINS = 3;
export const PHASE_COMPLETION_BONUS_COINS = 10;
export const TRAINING_COMPLETION_BONUS_COINS = 10;
export const TRAINING_PHASE_ID: PhaseId = 'treinamento';

export interface RoundRewardRecord {
  completed: boolean;
  bestStars: StoredStarRating;
  bestEfficiency: number;
  coinBasePaid: boolean;
  coinTwoStarsPaid: boolean;
  coinThreeStarsPaid: boolean;
}

export interface RewardsState {
  coins: number;
  rounds: Record<string, RoundRewardRecord>;
  phaseCompletionPaid: Record<string, boolean>;
}

export interface MatchEfficiencyEvaluation {
  rawEfficiency: number;
  stars: StarRating;
  displayEfficiency: string;
}

export interface RoundVictoryInput {
  phaseId: PhaseId;
  round: number;
  totalRounds: number;
  /** Informational flag mirrored from PhaseDef; reward category is governed strictly by phaseId. */
  isTutorial?: boolean;
  moves: number;
  idealMoves: number;
}

export interface RoundVictoryOutcome {
  rawEfficiency: number | null;
  displayEfficiency: string;
  stars: StarRating | null;
  coinsRoundBase: number;
  coinsStarBonus: number;
  coinsPhaseBonus: number;
  coinsTrainingBonus: number;
  coinsEarnedTotal: number;
  totalCoinsAfter: number;
  isNewBestStars: boolean;
  isNewBestEfficiency: boolean;
}

export interface PhaseRoundRewardSummary {
  round: number;
  completed: boolean;
  bestStars: StoredStarRating;
  bestEfficiency: number;
  displayBestEfficiency: string;
}

export interface PhaseRewardSummary {
  phaseId: PhaseId;
  totalRounds: number;
  completedRoundsCount: number;
  earnedStars: number;
  maxStars: number;
  phaseBonusPaid: boolean;
  rounds: PhaseRoundRewardSummary[];
}

export interface PhaseRangeDef {
  id: PhaseId;
  totalRounds: number;
}

export function getRoundRewardKey(phaseId: PhaseId, round: number): string {
  return `${phaseId}:${round}`;
}

export function createDefaultRoundRewardRecord(): RoundRewardRecord {
  return {
    completed: false,
    bestStars: 0,
    bestEfficiency: 0,
    coinBasePaid: false,
    coinTwoStarsPaid: false,
    coinThreeStarsPaid: false,
  };
}

export function createDefaultRewardsState(): RewardsState {
  return {
    coins: 0,
    rounds: {},
    phaseCompletionPaid: {},
  };
}

/**
 * Calculates unrounded efficiency clamped to 100%.
 * Returns null if moves or idealMoves are invalid (<= 0, non-finite, or > Number.MAX_SAFE_INTEGER).
 */
export function calculateRawEfficiency(moves: number, idealMoves: number): number | null {
  if (
    !Number.isFinite(moves) ||
    !Number.isFinite(idealMoves) ||
    moves <= 0 ||
    idealMoves <= 0 ||
    moves > Number.MAX_SAFE_INTEGER ||
    idealMoves > Number.MAX_SAFE_INTEGER
  ) {
    return null;
  }
  if (idealMoves >= moves) {
    return STAR_THRESHOLD_THREE;
  }
  return (idealMoves * 100) / moves;
}

/**
 * Classifies stars strictly using the real unrounded efficiency:
 * - < 80%: 1 star
 * - >= 80% and < 100%: 2 stars
 * - >= 100%: 3 stars
 */
export function classifyStars(rawEfficiency: number): StarRating {
  if (!Number.isFinite(rawEfficiency) || rawEfficiency < STAR_THRESHOLD_TWO) {
    return 1;
  }
  if (rawEfficiency >= STAR_THRESHOLD_THREE) {
    return 3;
  }
  return 2;
}

/**
 * Formats efficiency with 1 decimal place.
 * Values strictly below 100% are truncated (never rounded up) to 1 decimal place
 * so values below star thresholds never display as having reached the threshold
 * (e.g. 79.99 -> '79.9%', 80.00 -> '80.0%', 99.99 -> '99.9%', 100 -> '100.0%').
 */
export function formatEfficiencyDisplay(rawEfficiency: number): string {
  if (!Number.isFinite(rawEfficiency) || rawEfficiency <= 0) {
    return '0.0%';
  }
  if (rawEfficiency >= STAR_THRESHOLD_THREE) {
    return '100.0%';
  }
  const normalized = Number(rawEfficiency.toPrecision(12));
  if (normalized >= STAR_THRESHOLD_THREE) {
    return '99.9%';
  }
  const tenths = Math.min(999, Math.max(0, Math.floor(normalized * 10)));
  return `${(tenths / 10).toFixed(1)}%`;
}

/**
 * Primary evaluation for a match given moves and idealMoves.
 * Positive integers outside JS safe integer range (> Number.MAX_SAFE_INTEGER) return null.
 * When both inputs are positive safe integers (1..Number.MAX_SAFE_INTEGER), star
 * classification and 1-decimal visual truncation use BigInt arithmetic so products
 * like (idealMoves * 1000) never overflow safe integer precision.
 */
export function evaluateMatchEfficiency(
  moves: number,
  idealMoves: number
): MatchEfficiencyEvaluation | null {
  if (
    !Number.isFinite(moves) ||
    !Number.isFinite(idealMoves) ||
    moves <= 0 ||
    idealMoves <= 0 ||
    moves > Number.MAX_SAFE_INTEGER ||
    idealMoves > Number.MAX_SAFE_INTEGER
  ) {
    return null;
  }

  if (Number.isSafeInteger(moves) && Number.isSafeInteger(idealMoves)) {
    if (idealMoves >= moves) {
      return {
        rawEfficiency: STAR_THRESHOLD_THREE,
        stars: 3,
        displayEfficiency: '100.0%',
      };
    }

    const movesBig = BigInt(moves);
    const idealBig = BigInt(idealMoves);
    const stars: StarRating = idealBig * 5n >= movesBig * 4n ? 2 : 1;
    const rawEfficiency = (idealMoves * 100) / moves;
    const tenthsBig = (idealBig * 1000n) / movesBig;
    const tenths = Math.min(999, Math.max(0, Number(tenthsBig)));
    return {
      rawEfficiency,
      stars,
      displayEfficiency: `${(tenths / 10).toFixed(1)}%`,
    };
  }

  const rawEfficiency = idealMoves >= moves ? STAR_THRESHOLD_THREE : (idealMoves * 100) / moves;
  return {
    rawEfficiency,
    stars: classifyStars(rawEfficiency),
    displayEfficiency: formatEfficiencyDisplay(rawEfficiency),
  };
}

function sanitizeRoundRecord(raw: unknown): RoundRewardRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;

  const bestStars: StoredStarRating =
    rec.bestStars === 1 || rec.bestStars === 2 || rec.bestStars === 3
      ? rec.bestStars
      : 0;

  const rawEff = typeof rec.bestEfficiency === 'number' && Number.isFinite(rec.bestEfficiency)
    ? Math.min(STAR_THRESHOLD_THREE, Math.max(0, rec.bestEfficiency))
    : 0;

  return {
    completed: rec.completed === true,
    bestStars,
    bestEfficiency: rawEff,
    coinBasePaid: rec.coinBasePaid === true,
    coinTwoStarsPaid: rec.coinTwoStarsPaid === true,
    coinThreeStarsPaid: rec.coinThreeStarsPaid === true,
  };
}

export function sanitizeRewardsState(
  raw: unknown,
  validPhases?: ReadonlyArray<PhaseRangeDef>
): RewardsState {
  const defaults = createDefaultRewardsState();
  if (!raw || typeof raw !== 'object') return defaults;

  const obj = raw as Record<string, unknown>;
  const coins =
    typeof obj.coins === 'number' && Number.isSafeInteger(obj.coins) && obj.coins >= 0
      ? (obj.coins === 0 ? 0 : obj.coins)
      : 0;

  const validPhaseMap = validPhases
    ? new Map<string, number>(validPhases.map((p) => [p.id, p.totalRounds]))
    : null;

  const rounds: Record<string, RoundRewardRecord> = {};
  if (obj.rounds && typeof obj.rounds === 'object') {
    for (const [key, val] of Object.entries(obj.rounds as Record<string, unknown>)) {
      const sepIdx = key.indexOf(':');
      if (sepIdx <= 0) continue;
      const phaseId = key.slice(0, sepIdx);
      const roundNum = Number(key.slice(sepIdx + 1));
      if (!Number.isInteger(roundNum) || roundNum < 1) continue;
      if (validPhaseMap) {
        const maxRounds = validPhaseMap.get(phaseId);
        if (!maxRounds || roundNum > maxRounds) continue;
      }

      const sanitizedRec = sanitizeRoundRecord(val);
      if (sanitizedRec) {
        rounds[key] = sanitizedRec;
      }
    }
  }

  const phaseCompletionPaid: Record<string, boolean> = {};
  if (obj.phaseCompletionPaid && typeof obj.phaseCompletionPaid === 'object') {
    for (const [phaseId, paid] of Object.entries(obj.phaseCompletionPaid as Record<string, unknown>)) {
      if (validPhaseMap && !validPhaseMap.has(phaseId)) continue;
      if (paid === true) {
        phaseCompletionPaid[phaseId] = true;
      }
    }
  }

  return {
    coins,
    rounds,
    phaseCompletionPaid,
  };
}

function areAllPhaseRoundsCompleted(
  rounds: Record<string, RoundRewardRecord>,
  phaseId: PhaseId,
  totalRounds: number
): boolean {
  if (!Number.isInteger(totalRounds) || totalRounds < 1) return false;
  for (let r = 1; r <= totalRounds; r++) {
    if (!rounds[getRoundRewardKey(phaseId, r)]?.completed) {
      return false;
    }
  }
  return true;
}

/**
 * Pure, immutable, idempotent reward processor for a round victory.
 * Invalid inputs (invalid round, totalRounds, moves, or idealMoves) yield
 * zero coins and null star/efficiency fields without mutating rewards state.
 */
export function applyRoundVictoryRewards(
  state: RewardsState,
  input: RoundVictoryInput
): { nextState: RewardsState; outcome: RoundVictoryOutcome } {
  const isValidRound =
    Number.isInteger(input.totalRounds) &&
    input.totalRounds >= 1 &&
    Number.isInteger(input.round) &&
    input.round >= 1 &&
    input.round <= input.totalRounds;

  const evaluation = isValidRound
    ? evaluateMatchEfficiency(input.moves, input.idealMoves)
    : null;

  if (!evaluation) {
    return {
      nextState: state,
      outcome: {
        rawEfficiency: null,
        displayEfficiency: '—',
        stars: null,
        coinsRoundBase: 0,
        coinsStarBonus: 0,
        coinsPhaseBonus: 0,
        coinsTrainingBonus: 0,
        coinsEarnedTotal: 0,
        totalCoinsAfter: state.coins,
        isNewBestStars: false,
        isNewBestEfficiency: false,
      },
    };
  }

  const key = getRoundRewardKey(input.phaseId, input.round);
  const prevRec = state.rounds[key] ?? createDefaultRoundRewardRecord();
  const nextRec: RoundRewardRecord = { ...prevRec };

  // Phase identity governs reward category; isTutorial cannot override a normal or training phase.
  const isTraining = input.phaseId === TRAINING_PHASE_ID;
  const baseCoinsAmount = isTraining ? TRAINING_ROUND_BASE_COINS : NORMAL_ROUND_BASE_COINS;

  const isNewBestStars = evaluation.stars > prevRec.bestStars;
  const isNewBestEfficiency = evaluation.rawEfficiency > prevRec.bestEfficiency;

  nextRec.completed = true;
  if (isNewBestStars) {
    nextRec.bestStars = evaluation.stars;
  }
  if (isNewBestEfficiency) {
    nextRec.bestEfficiency = evaluation.rawEfficiency;
  }

  let coinsRoundBase = 0;
  if (!nextRec.coinBasePaid) {
    coinsRoundBase = baseCoinsAmount;
    nextRec.coinBasePaid = true;
  }

  let coinsStarBonus = 0;
  if (evaluation.stars >= 2 && !nextRec.coinTwoStarsPaid) {
    coinsStarBonus += TWO_STARS_BONUS_COINS;
    nextRec.coinTwoStarsPaid = true;
  }
  if (evaluation.stars === 3 && !nextRec.coinThreeStarsPaid) {
    coinsStarBonus += THREE_STARS_BONUS_COINS;
    nextRec.coinThreeStarsPaid = true;
  }

  const nextRounds: Record<string, RoundRewardRecord> = {
    ...state.rounds,
    [key]: nextRec,
  };
  const nextPhaseCompletionPaid: Record<string, boolean> = {
    ...state.phaseCompletionPaid,
  };

  let coinsPhaseBonus = 0;
  let coinsTrainingBonus = 0;

  if (
    !nextPhaseCompletionPaid[input.phaseId] &&
    areAllPhaseRoundsCompleted(nextRounds, input.phaseId, input.totalRounds)
  ) {
    nextPhaseCompletionPaid[input.phaseId] = true;
    if (isTraining) {
      coinsTrainingBonus = TRAINING_COMPLETION_BONUS_COINS;
    } else {
      coinsPhaseBonus = PHASE_COMPLETION_BONUS_COINS;
    }
  }

  const coinsEarnedTotal =
    coinsRoundBase + coinsStarBonus + coinsPhaseBonus + coinsTrainingBonus;
  const totalCoinsAfter = state.coins + coinsEarnedTotal;

  return {
    nextState: {
      coins: totalCoinsAfter,
      rounds: nextRounds,
      phaseCompletionPaid: nextPhaseCompletionPaid,
    },
    outcome: {
      rawEfficiency: evaluation.rawEfficiency,
      displayEfficiency: evaluation.displayEfficiency,
      stars: evaluation.stars,
      coinsRoundBase,
      coinsStarBonus,
      coinsPhaseBonus,
      coinsTrainingBonus,
      coinsEarnedTotal,
      totalCoinsAfter,
      isNewBestStars,
      isNewBestEfficiency,
    },
  };
}

export function getPhaseRewardSummary(
  state: RewardsState,
  phaseId: PhaseId,
  totalRounds: number
): PhaseRewardSummary {
  const safeTotal = Number.isInteger(totalRounds) && totalRounds > 0 ? totalRounds : 0;
  const rounds: PhaseRoundRewardSummary[] = [];
  let completedRoundsCount = 0;
  let earnedStars = 0;

  for (let r = 1; r <= safeTotal; r++) {
    const rec = state.rounds[getRoundRewardKey(phaseId, r)];
    const completed = Boolean(rec?.completed);
    const bestStars: StoredStarRating = rec?.bestStars ?? 0;
    const bestEfficiency = rec?.bestEfficiency ?? 0;

    if (completed) {
      completedRoundsCount++;
    }
    earnedStars += bestStars;

    rounds.push({
      round: r,
      completed,
      bestStars,
      bestEfficiency,
      displayBestEfficiency: completed ? formatEfficiencyDisplay(bestEfficiency) : '—',
    });
  }

  return {
    phaseId,
    totalRounds: safeTotal,
    completedRoundsCount,
    earnedStars,
    maxStars: safeTotal * 3,
    phaseBonusPaid: Boolean(state.phaseCompletionPaid[phaseId]),
    rounds,
  };
}

export function getTotalCompletedRounds(
  state: RewardsState,
  phases: ReadonlyArray<PhaseRangeDef>
): number {
  let completed = 0;
  for (const p of phases) {
    for (let r = 1; r <= p.totalRounds; r++) {
      if (state.rounds[getRoundRewardKey(p.id, r)]?.completed) {
        completed++;
      }
    }
  }
  return completed;
}

export function getTotalEarnedStars(
  state: RewardsState,
  phases: ReadonlyArray<PhaseRangeDef>
): { earned: number; max: number } {
  let earned = 0;
  let max = 0;
  for (const p of phases) {
    max += p.totalRounds * 3;
    for (let r = 1; r <= p.totalRounds; r++) {
      earned += state.rounds[getRoundRewardKey(p.id, r)]?.bestStars ?? 0;
    }
  }
  return { earned, max };
}
