import { test, expect } from '@playwright/test';

test.describe('MediaRecorder', async () => {
  test(`recorded blob has a valid size`, async ({ page }) => {
    await page.goto('/');
    const buttonStartStopElement = page.getByTestId('button-start-stop');
    await buttonStartStopElement.click();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await buttonStartStopElement.click();
    const blobSizeElement = page.getByTestId('blob-size');
    await expect(blobSizeElement).toBeVisible();
    const textContent = await blobSizeElement.textContent();
    const blobSizeNumber = Number(textContent);
    expect(typeof blobSizeNumber).toBe('number');
    expect(isNaN(blobSizeNumber)).toBe(false);
    expect(blobSizeNumber).toBeGreaterThan(0);
    await page.screenshot({
      path: 'playwright-report/media-recorder-complete.png',
    });
  });
});
