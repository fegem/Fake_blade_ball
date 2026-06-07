# Sprint 1

- **Başlangıç:** 2026-06-07
- **Bitiş:** —
- **Durum:** 🟢 Açık
- **Branch:** `claude/tender-allen-lAj0R`
- **PR:** #3

## Hedefler

- [x] Zemin çimen olsun (mavi ızgara yerine çimen zemin)
- [x] Oyun alanı büyüsün
- [x] Oyun alanında bulutlar olsun
- [x] Daha gerçekçi çimen + genel görsel zenginlik

## Notlar

- **Oyun alanı:** canvas 800×600 → 1100×760, CSS `#game-wrap` genişliği 1100px.
  Çarpışma/hareket sınırları `W`/`H`'den türediği için otomatik uyumlu.
- **Gerçekçi çimen:** bir kez offscreen canvas'a üretilen doku (her karede
  `drawImage`). İçerik: dikey degrade + organik renk lekeleri + biçilmiş çim
  bantları + yoğun iki tonlu eğimli çim tutamları + serpiştirilmiş çiçekler +
  kenar vinyet.
- **Bulutlar:** sürüklenen, çime yumuşak gölge düşüren yarı saydam bulutlar;
  ekran kenarından sarınca başa döner. Oyuncu/top bulutların üstünde çizilir,
  böylece oynanış her zaman net.
- **Kalıcı döngü:** ana döngü artık sürekli çalışıyor (menüde de bulutlar
  hareket eder). Parçacık güncellemesi `updateParticles()` olarak ayrıldı.

## Kapanış özeti

(Sprint kapanırken doldurulacak.)
