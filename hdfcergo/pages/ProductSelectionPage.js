import { BasePage } from './BasePage.js';
import { URLS } from '../testData.js';

export class ProductSelectionPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async navigate() {
    await this.page.goto(URLS.FQ);
    await this.page.waitForLoadState('networkidle');
    await this.waitForStable(2000);
  }

  async selectCategory(category) {
    await this.safeClick(this.page.getByText(category, { exact: true }));
    await this.waitForStable(1000);
  }

  async selectProduct(productName) {
    const compactName = productName.replace(/\s/g, '');
    const strategies = [
      this.page.locator('div').filter({ hasText: new RegExp(`^${compactName}$`) }).nth(2),
      this.page.locator('div').filter({ hasText: new RegExp(`^${productName}$`) }).nth(2),
      this.page.getByText(productName, { exact: false }).first(),
      this.page.getByText(productName.split(' ').pop(), { exact: false }).first(),
    ];

    for (const locator of strategies) {
      if (await locator.isVisible({ timeout: 3000 }).catch(() => false)) {
        await this.safeClick(locator);
        await this.waitForStable(1000);
        return;
      }
    }

    throw new Error(`Could not find product: ${productName}`);
  }

  async completeIntroWizard() {
    await this.clickButton('Next');
    await this.waitForStable(500);

    const fullListBtn = this.page.getByRole('button', { name: 'Full list' });
    if (await fullListBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fullListBtn.click();
      await this.waitForStable(500);
      await this.dismissModal();
    }

    await this.clickButton('Next');
    await this.waitForStable(500);

    await this.clickButton('Next');
    await this.waitForStable(500);

    await this.clickButton('Continue');
    await this.waitForStable(500);
  }
}
