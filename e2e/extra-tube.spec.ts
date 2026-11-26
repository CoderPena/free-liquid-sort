import { expect, test } from '@playwright/test';
import {
  advanceFromVictoryModal,
  expectHudRewards,
  expectTrainingLesson1InitialState,
  expectVictoryRewards,
  gotoFreshGame,
  playMoveSequence,
  pourBetweenTubes,
  SELECTORS,
  trackPageErrors,
} from './helpers/game';
import {
  EXTRA_TUBE_DEADLOCK_TUBES,
  EXTRA_TUBE_REDUCE_TUBES,
  prepareNormalRoundBoard,
  readPersistedState,
} from './helpers/storage';

const EXTRA_REDUCE_WIN_MOVES: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [0, 4],
  [1, 3],
  [1, 4],
  [0, 1],
  [2, 3],
  [2, 4],
  [2, 3],
];

const DEADLOCK_RESCUE_MOVES: ReadonlyArray<readonly [number, number]> = [
  [2, 4],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 3],
  [1, 2],
  [1, 4],
  [1, 2],
  [1, 3],
];

test.describe('Tubo Extra (+1 Tubo)', () => {
  test('Cenário A — Tubo extra permanece desabilitado no Treinamento e sem tubo fantasma', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    await expect(page.locator(SELECTORS.btnExtra)).toBeDisabled();
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('—');
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Ativação pelo tubo fantasma exige confirmação ao reiniciar com 0 movimentos e restaura estado inicial', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: EXTRA_TUBE_REDUCE_TUBES,
      idealMoves: 9,
      baseIdealMoves: 9,
    });

    await expect(page.locator(SELECTORS.btnExtra)).toBeEnabled();
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('1');
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(1);

    await page.locator(SELECTORS.ghostTube).click();

    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(5);
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(0);
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('0');
    await expect(page.locator(SELECTORS.btnExtra)).toBeDisabled();
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('8');

    await page.locator(SELECTORS.btnRestart).click();
    await expect(page.locator(SELECTORS.confirmModal)).toHaveClass(/\bopen\b/);

    await page.locator(SELECTORS.btnConfirmRestart).click();
    await expect(page.locator(SELECTORS.confirmModal)).not.toHaveClass(/\bopen\b/);

    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(4);
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(1);
    await expect(page.locator(SELECTORS.btnExtra)).toBeEnabled();
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('1');
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('9');

    const saved = await readPersistedState(page);
    expect(saved.phases.facil.board?.extraTubeUsed).toBe(false);
    expect(saved.phases.facil.board?.idealMoves).toBe(9);
    expect(saved.phases.facil.board?.baseIdealMoves).toBe(9);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário C — Ativação via #btn-extra recalcula ideal para 8, concede 3★/+10 sem easyRounds/perfect-win e libera novo tubo na próxima rodada', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: EXTRA_TUBE_REDUCE_TUBES,
      idealMoves: 9,
      baseIdealMoves: 9,
    });

    await page.locator(SELECTORS.btnExtra).click();

    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(5);
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(0);
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('0');
    await expect(page.locator(SELECTORS.btnExtra)).toBeDisabled();
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('8');

    await playMoveSequence(page, EXTRA_REDUCE_WIN_MOVES);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+10',
      balanceText: '10',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('8');
    await expect(page.locator(SELECTORS.victoryIdealMoves)).toHaveText('8');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('100.0%');
    await expect(page.locator(SELECTORS.winTitle)).not.toHaveClass(/\bperfect-win\b/);
    await expectHudRewards(page, 3, 10);

    const savedOnWin = await readPersistedState(page);
    expect(savedOnWin.phases.facil.completedRounds).toEqual([1]);
    expect(savedOnWin.phases.facil.easyRounds).toEqual([]);
    expect(savedOnWin.phases.facil.board?.extraTubeUsed).toBe(true);
    expect(savedOnWin.phases.facil.board?.baseIdealMoves).toBe(9);
    expect(savedOnWin.phases.facil.board?.idealMoves).toBe(8);

    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');
    await expect(page.locator(SELECTORS.btnExtra)).toBeEnabled();
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('1');
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(1);

    const savedNextRound = await readPersistedState(page);
    expect(savedNextRound.phases.facil.board?.extraTubeUsed).toBe(false);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário D — Resgate de impasse real via #btn-stuck-extra permite concluir com 3 estrelas, 100.0% e +10 moedas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: EXTRA_TUBE_DEADLOCK_TUBES,
      idealMoves: 10,
      baseIdealMoves: 10,
    });

    await pourBetweenTubes(page, 2, 3);

    await expect(page.locator(SELECTORS.deadlockBanner)).toHaveClass(/\bvisible\b/);
    await expect(page.locator(SELECTORS.stuckModal)).toHaveClass(/\bopen\b/);
    const stuckExtraBtn = page.locator(SELECTORS.btnStuckExtra);
    await expect(stuckExtraBtn).toBeVisible();
    await expect(stuckExtraBtn).toBeEnabled();

    await stuckExtraBtn.click();

    await expect(page.locator(SELECTORS.stuckModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.deadlockBanner)).not.toHaveClass(/\bvisible\b/);
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(5);
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(0);
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('0');
    await expect(page.locator(SELECTORS.btnExtra)).toBeDisabled();
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('10');

    await playMoveSequence(page, DEADLOCK_RESCUE_MOVES);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+10',
      balanceText: '10',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('10');
    await expect(page.locator(SELECTORS.victoryIdealMoves)).toHaveText('10');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('100.0%');
    await expectHudRewards(page, 3, 10);

    const saved = await readPersistedState(page);
    expect(saved.phases.facil.easyRounds).toEqual([]);
    expect(saved.phases.facil.board?.extraTubeUsed).toBe(true);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário E — Persistência após reload mantém tubo extra ativo, idealMoves em 8 e baseIdealMoves em 9', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: EXTRA_TUBE_REDUCE_TUBES,
      idealMoves: 9,
      baseIdealMoves: 9,
    });

    await page.locator(SELECTORS.btnExtra).click();
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(5);
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('8');

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(5);
    await expect(page.locator(SELECTORS.extraBadge)).toHaveText('0');
    await expect(page.locator(SELECTORS.btnExtra)).toBeDisabled();
    await expect(page.locator(SELECTORS.ghostTube)).toHaveCount(0);
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('8');

    const saved = await readPersistedState(page);
    expect(saved.phases.facil.board?.extraTubeUsed).toBe(true);
    expect(saved.phases.facil.board?.idealMoves).toBe(8);
    expect(saved.phases.facil.board?.baseIdealMoves).toBe(9);
    expect(saved.phases.facil.board?.tubes).toHaveLength(5);

    expect(pageErrors).toEqual([]);
  });
});
