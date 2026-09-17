# Over Grime Portfolio

Bağımlılık veya derleme adımı gerektirmeyen, GitHub Pages uyumlu statik portföy sitesi.

## İçerik düzeni

- `works/`: yüksek çözünürlüklü kaynak görseller
- `assets/works/large/`: Selected ve lightbox görselleri
- `assets/works/thumb/`: Archive küçük görselleri
- `data/projects.json`: proje kimlikleri, dosya grupları ve Selected/Archive durumu
- `assets/logos/`: şeffaf arka planlı referans logoları

Başlık, tarih, konum, müşteri ve açıklama alanları içerik kararı verilene kadar bilinçli olarak boş bırakılmıştır. Dosya adlarındaki `project-###` değerleri kalıcı iç kimliktir; görünür proje adı değildir.

Yeni kaynak görseller eklendikten sonra web çıktıları şu komutla yeniden hazırlanabilir:

```sh
python3 scripts/prepare_works.py
```

## Yayına alma

1. Bu klasörü bir GitHub deposuna gönderin.
2. **Settings → Pages** bölümünü açın.
3. **Deploy from a branch** seçeneğini, ardından ana dalı ve **/(root)** klasörünü seçin.

İçerik `index.html`, görünüm `styles.css`, küçük etkileşimler ise `script.js` içinden yönetilir.
