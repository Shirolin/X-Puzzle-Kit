# Chrome 网上应用店 本地化文案（复制粘贴稿）

> **本文件由 `scripts/gen-store-copy.js` 从 `src/_locales/*/messages.json` 生成，请勿手工编辑。**
> 修改文案请改 `_locales`，然后执行 `npm run store-copy`。

## 哪些是自动的，哪些要手填

| 字段                                | 来源                                                  | 是否需要手动操作                     |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------ |
| **名称 (Name)**                     | 上传包 `_locales/<locale>/messages.json` 的 `appName` | 否，随新版本包自动生效               |
| **简短描述 (Summary)**              | 上传包 `_locales/<locale>/messages.json` 的 `appDesc` | 否，随新版本包自动生效               |
| **详细描述 (Detailed description)** | 仅存在于 Dashboard                                    | **是**，每个语言都要单独粘贴（见下） |
| **截图**                            | 仅存在于 Dashboard                                    | **是**，每个语言可单独上传           |

字段上限：名称 75 字符、简短描述 132 字符、详细描述 16000 字符。

## 操作步骤

1. 打开 [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) 中本扩展的条目。
2. 进入 **Store listing** 标签页，在语言选择器中依次选择下表对应的语言。
3. 把「详细描述」一节对应的文本整段粘贴进 _Detailed description_ 输入框并保存。
4. 全部语言处理完后，回到 **Package** 标签页提交审核。

## 语言对照表

| manifest 目录 | Dashboard 语言代码 | 名称长度 | 简短描述长度 | 详细描述长度 |
| ------------- | ------------------ | -------- | ------------ | ------------ |
| `en`          | `en`               | 41       | 102          | 2304         |
| `de`          | `de`               | 49       | 117          | 2795         |
| `es`          | `es`               | 49       | 110          | 2747         |
| `fr`          | `fr`               | 43       | 125          | 2909         |
| `id`          | `id`               | 43       | 118          | 2431         |
| `it`          | `it`               | 44       | 115          | 2723         |
| `ja`          | `ja`               | 25       | 101          | 1233         |
| `ko`          | `ko`               | 34       | 99           | 1319         |
| `pt_BR`       | `pt-BR`            | 44       | 131          | 2726         |
| `ru`          | `ru`               | 52       | 123          | 2537         |
| `tr`          | `tr`               | 46       | 129          | 2538         |
| `uk`          | `uk`               | 52       | 119          | 2445         |
| `zh_CN`       | `zh-CN`            | 28       | 65           | 847          |
| `zh_TW`       | `zh-TW`            | 28       | 65           | 856          |

## en — Dashboard 代码 `en`

**名称 (Name)**

```text
X-Puzzle-Kit: Stitch & Split Images for X
```

**简短描述 (Summary)**

```text
Stitch panoramas or split grids for X (Twitter). Pixel-perfect, timeline-optimized & lossless quality.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit is a professional image stitcher and grid splitter designed specifically for X (Twitter) users, digital artists, and collectors. Whether you're reconstructing a multi-part panorama or preparing a creative grid reveal, X-Puzzle-Kit ensures your content looks exactly as intended on the X timeline.

🌐 CROSS-PLATFORM SUPPORT:
In addition to this Chrome extension, we provide a full-featured Web version (https://x-puzzle-kit.pages.dev/) for seamless use on mobile devices, tablets, and other browsers.

✨ CORE CAPABILITIES:

🧵 Intelligent Image Stitching
Seamlessly merge separate Tweet images back into their original panorama or long-form format.
- Smart Layouts: Full support for Vertical, Horizontal, 2x2 Grid, and the signature T-Shape layouts.
- Pixel-Perfect Alignment: Advanced coordinate calculation eliminates 1px seams and blurry artifacts.
- Native Integration: Stitch images directly from your X timeline with a single click—no manual saving required.
- Lossless Export: Preserves every pixel in its original resolution. No compression, no quality loss.

✂️ Creative Grid Splitter (Mosaic Maker)
Break down any large image into standardized grids (2x2, or custom) optimized for the X multi-image display.
- Twitter "Seamless Flow" Optimization: Optimized for Twitter's preview mechanism. Ensures multiple splits stitch back into a single "seamless image" in the timeline by perfectly matching X's preview ratios.
- Right-click & Split: Instantly send any web image to the splitter directly from your browser's context menu.
- Unified Storytelling: Create consistent, engaging "reveal" effects for your feed.

🚀 POWER FEATURES:
- Smooth Workflow: Move from timeline to canvas in seconds with deep browser integration.
- Professional Customization: Fine-tune global/local gaps, toggle Dark Mode, and choose custom background colors (including transparency).
- Easy Import: Support for file uploads and clipboard pasting alongside native X integration.
- Batch Export: Save your creations as high-quality PNG, JPG, or WebP files, or a single organized ZIP package.

🔒 COMMITTED TO PRIVACY
Your images never leave your browser. All processing is done locally on your machine—no remote uploads, no tracking, and total security.

Enhance your X storytelling with X-Puzzle-Kit today.
```

## de — Dashboard 代码 `de`

**名称 (Name)**

```text
X-Puzzle-Kit: Bilder für X zusammenfügen & teilen
```

**简短描述 (Summary)**

