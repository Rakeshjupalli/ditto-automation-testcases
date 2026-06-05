import { test, expect } from '@playwright/test';
import { HotelHomePage } from '../pages/HotelHomePage.js';
import { HotelListingPage } from '../pages/HotelListingPage.js';

/**
 * Test Suite: MakeMyTrip Hotel Search for Mumbai
 *
 * Scenario:
 * 1. Navigate to makemytrip.com
 * 2. Handle popups
 * 3. Select Hotels category
 * 4. Search for Mumbai
 * 5. Select current date as check-in, next day as check-out
 * 6. Submit search
 * 7. Extract all hotel names and prices through infinite scroll/pagination
 * 8. Log results to console
 */
test.describe('MakeMyTrip Hotel Search', () => {
  test('Search and list all hotels in Mumbai for current date', async ({ page }) => {
    // Initialize Page Objects
    const homePage = new HotelHomePage(page);
    const listingPage = new HotelListingPage(page);

    // Step 1 & 2: Navigate to homepage and dismiss popups
    await test.step('Navigate to MakeMyTrip homepage', async () => {
      await homePage.navigateToHome();
    });

    // Step 3: Select Hotels category
    await test.step('Select Hotels category', async () => {
      await homePage.selectHotelsCategory();
    });

    // Step 4: Enter Mumbai as destination
    await test.step('Enter Mumbai as destination', async () => {
      await homePage.enterCity('Mumbai');
    });

    // Step 5: Select dates (today check-in, tomorrow check-out)
    await test.step('Select check-in and check-out dates', async () => {
      await homePage.selectDates();
    });

    // Step 6: Click Search
    await test.step('Submit search', async () => {
      await homePage.clickSearch();
    });

    // Step 7: Wait for results and extract all hotels
    await test.step('Extract hotel listings from results page', async () => {
      await listingPage.waitForPageLoad();

      // Verify we're on the listing page
      await expect(page).toHaveURL(/hotel-listing|hotels-in/, { timeout: 30000 });

      // Extract all hotels via infinite scroll / pagination
      const hotels = await listingPage.extractAllHotels(15);

      // Assert that we found at least some hotels
      expect(hotels.length).toBeGreaterThan(0);

      // Step 8: Log all hotels cleanly
      listingPage.logHotels(hotels);

      // Additional assertion: verify each hotel has a name
      for (const hotel of hotels) {
        expect(hotel.name).toBeTruthy();
        expect(hotel.name.length).toBeGreaterThan(0);
      }
    });
  });
});
