/// <reference lib="webworker" />
/* eslint-env serviceworker */

import { clientsClaim } from 'workbox-core'

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'

import { NavigationRoute, registerRoute } from 'workbox-routing'

import { NetworkFirst, CacheFirst } from 'workbox-strategies'

import { ExpirationPlugin } from 'workbox-expiration'

const CACHE_VERSION = 'v2.0.0'
const API_CACHE = `api-cache-${CACHE_VERSION}`
const IMAGE_CACHE = `image-cache-${CACHE_VERSION}`
const FONT_CACHE = `font-cache-${CACHE_VERSION}`
const STATIC_ASSETS_CACHE = `static-assets-cache-${CACHE_VERSION}`
const CURRENT_RUNTIME_CACHES = new Set([API_CACHE, IMAGE_CACHE, FONT_CACHE, STATIC_ASSETS_CACHE])
const RUNTIME_CACHE_PREFIXES = ['api-cache-', 'image-cache-', 'font-cache-', 'static-assets-cache-']

// ----------------------
// Service Worker Setup
// ----------------------
self.skipWaiting()

clientsClaim()

// ----------------------
// Precache
// ----------------------
precacheAndRoute(self.__WB_MANIFEST)

cleanupOutdatedCaches()

// ----------------------
// Runtime Cache Cleanup
// ----------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              RUNTIME_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix)) &&
              !CURRENT_RUNTIME_CACHES.has(cacheName),
          )
          .map((cacheName) => {
            console.info('[PWA Update]', `Menghapus runtime cache lama: ${cacheName}`)
            return caches.delete(cacheName)
          }),
      ),
    ),
  )
})

// ----------------------
// SPA Fallback
// ----------------------
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// ----------------------
// API CACHE
// ----------------------
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),

  new NetworkFirst({
    cacheName: API_CACHE,

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
    cacheName: IMAGE_CACHE,

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
    cacheName: FONT_CACHE,

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
    cacheName: STATIC_ASSETS_CACHE,

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
