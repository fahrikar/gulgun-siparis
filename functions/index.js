/* functions/index.js — Gülgün sipariş bildirimi (HTTP)
   Uygulama sipariş kaydettikten sonra bu adresi çağırır, bu da push gönderir. */

const functions = require('@google-cloud/functions-framework');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

/* Basit paylaşılan anahtar — uygulama dışından çağrılmasın diye */
const GIZLI = 'gunkar-gulgun-2026';

functions.http('bildirimGonder', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

  try {
    const govde = req.body || {};
    if (govde.anahtar !== GIZLI) { res.status(403).json({ hata: 'yetkisiz' }); return; }

    const baslik = govde.baslik || 'Yeni Gülgün siparişi';
    const metin  = govde.metin  || '';

    const snap = await getFirestore().collection('push_tokens').get();
    const tokens = snap.docs.map((d) => d.data().token).filter(Boolean);

    if (!tokens.length) { res.json({ ok: true, gonderilen: 0, not: 'kayıtlı cihaz yok' }); return; }

    const sonuc = await getMessaging().sendEachForMulticast({
      tokens,
      data: { title: baslik, body: metin },
      webpush: { headers: { Urgency: 'high' } }
    });

    const silinecek = [];
    sonuc.responses.forEach((r, i) => {
      if (!r.success) {
        const kod = r.error && r.error.code;
        if (kod === 'messaging/registration-token-not-registered' ||
            kod === 'messaging/invalid-registration-token' ||
            kod === 'messaging/invalid-argument') {
          silinecek.push(getFirestore().collection('push_tokens').doc(tokens[i]).delete());
        }
      }
    });
    await Promise.all(silinecek);

    res.json({ ok: true, gonderilen: sonuc.successCount, toplam: tokens.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ hata: String((e && e.message) || e) });
  }
});
