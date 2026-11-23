import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRawEfficiency,
  classifyStars,
  formatEfficiencyDisplay,
  evaluateMatchEfficiency,
  createDefaultRewardsState,
  sanitizeRewardsState,
  applyRoundVictoryRewards,
  getPhaseRewardSummary,
  getTotalCompletedRounds,
  getTotalEarnedStars,
} from './rewards.ts';

const GAME_PHASES = [
  { id: 'treinamento', totalRounds: 5 },
  { id: 'facil', totalRounds: 8 },
  { id: 'medio', totalRounds: 12 },
  { id: 'dificil', totalRounds: 12 },
  { id: 'desafiador', totalRounds: 16 },
];

test('Boundary classification and truncated 1-decimal visual display (79.99%, 80%, 99.99%, 100%)', () => {
  assert.equal(classifyStars(79.99), 1);
  assert.equal(formatEfficiencyDisplay(79.99), '79.9%');

  assert.equal(classifyStars(80), 2);
  assert.equal(formatEfficiencyDisplay(80), '80.0%');

  assert.equal(classifyStars(99.99), 2);
  assert.equal(formatEfficiencyDisplay(99.99), '99.9%');

  assert.equal(classifyStars(100), 3);
  assert.equal(formatEfficiencyDisplay(100), '100.0%');
});

test('Integer match evaluation avoids floating-point drift at exact boundaries and fractions', () => {
  const b7999 = evaluateMatchEfficiency(10000, 7999);
  assert.ok(b7999);
  assert.equal(b7999.stars, 1);
  assert.equal(b7999.displayEfficiency, '79.9%');

  const b8000 = evaluateMatchEfficiency(5, 4);
  assert.ok(b8000);
  assert.equal(b8000.rawEfficiency, 80);
  assert.equal(b8000.stars, 2);
  assert.equal(b8000.displayEfficiency, '80.0%');

  const b9999 = evaluateMatchEfficiency(10000, 9999);
  assert.ok(b9999);
  assert.equal(b9999.stars, 2);
  assert.equal(b9999.displayEfficiency, '99.9%');

  const b100 = evaluateMatchEfficiency(12, 12);
  assert.ok(b100);
  assert.equal(b100.rawEfficiency, 100);
  assert.equal(b100.stars, 3);
  assert.equal(b100.displayEfficiency, '100.0%');

  // 29/100 in IEEE-754 float is 28.999999999999996; must still display 29.0%
  const f29 = evaluateMatchEfficiency(100, 29);
  assert.ok(f29);
  assert.equal(f29.stars, 1);
  assert.equal(f29.displayEfficiency, '29.0%');
  assert.equal(formatEfficiencyDisplay((29 / 100) * 100), '29.0%');
});

test('Efficiency > 100% is capped at 100% with 3 stars', () => {
  assert.equal(calculateRawEfficiency(8, 10), 100);
  const evalOver = evaluateMatchEfficiency(8, 10);
  assert.ok(evalOver);
  assert.equal(evalOver.rawEfficiency, 100);
  assert.equal(evalOver.stars, 3);
  assert.equal(evalOver.displayEfficiency, '100.0%');
});

