#!/bin/bash
# Gülgün bildirim fonksiyonunu yayına alır.
# Kullanım:  bash deploy.sh

set -e

PROJE="gulgun-siparis"
BOLGE="europe-west1"

echo "==> Gerekli servisler açılıyor..."
gcloud services enable \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  --project="$PROJE"

echo "==> Fonksiyon yayına alınıyor (birkaç dakika sürebilir)..."
gcloud functions deploy bildirimGonder \
  --gen2 \
  --runtime=nodejs20 \
  --region="$BOLGE" \
  --source=functions \
  --entry-point=bildirimGonder \
  --trigger-http \
  --allow-unauthenticated \
  --project="$PROJE"

echo ""
echo "==> TAMAM. Fonksiyon adresi:"
gcloud functions describe bildirimGonder \
  --gen2 --region="$BOLGE" --project="$PROJE" \
  --format="value(serviceConfig.uri)"
