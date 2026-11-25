import { expect, test } from '@playwright/test';
import {
  advanceFromVictoryModal,
  completeTrainingLesson1,
  expectHudRewards,
  expectTrainingLesson1InitialState,
  expectVictoryRewards,
  gotoFreshGame,
  replayFromVictoryModal,
  SELECTORS,
  trackPageErrors,
} from './helpers/game';

test.describe('Treinamento — Recompensas e Persistência', () => {
  test('Cenário A — Primeira conclusão da lição 1 concede 3 estrelas e 7 moedas', async ({
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
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('1');
    await expect(page.locator(SELECTORS.victoryIdealMoves)).toHaveText('1');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('100.0%');

    await expectHudRewards(page, 3, 7);
    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Persistência de estrelas e moedas após recarregar a página', async ({
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

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 3, 7);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário C — Repetição da lição 1 não duplica recompensas permanentes', async ({
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
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(3);
    await expectHudRewards(page, 3, 7);

    await completeTrainingLesson1(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+0',
      balanceText: '7',
    });
    await expect(page.locator(SELECTORS.victoryRewardNote)).toBeVisible();
    await expectHudRewards(page, 3, 7);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário D — Avanço para a segunda lição preserva saldo e reinicia contadores de partida', async ({
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

    await advanceFromVictoryModal(page);

    await expect(page.locator(SELECTORS.phaseName)).toHaveText(/\S+/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('5');
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(3);

    await expectHudRewards(page, 3, 7);

    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('3');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('—');

    expect(pageErrors).toEqual([]);
  });
});
