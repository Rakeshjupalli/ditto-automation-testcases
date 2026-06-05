import { expect } from '@playwright/test';

/**
 * Page Object for MakeMyTrip Hotel Listing/Results Page
 * Handles infinite scroll, pagination, and extraction of hotel names & prices.
 */
export class HotelListingPage {
  constructor(page) {
    this.page = page;

    // Hotel card locators - resilient multi-strategy selectors
    this.hotelCards = page.locator(
      '[data-cy="hotelCard"], .hotelCard, .listingHotelDescription, [class*="hotelCard"], [class*="HotelCard"]'
    );

    // Hotel name within a card
    this.hotelNameLocator = page.locator(
      '[data-cy="hotelName"], .hotelName, h3[class*="name"], [class*="hotelName"] span, p[id*="hotel_name"]'
    );

    // Price locators - MMT shows prices in various formats
    this.priceLocator = page.locator(
      '[data-cy="price"], .price, .latoBlack, [class*="Price"], [class*="price"], span[id*="price"]'
    );

    // Per-night / total price indicators
    this.perNightText = page.locator('text=/per night|Per Night|night/i');
    this.totalText = page.locator('text=/total|Total/i');

    // Pagination / Load More
    this.loadMoreButton = page.locator(
      'button:has-text("Load More"), [data-cy="loadMore"], a:has-text("Load More"), button:has-text("Show More")'
    );
    this.nextPageButton = page.locator(
      '[data-cy="next"], .pagination__next, a:has-text("Next"), button:has-text("Next")'
    );
    this.paginationContainer = page.locator('.pagination, [data-cy="pagination"]');

    // Loading indicators
    this.loaderSpinner = page.locator('.loader, .spinner, [class*="loading"], [data-cy="loader"]');

    // Sort/filter elements that indicate page readiness
    this.sortDropdown = page.locator('[data-cy="sort"], select[id*="sort"]').first();
    this.resultCountText = page.locator('[data-cy="count"], [class*="count"]').first();
  }

  /**
   * Wait for the hotel listing page to fully load
   */
  async waitForPageLoad() {
    // Wait for URL to confirm we're on listing page
    await this.page.waitForURL(/hotel-listing|hotels-in/, { timeout: 45000 });

    // Wait for network to settle
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    // Wait for at least one hotel card or a no-results indicator
    await this.page.waitForSelector(
      '[data-cy="hotelCard"], .hotelCard, .listingHotelDescription, [class*="hotelCard"], [class*="noResults"], [class*="emptyState"]',
      { timeout: 30000 }
    );

    // Extra wait for dynamic price rendering
    await this.page.waitForTimeout(2500);
  }

  /**
   * Extract all visible hotel names and prices from the current viewport
   * @returns {Promise<Array<{name: string, price: string}>>}
   */
  async extractVisibleHotels() {
    const hotels = [];

    // Get all hotel cards currently in DOM
    const cards = this.hotelCards;
    const count = await cards.count();

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      try {
        // Scroll card into view to ensure prices are loaded
        await card.scrollIntoViewIfNeeded({ timeout: 5000 });
        await this.page.waitForTimeout(200);

        // Extract hotel name
        const nameElement = card.locator('h3, [data-cy="hotelName"], .hotelName, [class*="name"], p[id*="hotel_name"]').first();
        const name = await nameElement.textContent({ timeout: 5000 }).catch(() => null);

        // Extract price - try multiple strategies
        let price = null;

        // Strategy 1: Direct price element within card
        const priceElement = card.locator('[data-cy="price"], .latoBlack, [class*="Price"], [class*="price"]').first();
        price = await priceElement.textContent({ timeout: 3000 }).catch(() => null);

        // Strategy 2: Look for rupee symbol or numeric price patterns
        if (!price) {
          const allText = await card.textContent({ timeout: 3000 }).catch(() => '');
          const priceMatch = allText.match(/₹\s*[\d,]+/);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }

        // Strategy 3: Look for per night text sibling
        if (!price) {
          const perNightEl = card.locator('text=/₹.*per night|Per Night/i').first();
          price = await perNightEl.textContent({ timeout: 2000 }).catch(() => null);
        }

        if (name) {
          hotels.push({
            name: this.sanitizeText(name),
            price: price ? this.sanitizeText(price) : 'Price not available'
          });
        }
      } catch (error) {
        // Log and continue to next card
        console.warn(`Failed to extract hotel at index ${i}:`, error.message);
      }
    }

    return hotels;
  }

  /**
   * Handle infinite scroll by scrolling to bottom and loading more hotels
   * @param {number} maxScrolls - Maximum number of scroll iterations
   * @returns {Promise<Array<{name: string, price: string}>>} All extracted hotels
   */
  async extractAllHotels(maxScrolls = 10) {
    const allHotels = [];
    const seenNames = new Set();
    let previousCount = 0;
    let scrollAttempts = 0;

    while (scrollAttempts < maxScrolls) {
      // Extract currently visible hotels
      const visibleHotels = await this.extractVisibleHotels();

      // Add new unique hotels
      for (const hotel of visibleHotels) {
        if (!seenNames.has(hotel.name)) {
          seenNames.add(hotel.name);
          allHotels.push(hotel);
        }
      }

      console.log(`Scroll ${scrollAttempts + 1}: Found ${visibleHotels.length} visible hotels. Total unique: ${allHotels.length}`);

      // Check if we got new hotels
      if (allHotels.length === previousCount) {
        // Try clicking "Load More" if available
        const loadMore = this.loadMoreButton;
        if (await loadMore.isVisible({ timeout: 3000 }).catch(() => false)) {
          await loadMore.click();
          await this.page.waitForTimeout(2500);

          // Wait for loader to disappear
          await this.loaderSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
          scrollAttempts++;
          continue;
        }

        // Try clicking "Next" pagination if available
        const nextPage = this.nextPageButton;
        if (await nextPage.isVisible({ timeout: 3000 }).catch(() => false) &&
            await nextPage.isEnabled({ timeout: 2000 }).catch(() => false)) {
          await nextPage.click();
          await this.page.waitForTimeout(2500);
          scrollAttempts++;
          continue;
        }

        // No more content to load
        console.log('No more hotels to load.');
        break;
      }

      previousCount = allHotels.length;

      // Scroll to bottom to trigger lazy loading
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(2000);

      // Wait for any loaders to disappear
      await this.loaderSpinner.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

      scrollAttempts++;
    }

    return allHotels;
  }

  /**
   * Log all extracted hotels in a clean format
   * @param {Array<{name: string, price: string}>} hotels
   */
  logHotels(hotels) {
    console.log('\n========================================');
    console.log('   MAKE MY TRIP - MUMBAI HOTELS');
    console.log(`   Check-in: ${new Date().toLocaleDateString()}`);
    console.log(`   Total Hotels Found: ${hotels.length}`);
    console.log('========================================\n');

    hotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.name}`);
      console.log(`   Price: ${hotel.price}`);
      console.log('');
    });

    console.log('========================================');
    console.log(`End of listing - ${hotels.length} hotels displayed.`);
    console.log('========================================\n');
  }

  /**
   * Sanitize text by trimming whitespace and removing extra spaces
   * @param {string} text
   * @returns {string}
   */
  sanitizeText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }
}
