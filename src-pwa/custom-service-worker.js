/// <reference lib="webworker" />
/* eslint-env serviceworker */

import { clientsClaim } from 'workbox-core'

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

import { registerRoute } from 'workbox-routing'

import { NetworkFirst, CacheFirst } from 'workbox-strategies'

import { ExpirationPlugin } from 'workbox-expiration'

const CACHE_VERSION = 'v1.0.0'

// ----------------------
// Service Worker Setup
// ----------------------
self.skipWaiting()

clientsClaim()

// ----------------------
// Precache
// ----------------------
precacheAndRoute(self.__WB_MANIFEST || [])

cleanupOutdatedCaches()

// ----------------------
// SPA Fallback
// ----------------------
registerRoute(
  ({ request }) => request.mode === 'navigate',

  async () => {
    try {
      return await fetch('/')
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return await caches.match('/')
    }
  },
)

// ----------------------
// API CACHE
// ----------------------
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),

  new NetworkFirst({
    cacheName: `api-cache-${CACHE_VERSION}`,

    networkTimeoutSeconds: 5,

    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  }),
)

// ----------------------
// IMAGE CACHE
// ----------------------
registerRoute(
  ({ request }) => request.destination === 'image',

  new CacheFirst({
    cacheName: `image-cache-${CACHE_VERSION}`,

    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
)

// ----------------------
// FONT CACHE
// ----------------------
registerRoute(
  ({ request, url }) =>
    request.destination === 'font' ||
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com'),

  new CacheFirst({
    cacheName: `font-cache-${CACHE_VERSION}`,

    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
)

// ----------------------
// STATIC ASSET CACHE
// ----------------------
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',

  new NetworkFirst({
    cacheName: `static-assets-cache-${CACHE_VERSION}`,

    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
)

// ----------------------
// PUSH NOTIFICATION
// ----------------------
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}

  try {
    payload = event.data.json()
  } catch {
    payload = {
      data: {
        title: 'Notifikasi',
        body: event.data.text(),
      },
    }
  }

  const data = payload.data || payload.notification || {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', {
      body: data.body || '',

      icon: '/icons/icon-192x192.png',

      badge: '/icons/icon-192x192.png',

      data: {
        id: data.notrans || null,
      },
    }),
  )
})

// ----------------------
// NOTIFICATION CLICK
// ----------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const notifId = event.notification.data?.id

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({
              type: 'OPEN_DETAIL',
              id: notifId,
            })

            return client.focus()
          }
        }

        return clients.openWindow('/notif')
      }),
  )
})

// ----------------------
// SKIP WAITING
// ----------------------
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
