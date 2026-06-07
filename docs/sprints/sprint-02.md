# Sprint 2

- **Başlangıç:** 2026-06-07
- **Bitiş:** —
- **Durum:** 🟢 Açık
- **Branch:** `claude/tender-allen-lAj0R`
- **PR:** #4

## Hedefler

- [x] iOS / mobil telefonlarda oynanabilir olsun (dokunmatik kontroller)
- [x] WhatsApp'tan paylaşılabilir bir link (GitHub Pages)

## Notlar

- **Dokunmatik kontroller:** Sol yarıda dokunulan yerde beliren **sanal
  joystick** (analog hareket), sağ yarıya dokunmak veya sağ alttaki **PARRY**
  butonu = parry. Çoklu dokunuş (Pointer Events) ile aynı anda yürü + parry.
- **Fare davranışı korundu:** masaüstünde tık = parry, klavye = hareket.
- **Responsive:** `#game-wrap` genişliği `min(100vw, 144vh, 1100px)` ile oranı
  koruyarak ekrana sığar. iOS için viewport-fit=cover, kullanıcı zoom kapalı,
  rubber-band kaydırma engellendi, küçük ekran medya sorgusu.
- **Hosting:** `.github/workflows/pages.yml` ile `main`'e her push'ta GitHub
  Pages'e dağıtım (Pages yoksa otomatik etkinleştirilir).
- **Yayın linki:** https://fegem.github.io/Fake_blade_ball/

## Kapanış özeti

(Sprint kapanırken doldurulacak.)
