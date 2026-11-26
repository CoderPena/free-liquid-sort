import { expect, test } from '@playwright/test';
import {
  advanceFromVictoryModal,
  closePhasesModal,
  completeTrainingLesson1,
  completeTrainingLesson2,
  completeTrainingLesson3,
  completeTrainingLesson4,
  completeTrainingLesson5,
  completeTrainingLessons1To4,
  completeTrainingLessons1To5,
  expectHudRewards,
  expectTrainingLesson1InitialState,
  expectVictoryRewards,
  gotoFreshGame,
  openPhasesModal,
  playMoveSequence,
  pourBetweenTubes,
  replayFromVictoryModal,
  SELECTORS,
  trackPageErrors,
} from './helpers/game';
import {
  prepareDesafiadorRound16PreBonusState,
  prepareFacilEasyAdvanceReadyState,
  prepareFacilRound8PreBonusState,
  readPersistedState,
} from './helpers/storage';

test.describe('Conclusão de Fases, Bônus e Replay', () => {
  test('Cenário A — Conclusão integral do Treinamento e concessão única do bônus de +10 moedas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    // Lição 1 (ideal 1) -> +7 moedas (2 base + 5 estrelas), saldo 7, 3★
    await completeTrainingLesson1(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+7',
      balanceText: '7',
    });
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(2);
    await expectHudRewards(page, 3, 7);
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');

    // Lição 2 (ideal 3) -> +7 moedas, saldo 14, 6★
    await completeTrainingLesson2(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+7',
      balanceText: '14',
    });
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(2);
    await expectHudRewards(page, 6, 14);
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('3');

    // Lição 3 (ideal 2) -> +7 moedas, saldo 21, 9★
    await completeTrainingLesson3(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+7',
      balanceText: '21',
    });
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(2);
    await expectHudRewards(page, 9, 21);
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('4');

    // Lição 4 (ideal 3) -> +7 moedas, saldo 28, 12★
    await completeTrainingLesson4(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+7',
      balanceText: '28',
    });
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(2);
    await expectHudRewards(page, 12, 28);
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');

    // Lição 5 (ideal 4) -> +17 moedas (2 base + 5 estrelas + 10 bônus Treinamento), saldo 45, 15★
    await completeTrainingLesson5(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+17',
      balanceText: '45',
    });
    const rewardTags = page.locator(SELECTORS.victoryRewardTags);
    await expect(rewardTags).toHaveCount(3);
    await expect(rewardTags.nth(0)).toContainText('+2');
    await expect(rewardTags.nth(1)).toContainText('+5');
    await expect(rewardTags.nth(2)).toContainText('+10');
    await expect(page.locator(SELECTORS.btnWinPrimary)).toHaveAttribute('data-action', 'start-facil');
    await expectHudRewards(page, 15, 45);

    const saved = await readPersistedState(page);
    expect(saved.rewards.coins).toBe(45);
    expect(saved.rewards.phaseCompletionPaid.treinamento).toBe(true);
    expect(saved.phases.treinamento.phaseCompleted).toBe(true);
    expect(saved.phases.treinamento.completedRounds).toEqual([1, 2, 3, 4, 5]);
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsTrainingBonus).toBe(10);
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsPhaseBonus).toBe(0);

    await page.locator(SELECTORS.btnWinPhases).click();
    await expect(page.locator(SELECTORS.phasesModal)).toHaveClass(/\bopen\b/);
    const trainingCard = page.locator(SELECTORS.phaseCardById('treinamento'));
    await expect(trainingCard.locator('.phase-pill.done')).toBeVisible();
    await expect(trainingCard.locator('.phase-progress-track')).toHaveAttribute('aria-valuenow', '100');
    await closePhasesModal(page);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Persistência após reload da conclusão sem duplicação do bônus de Treinamento', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await completeTrainingLessons1To5(page);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+17',
      balanceText: '45',
    });
    await expectHudRewards(page, 15, 45);

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
    await expect(page.locator(SELECTORS.victoryCoinsBalance)).toHaveText('45');
    await expect(page.locator(SELECTORS.victoryCoinsEarned)).toHaveText('+17');
    await expectHudRewards(page, 15, 45);

    const savedAfterReload = await readPersistedState(page);
    expect(savedAfterReload.rewards.coins).toBe(45);
    expect(savedAfterReload.rewards.phaseCompletionPaid.treinamento).toBe(true);
    expect(savedAfterReload.phases.treinamento.phaseCompleted).toBe(true);
    expect(savedAfterReload.phases.treinamento.board?.rewardProcessed).toBe(true);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário C — Repetição da quinta lição via #btn-win-replay não duplica recompensas nem bônus', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await completeTrainingLessons1To5(page);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+17',
      balanceText: '45',
    });
    await expectHudRewards(page, 15, 45);

    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 15, 45);

    await completeTrainingLesson5(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+0',
      balanceText: '45',
    });
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(0);
    await expect(page.locator(SELECTORS.victoryRewardNote)).toBeVisible();
    await expectHudRewards(page, 15, 45);

    const saved = await readPersistedState(page);
    expect(saved.rewards.coins).toBe(45);
    expect(saved.rewards.phaseCompletionPaid.treinamento).toBe(true);
    expect(saved.phases.treinamento.phaseCompleted).toBe(true);
    expect(saved.phases.treinamento.completedRounds).toEqual([1, 2, 3, 4, 5]);
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsEarnedTotal).toBe(0);
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsTrainingBonus).toBe(0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário D — Bônus de fase normal e replay integral do Desafiador preservando recompensas permanentes', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareDesafiadorRound16PreBonusState(page);

    await pourBetweenTubes(page, 10, 9);
    await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+20',
      balanceText: '170',
    });
    const rewardTags = page.locator(SELECTORS.victoryRewardTags);
    await expect(rewardTags).toHaveCount(3);
    await expect(rewardTags.nth(0)).toContainText('+5');
    await expect(rewardTags.nth(1)).toContainText('+5');
    await expect(rewardTags.nth(2)).toContainText('+10');
    await expectHudRewards(page, 48, 170);

    const replayPhaseBtn = page.locator(SELECTORS.btnWinPrimary);
    await expect(replayPhaseBtn).toHaveAttribute('data-action', 'replay-phase');

    const savedOnVictory = await readPersistedState(page);
    expect(savedOnVictory.rewards.coins).toBe(170);
    expect(savedOnVictory.rewards.phaseCompletionPaid.desafiador).toBe(true);
    expect(savedOnVictory.phases.desafiador.phaseCompleted).toBe(true);
    expect(savedOnVictory.phases.desafiador.completedRounds).toEqual(
      Array.from({ length: 16 }, (_, idx) => idx + 1)
    );
    expect(savedOnVictory.phases.desafiador.board?.lastVictoryReward?.coinsPhaseBonus).toBe(10);
    for (let r = 1; r <= 16; r++) {
      expect(savedOnVictory.rewards.rounds[`desafiador:${r}`]?.completed).toBe(true);
    }

    await replayPhaseBtn.click();
    await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);

    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bdesafiador\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('16');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('—');
    await expect(page.locator(SELECTORS.btnUndo)).toBeDisabled();
    await expectHudRewards(page, 48, 170);

    const savedAfterReplay = await readPersistedState(page);
    expect(savedAfterReplay.activePhaseId).toBe('desafiador');
    expect(savedAfterReplay.phases.desafiador.currentRound).toBe(1);
    expect(savedAfterReplay.phases.desafiador.completedRounds).toEqual([]);
    expect(savedAfterReplay.phases.desafiador.phaseCompleted).toBe(false);
    expect(savedAfterReplay.phases.desafiador.board?.round).toBe(1);
    expect(savedAfterReplay.phases.desafiador.board?.moves).toBe(0);
    expect(savedAfterReplay.rewards.coins).toBe(170);
    expect(savedAfterReplay.rewards.phaseCompletionPaid.desafiador).toBe(true);
    for (let r = 1; r <= 16; r++) {
      const rec = savedAfterReplay.rewards.rounds[`desafiador:${r}`];
      expect(rec?.completed).toBe(true);
      expect(rec?.bestStars).toBe(3);
      expect(rec?.coinBasePaid).toBe(true);
      expect(rec?.coinTwoStarsPaid).toBe(true);
      expect(rec?.coinThreeStarsPaid).toBe(true);
    }

    expect(pageErrors).toEqual([]);
  });

  test('Cenário E — Persistência de estrelas, moedas e histórico de recompensas após replay integral e reload', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareDesafiadorRound16PreBonusState(page);

    await pourBetweenTubes(page, 10, 9);
    await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+20',
      balanceText: '170',
    });

    const replayPhaseBtn = page.locator(SELECTORS.btnWinPrimary);
    await expect(replayPhaseBtn).toHaveAttribute('data-action', 'replay-phase');
    await replayPhaseBtn.click();
    await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 48, 170);

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bdesafiador\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('16');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 48, 170);

    const savedAfterReload = await readPersistedState(page);
    expect(savedAfterReload.activePhaseId).toBe('desafiador');
    expect(savedAfterReload.phases.desafiador.currentRound).toBe(1);
    expect(savedAfterReload.phases.desafiador.board?.moves).toBe(0);
    expect(savedAfterReload.rewards.coins).toBe(170);
    expect(savedAfterReload.rewards.phaseCompletionPaid.desafiador).toBe(true);
    for (let r = 1; r <= 16; r++) {
      const rec = savedAfterReload.rewards.rounds[`desafiador:${r}`];
      expect(rec?.completed).toBe(true);
      expect(rec?.bestStars).toBe(3);
      expect(rec?.coinBasePaid).toBe(true);
      expect(rec?.coinTwoStarsPaid).toBe(true);
      expect(rec?.coinThreeStarsPaid).toBe(true);
    }

    expect(pageErrors).toEqual([]);
  });

  test('Cenário F — Fase incompleta com 4 de 5 lições não marca conclusão nem concede bônus de +10', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await completeTrainingLessons1To4(page);

    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('5');
    await expectHudRewards(page, 12, 28);

    await openPhasesModal(page);
    const trainingCard = page.locator(SELECTORS.phaseCardById('treinamento'));
    await expect(trainingCard.locator('.phase-pill.done')).toHaveCount(0);
    await expect(trainingCard.locator('.phase-pill.tutorial')).toBeVisible();
    await expect(trainingCard.locator('.phase-progress-track')).toHaveAttribute('aria-valuenow', '80');
    await expect(trainingCard.locator('.phase-progress-pct')).toHaveText('80%');
    await expect(trainingCard.locator('.phase-card-meta')).toContainText('4/5');
    await closePhasesModal(page);

    const saved = await readPersistedState(page);
    expect(saved.phases.treinamento.phaseCompleted).toBe(false);
    expect(saved.phases.treinamento.completedRounds).toEqual([1, 2, 3, 4]);
    expect(saved.rewards.coins).toBe(28);
    expect(saved.rewards.phaseCompletionPaid.treinamento).not.toBe(true);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário G — Repetir a última rodada do Desafiador (16/16) via #btn-win-replay mantém a rodada 16 e não duplica bônus de fase', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareDesafiadorRound16PreBonusState(page);

    await pourBetweenTubes(page, 10, 9);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+20',
      balanceText: '170',
    });
    await expectHudRewards(page, 48, 170);

    const primaryReplayPhaseBtn = page.locator(SELECTORS.btnWinPrimary);
    const replayRoundBtn = page.locator(SELECTORS.btnWinReplay);
    await expect(primaryReplayPhaseBtn).toBeVisible();
    await expect(primaryReplayPhaseBtn).toHaveAttribute('data-action', 'replay-phase');
    await expect(replayRoundBtn).toBeVisible();

    await replayFromVictoryModal(page);

    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bdesafiador\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('16');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('16');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 48, 170);

    const savedBeforeSecondWin = await readPersistedState(page);
    expect(savedBeforeSecondWin.phases.desafiador.currentRound).toBe(16);
    expect(savedBeforeSecondWin.phases.desafiador.completedRounds).toHaveLength(16);
    expect(savedBeforeSecondWin.phases.desafiador.phaseCompleted).toBe(true);
    expect(savedBeforeSecondWin.rewards.phaseCompletionPaid.desafiador).toBe(true);

    await pourBetweenTubes(page, 10, 9);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+0',
      balanceText: '170',
    });
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(0);
    await expect(page.locator(SELECTORS.victoryRewardNote)).toBeVisible();
    await expectHudRewards(page, 48, 170);

    const savedAfterSecondWin = await readPersistedState(page);
    expect(savedAfterSecondWin.rewards.coins).toBe(170);
    expect(savedAfterSecondWin.rewards.phaseCompletionPaid.desafiador).toBe(true);
    expect(savedAfterSecondWin.phases.desafiador.currentRound).toBe(16);
    expect(savedAfterSecondWin.phases.desafiador.completedRounds).toHaveLength(16);
    expect(savedAfterSecondWin.phases.desafiador.phaseCompleted).toBe(true);
    expect(savedAfterSecondWin.phases.desafiador.board?.lastVictoryReward?.coinsPhaseBonus).toBe(0);
    expect(savedAfterSecondWin.phases.desafiador.board?.lastVictoryReward?.coinsEarnedTotal).toBe(0);

    // O botão primário de replay integral da fase continua funcionando normalmente
    await primaryReplayPhaseBtn.click();
    await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 48, 170);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário H — Avanço antecipado (#btn-win-advance) no Fácil avança para Médio e retorno pelo modal de fases carrega rodada seguinte sem reabrir vitória', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareFacilEasyAdvanceReadyState(page);

    // 3ª rodada perfeita no Fácil (threshold = floor(8 * 0.25) + 1 = 3) habilita #btn-win-advance
    await playMoveSequence(page, [
      [0, 3],
      [1, 3],
      [0, 1],
      [0, 3],
    ]);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+10',
      balanceText: '30',
    });
    await expectHudRewards(page, 9, 30);
    await expect(page.locator(SELECTORS.skipCallout)).toHaveClass(/\bvisible\b/);

    const winAdvanceBtn = page.locator(SELECTORS.btnWinAdvance);
    await expect(winAdvanceBtn).toBeVisible();
    await winAdvanceBtn.click();

    await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bmedio\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('12');
    await expectHudRewards(page, 9, 30);

    // onWinAdvance() avança currentRound (3 -> 4) e limpa facil.board para não deixar a rodada 3 vencida pendente
    const savedOnMedio = await readPersistedState(page);
    expect(savedOnMedio.activePhaseId).toBe('medio');
    expect(savedOnMedio.phases.facil.currentRound).toBe(4);
    expect(savedOnMedio.phases.facil.board).toBeNull();
    expect(savedOnMedio.phases.facil.completedRounds).toEqual([1, 2, 3]);
    expect(savedOnMedio.phases.facil.easyRounds).toEqual([1, 2, 3]);
    expect(savedOnMedio.rewards.coins).toBe(30);

    // Retorna ao Fácil pelo modal de fases: deve abrir a rodada 4 limpa, sem reabrir modal nem duplicar moedas
    await openPhasesModal(page);
    const facilCard = page.locator(SELECTORS.phaseCardById('facil'));
    await expect(facilCard.locator('.phase-card-meta')).toContainText('3/8');
    await facilCard.click();

    await expect(page.locator(SELECTORS.phasesModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.victoryModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bfacil\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('4');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('8');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 9, 30);

    const savedBackInFacil = await readPersistedState(page);
    expect(savedBackInFacil.activePhaseId).toBe('facil');
    expect(savedBackInFacil.phases.facil.currentRound).toBe(4);
    expect(savedBackInFacil.phases.facil.completedRounds).toEqual([1, 2, 3]);
    expect(savedBackInFacil.rewards.coins).toBe(30);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário I — Retorno pelo modal de fases ao Treinamento com tabuleiro já vencido reabre vitória via ensureWonBoardProcessedAndShown() sem duplicar recompensas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await completeTrainingLessons1To5(page);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+17',
      balanceText: '45',
    });
    await expectHudRewards(page, 15, 45);
    await expect(page.locator(SELECTORS.btnWinPrimary)).toHaveAttribute('data-action', 'start-facil');

    // Avança para o Fácil mantendo o tabuleiro vencido da Lição 5 salvo no Treinamento
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bfacil\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 15, 45);

    // Retorna ao Treinamento pelo modal de fases -> ensureWonBoardProcessedAndShown() reabre vitória sem duplicação
    await openPhasesModal(page);
    const trainingCard = page.locator(SELECTORS.phaseCardById('treinamento'));
    await expect(trainingCard.locator('.phase-pill.done')).toBeVisible();
    await expect(trainingCard.locator('.phase-progress-track')).toHaveAttribute('aria-valuenow', '100');
    await trainingCard.click();

    await expect(page.locator(SELECTORS.phasesModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\btreinamento\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+17',
      balanceText: '45',
    });
    await expectHudRewards(page, 15, 45);

    const savedOnReturn = await readPersistedState(page);
    expect(savedOnReturn.rewards.coins).toBe(45);
    expect(savedOnReturn.rewards.phaseCompletionPaid.treinamento).toBe(true);
    expect(savedOnReturn.phases.treinamento.completedRounds).toEqual([1, 2, 3, 4, 5]);
    expect(savedOnReturn.phases.treinamento.board?.rewardProcessed).toBe(true);

    // Jogador consegue repetir a rodada normalmente pelo modal reaberto sem ganhar moedas extras
    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await completeTrainingLesson5(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+0',
      balanceText: '45',
    });
    await expectHudRewards(page, 15, 45);

    // E consegue prosseguir normalmente para o Fácil pelo botão primário
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bfacil\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 15, 45);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário J — Retorno pelo modal de fases à fase Fácil (8/8) com tabuleiro vencido reabre vitória sem duplicar bônus de fase', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareFacilRound8PreBonusState(page);

    await pourBetweenTubes(page, 0, 1);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+20',
      balanceText: '90',
    });
    await expectHudRewards(page, 24, 90);
    await expect(page.locator(SELECTORS.btnWinPrimary)).toHaveAttribute('data-action', 'next-phase');

    // Avança para a fase Médio deixando o Fácil na rodada 8/8 com tabuleiro vencido
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bmedio\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 24, 90);

    // Retorna ao Fácil pelo modal de fases -> ensureWonBoardProcessedAndShown() reabre o modal de vitória da rodada 8
    await openPhasesModal(page);
    const facilCard = page.locator(SELECTORS.phaseCardById('facil'));
    await expect(facilCard.locator('.phase-pill.done')).toBeVisible();
    await expect(facilCard.locator('.phase-progress-track')).toHaveAttribute('aria-valuenow', '100');
    await facilCard.click();

    await expect(page.locator(SELECTORS.phasesModal)).not.toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bfacil\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('8');
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+20',
      balanceText: '90',
    });
    await expectHudRewards(page, 24, 90);

    const savedOnReturn = await readPersistedState(page);
    expect(savedOnReturn.rewards.coins).toBe(90);
    expect(savedOnReturn.rewards.phaseCompletionPaid.facil).toBe(true);
    expect(savedOnReturn.phases.facil.phaseCompleted).toBe(true);
    expect(savedOnReturn.phases.facil.completedRounds).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(savedOnReturn.phases.facil.board?.rewardProcessed).toBe(true);

    // Repetir a rodada 8 via #btn-win-replay mantém saldo e estrelas sem duplicação
    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('8');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await pourBetweenTubes(page, 0, 1);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+0',
      balanceText: '90',
    });
    await expectHudRewards(page, 24, 90);

    // Prosseguir pelo botão primário volta ao Médio normalmente
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bmedio\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expectHudRewards(page, 24, 90);

    expect(pageErrors).toEqual([]);
  });
});
