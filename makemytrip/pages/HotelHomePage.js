import { expect } from '@playwright/test';

/**
 * Page Object for MakeMyTrip Hotel Home Page
 * Handles navigation, popup dismissal, hotel category selection,
 * city search, date selection, and search submission.
 */
export class HotelHomePage {
  constructor(page) {
    this.page = page;

    // Locators for popup/modal handling
    this.loginModalCloseButton = page.locator('span[data-cy="closeModal"]').or(
      page.locator('[data-testid="closeIcon"]').first()
    ).or(
      page.getByRole('button', { name: /close|×/i }).first()
    );
    this.overlayBackdrop = page.locator('.modalOverlay, .loginModal, [data-cy="modalBackdrop"]').first();

    // Main navigation
    this.hotelsMenuItem = page.locator('li[data-cy="menu_Hotels"], a[href*="hotels"]').or(
      page.getByText('Hotels', { exact: true }).first()
    );

    // City/Destination search
    this.cityInput = page.locator('input[data-cy="city"]').or(
      page.locator('#city').or(
        page.getByPlaceholder('Enter city or property').or(
          page.getByPlaceholder('Where do you want to stay?')
        )
      )
    );
    this.cityDropdownOptions = page.locator('.react-autosuggest__suggestions-list li, .listingRhs ul li, [data-cy="citySuggestionList"] li');
    this.mumbaiOption = page.locator('text=Mumbai, India').or(
      page.getByText(/Mumbai/i).first()
    );

    // Calendar locators
    this.checkInField = page.locator('[data-cy="checkin"]').or(
      page.locator('#checkin').or(
        page.getByText('Check-In', { exact: false })
      )
    );
    this.calendarDayTiles = page.locator('.DayPicker-Day, .dateFiled__tile, [data-cy="calendarDay"]');
    this.activeCalendarDays = page.locator('.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)');

    // Search button
    this.searchButton = page.locator('button[data-cy="submit"]').or(
      page.getByRole('button', { name: /search/i }).or(
        page.locator('a[href*="hotel-listing"]').or(
          page.getByText('Search', { exact: true })
        )
      )
    );
  }

  /**
   * Navigate to MakeMyTrip homepage and handle initial popups
   */
  async navigateToHome() {
    await this.page.goto('https://www.makemytrip.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    // Wait for the page to stabilize
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    // Handle any initial login/popup modals
    await this.dismissPopups();
  }

  /**
   * Dismiss dynamic popups, login banners, and overlay modals
   */
  async dismissPopups() {
    const maxAttempts = 3;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Try clicking the close button if visible
        const closeBtn = this.loginModalCloseButton;
        if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeBtn.click({ timeout: 5000 });
          await this.page.waitForTimeout(500);
          continue;
        }

        // Try pressing Escape key to close modals
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(300);

        // Check for overlay and click outside
        const overlay = this.overlayBackdrop;
        if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
          await this.page.mouse.click(10, 10);
          await this.page.waitForTimeout(300);
        }
      } catch {
        // No popup to handle, continue
        break;
      }
    }
  }

  /**
   * Select the Hotels category from the main menu
   */
  async selectHotelsCategory() {
    await this.page.waitForSelector('li[data-cy="menu_Hotels"], a[href*="hotels"]', { timeout: 15000 });

    const hotelsTab = this.hotelsMenuItem;
    await expect(hotelsTab).toBeVisible({ timeout: 10000 });
    await hotelsTab.click();

    // Wait for hotel search form to render
    await this.page.waitForSelector('input[data-cy="city"], #city, [placeholder*="city"]', { timeout: 15000 });
    await this.page.waitForTimeout(800);
  }

  /**
   * Enter city name and select from dropdown
   * @param {string} cityName - Name of the city to search
   */
  async enterCity(cityName) {
    const cityField = this.cityInput;
    await expect(cityField).toBeVisible({ timeout: 10000 });

    // Clear and focus the field
    await cityField.click();
    await cityField.fill('');
    await cityField.fill(cityName);

    // Wait for dropdown to populate
    await this.page.waitForTimeout(1500);

    // Select the first matching option
    const option = this.mumbaiOption;
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();

    // Wait for selection to register
    await this.page.waitForTimeout(500);
  }

  /**
   * Select check-in (today) and check-out (tomorrow) dates
   */
  async selectDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format dates for matching
    const todayStr = today.getDate().toString();
    const tomorrowStr = tomorrow.getDate().toString();

    // Open calendar if not already open
    const checkIn = this.checkInField;
    if (await checkIn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkIn.click();
      await this.page.waitForTimeout(500);
    }

    // Wait for calendar to be visible
    await this.page.waitForSelector('.DayPicker-Day, .dateFiled__tile, [data-cy="calendarDay"]', { timeout: 15000 });

    // Select today's date
    const todayTile = this.page.locator(`.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)`, {
      hasText: new RegExp(`^${todayStr}$`)
    }).first();

    await expect(todayTile).toBeVisible({ timeout: 10000 });
    await todayTile.click();
    await this.page.waitForTimeout(400);

    // Select tomorrow's date
    const tomorrowTile = this.page.locator(`.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)`, {
      hasText: new RegExp(`^${tomorrowStr}$`)
    }).first();

    await expect(tomorrowTile).toBeVisible({ timeout: 10000 });
    await tomorrowTile.click();
    await this.page.waitForTimeout(400);
  }

  /**
   * Click the search button and wait for results page
   */
  async clickSearch() {
    const searchBtn = this.searchButton;
    await expect(searchBtn).toBeVisible({ timeout: 10000 });
    await expect(searchBtn).toBeEnabled({ timeout: 5000 });

    await searchBtn.click();

    // Wait for navigation to hotel listing page
    await this.page.waitForURL(/hotel-listing|hotels-in/, { timeout: 45000 });
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.page.waitForTimeout(2000);
  }
}
