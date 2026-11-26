import { expect, test } from '@playwright/test';
import { I18N, LANGUAGE_ORDER } from '../src/i18n';
import {
  completeTrainingLessons1To4,
  expectHudRewards,
  expectVictoryRewards,
  gotoFreshGame,
  playMoveSequence,
  pourBetweenTubes,
  replayFromVictoryModal,
  SELECTORS,
  trackPageErrors,
} from './helpers/game';
import {
  CLAMP_OVER_100_TUBES,
  EFFICIENCY_THREE_TIER_TUBES,
  prepareNormalRoundBoard,
  readPersistedState,
  SAVE_STORAGE_KEY,
} from './helpers/storage';

const ONE_STAR_SIX_MOVES: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [0, 4],
  [0, 3],
  [1, 0],
  [0, 3],
  [1, 4],
];

const TWO_STARS_FIVE_MOVES: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [0, 4],
  [0, 3],
  [1, 3],
  [1, 4],
];

const THREE_STARS_FOUR_MOVES: ReadonlyArray<readonly [number, number]> = [
  [0, 3],
  [1, 3],
  [0, 1],
  [0, 3],
];

test.describe('Eficiência e Classificação de Estrelas', () => {
  test('Cenário A — Vitória com 1 estrela na Lição 5 com Undo trunca eficiência para 66.6% e concede +2 de rodada sem bônus de estrelas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await completeTrainingLessons1To4(page);

    await expect(page.locator(SELECTORS.roundNum)).toHaveText('5');
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('4');
    await expectHudRewards(page, 12, 28);

    // 6 movimentos com Undo sobre ideal 4 => 4/6 = 66.666...% truncado para '66.6%' (1 estrela)
    await pourBetweenTubes(page, 0, 3);
    await page.locator(SELECTORS.btnUndo).click();
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('2');

    await playMoveSequence(page, [
      [0, 3],
      [2, 0],
      [1, 2],
      [1, 3],
    ]);

    await expectVictoryRewards(page, {
      stars: 1,
      earnedText: '+12',
      balanceText: '40',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('6');
    await expect(page.locator(SELECTORS.victoryIdealMoves)).toHaveText('4');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('66.6%');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('66.6%');

    const rewardTags = page.locator(SELECTORS.victoryRewardTags);
    await expect(rewardTags).toHaveCount(2);
    await expect(rewardTags.nth(0)).toContainText('+2');
    await expect(rewardTags.nth(1)).toContainText('+10');
    await expectHudRewards(page, 13, 40);

    const saved = await readPersistedState(page);
    expect(saved.rewards.coins).toBe(40);
    expect(saved.rewards.rounds['treinamento:5']).toEqual({
      completed: true,
      bestStars: 1,
      bestEfficiency: (4 * 100) / 6,
      coinBasePaid: true,
      coinTwoStarsPaid: false,
      coinThreeStarsPaid: false,
    });
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsRoundBase).toBe(2);
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsStarBonus).toBe(0);
    expect(saved.phases.treinamento.board?.lastVictoryReward?.coinsTrainingBonus).toBe(10);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Evolução incremental 1★ → 2★ (80.0%) → 3★ (100.0%) e não regressão na rodada 1 do Fácil', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: EFFICIENCY_THREE_TIER_TUBES,
      idealMoves: 4,
    });

    // 1ª vitória: 6 movimentos (4/6 = 66.6%) -> 1 estrela, +5 moedas base
    await playMoveSequence(page, ONE_STAR_SIX_MOVES);
    await expectVictoryRewards(page, {
      stars: 1,
      earnedText: '+5',
      balanceText: '5',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('6');
    await expect(page.locator(SELECTORS.victoryIdealMoves)).toHaveText('4');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('66.6%');
    await expect(page.locator(SELECTORS.btnWinReplay)).toBeVisible();
    await expectHudRewards(page, 1, 5);

    let saved = await readPersistedState(page);
    expect(saved.phases.facil.easyRounds).toEqual([]);

    // Replay e 2ª vitória: 5 movimentos (4/5 = 80.0% exato) -> 2 estrelas, +2 moedas incrementais
    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.phaseDot)).toHaveClass(/\bfacil\b/);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await playMoveSequence(page, TWO_STARS_FIVE_MOVES);
    await expectVictoryRewards(page, {
      stars: 2,
      earnedText: '+2',
      balanceText: '7',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('5');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('80.0%');
    await expectHudRewards(page, 2, 7);

    saved = await readPersistedState(page);
    expect(saved.phases.facil.easyRounds).toEqual([]);

    // Replay e 3ª vitória: 4 movimentos (4/4 = 100.0%) -> 3 estrelas, +3 moedas incrementais e inclusão em easyRounds
    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await playMoveSequence(page, THREE_STARS_FOUR_MOVES);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+3',
      balanceText: '10',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('4');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('100.0%');
    await expectHudRewards(page, 3, 10);

    saved = await readPersistedState(page);
    expect(saved.phases.facil.easyRounds).toEqual([1]);

    // Replay e 4ª vitória com desempenho inferior (1 estrela) -> sem novas moedas e sem regressão de recorde
    await replayFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await playMoveSequence(page, ONE_STAR_SIX_MOVES);
    await expectVictoryRewards(page, {
      stars: 1,
      earnedText: '+0',
      balanceText: '10',
    });
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('66.6%');
    await expect(page.locator(SELECTORS.victoryRewardTags)).toHaveCount(0);
    await expect(page.locator(SELECTORS.victoryRewardNote)).toBeVisible();
    await expectHudRewards(page, 3, 10);

    saved = await readPersistedState(page);
    expect(saved.rewards.coins).toBe(10);
    expect(saved.phases.facil.currentRound).toBe(1);
    expect(saved.phases.facil.completedRounds).toEqual([1]);
    expect(saved.phases.facil.easyRounds).toEqual([1]);
    expect(saved.rewards.rounds['facil:1']).toEqual({
      completed: true,
      bestStars: 3,
      bestEfficiency: 100,
      coinBasePaid: true,
      coinTwoStarsPaid: true,
      coinThreeStarsPaid: true,
    });

    expect(pageErrors).toEqual([]);
  });

  test('Cenário C — Clamping de eficiência superior a 100% limita exibição a 100.0% e concede 3 estrelas', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: CLAMP_OVER_100_TUBES,
      idealMoves: 2,
      baseIdealMoves: 2,
    });

    await pourBetweenTubes(page, 0, 1);

    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+10',
      balanceText: '10',
    });
    await expect(page.locator(SELECTORS.victoryMoves)).toHaveText('1');
    await expect(page.locator(SELECTORS.victoryIdealMoves)).toHaveText('2');
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('100.0%');
    await expect(page.locator(SELECTORS.effNum)).toHaveText('100.0%');
    await expectHudRewards(page, 3, 10);

    const saved = await readPersistedState(page);
    expect(saved.phases.facil.board?.lastVictoryReward?.rawEfficiency).toBe(100);
    expect(saved.phases.facil.board?.lastVictoryReward?.displayEfficiency).toBe('100.0%');
    expect(saved.phases.facil.board?.lastVictoryReward?.stars).toBe(3);
    expect(saved.rewards.rounds['facil:1']).toEqual({
      completed: true,
      bestStars: 3,
      bestEfficiency: 100,
      coinBasePaid: true,
      coinTwoStarsPaid: true,
      coinThreeStarsPaid: true,
    });

    expect(pageErrors).toEqual([]);
  });

  test('Cenário D — Persistência após reload de vitória com exatamente 80.0% (2 estrelas e +7 moedas)', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: EFFICIENCY_THREE_TIER_TUBES,
      idealMoves: 4,
    });

    await playMoveSequence(page, TWO_STARS_FIVE_MOVES);

    await expectVictoryRewards(page, {
      stars: 2,
      earnedText: '+7',
      balanceText: '7',
    });
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('80.0%');
    await expectHudRewards(page, 2, 7);

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
    await expect(page.locator(SELECTORS.victoryStarsFilled)).toHaveCount(2);
    await expect(page.locator(SELECTORS.victoryStarsEmpty)).toHaveCount(1);
    await expect(page.locator(SELECTORS.victoryEff)).toHaveText('80.0%');
    await expect(page.locator(SELECTORS.victoryCoinsBalance)).toHaveText('7');
    await expectHudRewards(page, 2, 7);

    const saved = await readPersistedState(page);
    expect(saved.rewards.coins).toBe(7);
    expect(saved.rewards.rounds['facil:1']).toEqual({
      completed: true,
      bestStars: 2,
      bestEfficiency: 80,
      coinBasePaid: true,
      coinTwoStarsPaid: true,
      coinThreeStarsPaid: false,
    });

    expect(pageErrors).toEqual([]);
  });

  test('Cenário E — Rótulo genérico e traduções de #btn-win-replay nas oito línguas em fase normal', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    expect(LANGUAGE_ORDER).toHaveLength(8);
    for (const lang of LANGUAGE_ORDER) {
      const label = I18N[lang].winBtnReplayRound;
      expect(label.trim().length).toBeGreaterThan(0);
      expect(label).not.toBe('Repetir Lição');
      expect(label).not.toBe('Replay Lesson');
      expect(label).not.toBe(I18N[lang].winReplayPhase);
    }

    await prepareNormalRoundBoard(page, {
      phaseId: 'facil',
      round: 1,
      tubes: CLAMP_OVER_100_TUBES,
      idealMoves: 1,
    });

    await pourBetweenTubes(page, 0, 1);
    await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);

    for (const lang of LANGUAGE_ORDER) {
      await page.evaluate(
        ({ storageKey, targetLang }) => {
          const raw = window.localStorage.getItem(storageKey);
          if (!raw) throw new Error('Missing persisted state');
          const parsed = JSON.parse(raw);
          parsed.language = targetLang;
          window.localStorage.setItem(storageKey, JSON.stringify(parsed));
        },
        { storageKey: SAVE_STORAGE_KEY, targetLang: lang }
      );

      const reloadResponse = await page.reload();
      expect(reloadResponse).not.toBeNull();
      expect(reloadResponse?.ok()).toBe(true);

      await expect(page.locator(SELECTORS.victoryModal)).toHaveClass(/\bopen\b/);
      const replayBtn = page.locator(SELECTORS.btnWinReplay);
      await expect(replayBtn).toBeVisible();
      await expect(replayBtn).toHaveText(I18N[lang].winBtnReplayRound);
    }

    expect(pageErrors).toEqual([]);
  });
});