test('Invalid inputs return null and grant zero coins without mutating state', () => {
  assert.equal(calculateRawEfficiency(0, 10), null);
  assert.equal(calculateRawEfficiency(10, 0), null);
  assert.equal(calculateRawEfficiency(-3, 5), null);
  assert.equal(calculateRawEfficiency(Number.NaN, 5), null);
  assert.equal(calculateRawEfficiency(5, Number.POSITIVE_INFINITY), null);

  assert.equal(evaluateMatchEfficiency(0, 10), null);
  assert.equal(evaluateMatchEfficiency(10, 0), null);

  // Integers outside Number.MAX_SAFE_INTEGER must return null
  const overMaxSafe = Number.MAX_SAFE_INTEGER + 1;
  assert.equal(calculateRawEfficiency(overMaxSafe, 10), null);
  assert.equal(calculateRawEfficiency(10, overMaxSafe), null);
  assert.equal(evaluateMatchEfficiency(overMaxSafe, 10), null);
  assert.equal(evaluateMatchEfficiency(overMaxSafe, overMaxSafe - 2), null);

  // Large safe integers near Number.MAX_SAFE_INTEGER remain safe and exact via BigInt
  const maxSafe = Number.MAX_SAFE_INTEGER;
  const nearMax = evaluateMatchEfficiency(maxSafe, maxSafe - 1);
  assert.ok(nearMax);
  assert.equal(nearMax.stars, 2);
  assert.equal(nearMax.displayEfficiency, '99.9%');

  const initial = createDefaultRewardsState();
  const { nextState, outcome } = applyRoundVictoryRewards(initial, {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 0,
    idealMoves: 8,
  });

  assert.equal(nextState, initial);
  assert.equal(outcome.stars, null);
  assert.equal(outcome.rawEfficiency, null);
  assert.equal(outcome.displayEfficiency, '—');
  assert.equal(outcome.coinsEarnedTotal, 0);
  assert.equal(outcome.totalCoinsAfter, 0);

  const outOfRange = applyRoundVictoryRewards(initial, {
    phaseId: 'facil',
    round: 9,
    totalRounds: 8,
    isTutorial: false,
    moves: 8,
    idealMoves: 8,
  });
  assert.equal(outOfRange.nextState, initial);
  assert.equal(outOfRange.outcome.coinsEarnedTotal, 0);
});

test('Normal round incremental coins (1* -> 2* -> 3*) and direct 3* clear', () => {
  let state = createDefaultRewardsState();

  // 1 star (5/10 = 50%) -> +5 coins
  let res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 10,
    idealMoves: 5,
  });
  state = res.nextState;
  assert.equal(res.outcome.stars, 1);
  assert.equal(res.outcome.coinsRoundBase, 5);
  assert.equal(res.outcome.coinsStarBonus, 0);
  assert.equal(res.outcome.coinsEarnedTotal, 5);
  assert.equal(state.coins, 5);

  // Repeat at 79.99% (1 star) -> 0 coins, efficiency record updates
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 10000,
    idealMoves: 7999,
  });
  state = res.nextState;
  assert.equal(res.outcome.stars, 1);
  assert.equal(res.outcome.displayEfficiency, '79.9%');
  assert.equal(res.outcome.coinsEarnedTotal, 0);
  assert.equal(res.outcome.isNewBestStars, false);
  assert.equal(res.outcome.isNewBestEfficiency, true);

  // Improve to 2 stars (80%) -> +2 coins (total 7)
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 5,
    idealMoves: 4,
  });
  state = res.nextState;
  assert.equal(res.outcome.stars, 2);
  assert.equal(res.outcome.coinsRoundBase, 0);
  assert.equal(res.outcome.coinsStarBonus, 2);
  assert.equal(res.outcome.coinsEarnedTotal, 2);
  assert.equal(state.coins, 7);

  // Improve to 3 stars (100%) -> +3 coins (total 10)
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 5,
    idealMoves: 5,
  });
  state = res.nextState;
  assert.equal(res.outcome.stars, 3);
  assert.equal(res.outcome.coinsRoundBase, 0);
  assert.equal(res.outcome.coinsStarBonus, 3);
  assert.equal(res.outcome.coinsEarnedTotal, 3);
  assert.equal(state.coins, 10);

  // Replay with worse performance (1 star) -> 0 coins and records never regress
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 20,
    idealMoves: 5,
  });
  state = res.nextState;
  assert.equal(res.outcome.coinsEarnedTotal, 0);
  assert.equal(state.rounds['facil:1'].bestStars, 3);
  assert.equal(state.rounds['facil:1'].bestEfficiency, 100);

  // Direct 3-star win on round 2 -> 5 + 2 + 3 = 10 coins at once
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 2,
    totalRounds: 8,
    isTutorial: false,
    moves: 8,
    idealMoves: 8,
  });
  state = res.nextState;
  assert.equal(res.outcome.coinsRoundBase, 5);
  assert.equal(res.outcome.coinsStarBonus, 5);
  assert.equal(res.outcome.coinsEarnedTotal, 10);
  assert.equal(state.coins, 20);
});

