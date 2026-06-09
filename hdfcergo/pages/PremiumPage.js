import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class PremiumPage extends BasePage {
  coverToLakhs(text) {
    const m = (text ?? '').match(/₹([\d.]+)\s*([LCr])/i);
    return m ? parseFloat(m[1]) * (m[2].toLowerCase() === 'cr' ? 100 : 1) : 0;
  }

  async adjustCoverIfNeeded() {
    const no = this.page.getByRole('radio', { name: 'No' });
    if (await no.isVisible({ timeout: 3000 }).catch(() => false)) {
      await no.check();
      await this.waitForStable(300);
    }

    const box = this.page.locator('._coverChangeBox_1vgra_2');
    await box.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    if (!await box.isVisible().catch(() => false)) return;

    const buttons = box.locator('button');
    for (let i = 0; i < 30; i++) {
      const current = this.coverToLakhs(await box.textContent());
      if (current === 20) break;

      const btn = current < 20 ? buttons.nth(1) : buttons.nth(0);
      if (await btn.isEnabled().catch(() => false)) {
        await btn.click();
        await this.waitForStable(600);
      } else {
        break;
      }
    }
  }

  async calculatePremium() {
    await this.adjustCoverIfNeeded();
    await this.clickButton('Calculate Premium');
    await this.waitForStable(3000);
  }

  async selectPolicyPeriod() {
    const btn = this.page.locator('button', { hasText: /Save up to \d+-\d+%/ }).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.safeClick(btn);
      await this.waitForStable(500);
    }
  }

  async buyPolicy() {
    await this.clickButton('Buy this policy');
    await this.waitForStable(2500);
  }

  async assertOnCheckoutSummary() {
    await this.assertHeading('Policy checkout summary');
  }

  async assertSummaryMembers(expected) {
    const text = await this.page.getByRole('main').textContent({ timeout: 10000 }) ?? '';
    const g = (gender) => gender === 'Male' ? 'M' : gender === 'Female' ? 'F' : gender;

    const checks = [
      { name: 'Self',    rx: `Self\\s*\\(${g(expected.self.gender)}\\)\\s*\\(${expected.self.age}\\)` },
      { name: 'Spouse',  rx: `Spouse\\s*\\(${g(expected.spouse.gender)}\\)\\s*\\(${expected.spouse.age}\\)` },
      { name: 'Son',     rx: `Son\\s*\\(${expected.son.age}\\)` },
      { name: 'Pincode', rx: `Pin\\s*code\\s*${expected.pincode}` },
    ];

    for (const { name, rx } of checks) {
      expect(text, `${name} not found in summary`).toMatch(new RegExp(rx));
    }

    console.log(`✅ Summary: Self(${g(expected.self.gender)})${expected.self.age}, Spouse(${g(expected.spouse.gender)})${expected.spouse.age}, Son(${expected.son.age}), Pin ${expected.pincode}`);
  }

  async extractPremiumBreakdown() {
    const text = await this.page.getByRole('main').textContent({ timeout: 10000 }) ?? '';
    const amt = (p) => parseFloat((text.match(p)?.[1] ?? '0').replace(/,/g, ''));

    const base  = amt(/Base Premium\s*[₹]?\s*([\d,]+)/);
    const rec   = amt(/Recommended Add-ons\s*\(\d+\/\d+\)\s*[₹]\s*([\d,]+)/);
    const other = amt(/Other Add-ons\s*\(\d+\/\d+\)\s*[₹]\s*([\d,]+)/);
    const total = amt(/Total Premium\s*[₹]?\s*([\d,]+)/);

    const expected = base + rec + other;
    const ok = Math.abs(expected - total) <= 1;

    console.log(`Base:₹${base} + Addons:₹${rec + other} = ₹${expected} | Displayed:₹${total} | ${ok ? '✅' : '❌'}`);
    return { basePremium: base, ridersTotal: rec + other, totalPremium: total, calculatedTotal: expected, isValid: ok, tolerance: 1 };
  }
}
