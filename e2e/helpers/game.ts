import { expect, type Page } from '@playwright/test';

export type SettingsCategory = 'visual' | 'gameplay' | 'audio' | 'data';

export const SELECTORS = {
  board: '#board',
  realTubes: '#board .tube:not(.tube-ghost)[data-index]',
  tubeByIndex: (index: number) => `#board .tube[data-index="${index}"]`,
  tubeSegmentsByIndex: (index: number) => `#board .tube[data-index="${index}"] .liquid-segment`,
  phaseDot: '#phase-dot',
  phaseName: '#phase-name',
  roundNum: '#round-num',
  roundTotal: '#round-total',
  btnPhases: '#btn-phases',
  phasesModal: '#phases-modal',
  phaseCards: '#phase-list .phase-card',
  phaseCardById: (phaseId: string) => `#phase-list .phase-card:has(.phase-dot.${phaseId})`,
  btnClosePhases: '#btn-close-phases',
  hudStars: '#hud-stars',
  hudStarsVal: '#hud-stars-val',
  hudCoins: '#hud-coins',
  hudCoinsVal: '#hud-coins-val',
  movesNum: '#moves-num',
  idealMovesNum: '#ideal-moves-num',
  effNum: '#eff-num',
  controlsDock: '.controls-dock',
  btnUndo: '#btn-undo',
  btnHint: '#btn-hint',
  btnRestart: '#btn-restart',
  btnExtra: '#btn-extra',
  extraBadge: '#extra-badge',
  ghostTube: '#board .tube.tube-ghost',
  deadlockBanner: '#deadlock-banner',
  btnTheme: '#btn-theme',
  btnSound: '#btn-sound',
  iconSoundOn: '#icon-sound-on',
  iconSoundOff: '#icon-sound-off',
  btnLanguage: '#btn-language',
  langCode: '#lang-code',
  languageModal: '#language-modal',
  languageItems: '#language-list .lang-item',
  btnBgm: '#btn-bgm',
  bgmEmoji: '#bgm-emoji',
  bgmModal: '#bgm-modal',
  bgmCards: '#bgm-list .bgm-card',
  btnSettings: '#btn-settings',
  settingsModal: '#settings-modal',
  settingsTrack: '#settings-track',
  settingsPaneMain: '#settings-pane-main',
  settingsPaneSub: '#settings-pane-sub',
  settingsCategoryBtn: (category: SettingsCategory) => `[data-settings-cat="${category}"]`,
  settingsSubpanel: (category: SettingsCategory) => `.settings-subpanel[data-subpanel="${category}"]`,
  btnSettingsBack: '#btn-settings-back',
  btnCloseSettings: '#btn-close-settings',
  visualModeCards: '#settings-list .setting-card',
  btnThemeLight: '#btn-theme-light',
  btnThemeDark: '#btn-theme-dark',
  toggleMysteryMode: '#toggle-mystery-mode',
  toggleMysteryModeLabel: 'label[for="toggle-mystery-mode"]',
  sliderHintDuration: '#slider-hint-duration',
  hintDurationValue: '#hint-duration-value',
  sliderSfxVolume: '#slider-sfx-volume',
  sfxVolumeValue: '#sfx-volume-value',
  sliderBgmVolume: '#slider-bgm-volume',
  bgmVolumeValue: '#bgm-volume-value',
  btnResetAllProgress: '#btn-reset-all-progress',
  resetConfirm1Modal: '#reset-confirm-1-modal',
  btnResetNext1: '#btn-reset-next-1',
  resetConfirm2Modal: '#reset-confirm-2-modal',
  btnResetConfirm2: '#btn-reset-confirm-2',
  confirmModal: '#confirm-modal',
  btnCancelRestart: '#btn-cancel-restart',
  btnConfirmRestart: '#btn-confirm-restart',
  stuckModal: '#stuck-modal',
  btnStuckUndo: '#btn-stuck-undo',
  btnStuckExtra: '#btn-stuck-extra',
  btnStuckRestart: '#btn-stuck-restart',
  hintSourceTubes: '#board .tube.hint-source',
  hintTargetTubes: '#board .tube.hint-target',
  hintArrowPath: '#hint-svg .hint-arrow-path',
  victoryModal: '#victory-modal',
  victoryModalCard: '#victory-modal .modal-card',
  winTitle: '#win-title',
  victoryStarsFilled: '#win-stars .win-star.filled',
  victoryStarsEmpty: '#win-stars .win-star.empty',
  victoryCoinsEarned: '#win-coins-earned',
  victoryCoinsBalance: '#win-coins-balance',
  victoryRewardTags: '#win-coins-breakdown .win-reward-tag',
  victoryRewardNote: '#win-coins-breakdown .win-reward-note',
  victoryMoves: '#win-moves',
  victoryIdealMoves: '#win-ideal-moves',
  victoryEff: '#win-eff',
  skipCallout: '#skip-callout',
  btnWinPrimary: '#btn-win-primary',
  btnWinAdvance: '#btn-win-advance',
  btnWinReplay: '#btn-win-replay',
  btnWinPhases: '#btn-win-phases',
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

export async function playMoveSequence(
  page: Page,
  moves: ReadonlyArray<readonly [number, number]>
): Promise<void> {
  for (const [fromIndex, toIndex] of moves) {
    await pourBetweenTubes(page, fromIndex, toIndex);
  }
}

export async function completeTrainingLesson1(page: Page): Promise<void> {
  await pourBetweenTubes(page, 0, 1);
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
}

export async function completeTrainingLesson2(page: Page): Promise<void> {
  await pourBetweenTubes(page, 0, 2);
  await pourBetweenTubes(page, 1, 0);
  await pourBetweenTubes(page, 1, 2);
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
}

export async function completeTrainingLesson3(page: Page): Promise<void> {
  await pourBetweenTubes(page, 1, 0);
  await pourBetweenTubes(page, 1, 2);
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
}

export async function completeTrainingLesson4(page: Page): Promise<void> {
  await pourBetweenTubes(page, 0, 2);
  await pourBetweenTubes(page, 1, 0);
  await pourBetweenTubes(page, 1, 2);
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
}

export async function completeTrainingLesson5(page: Page): Promise<void> {
  await pourBetweenTubes(page, 0, 3);
  await pourBetweenTubes(page, 2, 0);
  await pourBetweenTubes(page, 1, 2);
  await pourBetweenTubes(page, 1, 3);
  await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
}

export async function completeTrainingLessons1To4(page: Page): Promise<void> {
  await expectTrainingLesson1InitialState(page);
  await completeTrainingLesson1(page);
  await advanceFromVictoryModal(page);
  await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');

  await completeTrainingLesson2(page);
  await advanceFromVictoryModal(page);
  await expect(page.locator(SELECTORS.roundNum)).toHaveText('3');

  await completeTrainingLesson3(page);
  await advanceFromVictoryModal(page);
  await expect(page.locator(SELECTORS.roundNum)).toHaveText('4');

  await completeTrainingLesson4(page);
  await advanceFromVictoryModal(page);
  await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
}

export async function completeTrainingLessons1To5(page: Page): Promise<void> {
  await completeTrainingLessons1To4(page);
  await completeTrainingLesson5(page);
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

export async function openPhasesModal(page: Page): Promise<void> {
  await page.locator(SELECTORS.btnPhases).click();
  await expect(page.locator(SELECTORS.phasesModal)).toHaveClass(/\bopen\b/);
}

export async function closePhasesModal(page: Page): Promise<void> {
  await page.locator(SELECTORS.btnClosePhases).click();
  await expect(page.locator(SELECTORS.phasesModal)).not.toHaveClass(/\bopen\b/);
}

export async function openSettingsModal(page: Page): Promise<void> {
  await page.locator(SELECTORS.btnSettings).click();
  await expect(page.locator(SELECTORS.settingsModal)).toHaveClass(/\bopen\b/);
  await expect(page.locator(SELECTORS.settingsPaneMain)).toHaveAttribute('aria-hidden', 'false');
}

export async function openSettingsCategory(
  page: Page,
  category: SettingsCategory
): Promise<void> {
  const settingsModal = page.locator(SELECTORS.settingsModal);
  const isOpen = await settingsModal.evaluate((el) => el.classList.contains('open'));
  if (!isOpen) {
    await openSettingsModal(page);
  }
  await page.locator(SELECTORS.settingsCategoryBtn(category)).click();
  await expect(page.locator(SELECTORS.settingsTrack)).toHaveClass(/\bin-submenu\b/);
  await expect(page.locator(SELECTORS.settingsPaneSub)).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator(SELECTORS.settingsSubpanel(category))).toHaveClass(/\bactive\b/);
}

export async function backToSettingsMain(page: Page): Promise<void> {
  await page.locator(SELECTORS.btnSettingsBack).click();
  await expect(page.locator(SELECTORS.settingsTrack)).not.toHaveClass(/\bin-submenu\b/);
  await expect(page.locator(SELECTORS.settingsPaneMain)).toHaveAttribute('aria-hidden', 'false');
}

export async function closeSettingsModal(page: Page): Promise<void> {
  await page.locator(SELECTORS.btnCloseSettings).click();
  await expect(page.locator(SELECTORS.settingsModal)).not.toHaveClass(/\bopen\b/);
}

export async function setRangeSliderValue(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const slider = page.locator(selector);
  await slider.fill(value);
  await expect(slider).toHaveValue(value);
}

export async function triggerFullResetViaSettings(page: Page): Promise<void> {
  await openSettingsCategory(page, 'data');

  await page.locator(SELECTORS.btnResetAllProgress).click();
  await expect(page.locator(SELECTORS.settingsModal)).not.toHaveClass(/\bopen\b/);
  await expect(page.locator(SELECTORS.resetConfirm1Modal)).toHaveClass(/\bopen\b/);

  await page.locator(SELECTORS.btnResetNext1).click();
  await expect(page.locator(SELECTORS.resetConfirm1Modal)).not.toHaveClass(/\bopen\b/);
  await expect(page.locator(SELECTORS.resetConfirm2Modal)).toHaveClass(/\bopen\b/);

  await page.locator(SELECTORS.btnResetConfirm2).click();
  await expect(page.locator(SELECTORS.resetConfirm2Modal)).not.toHaveClass(/\bopen\b/);
}