```text
Erstellen Sie nahtlose Panoramen oder Raster für X (Twitter). Pixelgenau, Timeline-optimiert & verlustfreie Qualität.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit ist ein professionelles Tool zum Zusammenfügen und Teilen von Bildern, das speziell für X (Twitter)-Nutzer, digitale Künstler und Sammler entwickelt wurde. Egal, ob Sie ein mehrteiliges Panorama rekonstruieren oder ein kreatives Raster-Reveal vorbereiten möchten, X-Puzzle-Kit stellt sicher, dass Ihre Inhalte auf der X-Timeline genau so aussehen, wie sie beabsichtigt sind.

🌐 PLATTFORMÜBERGREIFENDE UNTERSTÜTZUNG:
Zusätzlich zu dieser Chrome-Erweiterung bieten wir eine voll funktionsfähige Web-Version (https://x-puzzle-kit.pages.dev/) für die nahtlose Nutzung auf Mobilgeräten, Tablets und anderen Browsern an.

✨KERNFUNKTIONEN:

🧵 Intelligentes Zusammenfügen von Bildern
Fügen Sie separate Tweet-Bilder nahtlos wieder in ihr ursprüngliches Panorama- oder Langformat zusammen.
- Smart Layouts: Volle Unterstützung für vertikale, horizontale, 2x2-Raster- und die charakteristischen T-Form-Layouts.
- Pixelgenaue Ausrichtung: Fortschrittliche Koordinatenberechnung eliminiert 1px-Nähte und verschwommene Artefakte.
- Native Integration: Fügen Sie Bilder mit einem einzigen Klick direkt von Ihrer X-Timeline zusammen – kein manuelles Speichern erforderlich.
- Verlustreier Export: Bewahrt jeden Pixel in seiner ursprünglichen Auflösung. Keine Kompression, kein Qualitätsverlust.

✂️ Kreativer Raster-Splitter (Mosaic Maker)
Unterteilen Sie jedes große Bild in Standardraster (2x2 oder benutzerdefiniert), die für die X-Multibildanzeige optimiert sind.
- Twitter "Seamless Flow" Optimierung: Optimiert für den Vorschaumechanismus von Twitter. Stellt sicher, dass mehrere Teilstücke in der Timeline wieder zu einem einzigen "nahtlosen Bild" zusammengefügt werden, indem die Vorschauraten von X perfekt angepasst werden.
- Rechtsklick & Teilen: Senden Sie jedes Webbild sofort direkt aus dem Kontextmenü Ihres Browsers an den Splitter.
- Einheitliches Storytelling: Erstellen Sie konsistente, ansprechende "Reveal"-Effekte für Ihren Feed.

🚀 POWER-FUNKTIONEN:
- Schneller Workflow: Wechseln Sie dank tiefer Browser-Integration in Sekundenschnelle von der Timeline zur Leinwand.
- Professionelle Anpassung: Verfeinern Sie globale/lokale Lücken, schalten Sie den Dunkelmodus um und wählen Sie benutzerdefinierte Hintergrundfarben (einschließlich Transparenz).
- Einfacher Import: Unterstützung für Dateiuploads und Einfügen aus der Zwischenablage neben der nativen X-Integration.
- Batch-Export: Speichern Sie Ihre Kreationen als hochwertige PNG-, JPG- oder WebP-Dateien oder als ein einziges organisiertes ZIP-Paket.

🔒 DEM DATENSCHUTZ VERPFLICHTET
Ihre Bilder verlassen niemals Ihren Browser. Die gesamte Verarbeitung erfolgt lokal auf Ihrem Rechner – keine Remote-Uploads, kein Tracking und absolute Sicherheit.

Verbessern Sie noch heute Ihr Storytelling auf X mit X-Puzzle-Kit.
```

## es — Dashboard 代码 `es`

**名称 (Name)**

```text
X-Puzzle-Kit: Ensamblar y Dividir Imágenes para X
```

**简短描述 (Summary)**

```text
Kit para X (Twitter): Ensambla panorámicas o crea cuadrículas. Optimizado para el timeline y calidad original.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit es un ensamblador de imágenes y divisor de cuadrícula profesional diseñado específicamente para usuarios de X (Twitter), artistas digitales y coleccionistas. Ya sea que estés reconstruyendo un panorama de varias piezas o preparando una revelación de cuadrícula creativa, X-Puzzle-Kit garantiza que tu contenido se vea exactamente como se diseñó en el timeline de X.

🌐 SOPORTE MULTIPLATAFORMA:
Además de esta extensión de Chrome, ofrecemos una versión web completa (https://x-puzzle-kit.pages.dev/) para un uso fluido en dispositivos móviles, tablets y otros navegadores.

✨ CAPACIDADES PRINCIPALES:

🧵 Ensamblado Inteligente de Imágenes
Combina de forma fluida imágenes de Tweets separadas para que vuelvan a su formato panorámico u original.
- Diseños Inteligentes: Soporte completo para cuadrícula vertical, horizontal, 2x2 y los diseños característicos en forma de T.
- Alineación Píxel por Píxel: El cálculo de coordenadas avanzado elimina las costuras de 1px y los artefactos borrosos.
- Integración Nativa: Ensambla imágenes directamente desde tu timeline de X con un solo clic, sin necesidad de guardarlas manualmente.
- Exportación sin Pérdida: Preserva cada píxel en su resolución original. Sin compresión, sin pérdida de calidad.

✂️ Divisor de Cuadrícula Creativo (Creador de Mosaicos)
Divide cualquier imagen grande en cuadrículas estándar (2x2 o personalizadas) optimizadas para la visualización de varias imágenes de X.
- Optimización de "Flujo Fluido" de Twitter: Optimizado para el mecanismo de vista previa de Twitter. Garantiza que las divisiones múltiples se vuelvan a unir en una sola "imagen fluida" en el timeline al coincidir perfectamente con los ratios de vista previa de X.
- Clic Derecho y Dividir: Envía instantáneamente cualquier imagen web al divisor directamente desde el menú contextual de tu navegador.
- Narrativa Unificada: Crea efectos de "revelación" consistentes y atractivos para tu feed.

🚀 FUNCIONES AVANZADAS:
- Flujo de Trabajo Sencillo: Pasa del timeline al lienzo en segundos con una profunda integración en el navegador.
- Personalización Profesional: Ajusta los espacios globales y locales, cambia al Modo Oscuro y elige colores de fondo personalizados (incluida la transparencia).
- Importación Fácil: Soporte para carga de archivos y pegado desde el portapapeles junto con la integración nativa de X.
- Exportación por Lotes: Guarda tus creaciones como archivos PNG, JPG o WebP de alta calidad, o en un único paquete ZIP organizado.

🔒 COMPROMETIDOS CON LA PRIVACIDAD
Tus imágenes nunca salen de tu navegador. Todo el procesamiento se realiza localmente en tu equipo: sin cargas remotas, sin seguimiento y con total seguridad.

Mejora hoy mismo tu narrativa en X con X-Puzzle-Kit.
```

