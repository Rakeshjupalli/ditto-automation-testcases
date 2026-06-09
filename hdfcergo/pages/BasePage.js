import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForStable(ms = 500) {
    await this.page.waitForTimeout(ms);
  }

  async safeClick(locator) {
    await locator.click();
  }

  async safeFill(locator, value) {
    await locator.fill(value);
  }

  async clickButton(name) {
    await this.page.getByRole('button', { name }).click();
  }

  async dismissModal() {
    const btn = this.page.getByRole('button', { name: 'Close' });
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await this.waitForStable(300);
    }
  }

  async assertHeading(name) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible();
  }
}
