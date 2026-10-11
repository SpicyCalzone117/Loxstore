# Loxstore — versi statis tanpa database

Website katalog Gamepass dan Cash Drag Drive Simulator. Dibuat dengan HTML, CSS, dan JavaScript; tidak membutuhkan PHP, MySQL, atau database.

## Deploy
1. Unggah isi folder ini ke folder publik hosting (biasanya `public_html`) atau hosting statis.
2. Pastikan `index.html` berada di folder publik dan folder `assets/` ikut diunggah.
3. Buka website melalui domain hosting HTTPS.
4. Uji katalog, pencarian, keranjang, modal checkout, QRIS, dan tombol WhatsApp.

## Checkout
Checkout membuat kode pesanan acak di browser dan membuka WhatsApp dengan rincian pesanan. Website ini tidak menyimpan pesanan di server; salinan pesanan berada pada percakapan WhatsApp setelah dikirim. Kode dibuat dengan tanggal dan karakter acak sehingga kemungkinan tabrakan sangat kecil, tetapi tidak dijamin unik secara global tanpa pencatatan server/database.

## Pembayaran
QRIS ditampilkan untuk pembayaran manual. Website tidak memverifikasi pembayaran otomatis. Admin perlu memeriksa bukti pembayaran sebelum memproses pesanan.

## Konfigurasi
Nomor WhatsApp admin diatur di `index.html` melalui `window.WHATSAPP_NUMBER`. Ubah jika nomor admin berubah. Ganti `assets/qris.png` dengan QRIS resmi toko jika diperlukan.