## fr — Dashboard 代码 `fr`

**名称 (Name)**

```text
X-Puzzle-Kit : Assemblage et Découpe pour X
```

**简短描述 (Summary)**

```text
Assemblez des panoramas ou créez des grilles pour X (Twitter). Qualité originale, optimisé pour le fil et alignement parfait.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit est un assembleur d'images et un diviseur de grille professionnel conçu spécifiquement pour les utilisateurs de X (Twitter), les artistes numériques et les collectionneurs. Que vous reconstruisiez un panorama en plusieurs parties ou que vous prépariez une révélation de grille créative, X-Puzzle-Kit garantit que votre contenu apparaisse exactement comme prévu sur le fil X.

🌐 SUPPORT MULTIPLATEFORME :
En plus de cette extension Chrome, nous proposons une version Web complète (https://x-puzzle-kit.pages.dev/) pour une utilisation fluide sur les appareils mobiles, les tablettes et autres navigateurs.

✨ CAPACITÉS CLÉS :

🧵 Assemblage d'images intelligent
Fusionnez de manière transparente des images de Tweets séparées pour recréer leur format panoramique ou long d'origine.
- Layouts Intelligents : Support complet pour les formats Vertical, Horizontal, Grille 2x2 et les mises en page signature en forme de T.
- Alignement au pixel près : Le calcul avancé des coordonnées élimine les coutures d'un pixel et les flous.
- Intégration Native : Assemblez des images directement depuis votre fil X en un seul clic — aucune sauvegarde manuelle n'est requise.
- Exportation sans perte : Préserve chaque pixel dans sa résolution d'origine. Pas de compression, pas de perte de qualité.

✂️ Diviseur de grille créatif (Créateur de mosaïques)
Divisez n'importe quelle image de grande taille en grilles standard (2x2 ou personnalisées) optimisées pour l'affichage multi-images de X.
- Optimisation Twitter "Seamless Flow" : Optimisé pour le mécanisme de prévisualisation de Twitter. Garantit que les multiples divisions se réassemblent en une seule "image sans couture" dans le fil en respectant parfaitement les ratios de prévisualisation de X.
- Clic droit & Diviser : Envoyez instantanément n'importe quelle image Web vers le diviseur directement depuis le menu contextuel de votre navigateur.
- Narration unifiée : Créez des effets de "révélation" cohérents et attrayants pour votre fil d'actualité.

🚀 FONCTIONNALITÉS PUISSANTES :
- Flux de travail fluide : Passez du fil d'actualité au canevas en quelques secondes grâce à une intégration poussée au navigateur.
- Personnalisation professionnelle : Ajustez les espacements globaux/locaux, activez le mode sombre et choisissez des couleurs de fond personnalisées (transparence incluse).
- Importation facile : Supporte le téléchargement de fichiers et le collage depuis le presse-papiers parallèlement à l'intégration native de X.
- Exportation par lot : Enregistrez vos créations aux formats PNG, JPG ou WebP de haute qualité, ou dans une archive ZIP organisée.

🔒 ENGAGÉS POUR LA CONFIDENTIALITÉ
Vos images ne quittent jamais votre navigateur. Tout le traitement est effectué localement sur votre ordinateur — aucun téléchargement à distance, aucun suivi, sécurité totale.

Améliorez votre narration sur X avec X-Puzzle-Kit dès aujourd'hui.
```

## id — Dashboard 代码 `id`

**名称 (Name)**

```text
X-Puzzle-Kit: Gabung & Pisah Gambar untuk X
```

**简短描述 (Summary)**

```text
Gabungkan panorama atau pisahkan kisi untuk X (Twitter). Presisi piksel, dioptimalkan untuk timeline & tanpa kompresi.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit adalah penggabung gambar dan pemisah kisi profesional yang dirancang khusus untuk pengguna X (Twitter), seniman digital, dan kolektor. Baik Anda merekonstruksi panorama multi-bagian atau menyiapkan pengungkapan kisi yang kreatif, X-Puzzle-Kit memastikan konten Anda tampil persis seperti yang diinginkan di timeline X.

🌐 DUKUNGAN LINTAS PLATFORM:
Selain ekstensi Chrome ini, kami menyediakan versi Web lengkap (https://x-puzzle-kit.pages.dev/) untuk penggunaan lancar di perangkat seluler, tablet, dan browser lain.

✨ KEMAMPUAN INTI:

🧵 Penggabungan Gambar Cerdas
Gabungkan gambar Tweet terpisah kembali ke panorama asli atau format panjang secara mulus.
- Tata letak cerdas: dukungan penuh untuk Vertikal, Horizontal, Kisi 2x2, dan tata letak Bentuk T yang khas.
- Presisi piksel: perhitungan koordinat canggih menghilangkan sambungan 1 piksel dan artefak buram.
- Integrasi asli: gabungkan gambar langsung dari timeline X dengan satu klik — tanpa penyimpanan manual.
- Ekspor tanpa kehilangan: mempertahankan setiap piksel dalam resolusi aslinya. Tanpa kompresi, tanpa penurunan kualitas.

✂️ Pemisah Kisi Kreatif (Pembuat Mosaik)
Pecah gambar besar apa pun menjadi kisi terstandardisasi (2x2 atau kustom) yang dioptimalkan untuk tampilan multi-gambar X.
- Optimasi "Alur Mulus" Twitter: dioptimalkan untuk mekanisme pratinjau Twitter. Memastikan beberapa bagian menyatu kembali menjadi satu "gambar mulus" di timeline dengan mencocokkan rasio pratinjau X secara sempurna.
- Pisah dengan klik kanan: kirim gambar web apa pun ke pemisah secara instan langsung dari menu konteks browser.
- Penceritaan terpadu: buat efek "pengungkapan" yang konsisten dan menarik untuk feed Anda.

🚀 FITUR UNGGULAN:
- Alur kerja lancar: dari timeline ke kanvas dalam hitungan detik dengan integrasi browser yang mendalam.
- Kustomisasi profesional: sesuaikan jarak global/lokal, aktifkan Mode Gelap, dan pilih warna latar belakang khusus (termasuk transparansi).
- Impor mudah: dukungan unggah file dan tempel dari clipboard bersama integrasi asli X.
- Ekspor massal: simpan kreasi Anda sebagai PNG, JPG, atau WebP berkualitas tinggi, atau satu paket ZIP yang terorganisir.

🔒 BERKOMITMEN PADA PRIVASI
Gambar Anda tidak pernah meninggalkan browser. Semua pemrosesan dilakukan secara lokal di perangkat Anda — tanpa unggahan jarak jauh, tanpa pelacakan, keamanan total.

Tingkatkan penceritaan X Anda dengan X-Puzzle-Kit hari ini.
```

