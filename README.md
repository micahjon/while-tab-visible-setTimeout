# While tab visible setTimeout()

`setTimeout`-like timer that pauses when tab is not visible.

Useful when waiting for browser APIs that are throttled when tab is inactive.

`0.7kb` uglified, `0.4kb` gzipped.

```js
import whileTabVisibleTimeout from 'while-tab-visible-setTimeout';

const cancelTimer = whileTabVisibleTimeout(() => {
    console.log('Tab was active for at least 3 seconds');
}, 3000);
```
