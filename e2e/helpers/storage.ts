import { expect, type Page } from '@playwright/test';
import { gotoFreshGame, SELECTORS } from './game';

export const SAVE_STORAGE_KEY = 'liquid_sort_save_v4';

export interface PersistedHistoryEntry {
  from: number;
  to: number;
  count: number;
}

export interface PersistedVictoryOutcome {
  rawEfficiency: number | null;
  displayEfficiency: string;
  stars: 1 | 2 | 3 | null;
  coinsRoundBase: number;
  coinsStarBonus: number;
  coinsPhaseBonus: number;
  coinsTrainingBonus: number;
  coinsEarnedTotal: number;
  totalCoinsAfter: number;
  isNewBestStars: boolean;
  isNewBestEfficiency: boolean;
}

export interface PersistedBoardState {
  round: number;
  tubes: number[][];
  initialTubes: number[][];
  hiddenCounts?: number[];
  initialHiddenCounts?: number[];
  history: PersistedHistoryEntry[];
  moves: number;
  idealMoves: number;
  baseIdealMoves: number;
  extraTubeUsed: boolean;
  tutorialStep?: number;
  rewardProcessed?: boolean;
  lastVictoryReward?: PersistedVictoryOutcome | null;
}

export interface PersistedPhaseData {
  currentRound: number;
  completedRounds: number[];
  easyRounds: number[];
  phaseCompleted: boolean;
  seed: number;
  board: PersistedBoardState | null;
}

export interface PersistedRoundRewardRecord {
  completed: boolean;
  bestStars: 0 | 1 | 2 | 3;
  bestEfficiency: number;
  coinBasePaid: boolean;
  coinTwoStarsPaid: boolean;
  coinThreeStarsPaid: boolean;
}

export interface PersistedRewardsState {
  coins: number;
  rounds: Record<string, PersistedRoundRewardRecord>;
  phaseCompletionPaid: Record<string, boolean>;
}

export interface PersistedAppState {
  language: string;
  activePhaseId: string;
  bgmTrack: string;
  muted: boolean;
  sfxVolume: number;
  bgmVolume: number;
  visualMode: 'color' | 'pattern' | 'both';
  theme: 'dark' | 'light';
  mysteryModeEnabled: boolean;
  hintDuration: number;
  phases: Record<string, PersistedPhaseData>;
  rewards: PersistedRewardsState;
}

export const DESAFIADOR_ROUND_16_TUBES: number[][] = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [2, 2, 2, 2],
  [3, 3, 3, 3],
  [4, 4, 4, 4],
  [5, 5, 5, 5],
  [6, 6, 6, 6],
  [7, 7, 7, 7],
  [8, 8, 8, 8],
  [9, 9, 9],
  [9],
  [],
];

export async function readPersistedState(page: Page): Promise<PersistedAppState> {
  const raw = await page.evaluate((storageKey) => {
    return window.localStorage.getItem(storageKey);
  }, SAVE_STORAGE_KEY);

  expect(raw).not.toBeNull();
  return JSON.parse(raw!) as PersistedAppState;
}

export const EFFICIENCY_THREE_TIER_TUBES: number[][] = [
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [2, 2, 2, 2],
  [],
  [],
];

export const CLAMP_OVER_100_TUBES: number[][] = [
  [0, 0],
  [0, 0],
  [],
];

export const EXTRA_TUBE_REDUCE_TUBES: number[][] = [
  [1, 1, 2, 0],
  [1, 1, 2, 0],
  [0, 2, 2, 0],
  [],
];

export const EXTRA_TUBE_DEADLOCK_TUBES: number[][] = [
  [0, 2, 0, 1],
  [0, 1, 2, 1],
  [1, 2, 2, 0],
  [],
];

export interface PrepareNormalRoundBoardOptions {
  phaseId?: 'facil' | 'medio' | 'dificil' | 'desafiador';
  round?: number;
  tubes: number[][];
  idealMoves: number;
  baseIdealMoves?: number;
}

