/* firebase-messaging-sw.js — GÜLGÜN
   ZORUNLU: Bu dosya index.html ile aynı klasörde durmalı.
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

/* Bu servis worker SADECE bu uygulamaya ait */
const UYGULAMA = 'gulgun';

const messaging = firebase.messaging();

/* Cloud Function data-only mesaj gönderir; bildirimi burada oluşturuyoruz */
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'Gülgün Sipariş', {
    body: d.body || '',
    icon: './logo.png',
    badge: './logo.png',
    tag: UYGULAMA + '-' + (d.orderId || 'genel'),
    data: { url: self.registration.scope + '?admin=1' }
  });
});

/* Bildirime dokununca SADECE bu uygulamanın penceresini aç */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const kapsam = self.registration.scope;
  const url = (event.notification.data && event.notification.data.url) || (kapsam + '?admin=1');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.startsWith(kapsam) && 'focus' in w) return w.focus();
      }
      return clients.openWindow(url);
    })
  );
});