## it — Dashboard 代码 `it`

**名称 (Name)**

```text
X-Puzzle-Kit: Unisci e dividi immagini per X
```

**简短描述 (Summary)**

```text
Unisci panorami o dividi griglie per X (Twitter). Precisione al pixel, ottimizzato per la timeline e senza perdite.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit è un unione immagini e divisore di griglie professionale, progettato appositamente per gli utenti di X (Twitter), artisti digitali e collezionisti. Che tu stia ricostruendo un panorama in più parti o preparando una rivelazione creativa a griglia, X-Puzzle-Kit garantisce che i tuoi contenuti appaiano esattamente come previsto nella timeline di X.

🌐 SUPPORTO MULTIPIATTAFORMA:
Oltre a questa estensione per Chrome, offriamo una versione Web completa (https://x-puzzle-kit.pages.dev/) per un utilizzo fluido su dispositivi mobili, tablet e altri browser.

✨ FUNZIONALITÀ PRINCIPALI:

🧵 Unione intelligente delle immagini
Unisci senza soluzione di continuità le immagini separate dei Tweet nel loro panorama originale o formato lungo.
- Layout intelligenti: pieno supporto per verticale, orizzontale, griglia 2x2 e il caratteristico layout a T.
- Precisione al pixel: il calcolo avanzato delle coordinate elimina cuciture di 1 pixel e artefatti sfocati.
- Integrazione nativa: unisci le immagini direttamente dalla timeline di X con un clic — nessun salvataggio manuale.
- Esportazione senza perdite: preserva ogni pixel nella risoluzione originale. Nessuna compressione, nessuna perdita di qualità.

✂️ Divisore di griglie creativo (creatore di mosaici)
Scomponi qualsiasi immagine grande in griglie standardizzate (2x2 o personalizzate) ottimizzate per la visualizzazione multi-immagine di X.
- Ottimizzazione "flusso continuo" di Twitter: ottimizzato per il meccanismo di anteprima di Twitter. Garantisce che più parti si uniscano in un'unica "immagine continua" nella timeline, corrispondendo perfettamente alle proporzioni di anteprima di X.
- Divisione con clic destro: invia istantaneamente qualsiasi immagine dal web al divisore direttamente dal menu contestuale del browser.
- Narrazione unificata: crea effetti "rivelazione" coerenti e coinvolgenti per il tuo feed.

🚀 FUNZIONI AVANZATE:
- Flusso di lavoro fluido: dalla timeline alla tela in pochi secondi con una profonda integrazione nel browser.
- Personalizzazione professionale: regola con precisione gli spazi globali/locali, attiva la modalità scura e scegli colori di sfondo personalizzati (inclusa la trasparenza).
- Importazione facile: supporto per il caricamento di file e l'incollaggio dagli appunti insieme all'integrazione nativa con X.
- Esportazione in blocco: salva le tue creazioni come file PNG, JPG o WebP di alta qualità, o in un unico pacchetto ZIP organizzato.

🔒 IMPEGNO PER LA PRIVACY
Le tue immagini non lasciano mai il browser. Tutta l'elaborazione avviene localmente sul tuo dispositivo — nessun caricamento remoto, nessun tracciamento, sicurezza totale.

Migliora la tua narrazione su X con X-Puzzle-Kit oggi stesso.
```

## ja — Dashboard 代码 `ja`

**名称 (Name)**

```text
X-Puzzle-Kit: X画像結合・分割ツール
```

**简短描述 (Summary)**

```text
X (Twitter) 向けプロフェッショナルツール。画像をシームレスにパノラマ結合したり、アートをピクセルパーフェクトなグリッドに分割。Xのタイムラインに最適化され、オリジナル画質のまま保存できます。
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit は、X (Twitter) ユーザー、デジタルアーティスト、コレクターのために設計されたプロフェッショナルな画像編集ツールボックスです。複数枚のツイート画像からオリジナルのパノラマを復元する場合でも、クリエイティブなタイル表示を作成する場合でも、X-Puzzle-Kit を使用すればコンテンツを X のタイムライン上で理想的な形で表示できます。

🌐 マルチプラットフォーム対応：
この Chrome 拡張機能に加えて、モバイル、タブレット、その他のブラウザでもシームレスに利用できる、機能フル装備の Web オンライン版（https://x-puzzle-kit.pages.dev/）を提供しています。

✨ 主な機能：

🧵 高精度な画像結合
バラバラになったツイート画像を、元のパノラマや長尺形式にシームレスに結合します。
・ 多彩なレイアウト：垂直、水平、2x2、および独自の T 型レイアウトを完全にサポート。
・ ピクセルパーフェクトな整列：精密な座標計算により、継ぎ目やぼやけを排除し、鮮明な画質を実現します。
・ ネイティブ統合：X のページ上から直接ボタンをクリックして結合を開始でき、手間を大幅に削減します。
・ 画質劣化なしの出力：二次圧縮を行わず、各ピクセルの元の解像度を維持し、ディテールを完璧に再現します。

✂️ クリエイティブ分割ツール (グリッド・タイル作成)
あらゆる画像を標準的なグリッド（2x2、またはカスタム）に分割し、X のマルチ画像表示に完璧に適合させます。
・ X「1枚絵」レイアウト最適化：Xのプレビュー表示に最適化。タイムライン上で複数の分割画像が繋がって、1枚の大きな画像に見えるように調整します。
・ 右クリックで即分割：ウェブ上で画像を右クリックして、そのまま分割ツールに送って処理できます。
・ 統一された視覚効果：グリッド投稿に一貫性をもたせ、タイムラインでの注目度を高めます。

🚀 便利な機能：
・ 高効率なワークフロー：ブラウザに深く統合されており、ツイートの発見から画像生成までわずか数秒で完了します。
・ 柔軟なカスタマイズ：全体の余白や個別の余白を微調整。ダークモード対応、背景色の自由な設定（透明対応）も可能です。
・ 多様なインポート：ファイルアップロード、クリップボード貼り付け、および X ページからの直接インポートに対応。
・ 一括書き出し：高品質な PNG、JPG、WebP でのダウンロード、または ZIP 形式での一括保存が可能です。

🔒 プライバシー保護
すべての画像処理はローカルブラウザ内で行われます。画像がリモートサーバーにアップロードされることはありません。トラッキングなし、記録なしで、あなたの創作プライバシーを守ります。

今すぐ X-Puzzle-Kit を使って、X での画像投稿をよりプロフェッショナルにしましょう。
```