test('Training rewards: 2 coins per lesson + star bonuses + unique 10-coin completion bonus (no double bonus)', () => {
  let state = createDefaultRewardsState();

  // Complete all 5 training lessons with 1 star: 5 * 2 + 10 = 20 coins
  for (let r = 1; r <= 5; r++) {
    const res = applyRoundVictoryRewards(state, {
      phaseId: 'treinamento',
      round: r,
      totalRounds: 5,
      isTutorial: true,
      moves: 10,
      idealMoves: 5,
    });
    state = res.nextState;
    assert.equal(res.outcome.coinsRoundBase, 2);
    assert.equal(res.outcome.coinsPhaseBonus, 0);
    if (r < 5) {
      assert.equal(res.outcome.coinsTrainingBonus, 0);
    } else {
      assert.equal(res.outcome.coinsTrainingBonus, 10);
    }
  }

  assert.equal(state.coins, 20);
  assert.equal(state.phaseCompletionPaid.treinamento, true);

  // Repeating lesson 5 with 3 stars gives +5 star bonus (2 + 3) and NEVER repeats base or +10 training bonus
  const upgradeRes = applyRoundVictoryRewards(state, {
    phaseId: 'treinamento',
    round: 5,
    totalRounds: 5,
    isTutorial: true,
    moves: 4,
    idealMoves: 4,
  });
  state = upgradeRes.nextState;
  assert.equal(upgradeRes.outcome.coinsRoundBase, 0);
  assert.equal(upgradeRes.outcome.coinsStarBonus, 5);
  assert.equal(upgradeRes.outcome.coinsTrainingBonus, 0);
  assert.equal(upgradeRes.outcome.coinsPhaseBonus, 0);
  assert.equal(state.coins, 25);
});

test('Phase identity determines reward category regardless of mismatched isTutorial flag', () => {
  // Normal phase 'facil' with isTutorial: true must still receive normal rewards (+5 base, +10 phase bonus on full clear)
  const normalMismatch = applyRoundVictoryRewards(createDefaultRewardsState(), {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: true,
    moves: 10,
    idealMoves: 5,
  });
  assert.equal(normalMismatch.outcome.coinsRoundBase, 5);
  assert.equal(normalMismatch.outcome.coinsTrainingBonus, 0);
  assert.equal(normalMismatch.outcome.coinsEarnedTotal, 5);

  // Training phase 'treinamento' with isTutorial: false must still receive training rewards (+2 base, +10 training bonus on full clear)
  let trainingState = createDefaultRewardsState();
  for (let r = 1; r <= 5; r++) {
    const res = applyRoundVictoryRewards(trainingState, {
      phaseId: 'treinamento',
      round: r,
      totalRounds: 5,
      isTutorial: false,
      moves: 10,
      idealMoves: 5,
    });
    trainingState = res.nextState;
    assert.equal(res.outcome.coinsRoundBase, 2);
    assert.equal(res.outcome.coinsPhaseBonus, 0);
    if (r === 5) {
      assert.equal(res.outcome.coinsTrainingBonus, 10);
    }
  }
  assert.equal(trainingState.coins, 20);
});

test('Normal phase +10 completion bonus requires ALL rounds completed, regardless of order, paid once', () => {
  let state = createDefaultRewardsState();

  // Winning only the last round (8/8) first does NOT grant phase completion bonus
  let res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 8,
    totalRounds: 8,
    isTutorial: false,
    moves: 10,
    idealMoves: 6,
  });
  state = res.nextState;
  assert.equal(res.outcome.coinsPhaseBonus, 0);
  assert.equal(Boolean(state.phaseCompletionPaid.facil), false);

  // Complete rounds 1..6
  for (let r = 1; r <= 6; r++) {
    res = applyRoundVictoryRewards(state, {
      phaseId: 'facil',
      round: r,
      totalRounds: 8,
      isTutorial: false,
      moves: 10,
      idealMoves: 6,
    });
    state = res.nextState;
    assert.equal(res.outcome.coinsPhaseBonus, 0);
  }

  // Round 7 is the last missing round -> grants +5 base + 10 phase completion bonus
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 7,
    totalRounds: 8,
    isTutorial: false,
    moves: 10,
    idealMoves: 6,
  });
  state = res.nextState;
  assert.equal(res.outcome.coinsRoundBase, 5);
  assert.equal(res.outcome.coinsPhaseBonus, 10);
  assert.equal(res.outcome.coinsEarnedTotal, 15);
  assert.equal(state.coins, 50); // 8*5 + 10
  assert.equal(state.phaseCompletionPaid.facil, true);

  // Replaying any round never re-awards phase bonus
  res = applyRoundVictoryRewards(state, {
    phaseId: 'facil',
    round: 8,
    totalRounds: 8,
    isTutorial: false,
    moves: 10,
    idealMoves: 6,
  });
  assert.equal(res.outcome.coinsEarnedTotal, 0);
});

