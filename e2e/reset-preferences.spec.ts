import { expect, test, type Page } from '@playwright/test';
import {
  advanceFromVictoryModal,
  backToSettingsMain,
  closeSettingsModal,
  completeTrainingLesson1,
  expectHudRewards,
  expectTrainingLesson1InitialState,
  expectVictoryRewards,
  gotoFreshGame,
  openSettingsCategory,
  SELECTORS,
  setRangeSliderValue,
  trackPageErrors,
  triggerFullResetViaSettings,
} from './helpers/game';

interface ExpectedPreferences {
  langCode: string;
  htmlLang: string;
  theme: 'dark' | 'light';
  muted: boolean;
  bgmEmoji: string;
  visualModeIndex: number;
  mysteryChecked: boolean;
  hintDurationValue: string;
  hintDurationLabel: string;
  sfxVolume: string;
  bgmVolume: string;
}

async function expectConfiguredPreferences(
  page: Page,
  expected: ExpectedPreferences
): Promise<void> {
  await expect(page.locator(SELECTORS.langCode)).toHaveText(expected.langCode);
  await expect(page.locator('html')).toHaveAttribute('lang', expected.htmlLang);

  await expect(page.locator('html')).toHaveAttribute('data-theme', expected.theme);
  await expect(page.locator(SELECTORS.btnTheme)).toHaveAttribute(
    'aria-pressed',
    expected.theme === 'light' ? 'true' : 'false'
  );

  if (expected.muted) {
    await expect(page.locator(SELECTORS.btnSound)).toHaveClass(/\bmuted\b/);
    await expect(page.locator(SELECTORS.iconSoundOff)).toBeVisible();
    await expect(page.locator(SELECTORS.iconSoundOn)).toBeHidden();
  } else {
    await expect(page.locator(SELECTORS.btnSound)).not.toHaveClass(/\bmuted\b/);
    await expect(page.locator(SELECTORS.iconSoundOn)).toBeVisible();
    await expect(page.locator(SELECTORS.iconSoundOff)).toBeHidden();
  }

  await expect(page.locator(SELECTORS.bgmEmoji)).toHaveText(expected.bgmEmoji);

  await expect(page.locator(SELECTORS.board)).toHaveClass(/\bpatterns-on\b/);
  await expect(page.locator(SELECTORS.board)).toHaveClass(/\bpatterns-mono\b/);
  await expect(page.locator(SELECTORS.btnSettings)).toHaveClass(/\bsettings-active\b/);

  await openSettingsCategory(page, 'visual');
  await expect(
    page.locator(SELECTORS.visualModeCards).nth(expected.visualModeIndex)
  ).toHaveClass(/\bactive\b/);
  const expectedThemeBtn =
    expected.theme === 'light' ? SELECTORS.btnThemeLight : SELECTORS.btnThemeDark;
  await expect(page.locator(expectedThemeBtn)).toHaveClass(/\bactive\b/);
  await backToSettingsMain(page);

  await openSettingsCategory(page, 'gameplay');
  if (expected.mysteryChecked) {
    await expect(page.locator(SELECTORS.toggleMysteryMode)).toBeChecked();
  } else {
    await expect(page.locator(SELECTORS.toggleMysteryMode)).not.toBeChecked();
  }
  await expect(page.locator(SELECTORS.sliderHintDuration)).toHaveValue(
    expected.hintDurationValue
  );
  await expect(page.locator(SELECTORS.hintDurationValue)).toHaveText(
    expected.hintDurationLabel
  );
  await backToSettingsMain(page);

  await openSettingsCategory(page, 'audio');
  await expect(page.locator(SELECTORS.sliderSfxVolume)).toHaveValue(expected.sfxVolume);
  await expect(page.locator(SELECTORS.sfxVolumeValue)).toHaveText(`${expected.sfxVolume}%`);
  await expect(page.locator(SELECTORS.sliderBgmVolume)).toHaveValue(expected.bgmVolume);
  await expect(page.locator(SELECTORS.bgmVolumeValue)).toHaveText(`${expected.bgmVolume}%`);
  await closeSettingsModal(page);
}

