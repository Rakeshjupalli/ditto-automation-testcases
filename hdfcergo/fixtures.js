import { test as base, expect } from '@playwright/test';
import { ProductSelectionPage } from './pages/ProductSelectionPage.js';
import { FamilyDetailsPage } from './pages/FamilyDetailsPage.js';
import { PremiumPage } from './pages/PremiumPage.js';

export { expect };

export const test = base.extend({
  productPage: async ({ page }, use) => {
    await use(new ProductSelectionPage(page));
  },
  familyPage: async ({ page }, use) => {
    await use(new FamilyDetailsPage(page));
  },
  premiumPage: async ({ page }, use) => {
    await use(new PremiumPage(page));
  },
});
