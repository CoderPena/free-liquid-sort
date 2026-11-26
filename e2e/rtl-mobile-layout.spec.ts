import { expect, test, type Page } from '@playwright/test';
import {
  advanceFromVictoryModal,
  backToSettingsMain,
  closePhasesModal,
  closeSettingsModal,
  completeTrainingLesson1,
  expectHudRewards,
  expectVictoryRewards,
  gotoFreshGame,
  openPhasesModal,
  openSettingsCategory,
  SELECTORS,
  trackPageErrors,
} from './helpers/game';

const NARROW_VIEWPORT = { width: 375, height: 667 } as const;

async function expectElementInsideViewport(page: Page, selector: string): Promise<void> {
  const locator = page.locator(selector);
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `Bounding box esperado para ${selector}`).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(NARROW_VIEWPORT.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(NARROW_VIEWPORT.height + 1);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => {
    const selectors = ['#app', '.topbar', '.topbar-row', '.rewards-bar', '.stats-bar', '.controls-dock', '#board'];
    const containers = selectors.map((sel) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (!el) {
        return { selector: sel, missing: true, scrollWidth: 0, clientWidth: 0, left: 0, right: 0 };
      }
      const rect = el.getBoundingClientRect();
      return {
        selector: sel,
        missing: false,
        scrollWidth: Math.round(el.scrollWidth),
        clientWidth: Math.round(el.clientWidth),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      };
    });

    return {
      innerWidth: window.innerWidth,
      docScrollWidth: Math.round(document.documentElement.scrollWidth),
      bodyScrollWidth: Math.round(document.body.scrollWidth),
      containers,
    };
  });

  expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth);

  for (const container of metrics.containers) {
    expect(container.missing, `Container ausente: ${container.selector}`).toBe(false);
    expect(
      container.scrollWidth,
      `Overflow horizontal detectado em ${container.selector}: scrollWidth=${container.scrollWidth} > clientWidth=${container.clientWidth}`
    ).toBeLessThanOrEqual(container.clientWidth + 1);
    expect(container.left).toBeGreaterThanOrEqual(-1);
    expect(container.right).toBeLessThanOrEqual(NARROW_VIEWPORT.width + 1);
  }
}

async function selectArabicViaLanguageModal(page: Page): Promise<void> {
  await page.locator(SELECTORS.btnLanguage).click();
  await expect(page.locator(SELECTORS.languageModal)).toHaveClass(/\bopen\b/);
  await page
    .locator(SELECTORS.languageItems)
    .filter({ has: page.locator('.lang-item-code', { hasText: /^AR$/ }) })
    .click();
  await expect(page.locator(SELECTORS.languageModal)).not.toHaveClass(/\bopen\b/);
}

test.describe('Árabe RTL e Viewport Estreito (375 × 667)', () => {
  test('Cenário A — Seleção de árabe via interface em 375 × 667 ativa dir="rtl", mantém HUD e controles acessíveis sem overflow horizontal', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await page.setViewportSize(NARROW_VIEWPORT);
    await gotoFreshGame(page);

    await selectArabicViaLanguageModal(page);

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator(SELECTORS.langCode)).toHaveText('AR');
    const bodyDirection = await page.evaluate(() => getComputedStyle(document.body).direction);
    expect(bodyDirection).toBe('rtl');

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(3);

    await expectElementInsideViewport(page, SELECTORS.hudStars);
    await expectElementInsideViewport(page, SELECTORS.hudCoins);
    await expectHudRewards(page, 0, 0);

    await expectNoHorizontalOverflow(page);

    // Verifica que os controles principais do topo e do dock inferior estão visíveis e dentro do viewport
    const mainControls = [
      SELECTORS.btnPhases,
      SELECTORS.btnBgm,
      SELECTORS.btnLanguage,
      SELECTORS.btnTheme,
      SELECTORS.btnSettings,
      SELECTORS.btnSound,
      SELECTORS.btnUndo,
      SELECTORS.btnHint,
      SELECTORS.btnRestart,
      SELECTORS.btnExtra,
    ];
    for (const controlSelector of mainControls) {
      await expectElementInsideViewport(page, controlSelector);
    }

    // Testa abertura e fechamento dos modais principais em RTL no viewport estreito
    await openPhasesModal(page);
    await closePhasesModal(page);

    await openSettingsCategory(page, 'visual');
    await backToSettingsMain(page);
    await closeSettingsModal(page);

    // Joga a Lição 1 normalmente em RTL no viewport 375 × 667 e verifica o modal de vitória e atualização do HUD
    await completeTrainingLesson1(page);
    await expectVictoryRewards(page, {
      stars: 3,
      earnedText: '+7',
      balanceText: '7',
    });
    await expectHudRewards(page, 3, 7);

    const modalCardBox = await page.locator(SELECTORS.victoryModalCard).boundingBox();
    expect(modalCardBox).not.toBeNull();
    expect(modalCardBox!.x).toBeGreaterThanOrEqual(0);
    expect(modalCardBox!.x + modalCardBox!.width).toBeLessThanOrEqual(NARROW_VIEWPORT.width + 1);

    await advanceFromVictoryModal(page);
    await expect(page.locator(SELECTORS.roundNum)).toHaveText('2');

    expect(pageErrors).toEqual([]);
  });

  test('Cenário B — Reload em árabe RTL no viewport 375 × 667 inicializa sem erros e preserva dir="rtl" e HUD visível', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await page.setViewportSize(NARROW_VIEWPORT);
    await gotoFreshGame(page);
    await selectArabicViaLanguageModal(page);

    const reloadResponse = await page.reload();
    expect(reloadResponse).not.toBeNull();
    expect(reloadResponse?.ok()).toBe(true);

    await expect(page.locator(SELECTORS.board)).toBeVisible();
    await expect(page.locator(SELECTORS.realTubes)).toHaveCount(3);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator(SELECTORS.langCode)).toHaveText('AR');

    await expectElementInsideViewport(page, SELECTORS.hudStars);
    await expectElementInsideViewport(page, SELECTORS.hudCoins);
    await expectNoHorizontalOverflow(page);

    expect(pageErrors).toEqual([]);
  });
});