## ko — Dashboard 代码 `ko`

**名称 (Name)**

```text
X-Puzzle-Kit: X를 위한 이미지 병합 및 분할 도구
```

**简短描述 (Summary)**

```text
X (트위터) 전용 전문 툴킷. 이미지를 파노라마로 매끄럽게 병합하거나 이미지를 픽셀 단위로 완벽한 그리드로 분할하세요. X 타임라인에 최적화되며 원본 화질을 그대로 보존합니다。
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit은 X(트위터) 사용자, 디지털 아티스트 및 수집가를 위해 특별히 설계된 전문 이미지 병합 및 그리드 분할 도구입니다. 여러 파트로 나누어진 파노라마를 재구성하거나 창의적인 그리드 공개를 준비할 때, X-Puzzle-Kit은 여러분의 콘텐츠가 X 타임라인에서 의도한 대로 정확하게 보이도록 보장합니다.

🌐 크로스 플랫폼 지원:
이 Chrome 확장 프로그램 외에도 모바일 기기, 태블릿 및 기타 브라우저에서 원활하게 사용할 수 있도록 모든 기능을 갖춘 웹 버전(https://x-puzzle-kit.pages.dev/)을 제공합니다.

✨ 주요 기능:

🧵 지능형 이미지 병합
개별 트윗 이미지를 원래의 파노라마 또는 긴 형태의 형식으로 원활하게 다시 병합합니다.
- 스마트 레이아웃: 수직, 수평, 2x2 그리드 및 고유한 T자형 레이아웃을 완벽하게 지원합니다.
- 픽셀 완벽 정렬: 고급 좌표 계산으로 1px 이음새와 흐릿한 현상을 제거합니다.
- 네이티브 통합: 수동 저장 없이 클릭 한 번으로 X 타임라인에서 이미지를 직접 병합할 수 있습니다.
- 무손실 내보내기: 모든 픽셀을 원래 해상도로 보존합니다. 압축 및 화질 저하가 없습니다.

✂️ 창의적인 그리드 분할기 (모자이크 메이커)
모든 대형 이미지를 X 다중 이미지 디스플레이에 최적화된 표준 그리드(2x2 또는 맞춤형)로 분할합니다.
- 트위터 "심리스 플로우" 최적화: 트위터의 미리보기 메커니즘에 최적화되었습니다. X의 미리보기 비율과 완벽하게 일치시켜 타임라인에서 여러 분할 이미지가 하나의 "심리스 이미지"로 다시 병합되도록 합니다.
- 우클릭 및 분할: 브라우저 컨텍스트 메뉴에서 웹 이미지를 즉시 분할기로 직접 전송할 수 있습니다.
- 통합 스토리텔링: 피드에 일관되고 매력적인 "공개" 효과를 만듭니다.

🚀 강력한 기능:
- 원활한 워크플로우: 깊은 브라우저 통합을 통해 타임라인에서 캔버스까지 몇 초 만에 이동할 수 있습니다.
- 전문적인 맞춤 설정: 전역/지역 간격을 미세 조정하고, 다크 모드를 전환하며, 사용자 정의 배경색(투명도 포함)을 선택할 수 있습니다.
- 간편한 가져오기: 네이티브 X 통합과 함께 파일 업로드 및 클립보드 붙여넣기를 지원합니다.
- 일괄 내보내기: 결과물을 고품질 PNG, JPG, WebP 파일로 저장하거나 하나의 정리된 ZIP 패키지로 다운로드할 수 있습니다.

🔒 개인 정보 보호 약속
이미지는 브라우저를 절대 벗어나지 않습니다. 모든 처리는 사용자의 기기에서 로컬로 수행됩니다. 원격 업로드나 추적이 없으며 완전한 보안을 보장합니다.

지금 바로 X-Puzzle-Kit으로 X 스토리텔링을 강화해 보세요.
```

## pt_BR — Dashboard 代码 `pt-BR`

**名称 (Name)**

```text
X-Puzzle-Kit: Unir e Cortar Imagens para o X
```

**简短描述 (Summary)**

```text
Crie panoramas perfeitos ou mosaicos (grids) para o X (Twitter). Alinhamento pixel-perfect, otimizado para a timeline e sem perdas.
```

**详细描述 (Detailed description)**