test.describe('Reset Total e Preservação de Preferências', () => {
  test('Cenário A — Reset Total apaga progresso e recompensas e retorna à Lição 1 após reload', async ({
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
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');
    await expectHudRewards(page, 3, 7);

    await triggerFullResetViaSettings(page);

    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('5');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expect(page.locator(SELECTORS.idealMovesNum)).toHaveText('1');
    await expectHudRewards(page, 0, 0);

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);
    await expect(page.locator(SELECTORS.board)).toBeVisible();

    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.roundTotal)).toHaveText('5');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 0, 0);

    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Reset Total preserva todas as 9 preferências antes e depois de reload', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await gotoFreshGame(page);
    await expectTrainingLesson1InitialState(page);

    // 1. Idioma -> ES
    await page.locator(SELECTORS.btnLanguage).click();
    await expect(page.locator(SELECTORS.languageModal)).toHaveClass(/\bopen\b/);
    await page
      .locator(SELECTORS.languageItems)
      .filter({ has: page.locator('.lang-item-code', { hasText: /^ES$/ }) })
      .click();
    await expect(page.locator(SELECTORS.languageModal)).not.toHaveClass(/\bopen\b/);

    // 2. Tema -> alterna a partir do estado atual
    const currentTheme = await page.locator('html').getAttribute('data-theme');
    const targetTheme: 'dark' | 'light' = currentTheme === 'light' ? 'dark' : 'light';
    await page.locator(SELECTORS.btnTheme).click();

    // 3. Som -> alterna a partir do estado atual
    const wasMuted = await page
      .locator(SELECTORS.btnSound)
      .evaluate((el) => el.classList.contains('muted'));
    const targetMuted = !wasMuted;
    await page.locator(SELECTORS.btnSound).click();

    // 4. Faixa musical -> calm (🌙), selecionada somente se ainda não estiver ativa
    const currentBgmEmoji = (await page.locator(SELECTORS.bgmEmoji).innerText()).trim();
    if (currentBgmEmoji !== '🌙') {
      await page.locator(SELECTORS.btnBgm).click();
      await expect(page.locator(SELECTORS.bgmModal)).toHaveClass(/\bopen\b/);
      await page.locator(SELECTORS.bgmCards).filter({ hasText: '🌙' }).click();
      await expect(page.locator(SELECTORS.bgmModal)).not.toHaveClass(/\bopen\b/);
    }

    // 5. Modo visual -> pattern (índice 1)
    await openSettingsCategory(page, 'visual');
    await page.locator(SELECTORS.visualModeCards).nth(1).click();
    await backToSettingsMain(page);

    // 6. Mystery Mode -> alterna a partir do estado atual & 7. Duração das dicas -> 4s
    await openSettingsCategory(page, 'gameplay');
    const wasMysteryChecked = await page.locator(SELECTORS.toggleMysteryMode).isChecked();
    const targetMysteryChecked = !wasMysteryChecked;
    await page.locator(SELECTORS.toggleMysteryModeLabel).click();
    await setRangeSliderValue(page, SELECTORS.sliderHintDuration, '4');
    await backToSettingsMain(page);

    // 8. Volume SFX -> 80% & 9. Volume Música -> 25%
    await openSettingsCategory(page, 'audio');
    await setRangeSliderValue(page, SELECTORS.sliderSfxVolume, '80');
    await setRangeSliderValue(page, SELECTORS.sliderBgmVolume, '25');
    await closeSettingsModal(page);

    const expectedPreferences: ExpectedPreferences = {
      langCode: 'ES',
      htmlLang: 'es',
      theme: targetTheme,
      muted: targetMuted,
      bgmEmoji: '🌙',
      visualModeIndex: 1,
      mysteryChecked: targetMysteryChecked,
      hintDurationValue: '4',
      hintDurationLabel: '4s',
      sfxVolume: '80',
      bgmVolume: '25',
    };

    await expectConfiguredPreferences(page, expectedPreferences);

    // Gera progresso e recompensas reais antes do Reset Total
    await completeTrainingLesson1(page);
    await expectHudRewards(page, 3, 7);
    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');

    // Executa Reset Total
    await triggerFullResetViaSettings(page);

    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 0, 0);

    // Confirma todas as 9 preferências preservadas após Reset Total
    await expectConfiguredPreferences(page, expectedPreferences);

    // Confirma preservação após reload completo
    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);
    await expect(page.locator(SELECTORS.board)).toBeVisible();

    await expect(page.locator(SELECTORS.roundNum)).toHaveText('1');
    await expect(page.locator(SELECTORS.movesNum)).toHaveText('0');
    await expectHudRewards(page, 0, 0);
    await expectConfiguredPreferences(page, expectedPreferences);

    expect(pageErrors).toEqual([]);
  });
});
