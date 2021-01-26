const playwright = require('playwright');

describe('Tab Visibility Tests', () => {
    const localPath = 'http://localhost:5000/__tests__';
    let browser, page1, page2;

    // Lauch new headless page (which just loads UMD library)
    beforeAll(async () => {
        browser = await playwright.chromium.launch();
        page1 = await browser.newPage();
        await page1.goto(localPath);
        page1.once('load', () => {
            console.log('>> Page has loaded');
        });
        page1.on('console', (msg) => console.log(msg.text()));
    });

    // Close browser
    afterAll(async () => {
        return await browser.close();
    });

    test('Identical to setTimeout when tab is visible', async () => {
        const comparisons = await page.evaluate(async () => {
            return new Promise((resolve) => {
                const startTime = Date.now();
                // Should behave similarly to setTimeout
                const timesToTest = [0, 100, 1000];
                const results = {};
                timesToTest.forEach((timeMs) => {
                    setTimeout(() => {
                        const interval = Date.now() - startTime;
                        results[timeMs] = results[timeMs] || {};
                        results[timeMs].setTimeout = interval;
                    }, timeMs);
                    whileTabVisibleTimeout(() => {
                        const interval = Date.now() - startTime;
                        results[timeMs] = results[timeMs] || {};
                        results[timeMs].whileTabVisibleTimeout = interval;
                    }, timeMs);
                });
                setTimeout(() => resolve(results), Math.max(...timesToTest) + 100);
            });
        });

        // Are both timers within 1 ms?
        const nearlySameTimes = Object.values(comparisons).every(
            ({ setTimeout, whileTabVisibleTimeout }) => {
                return Math.abs(setTimeout - whileTabVisibleTimeout) <= 1;
            }
        );
        if (!nearlySameTimes) {
            console.log(comparisons);
        }

        expect(nearlySameTimes).toBe(true);
    });

    test('Waits when tab is hidden', async () => {
        // @todo -> how to make tab inactive in Playwright?
        // https://github.com/microsoft/playwright/issues/2286
    });
});