```text
O X-Puzzle-Kit é um combinador de imagens e divisor de grade profissional projetado especificamente para usuários do X (Twitter), artistas digitais e colecionadores. Esteja você reconstruindo um panorama de várias partes ou preparando uma revelação criativa em grade, o X-Puzzle-Kit garante que seu conteúdo apareça exatamente como pretendido na linha do tempo do X.

🌐 SUPORTE MULTIPLATAFORMA:
Além desta extensão do Chrome, oferecemos uma versão web com todos os recursos (https://x-puzzle-kit.pages.dev/) para uso contínuo em dispositivos móveis, tablets e outros navegadores.

✨ CAPACIDADES PRINCIPAIS:

🧵 Combinação Inteligente de Imagens
Mescle imagens separadas de Tweets de volta ao seu formato original de panorama ou formato longo.
- Layouts Inteligentes: Suporte total para layouts Vertical, Horizontal, Grade 2x2 e os exclusivos layouts em forma de T.
- Alinhamento Perfeito de Pixels: O cálculo avançado de coordenadas elimina costuras de 1px e artefatos borrados.
- Integração Nativa: Combine imagens diretamente da sua linha do tempo do X com um único clique — sem necessidade de salvamento manual.
- Exportação sem Perdas: Preserva cada pixel em sua resolução original. Sem compressão, sem perda de qualidade.

✂️ Divisor de Grade Criativo (Criador de Mosaicos)
Divida qualquer imagem grande em grades padronizadas (2x2 ou personalizadas) otimizadas para a exibição de várias imagens do X.
- Otimização "Fluxo Contínuo" do Twitter: Otimizado para o mecanismo de visualização do Twitter. Garante que as divisões múltiplas se combinem novamente em uma única "imagem contínua" na linha do tempo, correspondendo perfeitamente às proporções de visualização do X.
- Clique com o Botão Direito e Dividir: Envie instantaneamente qualquer imagem da web para o divisor diretamente do menu de contexto do seu navegador.
- Storytelling Unificado: Crie efeitos de "revelação" consistentes e envolventes para o seu feed.

🚀 RECURSOS PODEROSOS:
- Fluxo de Trabalho Ágil: Mude da linha do tempo para a tela em segundos com integração profunda do navegador.
- Personalização Profissional: Ajuste fino de lacunas globais/locais, alterne para o Modo Escuro e escolha cores de fundo personalizadas (incluindo transparência).
- Importação Fácil: Suporte para upload de arquivos e colagem da área de transferência, além da integração nativa do X.
- Exportação em Lote: Salve suas criações como arquivos PNG, JPG ou WebP de alta qualidade ou em um único pacote ZIP organizado.

🔒 COMPROMISSO COM A PRIVACIDADE
Suas imagens nunca saem do seu navegador. Todo o processamento é feito localmente em sua máquina — sem uploads remotos, sem rastreamento e segurança total.

Melhore o seu storytelling no X com o X-Puzzle-Kit hoje mesmo.
```

## ru — Dashboard 代码 `ru`

**名称 (Name)**

```text
X-Puzzle-Kit: Склейка и разделение изображений для X
```

**简短描述 (Summary)**

```text
Склеивайте панорамы или разделяйте сетки для X (Twitter). Пиксельная точность, оптимизация для ленты и качество без потерь.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit — профессиональный инструмент для склейки изображений и разделения сеток, созданный специально для пользователей X (Twitter), цифровых художников и коллекционеров. Восстанавливаете ли вы многочастную панораму или готовите креативное раскрытие сетки — X-Puzzle-Kit гарантирует, что ваш контент будет выглядеть именно так, как задумано, в ленте X.

🌐 КРОССПЛАТФОРМЕННАЯ ПОДДЕРЖКА:
Помимо этого расширения для Chrome, мы предлагаем полнофункциональную веб-версию (https://x-puzzle-kit.pages.dev/) для удобного использования на мобильных устройствах, планшетах и в других браузерах.

✨ ОСНОВНЫЕ ВОЗМОЖНОСТИ:

🧵 Умная склейка изображений
Бесшовно объединяйте отдельные изображения из твитов обратно в исходную панораму или длинный формат.
- Умные макеты: полная поддержка вертикального, горизонтального, сетки 2x2 и фирменного T-образного макета.
- Пиксельная точность: усовершенствованный расчёт координат устраняет швы в 1 пиксель и размытие.
- Нативная интеграция: склеивайте изображения прямо из ленты X одним кликом — без ручного сохранения.
- Экспорт без потерь: сохраняет каждый пиксель в исходном разрешении. Без сжатия, без потери качества.

✂️ Креативное разделение сетки (создатель мозаики)
Разбивайте любое большое изображение на стандартизированные сетки (2x2 или собственные), оптимизированные для показа нескольких изображений в X.
- Оптимизация «бесшовного потока» Twitter: настроено под механизм предпросмотра Twitter. Обеспечивает склейку нескольких частей в одно «бесшовное изображение» в ленте за счёт точного соответствия пропорциям предпросмотра X.
- Разделение правой кнопкой: мгновенно отправляйте любое изображение из интернета в разделитель прямо из контекстного меню браузера.
- Единое повествование: создавайте последовательные эффекты «раскрытия» для своей ленты.

🚀 МОЩНЫЕ ФУНКЦИИ:
- Плавный рабочий процесс: от ленты до холста за секунды благодаря глубокой интеграции с браузером.
- Профессиональная настройка: точная регулировка глобальных и локальных отступов, тёмная тема и собственные цвета фона (включая прозрачность).
- Простой импорт: поддержка загрузки файлов и вставки из буфера обмена вместе с нативной интеграцией с X.
- Пакетный экспорт: сохраняйте работы как высококачественные PNG, JPG или WebP, или одним ZIP-архивом.

🔒 ПРИВАТНОСТЬ ПРЕЖДЕ ВСЕГО
Ваши изображения никогда не покидают браузер. Вся обработка выполняется локально на вашем устройстве — без удалённых загрузок, без отслеживания, полная безопасность.

Улучшите своё повествование в X вместе с X-Puzzle-Kit уже сегодня.
```

## tr — Dashboard 代码 `tr`

**名称 (Name)**

```text
X-Puzzle-Kit: X için Resim Birleştirme & Bölme
```

**简短描述 (Summary)**

