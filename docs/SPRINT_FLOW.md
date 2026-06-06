# Sprint Akışı

Bu proje, Vertiservices'tekine benzer şekilde **sprint'ler** halinde ilerler.
Akış sohbet üzerinden iki komutla yönetilir.

## Komutlar

### `Sprint'i aç`
Yeni bir sprint başlatır. Bu komutla:

1. Bir sonraki sprint numarası belirlenir.
2. `docs/sprints/sprint-XX.md` dosyası oluşturulur (hedefler + görev listesi).
3. Geliştirme bir feature branch'inde yapılır.
4. Sprint için bir **draft PR** açık tutulur (main'e doğru).
5. Verdiğin hedefler sprint dosyasına işlenir.

> Hedefleri komutla birlikte verebilirsin:
> `Sprint'i aç: çoklu top, ses efektleri, mobil joystick`

### `Sprinti kapat`
Aktif sprinti tamamlar. Bu komutla:

1. CI'ın **yeşil** olduğu doğrulanır (kırmızıysa önce düzeltilir).
2. Sprint dosyasındaki görevler işaretlenir / özet yazılır.
3. PR **ready** hale getirilir ve **`main` branch'ine merge** edilir.
4. Sprint, `docs/sprints/README.md` günlüğünde **kapandı** olarak işaretlenir.

## Kurallar

- Her sprint = bir sprint dosyası + bir PR.
- Sprint kapanırken değişiklikler **her zaman `main`'e merge** edilir.
- CI yeşil olmadan sprint kapatılmaz.
- Bir sonraki sprint, `main`'in güncel hali üzerinden yeni bir branch ile başlar.

## CI

Her PR'da ve `main`'e push'ta `.github/workflows/ci.yml` çalışır:
- Tüm `.js` dosyaları için sözdizimi kontrolü (`node --check`)
- Zorunlu dosyaların varlığı (`index.html`, `style.css`, `game.js`)
- `index.html` içinde referans verilen yerel dosyaların gerçekten var olması
