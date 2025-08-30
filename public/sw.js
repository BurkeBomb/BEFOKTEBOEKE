const CACHE_NAME = 'burkebooks-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'book-sync') {
    event.waitUntil(syncBooks());
  }
});

async function syncBooks() {
  // Sync any pending book additions when back online
  const pendingBooks = await getStoredBooks();
  for (const book of pendingBooks) {
    try {
      await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
    } catch (error) {
      console.log('Sync failed for book:', book.title);
    }
  }
}

async function getStoredBooks() {
  // Implementation would retrieve books from IndexedDB
  return [];
}