```text
X (Twitter) için panoramaları birleştirin veya ızgaralara bölün. Piksel mükemmelliğinde, zaman akışı optimize ve kayıpsız kalite.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit, X (Twitter) kullanıcıları, dijital sanatçılar ve koleksiyoncular için özel olarak tasarlanmış profesyonel bir resim birleştirici ve ızgara ayırıcıdır. İster çok parçalı bir panoramayı yeniden oluşturuyor olun ister yaratıcı bir ızgara gösterimi hazırlıyor olun, X-Puzzle-Kit içeriğinizin X zaman tünelinde tam olarak istediğiniz gibi görünmesini sağlar.

🌐 ÇAPRAZ PLATFORM DESTEĞİ:
Bu Chrome uzantısına ek olarak, mobil cihazlarda, tabletlerde ve diğer tarayıcılarda sorunsuz kullanım için tam özellikli bir Web sürümü (https://x-puzzle-kit.pages.dev/) sunuyoruz.

✨ TEMEL YETENEKLER:

🧵 Akıllı Resim Birleştirme
Ayrı Tweet resimlerini orijinal panorama veya uzun form formatlarına sorunsuz bir şekilde geri birleştirin.
- Akıllı Düzenler: Dikey, Yatay, 2x2 Izgara ve imza niteliğindeki T-Biçimli düzenler için tam destek.
- Piksel Kusursuzluğunda Hizalama: Gelişmiş koordinat hesaplaması 1 piksellik dikişleri ve bulanık artefaktları ortadan kaldırır.
- Yerel Entegrasyon: Resimleri tek bir tıklamayla doğrudan X zaman tünelinizden birleştirin; manuel kaydetmeye gerek yoktur.
- Kayıpsız Dışa Aktarma: Her pikseli orijinal çözünürlüğünde korur. Sıkıştırma yok, kalite kaybı yok.

✂️ Yaratıcı Izgara Ayırıcı (Mozaik Oluşturucu)
Herhangi bir büyük resmi, X'in çoklu resim ekranı için optimize edilmiş standart ızgaralara (2x2 veya özel) bölün.
- Twitter "Kesintisiz Akış" Optimizasyonu: Twitter'ın önizleme mekanizması için optimize edilmiştir. X'in önizleme oranlarıyla mükemmel şekilde eşleşerek birden fazla parçanın zaman tünelinde tek bir "kesintisiz resim" olarak birleşmesini sağlar.
- Sağ Tıkla ve Ayır: Herhangi bir web resmini doğrudan tarayıcınızın içerik menüsünden anında ayırıcıya gönderin.
- Birleşik Hikaye Anlatımı: Akışınız için tutarlı, ilgi çekici "gösterim" efektleri oluşturun.

🚀 GÜÇLÜ ÖZELLİKLER:
- Sorunsuz İş Akışı: Derin tarayıcı entegrasyonu ile saniyeler içinde zaman tünelinden tuvale geçin.
- Profesyonel Özelleştirme: Genel/yerel boşluklara ince ayar yapın, Karanlık Modu açın ve özel arka plan renkleri (şeffaflık dahil) seçin.
- Kolay İçe Aktarma: Yerel X entegrasyonunun yanı sıra dosya yükleme ve panodan yapıştırma desteği.
- Toplu Dışa Aktarma: Tasarımlarınızı yüksek kaliteli PNG, JPG veya WebP dosyaları olarak veya tek bir düzenli ZIP paketi olarak kaydedin.

🔒 GİZLİLİK TAAHHÜDÜ
Resimleriniz asla tarayıcınızdan çıkmaz. Tüm işlemler yerel olarak makinenizde yapılır; uzak sunucuya yükleme yok, izleme yok ve tam güvenlik.

X hikaye anlatımınızı bugün X-Puzzle-Kit ile geliştirin.
```

## uk — Dashboard 代码 `uk`

**名称 (Name)**

```text
X-Puzzle-Kit: Зшивання та розділення зображень для X
```

**简短描述 (Summary)**

```text
Зшивайте панорами чи розділяйте сітки для X (Twitter). Піксельна точність, оптимізація для стрічки та якість без втрат.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit — професійний інструмент для зшивання зображень і розділення сіток, створений спеціально для користувачів X (Twitter), цифрових художників і колекціонерів. Чи відновлюєте ви багаточастинну панораму, чи готуєте креативне розкриття сітки — X-Puzzle-Kit гарантує, що ваш контент виглядатиме саме так, як задумано, у стрічці X.

🌐 КРОСПЛАТФОРМНА ПІДТРИМКА:
Окрім цього розширення для Chrome, ми пропонуємо повнофункціональну веб-версію (https://x-puzzle-kit.pages.dev/) для зручного використання на мобільних пристроях, планшетах та інших браузерах.

✨ ОСНОВНІ МОЖЛИВОСТІ:

🧵 Розумне зшивання зображень
Безшовно об'єднуйте окремі зображення з твітів назад у вихідну панораму або довгий формат.
- Розумні макети: повна підтримка вертикального, горизонтального, сітки 2x2 та фірмового T-подібного макета.
- Піксельна точність: удосконалений розрахунок координат усуває шви в 1 піксель і розмитість.
- Нативна інтеграція: зшивайте зображення прямо зі стрічки X одним кліком — без ручного збереження.
- Експорт без втрат: зберігає кожен піксель у вихідній роздільній здатності. Без стиснення, без втрати якості.

✂️ Креативне розділення сітки (творець мозаїки)
Розбивайте будь-яке велике зображення на стандартизовані сітки (2x2 або власні), оптимізовані для показу кількох зображень у X.
- Оптимізація «безшовного потоку» Twitter: налаштовано під механізм попереднього перегляду Twitter. Забезпечує зшивання кількох частин в одне «безшовне зображення» у стрічці завдяки точній відповідності пропорціям перегляду X.
- Розділення правою кнопкою: миттєво надсилайте будь-яке зображення з інтернету до розділювача прямо з контекстного меню браузера.
- Єдине оповідання: створюйте послідовні ефекти «розкриття» для своєї стрічки.

🚀 ПОТУЖНІ ФУНКЦІЇ:
- Плавний робочий процес: від стрічки до полотна за секунди завдяки глибокій інтеграції з браузером.
- Професійне налаштування: точне регулювання глобальних і локальних відступів, темна тема та власні кольори фону (включно з прозорістю).
- Простий імпорт: підтримка завантаження файлів і вставки з буфера обміну разом із нативною інтеграцією з X.
- Пакетний експорт: зберігайте роботи як високоякісні PNG, JPG або WebP, чи одним ZIP-архівом.

🔒 ПРИВАТНІСТЬ ПОНАД УСЕ
Ваші зображення ніколи не залишають браузер. Уся обробка виконується локально на вашому пристрої — без віддалених завантажень, без відстеження, повна безпека.

Покращте свою розповідь у X разом із X-Puzzle-Kit вже сьогодні.
```

