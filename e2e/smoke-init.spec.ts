import { expect, test } from '@playwright/test';

test.describe('Inicialização limpa do jogo', () => {
  test('carrega o tabuleiro inicial sem erros de runtime e com estado inicial esperado', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response?.ok()).toBe(true);

    const board = page.locator('#board');
    await expect(board).toBeVisible();

    await expect(page.locator('#phase-name')).toHaveText(/\S+/);
    await expect(page.locator('#round-num')).toHaveText('1');
    await expect(page.locator('#round-total')).toHaveText('5');
    await expect(page.locator('#hud-stars-val')).toHaveText('0');
    await expect(page.locator('#hud-coins-val')).toHaveText('0');
    await expect(page.locator('#moves-num')).toHaveText('0');
    await expect(page.locator('#ideal-moves-num')).toHaveText('1');

    const realTubes = page.locator('#board .tube:not(.tube-ghost)[data-index]');
    await expect(realTubes).toHaveCount(3);

    expect(pageErrors).toEqual([]);
  });
});
