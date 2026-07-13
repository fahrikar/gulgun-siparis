/* firebase-messaging-sw.js
   ZORUNLU: Bu dosya site kökünde (index.html ile aynı klasörde) durmalı.
   Telefon/uygulama kapalıyken bildirimi bu servis worker gösterir. */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

/* index.html'deki firebaseConfig ile AYNI olmalı */
firebase.initializeApp({
  apiKey: "AIzaSyDQeCLGHQUxO0uQx42ypa4pqXuWOaWsI2I",
  authDomain: "gulgun-siparis.firebaseapp.com",
  projectId: "gulgun-siparis",
  storageBucket: "gulgun-siparis.firebasestorage.app",
  messagingSenderId: "936393876926",
  appId: "1:936393876926:web:3979b2869b7a7f717fc5ef"
});

const messaging = firebase.messaging();

/* Cloud Function data-only mesaj gönderir; bildirimi burada oluşturuyoruz
   (böylece iOS/Android'de çift bildirim olmaz). */
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'Yeni Gülgün siparişi', {
    body: d.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: d.orderId || 'gulgun',
    data: { url: (self.registration.scope || '/') + '?admin=1' }
  });
});

/* Bildirime dokununca yönetim panelini aç */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) ||
              (self.registration.scope + '?admin=1');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) { if (w.url.includes('admin') && 'focus' in w) return w.focus(); }
      return clients.openWindow(url);
    })
  );
});