export async function prepareNormalRoundBoard(
  page: Page,
  options: PrepareNormalRoundBoardOptions
): Promise<void> {
  const phaseId = options.phaseId ?? 'facil';
  const round = options.round ?? 1;
  const baseIdealMoves = options.baseIdealMoves ?? options.idealMoves;

  await gotoFreshGame(page);

  await page.evaluate(
    ({ storageKey, targetPhaseId, targetRound, tubes, idealMoves, baseIdeal }) => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        throw new Error(`Missing initial persisted state at ${storageKey}`);
      }
      const state = JSON.parse(raw) as PersistedAppState;
      const zeroHidden = new Array(tubes.length).fill(0);
      const clone = (src: number[][]) => src.map((tube) => tube.slice());

      state.activePhaseId = targetPhaseId;
      state.mysteryModeEnabled = false;
      state.phases[targetPhaseId] = {
        currentRound: targetRound,
        completedRounds: [],
        easyRounds: [],
        phaseCompleted: false,
        seed: state.phases[targetPhaseId]?.seed || 123456789,
        board: {
          round: targetRound,
          tubes: clone(tubes),
          initialTubes: clone(tubes),
          hiddenCounts: [...zeroHidden],
          initialHiddenCounts: [...zeroHidden],
          history: [],
          moves: 0,
          idealMoves,
          baseIdealMoves: baseIdeal,
          extraTubeUsed: false,
          rewardProcessed: false,
          lastVictoryReward: null,
        },
      };
      state.rewards = {
        coins: 0,
        rounds: {},
        phaseCompletionPaid: {},
      };

      window.localStorage.setItem(storageKey, JSON.stringify(state));
    },
    {
      storageKey: SAVE_STORAGE_KEY,
      targetPhaseId: phaseId,
      targetRound: round,
      tubes: options.tubes,
      idealMoves: options.idealMoves,
      baseIdeal: baseIdealMoves,
    }
  );

  const reloadResponse = await page.reload();
  expect(reloadResponse).not.toBeNull();
  expect(reloadResponse?.ok()).toBe(true);
  await expect(page.locator(SELECTORS.board)).toBeVisible();
  await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(new RegExp(`\\b${phaseId}\\b`));
  await expect(page.locator(SELECTORS.roundNum)).toHaveText(String(round));
  await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
  await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText(String(options.idealMoves));
  await expect(page.locator(SELECTORS.hudStarsVal)).toHaveText('0');
  await expect(page.locator(SELECTORS.hudCoinsVal)).toHaveText('0');
  await expect(page.locator(SELECTORS.realTubes)).toHaveCount(options.tubes.length);
}

export async function prepareDesafiadorRound16PreBonusState(page: Page): Promise<void> {
  await gotoFreshGame(page);

  await page.evaluate(
    ({ storageKey, tubes }) => {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        throw new Error(`Missing initial persisted state at ${storageKey}`);
      }
      const state = JSON.parse(raw) as PersistedAppState;

      const completed1To15 = Array.from({ length: 15 }, (_, idx) => idx + 1);
      const zeroHidden = new Array(tubes.length).fill(0);
      const clone = (src: number[][]) => src.map((tube) => tube.slice());

      state.activePhaseId = 'desafiador';
      state.phases.desafiador = {
        currentRound: 16,
        completedRounds: [...completed1To15],
        easyRounds: [...completed1To15],
        phaseCompleted: false,
        seed: state.phases.desafiador?.seed || 123456789,
        board: {
          round: 16,
          tubes: clone(tubes),
          initialTubes: clone(tubes),
          hiddenCounts: [...zeroHidden],
          initialHiddenCounts: [...zeroHidden],
          history: [],
          moves: 0,
          idealMoves: 1,
          baseIdealMoves: 1,
          extraTubeUsed: false,
          rewardProcessed: false,
          lastVictoryReward: null,
        },
      };

      const roundRewards: Record<string, PersistedRoundRewardRecord> = {};
      for (let r = 1; r <= 15; r++) {
        roundRewards[`desafiador:${r}`] = {
          completed: true,
          bestStars: 3,
          bestEfficiency: 100,
          coinBasePaid: true,
          coinTwoStarsPaid: true,
          coinThreeStarsPaid: true,
        };
      }

      state.rewards = {
        coins: 150,
        rounds: roundRewards,
        phaseCompletionPaid: {},
      };

      window.localStorage.setItem(storageKey, JSON.stringify(state));
    },
    { storageKey: SAVE_STORAGE_KEY, tubes: DESAFIADOR_ROUND_16_TUBES }
  );

  const reloadResponse = await page.reload();
  expect(reloadResponse).not.toBeNull();
  expect(reloadResponse?.ok()).toBe(true);
  await expect(page.locator(SELECTORS.board)).toBeVisible();
  await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bdesafiador\b/);
  await expect(page.locator(SELECTORS.roundNum)).toHaveText('16');
  await expect(page.locator(SELECTORS.roundTotal)).toHaveText('16');
  await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
  await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('1');
  await expect(page.locator(SELECTORS.hudStarsVal)).toHaveText('45');
  await expect(page.locator(SELECTORS.hudCoinsVal)).toHaveText('150');
  await expect(page.locator(SELECTORS.realTubes)).toHaveCount(DESAFIADOR_ROUND_16_TUBES.length);
}
