import { test, expect } from '@playwright/test';

const MAX_LOOP_COUNT = 100;

let count = 1;
test.describe('MediaRecorder', () => {
  while (count <= MAX_LOOP_COUNT) {
    test(`recorded blob has a valid size (${count})`, async ({ page }) => {
      await page.goto('/');

      const buttonStartStop = page.getByTestId('button-start-stop');
      await buttonStartStop.click();
      await expect(buttonStartStop).toHaveText('Stop');

      await new Promise((resolve) => setTimeout(resolve, 15000));

      await buttonStartStop.click();
      await expect(buttonStartStop).toHaveText('Start');

      const blobSize = page.getByTestId('blob-size');
      await expect(blobSize).toBeVisible();

      const textContent = await blobSize.textContent();
      const blobSizeNumber = Number(textContent);
      expect(typeof blobSizeNumber).toBe('number');
      expect(isNaN(blobSizeNumber)).toBe(false);

      const blobSizeMb = blobSizeNumber / 1000000;
      expect(blobSizeMb).toBeGreaterThan(1);
    });
    count++;
  }
});
