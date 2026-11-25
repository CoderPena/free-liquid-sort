import { expect, type Page } from '@playwright/test';

export const SELECTORS = {
  board: '#board',
  realTubes: '#board .tube:not(.tube-ghost)[data-index]',
  tubeByIndex: (index: number) => `#board .tube[data-index="${index}"]`,
  phaseName: '#phase-name',
  roundNum: '#round-num',
  roundTotal: '#round-total',
  hudStarsVal: '#hud-stars-val',
  hudCoinsVal: '#hud-coins-val',
  movesNum: '#moves-num',
  idealMovesNum: '#ideal-moves-num',
  effNum: '#eff-num',
  victoryModal: '#victory-modal',
  victoryStarsFilled: '#win-stars .win-star.filled',
  victoryStarsEmpty: '#win-stars .win-star.empty',
  victoryCoinsEarned: '#win-coins-earned',
  victoryCoinsBalance: '#win-coins-balance',
  victoryRewardNote: '#win-coins-breakdown .win-reward-note',
  victoryMoves: '#win-moves',
  victoryIdealMoves: '#win-ideal-moves',
  victoryEff: '#win-eff',
  btnWinPrimary: '#btn-win-primary',
  btnWinReplay: '#btn-win-replay',
} as const;

export function trackPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on('pageerror', (error) => {
    errors.push(error);
  });
  return errors;
}

export async function gotoFreshGame(page: Page): Promise<void> {
  const response = await page.goto('/');
  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.locator(SELECTORS.board)).toBeVisible();
}

export async function expectTrainingLesson1InitialState(page: Page): Promise<void> {
  await expect(page.locator(SELECTORS.phaseName)).toHaveText(/\S+/);
  await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
  await expect(page.locator(SELECTORS.roundTotal)).toHaveText('5');
  await expect(page.locator(SELECTORS.hudStarsVal)).toHaveText('0');
  await expect(page.locator(SELECTORS.hudCoinsVal)).toHaveText('0');
  await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
  await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('1');
  await expect(page.locator(SELECTORS.effNum)).toHaveText('—');
  await expect(page.locator(SELECTORS.realTubes)).toHaveCount(3);
}

export async function pourBetweenTubes(
  page: Page,
  fromIndex: number,
  toIndex: number
): Promise<void> {
  const board = page.locator(SELECTORS.board);
  const fromTube = page.locator(SELECTORS.tubeByIndex(fromIndex));
  const toTube = page.locator(SELECTORS.tubeByIndex(toIndex));

  await fromTube.click();
  await expect(fromTube).toHaveClass(/\bselected\b/);

  await toTube.click();
  await expect(board).toHaveClass(/\bis-pouring\b/);
  await expect(board).not.toHaveClass(/\bis-pouring\b/);
}

export async function completeTrainingLesson1(page: Page): Promise<void> {
  await pourBetweenTubes(page, 0, 1);
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
}

export async function expectHudRewards(
  page: Page,
  stars: number,
  coins: number
): Promise<void> {
  await expect(page.locator(SELECTORS.hudStarsVal)).toHaveText(String(stars));
  await expect(page.locator(SELECTORS.hudCoinsVal)).toHaveText(String(coins));
}

export async function expectVictoryRewards(
  page: Page,
  options: {
    stars: number;
    earnedText: string;
    balanceText: string;
  }
): Promise<void> {
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
  await expect(page.locator(SELECTORS.victoryStarsFilled)).toHaveCount(options.stars);
  await expect(page.locator(SELECTORS.victoryStarsEmpty)).toHaveCount(3 - options.stars);
  await expect(page.locator(SELECTORS.victoryCoinsEarned)).toHaveText(options.earnedText);
  await expect(page.locator(SELECTORS.victoryCoinsBalance)).toHaveText(options.balanceText);
}

export async function replayFromVictoryModal(page: Page): Promise<void> {
  const replayBtn = page.locator(SELECTORS.btnWinReplay);
  await expect(replayBtn).toBeVisible();
  await replayBtn.click();
  await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
  await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
}

export async function advanceFromVictoryModal(page: Page): Promise<void> {
  const primaryBtn = page.locator(SELECTORS.btnWinPrimary);
  await expect(primaryBtn).toBeVisible();
  await primaryBtn.click();
  await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
}
