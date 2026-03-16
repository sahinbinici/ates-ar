# 3D Model Dosyaları

Bu klasöre `.glb` (GLTF Binary) formatında 3D model dosyaları eklenecektir.

## Şu an Three.js geometrik placeholder kullanılıyor

SceneManager (`lib/ar/SceneManager.ts`) her nesne için otomatik olarak
basit geometrik şekiller oluşturur. Gerçek modeller eklendiğinde GLTFLoader
ile yüklenecektir.

## Gerekli Modeller

| Dosya               | Açıklama              | Placeholder           |
| ------------------- | --------------------- | --------------------- |
| `ates_fox.glb`      | Ateş tilki karakteri  | Turuncu küre/koni     |
| `apple.glb`         | Elma                  | Kırmızı küre          |
| `star.glb`          | Yıldız                | Sarı oktahedron       |
| `block.glb`         | Küp blok              | Mavi küp              |
| `plus.glb`          | Artı işareti          | Yeşil kutu            |
| `plate.glb`         | Tabak                 | Beyaz silindir        |
| `pizza_half.glb`    | Yarım pizza           | Turuncu yarım silindir|
| `square.glb`        | Kare şekli            | Mor düzlem            |

## Model Gereksinimleri

- Format: `.glb` (GLTF Binary)
- Maksimum poligon: ~5000 (mobil performans)
- Texture boyutu: 512x512 veya altı
- Animasyonları model içinde gömülü olmalı (Ateş için)