test('Immutability, sanitization, and phase/global summary helpers', () => {
  const original = createDefaultRewardsState();
  const { nextState } = applyRoundVictoryRewards(original, {
    phaseId: 'medio',
    round: 1,
    totalRounds: 12,
    isTutorial: false,
    moves: 10,
    idealMoves: 10,
  });

  // Original state was not mutated
  assert.equal(original.coins, 0);
  assert.deepEqual(original.rounds, {});
  assert.equal(nextState.coins, 10);

  const summary = getPhaseRewardSummary(nextState, 'medio', 12);
  assert.equal(summary.completedRoundsCount, 1);
  assert.equal(summary.earnedStars, 3);
  assert.equal(summary.maxStars, 36);
  assert.equal(summary.rounds[0].displayBestEfficiency, '100.0%');
  assert.equal(summary.rounds[1].displayBestEfficiency, '—');

  assert.equal(getTotalCompletedRounds(nextState, GAME_PHASES), 1);
  assert.deepEqual(getTotalEarnedStars(nextState, GAME_PHASES), { earned: 3, max: 159 });

  const sanitized = sanitizeRewardsState(
    {
      coins: -50,
      rounds: {
        'facil:1': {
          completed: true,
          bestStars: 99,
          bestEfficiency: 150,
          coinBasePaid: 1,
          coinTwoStarsPaid: 'true',
          coinThreeStarsPaid: true,
        },
        // Fractional, negative, and string bestStars must never be rounded or accepted
        'facil:2': { completed: 'yes', bestStars: 2.6, bestEfficiency: 95 },
        'facil:3': { completed: 1, bestStars: 1.4, bestEfficiency: 60 },
        'facil:4': { completed: false, bestStars: 3, bestEfficiency: 100 },
        'facil:5': { completed: {}, bestStars: -1, bestEfficiency: 50 },
        'facil:6': { completed: [], bestStars: '3', bestEfficiency: 100 },
        'facil:7': { completed: 'false', bestStars: 4, bestEfficiency: 80 },
        'facil:99': { completed: true, bestStars: 3, bestEfficiency: 100 },
        'invalida:1': { completed: true, bestStars: 3, bestEfficiency: 100 },
      },
      phaseCompletionPaid: {
        facil: true,
        medio: 1,
        invalida: true,
      },
    },
    GAME_PHASES
  );

  assert.equal(sanitized.coins, 0);
  assert.equal(sanitized.rounds['facil:1'].completed, true);
  assert.equal(sanitized.rounds['facil:1'].bestStars, 0);
  assert.equal(sanitized.rounds['facil:1'].bestEfficiency, 100);
  assert.equal(sanitized.rounds['facil:1'].coinBasePaid, false);
  assert.equal(sanitized.rounds['facil:1'].coinTwoStarsPaid, false);
  assert.equal(sanitized.rounds['facil:1'].coinThreeStarsPaid, true);

  assert.equal(sanitized.rounds['facil:2'].completed, false);
  assert.equal(sanitized.rounds['facil:2'].bestStars, 0);
  assert.equal(sanitized.rounds['facil:3'].completed, false);
  assert.equal(sanitized.rounds['facil:3'].bestStars, 0);
  assert.equal(sanitized.rounds['facil:4'].completed, false);
  assert.equal(sanitized.rounds['facil:4'].bestStars, 3);
  assert.equal(sanitized.rounds['facil:5'].completed, false);
  assert.equal(sanitized.rounds['facil:5'].bestStars, 0);
  assert.equal(sanitized.rounds['facil:6'].completed, false);
  assert.equal(sanitized.rounds['facil:6'].bestStars, 0);
  assert.equal(sanitized.rounds['facil:7'].completed, false);
  assert.equal(sanitized.rounds['facil:7'].bestStars, 0);

  assert.equal(sanitized.rounds['facil:99'], undefined);
  assert.equal(sanitized.rounds['invalida:1'], undefined);
  assert.equal(sanitized.phaseCompletionPaid.facil, true);
  assert.equal(sanitized.phaseCompletionPaid.medio, undefined);
  assert.equal(sanitized.phaseCompletionPaid.invalida, undefined);
});

