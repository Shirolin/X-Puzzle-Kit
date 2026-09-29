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
| `de`          | `de`               | 49       | 117          | 2633         |
| `es`          | `es`               | 49       | 110          | 2585         |
| `fr`          | `fr`               | 43       | 125          | 2625         |
| `id`          | `id`               | 43       | 118          | 2431         |
| `it`          | `it`               | 44       | 115          | 2723         |
| `ja`          | `ja`               | 25       | 101          | 1233         |
| `ko`          | `ko`               | 34       | 99           | 1327         |
| `pt_BR`       | `pt-BR`            | 44       | 141          | 2491         |
| `ru`          | `ru`               | 52       | 123          | 2537         |
| `tr`          | `tr`               | 46       | 140          | 2464         |
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
X-Puzzle-Kit ist ein professionelles Tool zum Zusammenfügen und Aufteilen von Bildern, das speziell für X (Twitter)-Nutzer, digitale Künstler und Sammler entwickelt wurde. Egal ob Sie ein mehrteiliges Panorama rekonstruieren oder ein kreatives Raster für einen 'Reveal'-Effekt erstellen möchten – X-Puzzle-Kit sorgt dafür, dass Ihre Inhalte auf der X-Timeline genau so aussehen wie beabsichtigt.

🌐 PLATTFORMÜBERGREIFENDER SUPPORT:
Zusätzlich zu dieser Chrome-Erweiterung bieten wir eine voll ausgestattete Web-Version (https://x-puzzle-kit.pages.dev/) für die nahtlose Nutzung auf Mobilgeräten, Tablets und anderen Browsern.

✨ KERNFUNKTIONEN:

🧵 Intelligentes Zusammenfügen (Stitching)
Fügen Sie separate Tweet-Bilder nahtlos wieder zu ihrem ursprünglichen Panorama- oder Langformat zusammen.
- Smarte Layouts: Unterstützung für Vertokal-, Horizontal-, 2x2-Raster- und das charakteristische T-Form-Layout.
- Pixelgenaue Ausrichtung: Fortschrittliche Koordinatenberechnung eliminiert 1px-Nähte und unscharfe Artefakte.
- Native Integration: Bilder direkt aus Ihrer X-Timeline mit einem Klick zusammenfügen – kein manuelles Speichern erforderlich.
- Verlustfreier Export: Erhält jeden Pixel in seiner Originalauflösung. Keine Kompression, kein Qualitätsverlust.

✂️ Kreatives Aufteilen (Grid Splitter)
Teilen Sie jedes große Bild in standardisierte Raster (2x2 oder benutzerdefiniert), die für die Multi-Image-Anzeige von X optimiert sind.
- Twitter 'Seamless Flow'-Optimierung: Perfektes Splitting für den X-Vorschau-Mechanismus. Sorgt dafür, dass mehrere Teile in der Timeline optisch wieder zu einem einzigen, nahtlosen Bild verschmelzen.
- Rechtsklick & Teilen: Senden Sie jedes Web-Bild direkt über das Kontextmenü Ihres Browsers an den Splitter.
- Einheitliches Storytelling: Erstellen Sie konsistente, fesselnde 'Reveal'-Effekte für Ihren Feed.

🚀 POWER-FUNKTIONEN:
- Reibungsloser Workflow: Wechseln Sie dank tiefer Browser-Integration in Sekunden von der Timeline zur Bearbeitung.
- Professionelle Anpassung: Feinabstimmung globaler/lokaler Abstände, Dark Mode und benutzerdefinierte Hintergrundfarben (inkl. Transparenz).
- Einfacher Import: Unterstützung für Datei-Uploads und Einfügen aus der Zwischenablage neben der nativen X-Integration.
- Batch-Export: Speichern Sie Ihre Kreationen als hochwertige PNG-, JPG- oder WebP-Dateien oder als einzelnes, organisiertes ZIP-Paket.

🔒 DATENSCHUTZ IM FOKUS
Ihre Bilder verlassen niemals Ihren Browser. Die gesamte Verarbeitung erfolgt lokal auf Ihrem Gerät – keine Uploads, kein Tracking, absolute Sicherheit.

Optimieren Sie Ihr X-Storytelling noch heute mit X-Puzzle-Kit.
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
X-Puzzle-Kit es un kit de herramientas multimedia profesional diseñado específicamente para usuarios de X (Twitter), artistas digitales y coleccionistas. Ya sea que estés reconstruyendo una panorámica a partir de varios tweets o preparando una galería creativa, X-Puzzle-Kit garantiza que tu contenido se vea exactamente como deseas en el timeline de X.

🌐 SOPORTE MULTIPLATAFORMA:
Además de esta extensión de Chrome, ofrecemos una versión Web en línea completa (https://x-puzzle-kit.pages.dev/) para un uso fluido en dispositivos móviles, tablets y otros navegadores.

✨ CAPACIDADES PRINCIPALES:

🧵 Ensamblado Inteligente de Imágenes
Une sin costuras imágenes separadas de un Tweet en su formato original panorámico o de formato largo.
- Diseños Inteligentes: Soporte completo para disposiciones Verticales, Horizontales, Cuadrículas 2x2 y el exclusivo diseño en forma de T.
- Alineación de Píxel Perfecto: El cálculo avanzado de coordenadas elimina las uniones de 1px y los artefactos borrosos para un acabado profesional.
- Integración Nativa: Ensambla imágenes directamente desde tu timeline de X con un solo clic, sin descargas manuales.
- Exportación sin Pérdidas: Conserva cada píxel en su resolución original. Sin compresión ni pérdida de calidad.

✂️ Divisor de Grillas Creativo (Creador de Mosaicos)
Divide sus imágenes en grillas estandarizadas (2x2 o personalizadas) optimizadas para la visualización de múltiples imágenes de X.
- Optimización de Diseño "Imagen Única" para Twitter: Optimizado para la vista previa de X. Asegura que múltiples cortes se unan en una sola "gran imagen" en el timeline.
- Clic Derecho y Dividir: Envía instantáneamente cualquier imagen web al divisor directamente desde el menú contextual del navegador.
- Estética Unificada: Crea efectos visuales consistentes que capturan la atención en el feed.

🚀 CARACTERÍSTICAS POTENTES:
- Flujo de Trabajo Eficiente: Pasa del timeline al lienzo en segundos con una integración profunda.
- Personalización Pro: Ajusta espacios globales/locales, activa el Modo Oscuro y elige colores de fondo personalizados (incluyendo transparencia).
- Importación Fácil: Soporte para subida de archivos, portapapeles e integración nativa con la página de X.
- Exportación por Lotes: Guarda tus creaciones como archivos PNG, JPG o WebP de alta calidad, o en un paquete ZIP.

🔒 COMPROMETIDO CON LA PRIVACIDAD
Tus imágenes nunca salen de tu navegador. Todo el procesamiento se realiza localmente en tu equipo: sin subidas, sin rastreo y con total seguridad.

Mejora tu contenido visual en X con X-Puzzle-Kit hoy mismo.
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
X-Puzzle-Kit est une boîte à outils média professionnelle conçue spécifiquement pour les utilisateurs de X (Twitter), les artistes numériques et les collectionneurs. Que vous souhaitiez reconstituer un panorama à partir de plusieurs tweets ou préparer une présentation en grille créative, X-Puzzle-Kit garantit que votre contenu s'affiche exactement comme prévu sur votre fil X.

🌐 SUPPORT MULTIPLATEFORME :
En plus de cette extension Chrome, nous proposons une version Web en ligne complète (https://x-puzzle-kit.pages.dev/) pour une utilisation fluide sur mobiles, tablettes et autres navigateurs.

✨ FONCTIONNALITÉS CLÉS :

🧵 Assemblage Intelligent d'Images
Fusionnez sans couture des images séparées d'un Tweet pour retrouver leur format original panoramique ou long.
- Mises en page intelligentes : Support complet des formats Vertical, Horizontal, Grille 2x2 et de la mise en page signature en forme de T.
- Alignement au pixel près : Un algorithme avancé élimine les raccords de 1px et les flous pour une finition professionnelle.
- Intégration Native : Assemblez des images directement depuis votre fil X d'un simple clic, sans manipulations manuelles.
- Exportation sans Perte : Préserve chaque pixel dans sa résolution d'origine. Aucune compression, aucune perte de qualité.

✂️ Découpeur de Grilles Créatif (Mosaic Maker)
Divisez n'importe quelle image en grilles standardisées (2x2 ou personnalisées) optimisées pour l'affichage multi-images de X.
- Optimisation de Mise en Page "Image Unique" pour Twitter : Optimisé pour l'aperçu de X. Permet de fusionner plusieurs découpes en une seule "grande image" dans le flux.
- Clic droit et Découpe : Envoyez instantanément n'importe quelle image vers l'outil de découpe via le menu contextuel du navigateur.
- Esthétique Unifiée : Créez des rendus cohérents qui captent l'attention sur votre flux.

🚀 FONCTIONS AVANCÉES :
- Flux de Travail Fluide : Passez du fil au canevas en quelques secondes grâce à une intégration profonde.
- Personnalisation Pro : Ajustez les espacements, activez le Mode Sombre et choisissez des couleurs de fond (transparence incluse).
- Import Facile : Support de l'import de fichiers, du presse-papiers et de l'intégration native avec la page X.
- Export par Lot : Sauvegardez vos créations aux formats PNG, JPG ou WebP de haute qualité, ou dans une archive ZIP organisée.

🔒 CONFIDENTIALITÉ GARANTIE
Vos images ne quittent jamais votre navigateur. Tout le traitement est effectué localement sur votre machine : aucun transfert vers un serveur, aucun suivi, sécurité totale.

Sublimez vos contenus sur X avec X-Puzzle-Kit dès aujourdhui.
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
X-Puzzle-Kit은 X (트위터) 사용자, 디지털 아티스트 및 수집가를 위해 설계된 전문가용 미디어 툴킷입니다. 여러 트윗 이미지를 원래의 파노라마로 복원하거나 창의적인 그리드 전시를 준비할 때, X-Puzzle-Kit은 콘텐츠가 X 타임라인에서 의도한 대로 완벽하게 보이도록 도와줍니다.

🌐 멀티 플랫폼 지원:
이 Chrome 확장 프로그램 외에도 모바일, 태블릿 및 기타 브라우저에서 원활하게 사용할 수 있도록 모든 기능을 갖춘 웹 온라인 버전(https://x-puzzle-kit.pages.dev/)을 제공합니다.

✨ 핵심 기능:

🧵 지능형 이미지 병합
분산된 트윗 이미지를 원래의 파노라마 또는 긴 형식으로 매끄럽게 병합합니다.
- 스마트 레이아웃: 세로, 가로, 2x2 격자 및 시그니처 T자형 레이아웃을 완벽하게 지원합니다.
- 픽셀 단위 정렬: 정교한 알고리즘으로 1px의 오차나 흐릿함을 제거하여 선명하고 전문적인 화질을 제공합니다.
- 네이티브 통합: X 페이지에서 버튼을 클릭하여 즉시 병합을 시작할 수 있어 번거로운 수동 다운로드가 필요 없습니다.
- 무손실 내보내기: 원본 해상도를 그대로 유지하며 품질 저하 없이 최고의 결과물을 보장합니다.

✂️ 창의적 그리드 분할 (모자이크 제작)
어떤 이미지든 표준 그리드(2x2 또는 사용자 정의)로 분할하여 X의 다중 이미지 표시에 최적화된 결과물을 만듭니다.
- 트위터 「한 장의 그림」 레이아웃 최적화: 트위터 미리보기 메커니즘에 최적화되었습니다. 타임라인에서 여러 장의 이미지가 끊김 없이 연결되어 하나의 큰 이미지로 보이도록 합니다.
- 우클릭 즉시 분할: 웹에서 이미지를 우클릭하여 분할 도구로 직접 보내 빠르게 편집할 수 있습니다.
- 통일된 시각 효과: 일관성 있는 레이아웃으로 트윗의 주목도를 높이고 메시지를 효과적으로 전달합니다.

🚀 강력한 기능:
- 워크플로우 효율화: 브라우저와 깊이 통합되어 트윗 발견부터 이미지 생성까지 단 몇 초 만에 완료됩니다.
- 프로 설정: 전체 및 개별 간격 미세 조정, 다크 모드 지원, 배경색 및 투명도 사용자 정의가 가능합니다.
- 간편한 가져오기: 파일 업로드, 클립보드 복사-붙여넣기 및 X 페이지 직접 연동을 지원합니다.
- 일괄 저장: 고화질 PNG, JPG, WebP 다운로드 또는 ZIP 파일로 한 번에 보관할 수 있습니다.

🔒 철저한 개인정보 보호
모든 이미지 처리는 사용자 기기의 로컬 브라우저 내에서만 이루어집니다. 이미지가 서버로 전송되지 않으며, 어떠한 추적이나 기록도 남지 않아 안심하고 창작에만 집중할 수 있습니다.

지금 바로 X-Puzzle-Kit로 X에서의 미디어 경험을 한 단계 업그레이드해보세요。
```

## pt_BR — Dashboard 代码 `pt-BR`

**名称 (Name)**

```text
X-Puzzle-Kit: Unir e Cortar Imagens para o X
```

**简短描述 (Summary)**

```text
Crie panoramas perfeitos ou mosaicos (grids) para o X (Twitter). Alinhamento pixel-perfect, otimizado para a timeline e qualidade sem perdas.
```

**详细描述 (Detailed description)**

```text
O X-Puzzle-Kit é uma ferramenta profissional de união (stitching) e divisão de imagens desenvolvida especificamente para usuários do X (Twitter), artistas digitais e colecionadores. Seja para reconstruir um panorama em várias partes ou criar um "reveal" criativo em grade, o X-Puzzle-Kit garante que seu conteúdo apareça exatamente como planejado na timeline do X.

🌐 SUPORTE MULTIPLATAFORMA:
Além desta extensão para Chrome, oferecemos uma versão Web completa (https://x-puzzle-kit.pages.dev/) para uso perfeito em celulares, tablets e outros navegadores.

✨ RECURSOS PRINCIPAIS:

🧵 União Inteligente (Stitching)
Junte imagens de Tweets separados de volta ao seu formato original panorâmico ou longo.
- Layouts Inteligentes: Suporte total para layouts Vertical, Horizontal, Grade 2x2 e o exclusivo formato "T-Shape".
- Alinhamento Pixel-Perfect: Cálculo avançado de coordenadas elimina emendas de 1px e artefatos borrados.
- Integração Nativa: Una imagens diretamente da sua timeline do X com um clique — sem necessidade de salvar manualmente.
- Exportação Sem Perdas: Preserva cada pixel na resolução original. Sem compressão, sem perda de qualidade.

✂️ Divisor de Grade Criativo (Mosaic Maker)
Divida qualquer imagem grande em grades padronizadas (2x2 ou personalizadas) otimizadas para a exibição de múltiplas imagens do X.
- Otimização "Seamless Flow": Otimizado para o mecanismo de prévia do Twitter. Garante que várias partes se unam visualmente em uma única "imagem contínua" na timeline.
- Clique Direito e Dividir: Envie instantaneamente qualquer imagem da web para o divisor direto do menu de contexto do navegador.
- Storytelling Unificado: Crie efeitos de revelação consistentes e envolventes para o seu feed.

🚀 RECURSOS AVANÇADOS:
- Fluxo Fluido: Vá da timeline para a edição em segundos com integração profunda no navegador.
- Personalização Profissional: Ajuste fino de espaçamentos globais/locais, Modo Escuro e cores de fundo personalizadas (incluindo transparência).
- Importação Fácil: Suporte para upload de arquivos e colar da área de transferência, além da integração nativa com o X.
- Exportação em Lote: Salve suas criações como arquivos PNG, JPG ou WebP de alta qualidade, ou como um pacote ZIP organizado.

🔒 PRIVACIDADE EM PRIMEIRO LUGAR
Suas imagens nunca saem do seu navegador. Todo o processamento é feito localmente no seu dispositivo — sem uploads remotos, sem rastreamento e com total segurança.

Melhore seu storytelling no X hoje com o X-Puzzle-Kit.
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
X (Twitter) için panoramaları birleştirin veya ızgaralara bölün. Piksel mükemmelliğinde, zaman akışı (timeline) optimize ve kayıpsız kalite.
```

**详细描述 (Detailed description)**

```text
X-Puzzle-Kit, X (Twitter) kullanıcıları, dijital sanatçılar ve koleksiyoncular için özel olarak tasarlanmış profesyonel bir resim birleştirme ve ızgara bölme aracıdır. İster çok parçalı bir panoramayı yeniden birleştiriyor olun, ister yaratıcı bir ızgara "reveal" (açığa çıkarma) efekti hazırlıyor olun, X-Puzzle-Kit içeriğinizin X zaman akışında tam olarak amaçlandığı gibi görünmesini sağlar.

🌐 PLATFORMLAR ARASI DESTEK:
Bu Chrome uzantısına ek olarak, mobil cihazlar, tabletler ve diğer tarayıcılarda sorunsuz kullanım için tam özellikli bir Web sürümü (https://x-puzzle-kit.pages.dev/) sunuyoruz.

✨ TEMEL GÜÇLER:

🧵 Akıllı Resim Birleştirme (Stitching)
Ayrı Tweet resimlerini orijinal panorama veya uzun formata sorunsuz bir şekilde geri birleştirin.
- Akıllı Düzenler: Dikey, Yatay, 2x2 Izgara ve imza niteliğindeki T-Şekli düzenleri için tam destek.
- Piksel Mükemmelliğinde Hizalama: Gelişmiş koordinat hesaplaması, 1 piksellik dikiş izlerini ve bulanık eserleri ortadan kaldırır.
- Yerel Entegrasyon: Resimleri doğrudan X zaman akışınızdan tek tıklamayla birleştirin — manuel kaydetmeye gerek yok.
- Kayıpsız Dışa Aktarma: Her pikseli orijinal çözünürlüğünde korur. Sıkıştırma yok, kalite kaybı yok.

✂️ Yaratıcı Izgara Bölücü (Mosaic Maker)
Herhangi bir büyük resmi, X'in çoklu resim gösterimi için optimize edilmiş standart ızgaralara (2x2 veya özel) bölün.
- Twitter "Kusursuz Akış" Optimizasyonu: Twitter'ın önizleme mekanizması için optimize edilmiştir. Zaman akışında görsel olarak tek bir "kesintisiz resim" gibi birleşmesini sağlar.
- Sağ Tık & Böl: Herhangi bir web resmini doğrudan tarayıcınızın içerik menüsünden bölücüye gönderin.
- Birleşik Hikaye Anlatımı: Akışınız için tutarlı, ilgi çekici "ortaya çıkarma" efektleri oluşturun.

🚀 GÜÇLÜ ÖZELLİKLER:
- Akıcı İş Akışı: Derin tarayıcı entegrasyonu ile saniyeler içinde zaman akışından düzenlemeye geçin.
- Profesyonel Özelleştirme: Global/yerel boşlukların ince ayarı, Karanlık Mod ve özel arka plan renkleri (şeffaflık dahil).
- Kolay İçe Aktarma: Yerel X entegrasyonunun yanı sıra dosya yükleme ve panodan yapıştırma desteği.
- Toplu Dışa Aktarma: Tasarımlarınızı yüksek kaliteli PNG, JPG veya WebP dosyaları olarak ya da tek bir düzenli ZIP paketi olarak kaydedin.

🔒 GİZLİLİK ÖNCELİĞİMİZ
Resimleriniz asla tarayıcınızdan çıkmaz. Tüm işlemler yerel olarak cihazınızda yapılır — uzaktan yükleme yok, izleme yok ve tam güvenlik.

X hikaye anlatımınızı X-Puzzle-Kit ile bugün geliştirin.
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
