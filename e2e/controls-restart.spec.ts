import { expect, test } from '@playwright/test';
import {
  closeSettingsModal,
  completeTrainingLesson1,
  expectHudRewards,
  expectTrainingLesson1InitialState,
  expectVictoryRewards,
  gotoFreshGame,
  openSettingsCategory,
  pourBetweenTubes,
  replayFromVictoryModal,
  SELECTORS,
  setRangeSliderValue,
  trackPageErrors,
} from './helpers/game';

test.describe('Controles e Reinício de Partida', () => {
  test('Cenário A — Undo reverte segmentos da jogada, incrementa moves e preserva recompensas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    const undoBtn = page.locator(SELECTORS.btnUndo);
    await expect(undoBtn).toBeDisabled();
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(1);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(0);

    await pourBetweenTubes(page, 0, 2);

    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(0);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(1);
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('1');
    await expect(undoBtn).toBeEnabled();

    await undoBtn.click();

    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(1);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(0);
    await expect(undoBtn).toBeDisabled();
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('2');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('50.0%');
    await expectHudRewards(page, 0, 0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Hint exibe sugestão visual, respeita duração configurável e não altera movimentos nem recompensas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    const hintBtn = page.locator(SELECTORS.btnHint);
    await expect(hintBtn).toBeVisible();
    await expect(hintBtn).toBeEnabled();

    await openSettingsCategory(page, 'gameplay');
    await setRangeSliderValue(page, SELECTORS.sliderHintDuration, '6');
    await expect(page.locator(SELECTORS.hintDurationValue)).toHaveText('∞');
    await closeSettingsModal(page);

    await hintBtn.click();

    await expect(page.locator(SELECTORS.hintSourceTubes)).toHaveCount(1);
    await expect(page.locator(SELECTORS.hintTargetTubes)).toHaveCount(1);
    await expect(page.locator(SELECTORS.hintArrowPath)).toHaveCount(1);
    await expect(page.locator(SELECTORS.hintArrowPath)).toBeVisible();
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('—');
    await expectHudRewards(page, 0, 0);

    await openSettingsCategory(page, 'gameplay');
    await setRangeSliderValue(page, SELECTORS.sliderHintDuration, '0');
    await expect(page.locator(SELECTORS.hintDurationValue)).toHaveText('Off');
    await closeSettingsModal(page);

    await expect(hintBtn).toBeHidden();
    await expect(page.locator(SELECTORS.hintSourceTubes)).toHaveCount(0);
    await expect(page.locator(SELECTORS.hintTargetTubes)).toHaveCount(0);
    await expect(page.locator(SELECTORS.hintArrowPath)).toHaveCount(0);
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 0, 0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário C — Reinício direto restaura estado inicial com até 2 jogadas sem abrir confirmação', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    await pourBetweenTubes(page, 0, 2);
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(0);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(1);

    await page.locator(SELECTORS.btnRestart).click();

    await expect(page.locator(SELECTORS.confirmModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('—');
    await expect(page.locator(SELECTORS.btnUndo)).toBeDisabled();
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(1);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(0);
    await expectHudRewards(page, 0, 0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário D — Reinício com confirmação após 3 movimentos na Lição 1 restaura o tabuleiro', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    await pourBetweenTubes(page, 0, 2);
    await pourBetweenTubes(page, 2, 0);
    await pourBetweenTubes(page, 0, 2);

    await expect(page.locator(SELECTORS.movesNum)).toHaveText('3');
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(0);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(1);

    await page.locator(SELECTORS.btnRestart).click();
    await expect(page.locator(SELECTORS.confirmModal)).toHaveClass(/\bopen\b/);

    await page.locator(SELECTORS.btnConfirmRestart).click();
    await expect(page.locator(SELECTORS.confirmModal)).not.toHaveClass(/\bopen\b/);

    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('—');
    await expect(page.locator(SELECTORS.btnUndo)).toBeDisabled();
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(1);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(0);
    await expectHudRewards(page, 0, 0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário E — Preservação de estrelas e moedas após reinício com confirmação e reload', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    await completeTrainingLesson1(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+7',
      balanceText: '7',
    });
    await expectHudRewards(page, 3, 7);

    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 3, 7);

    await pourBetweenTubes(page, 0, 2);
    await pourBetweenTubes(page, 2, 0);
    await pourBetweenTubes(page, 0, 2);
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('3');

    await page.locator(SELECTORS.btnRestart).click();
    await expect(page.locator(SELECTORS.confirmModal)).toHaveClass(/\bopen\b/);

    await page.locator(SELECTORS.btnConfirmRestart).click();
    await expect(page.locator(SELECTORS.confirmModal)).not.toHaveClass(/\bopen\b/);

    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(0))).toHaveCount(1);
    await expect(page.locator(SELECTORS.tubeSegmentsByIndex(2))).toHaveCount(0);
    await expectHudRewards(page, 3, 7);

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);
    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 3, 7);

    expect(pageErrors).toEqual([]);
  });
});