## zh_CN — Dashboard 代码 `zh-CN`

**名称 (Name)**

```text
X-Puzzle-Kit: 推特 (X) 拼图与切图工具
```

**简短描述 (Summary)**

```text
专为推特 (X) 打造的拼图与切图工具。无缝拼接全景长图，或将图片拆分为像素级完美的网格——支持推特布局优化，确保原画质无损导出。
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit 是一款专为推特 (X) 用户、数字艺术家及收藏家打造的专业拼图与切图工具箱。无论您是想还原多图推文中的全景长图，还是准备制作高效的网格展示，X-Puzzle-Kit 都能确保您的内容在推特动态（Timeline）得到理想呈现。

🌐 全平台支持：
除了此 Chrome 扩展程序，我们还提供功能完整的 Web 在线版（https://x-puzzle-kit.pages.dev/），方便您在手机、平板或其他浏览器中随时使用。

✨ 核心功能：

🧵 智能无缝拼图
将推文中分散的图片重新拼接回其原始的全景或长图格式。
- 布局方案：全面支持纵向、横向、田字格（2x2）以及独特的 T 型布局。
- 像素级对齐：精准的坐标计算逻辑，有效消除接缝与模糊伪影，呈现清晰画质。
- 原生集成：直接在推特页面上点击按钮发起拼接，省略手动下载步骤。
- 无损导出：不进行二次压缩，保留每一颗像素的原始分辨率，细节分毫毕现。

✂️ 创意切图助手
将任何图片拆分为标准网格（2x2 或自定义），完美适配推特的多图展示机制。
- 推特「一图流」布局优化：自动适配推特预览机制，让多张切图在信息流中完美严丝合缝，拼出一张完整大图。
- 右键即刻拆分：在网页中右键点击图片，即可直接发送至拆分工具进行处理。
- 统一视觉效果：为您的网格推文创造一致的展示效果，提升推文吸引力。

🚀 实用特性：
- 高效操作流：深度集成于浏览器，从发现推文到生成图片仅需数秒。
- 灵活选项：微调全局或局部间距，支持深色模式，可自定义背景颜色（支持透明）。
- 多样化导入：支持文件上传、剪贴板粘贴以及推特页面直接导入。
- 批量导出：支持高质量 PNG、JPG、WebP 下载，或一键打包为 ZIP 压缩包。

🔒 隐私保护
所有图片处理均在您的本地浏览器中完成。图片不会上传到任何远程服务器——无追踪、无记录，保护您的创作隐私。

立即使用 X-Puzzle-Kit 提升您的推特配图效率。
```

## zh_TW — Dashboard 代码 `zh-TW`

**名称 (Name)**

```text
X-Puzzle-Kit: 推特 (X) 拼圖與切圖工具
```

**简短描述 (Summary)**

```text
專為推特 (X) 打造的拼圖與切圖工具。無縫拼接全景長圖，或將圖片拆分為像素級完美的網格——支持推特佈局優化，確保原畫質無損匯出。
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit 是一款專為推特 (X) 用戶、數位藝術家及收藏家打造的專業拼圖與切圖工具箱。無論您是想還原多圖推文中的全景長圖，還是準備製作高效的網格展示，X-Puzzle-Kit 都能確保您的內容在推特動態（Timeline）中得到理想呈現。

🌐 全平台支持：
除了此 Chrome 擴充功能，我們還提供功能完整的 Web 在線版（https://x-puzzle-kit.pages.dev/），方便您在手機、平板或其他瀏覽器中隨時使用。

✨ 核心功能：

🧵 智能無縫拼圖
將推文中分散的圖片重新拼接回其原始的全景或長圖格式。
- 佈局方案：全面支持縱向、橫向、田字格（2x2）以及獨特的 T 型佈局。
- 像素級對齊：精準的座標計算邏輯，有效消除接縫與模糊偽影，呈現清晰畫質。
- 原生集成：直接在推特頁面上點擊按鈕發起拼接，省略手動下載步驟。
- 無損匯出：不進行二次壓縮，保留每一顆像素的原始解析度，細節分毫畢現。

✂️ 創意切圖助手 (九宮格製作)
將任何圖片拆分為標準網格（2x2 或自定義），完美適配推特的多圖展示機制。
- 推特「一圖流」佈局優化：針對推特預覽機制特殊適配，讓多張切圖在動態時報中拼成一張完整的「大圖」。
- 右键即刻拆分：在網頁中右鍵點擊圖片，即可直接發送至拆分工具進行處理。
- 統一視覺效果：為您的網格推文創造一致的展示效果，提升推文吸引力。

🚀 實用特性：
- 高效操作流：深度集成於瀏覽器，從發現推文到生成圖片僅需数秒。
- 靈活選項：微調全局或局部間距，支持深色模式，可自定義背景顏色（支持透明）。
- 多樣化導入：支持文件上傳、剪貼簿貼上以及推特頁面直接導入。
- 批量匯出：支持高質量 PNG、JPG、WebP 下載，或一鍵打包為 ZIP 壓縮檔。

🔒 隱私保護
所有圖片處理均在您的本地瀏覽器中完成。圖片絕不會上傳到任何遠端伺服器——無追蹤、无記錄，保護您的創作隱私。

立即使用 X-Puzzle-Kit 提升您的推特配圖效率。
```
