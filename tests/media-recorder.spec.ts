import { test, expect } from '@playwright/test';

const MAX_LOOP_COUNT = 10;

let count = 1;
test.describe('MediaRecorder', async () => {
  test.beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });
  while (count <= MAX_LOOP_COUNT) {
    test(`recorded blob has a valid size (${count})`, async ({ page }) => {
      await page.goto('/');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await page.screenshot({ path: 'playwright-report/screenshot.png' });
      const buttonStartStop = page.getByTestId('button-start-stop');
      await buttonStartStop.click();
      await expect(buttonStartStop).toHaveText('Stop');

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await buttonStartStop.click();
      await expect(buttonStartStop).toHaveText('Start');

      const blobSize = page.getByTestId('blob-size');
      await expect(blobSize).toBeVisible();

      const textContent = await blobSize.textContent();
      const blobSizeNumber = Number(textContent);
      expect(typeof blobSizeNumber).toBe('number');
      expect(isNaN(blobSizeNumber)).toBe(false);
      expect(blobSizeNumber).toBeGreaterThan(0);
    });
    count++;
  }
});
