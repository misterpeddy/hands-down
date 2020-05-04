// import { precaching } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  // NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
// import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// TODO Consider adding https://github.com/dahnielson/parcel-plugin-workbox
// TODO Decide if it's worth adding a register route for TFjs imports
// GA offline? https://developers.google.com/web/tools/workbox/guides/enable-offline-analytics

const ONE_WEEK = 7 * 24 * 60 * 60;
const ONE_MONTH = 30 * 24 * 60 * 60;
const ONE_YEAR = 60 * 60 * 24 * 365;

registerRoute(
  /\.(?:js|css|json)$/,
  // Use cache but update in the background.
  new StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: 'resources',
  })
);

registerRoute(
  // Cache image files.
  /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
  // Use the cache if it's available.
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: ONE_WEEK,
      }),
    ],
  })
);

registerRoute(
  /\.(?:txt|mp3)$/,
  new CacheFirst({
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: ONE_MONTH,
      }),
    ],
  })
);

registerRoute(
  'https://www.googletagmanager.com/gtag/js?id=UA-163501590-1',
  new StaleWhileRevalidate()
);

// TODO Check if group1-*.bin files go to the google-fonts cache
registerRoute(
  /\.bin$/,
  new CacheFirst({
    cacheName: 'models',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: ONE_WEEK,
        maxEntries: 30,
      }),
    ],
  })
);

// If the *.bin files remain here, perhaps consider using a /^https:\/\/fonts\.gstatic\.com/ style RE
registerRoute(
  /.*(?:googleapis|gstatic)\.com/,
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: ONE_YEAR,
        maxEntries: 30,
      }),
    ],
  })
);

registerRoute(
  /^https:\/\/cdn\.jsdelivr\.net/,
  new CacheFirst({
    cacheName: 'external-js',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: ONE_WEEK,
        maxEntries: 30,
      }),
    ],
  })
);
