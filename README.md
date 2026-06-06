# Fake Blade Ball

Murat Kaan Game Center

Blade Ball tarzı, tarayıcıda çalışan bir refleks oyunu. Ölümcül top sürekli
üstüne homing yapar; doğru zamanda **parry** ederek savuşturursun. Her parry'de
top hızlanır. Kaçırırsan oyun biter.

## Nasıl oynanır

| Tuş | Aksiyon |
| --- | --- |
| `WASD` / Ok tuşları | Hareket |
| `SPACE` (veya tıkla/dokun) | Parry — topu savuştur |

- Top üstüne gelirken doğru anda parry yap.
- Her başarılı parry skoru ve top hızını artırır.
- Parry'nin kısa bir bekleme süresi (cooldown) vardır — boşa harcama.

## Çalıştırma

Sunucuya gerek yok, saf HTML/CSS/JS:

```bash
# Dosyayı doğrudan tarayıcıda aç
open index.html        # macOS
xdg-open index.html    # Linux

# veya basit bir yerel sunucu ile
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

## Teknoloji

- HTML5 Canvas + saf JavaScript (bağımlılık yok)
- En iyi skor `localStorage` ile saklanır

## Dosyalar

- `index.html` — sayfa iskeleti, HUD ve menü
- `style.css` — görsel stil
- `game.js` — oyun mantığı (hareket, homing top, parry, çarpışma, parçacıklar)
