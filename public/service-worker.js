import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// TODO Consider adding https://github.com/dahnielson/parcel-plugin-workbox
// GA offline? https://developers.google.com/web/tools/workbox/guides/enable-offline-analytics

const ONE_WEEK = 7 * 24 * 60 * 60;
const ONE_MONTH = 30 * 24 * 60 * 60;
const ONE_YEAR = 60 * 60 * 24 * 365;

registerRoute(
  /\.(?:js|css|json)$/,
  new StaleWhileRevalidate({
    cacheName: 'resources',
  })
);

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
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
// If they do then consider using a /^https:\/\/fonts\.gstatic\.com/ style RE
registerRoute(
  /.*(?:storage.googleapis)\.com/,
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

registerRoute(
  /.*(?:fonts.googleapis|gstatic)\.com/,
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
