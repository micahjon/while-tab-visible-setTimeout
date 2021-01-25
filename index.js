/**
 * Create a timer (similar to setTimeout) that only runs when tab is visible
 * @param {function} callback
 * @param {number} timeoutMs
 * @return {function} stopWaiting - call to abort timer
 */
export default function whileTabVisibleTimeout(callback, timeoutMs) {
    let timeoutId;
    let cleanupListener;

    if (isTabVisible()) {
        // Tab started off visible

        // Keep track of start time in case we need to pause timeout
        const startTime = Date.now();

        cleanupListener = whenNotVisible(() => {
            // Tab was hidden before timeout completed
            clearTimeout(timeoutId);
            // Wait until tab is visible again to restart timeout
            whileTabVisibleTimeout(callback, timeoutMs - (Date.now() - startTime));
        });

        // Start timer
        timeoutId = setTimeout(() => {
            cleanupListener();
            callback();
        }, timeoutMs);
    } else {
        // Tab started off hidden
        cleanupListener = whenVisible(() => {
            // Tab became visible. Start timer now.
            whileTabVisibleTimeout(callback, timeoutMs);
        });
    }

    return stopWaiting;

    function stopWaiting() {
        cleanupListener();
        clearTimeout(timeoutId);
    }
}

function whenVisible(callback) {
    return onVisibilityChange(true, callback);
}

function whenNotVisible(callback) {
    return onVisibilityChange(false, callback);
}

function onVisibilityChange(shouldBeVisible, callback) {
    document.addEventListener('visibilitychange', function onVisibilityChange() {
        if (shouldBeVisible === isTabVisible()) {
            cleanup();
            callback();
        }
    });

    return cleanup;

    function cleanup() {
        document.removeEventListener('visibilitychange', onVisibilityChange);
    }
}

function isTabVisible() {
    return document.visibilityState === 'visible';
}