test('Idempotency: reapplying the exact same victory never grants additional coins or alters state', () => {
  const victoryInput = {
    phaseId: 'facil',
    round: 1,
    totalRounds: 8,
    isTutorial: false,
    moves: 10,
    idealMoves: 10,
  };

  const first = applyRoundVictoryRewards(createDefaultRewardsState(), victoryInput);
  assert.equal(first.outcome.coinsEarnedTotal, 10);
  assert.equal(first.nextState.coins, 10);

  const second = applyRoundVictoryRewards(first.nextState, victoryInput);
  assert.equal(second.outcome.coinsRoundBase, 0);
  assert.equal(second.outcome.coinsStarBonus, 0);
  assert.equal(second.outcome.coinsPhaseBonus, 0);
  assert.equal(second.outcome.coinsTrainingBonus, 0);
  assert.equal(second.outcome.coinsEarnedTotal, 0);
  assert.equal(second.outcome.totalCoinsAfter, 10);
  assert.equal(second.outcome.isNewBestStars, false);
  assert.equal(second.outcome.isNewBestEfficiency, false);
  assert.deepEqual(second.nextState, first.nextState);

  // Also test idempotency when phase/training completion bonus was just granted
  let trainingState = createDefaultRewardsState();
  for (let r = 1; r <= 4; r++) {
    trainingState = applyRoundVictoryRewards(trainingState, {
      phaseId: 'treinamento',
      round: r,
      totalRounds: 5,
      isTutorial: true,
      moves: 5,
      idealMoves: 5,
    }).nextState;
  }

  const finalTrainingInput = {
    phaseId: 'treinamento',
    round: 5,
    totalRounds: 5,
    isTutorial: true,
    moves: 5,
    idealMoves: 5,
  };
  const firstFinal = applyRoundVictoryRewards(trainingState, finalTrainingInput);
  assert.equal(firstFinal.outcome.coinsTrainingBonus, 10);
  assert.equal(firstFinal.outcome.coinsEarnedTotal, 17); // 2 base + 5 stars + 10 training

  const secondFinal = applyRoundVictoryRewards(firstFinal.nextState, finalTrainingInput);
  assert.equal(secondFinal.outcome.coinsEarnedTotal, 0);
  assert.deepEqual(secondFinal.nextState, firstFinal.nextState);
});

test('sanitizeRewardsState validates coins strictly as non-negative safe integers', () => {
  // 1. Zero preserved (including normalizing -0 to 0)
  assert.equal(sanitizeRewardsState({ coins: 0 }).coins, 0);
  assert.equal(Object.is(sanitizeRewardsState({ coins: -0 }).coins, 0), true);

  // 2. Positive integers preserved
  assert.equal(sanitizeRewardsState({ coins: 1 }).coins, 1);
  assert.equal(sanitizeRewardsState({ coins: 100 }).coins, 100);

  // 3. Exactly Number.MAX_SAFE_INTEGER preserved
  assert.equal(
    sanitizeRewardsState({ coins: Number.MAX_SAFE_INTEGER }).coins,
    Number.MAX_SAFE_INTEGER
  );

  // 4. Greater than Number.MAX_SAFE_INTEGER rejected as 0
  assert.equal(sanitizeRewardsState({ coins: Number.MAX_SAFE_INTEGER + 1 }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: 1e20 }).coins, 0);

  // 5. Fractional numbers rejected as 0
  assert.equal(sanitizeRewardsState({ coins: 1.5 }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: 0.9 }).coins, 0);

  // 6. Negative numbers rejected as 0
  assert.equal(sanitizeRewardsState({ coins: -10 }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: -1 }).coins, 0);

  // 7. Non-numeric values rejected as 0
  assert.equal(sanitizeRewardsState({ coins: '100' }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: null }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: undefined }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: true }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: {} }).coins, 0);

  // 8. NaN and infinite values rejected as 0
  assert.equal(sanitizeRewardsState({ coins: Number.NaN }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: Number.POSITIVE_INFINITY }).coins, 0);
  assert.equal(sanitizeRewardsState({ coins: Number.NEGATIVE_INFINITY }).coins, 0);
});

