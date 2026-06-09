import { BasePage } from './BasePage.js';

export class FamilyDetailsPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async selectSelfGender(gender) {
    await this.safeClick(this.page.getByText('SelfMaleFemale'));
    const genderOpt = this.page.getByText(gender).first();
    await this.safeClick(genderOpt);
    await this.waitForStable(300);
  }

  async selectSpouse(gender) {
    await this.safeClick(this.page.getByText('Spouse'));
    const genderOptions = this.page.getByText(gender);
    await this.safeClick(genderOptions.nth(1));
    await this.waitForStable(300);
  }

  async addSon(count = 1) {
    const sonLabel = this.page.locator('label').filter({ hasText: 'Son' });
    const sonRow = sonLabel.locator('xpath=..');
    const plusBtn = sonRow.locator('button[class*="ActionIcon"]').last();

    for (let i = 0; i < count; i++) {
      await plusBtn.click();
      await this.waitForStable(200);
    }
  }

  async addFather() {
    await this.safeClick(this.page.getByText('Father', { exact: true }));
    await this.waitForStable(300);
  }

  async addMother() {
    await this.safeClick(this.page.getByText('Mother', { exact: true }));
    await this.waitForStable(300);
  }

  async configureFamilyMembers(config) {
    if (config.self) await this.selectSelfGender(config.self.gender);
    if (config.spouse) await this.selectSpouse(config.spouse.gender);
    if (config.son) await this.addSon(config.son.count ?? 1);
    if (config.father) await this.addFather();
    if (config.mother) await this.addMother();

    await this.clickButton('Next step');
    await this.waitForStable(1000);
  }

  async fillSelfAge(age) {
    await this.safeFill(this.page.getByRole('textbox', { name: 'Your age' }), age);
  }

  async fillSpouseAge(age) {
    await this.safeFill(this.page.getByRole('textbox', { name: "Spouse's age" }), age);
  }

  async fillFatherAge(age) {
    await this.safeFill(this.page.getByRole('textbox', { name: "Father's age" }), age);
  }

  async fillMotherAge(age) {
    await this.safeFill(this.page.getByRole('textbox', { name: "Mother's age" }), age);
  }

  async fillSonAge(age, index = 0) {
    const labels = ["First son's age", "Second son's age", "Third son's age"];
    await this.safeFill(this.page.getByRole('textbox', { name: labels[index] }), age);
  }

  async fillPincode(pincode) {
    await this.safeFill(this.page.getByRole('textbox', { name: "Proposer's Pincode" }), pincode);
  }

  async setExistingPolicy(hasPolicy) {
    const radioValue = hasPolicy ? 'Yes' : 'No';
    await this.page.getByRole('radio', { name: radioValue }).check();
    await this.waitForStable(300);
  }

  async fillAgeForm(data) {
    if (data.selfAge) await this.fillSelfAge(data.selfAge);
    if (data.spouseAge) await this.fillSpouseAge(data.spouseAge);
    if (data.fatherAge) await this.fillFatherAge(data.fatherAge);
    if (data.motherAge) await this.fillMotherAge(data.motherAge);
    if (data.sonAge) await this.fillSonAge(data.sonAge);
    await this.fillPincode(data.pincode);
    await this.setExistingPolicy(data.hasExistingPolicy);
  }
}
