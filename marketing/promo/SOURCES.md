# X-Puzzle-Kit Promo Video Audio Sources & Licenses

All audio assets used in `marketing/promo/x-puzzle-kit-promo.mp4` (`30.000s`, `30 fps`, `48 kHz` stereo AAC `192 kbps`, mastered to EBU R128 `-16 LUFS` target with `-1.05 dBFS` true-peak limiter ceiling) are documented below.

## Background Music (BGM)

| File | Source | License / Usage Rights | Notes & Sync Verification |
| :--- | :--- | :--- | :--- |
| `bgm.wav` | Google Flow Music — custom generated instrumental track `"Design Launch V1"` (`https://www.flowmusic.app/`, session `6d93ad93-bdce-422b-a354-b56623c3b268`, song `f0ef2c5e-3b26-42bf-bbc4-bcb4d920310a`) | User-generated AI instrumental via Google Flow Music (commercial/promo project use under Flow Music terms) | Cleaned via `audio_craft.py clean-bgm` to standard 44-byte RIFF/WAVE 48 kHz stereo PCM16 WAV (`116.06s`). Verified `120.0 BPM` (`0.500s`/beat, `2.000s`/bar), diatonic C/F major (`C-D-E-F-G-A`), **100% instrumental with zero vocal contamination** audited across full target window `[54.07s, 84.07s]`. `bgm_start = 54.07s` locks Bar 28 Beat 1 to Frame `0` (`0.000s`) and aligns the natural drums-out marimba/Rhodes warm-resolve outro (`80.09s`) directly onto Frame `780` (`26.000s`, Brand Resolve). |

## Sound Effects (SFX)

All sound effects are sourced from **Earshot** (`https://leonxlnx.github.io/earshot-site`, MIT / Public Domain) and normalized via `audio_craft.py normalize-sfx` to 48 kHz stereo 16-bit PCM WAV (`-3.0 dBFS` peak, standard 44-byte RIFF header). All pitched chimes were spectrally verified to harmonize with the BGM's diatonic C/F major harmony (`C, D, E, F, G, A`).

| File | Source | License | Usage (Cue & Frame @ 30fps) |
| :--- | :--- | :--- | :--- |
| `brand_resolve.wav` | Earshot `success/done` (`https://leonxlnx.github.io/earshot-site/sounds/success/done.mp3`) | MIT / Public Domain | `Cue25BrandResolve` (Frame `780` / `26.000s`, A4+A5 octave resolve) |
| `chime_rise.wav` | Earshot `success/rise` (`https://leonxlnx.github.io/earshot-site/sounds/success/rise.mp3`) | MIT / Public Domain | `Cue07MagneticSnapChime` (Frame `211` / `7.033s`, G5 rising harmonic shimmer) |
| `chime_single.wav` | Earshot `notify/single` (`https://leonxlnx.github.io/earshot-site/sounds/notify/single.mp3`) | MIT / Public Domain | `Cue16SeamlessChime` (Frame `511` / `17.033s`, A5 crystal bell) |
| `chime_triad.wav` | Earshot `success/triad` (`https://leonxlnx.github.io/earshot-site/sounds/success/triad.mp3`) | MIT / Public Domain | `Cue11ExportDone` (Frame `352` / `11.733s`, C-E-G major triad confirmation) |
| `click_snap.wav` | Earshot `pro_click/snap` (`https://leonxlnx.github.io/earshot-site/sounds/pro_click/snap.mp3`) | MIT / Public Domain | `Cue08LayoutTShape` (Frame `255` / `8.500s`), `Cue09LayoutGrid` (Frame `285` / `9.500s`) |
| `click_thock.wav` | Earshot `click/thock` (`https://leonxlnx.github.io/earshot-site/sounds/click/thock.mp3`) | MIT / Public Domain | `Cue05StitchTrigger` (Frame `120` / `4.000s`), `Cue10ExportClick` (Frame `345` / `11.500s`) |
| `click_tink.wav` | Earshot `pro_click/tink` (`https://leonxlnx.github.io/earshot-site/sounds/pro_click/tink.mp3`) | MIT / Public Domain | `Cue15PrecisionMode` (Frame `480` / `16.000s`) |
| `cover_shimmer.wav` | Earshot `shine/air` (`https://leonxlnx.github.io/earshot-site/sounds/shine/air.mp3`) | MIT / Public Domain | `Cue01CoverStart` (Frame `0` / `0.000s`, airy brand reveal shimmer) |
| `cta_settle.wav` | Earshot `thump/soft` (`https://leonxlnx.github.io/earshot-site/sounds/thump/soft.mp3`) | MIT / Public Domain | `Cue26CtaPop` (Frame `795` / `26.500s`, grounded low-end CTA settle) |
| `hover_tick.wav` | Earshot `pro_hover_tick/soft` (`https://leonxlnx.github.io/earshot-site/sounds/pro_hover_tick/soft.mp3`) | MIT / Public Domain | `Cue04ButtonHover` (Frame `105` / `3.500s`) |
| `laser_slice.wav` | Earshot `shutter/snap` (`https://leonxlnx.github.io/earshot-site/sounds/shutter/snap.mp3`) | MIT / Public Domain | `Cue13GridSlice` (Frame `420` / `14.000s`, 2x2 laser cut hero snap) |
| `pop_airy.wav` | Earshot `pro_pop_in/airy` (`https://leonxlnx.github.io/earshot-site/sounds/pro_pop_in/airy.mp3`) | MIT / Public Domain | `Cue20CardChrome` (`645`), `Cue21CardAndroid` (`660`), `Cue22CardIos` (`675`) |
| `pop_round.wav` | Earshot `pro_pop_in/round` (`https://leonxlnx.github.io/earshot-site/sounds/pro_pop_in/round.mp3`) | MIT / Public Domain | `Cue03TweetLand` (Frame `45` / `1.500s`), `Cue18PostActions` (Frame `585` / `19.500s`) |
| `shutter_lock.wav` | Earshot `toggle/shutter_open` (`https://leonxlnx.github.io/earshot-site/sounds/toggle/shutter_open.mp3`) | MIT / Public Domain | `Cue07MagneticSnapLock` (Frame `210` / `7.000s`, 4-tile magnetic lock hero snap) |
| `slice_cascade.wav` | Earshot `pro_typing_run/tick` (`https://leonxlnx.github.io/earshot-site/sounds/pro_typing_run/tick.mp3`) | MIT / Public Domain | `Cue14TwentySlices` (Frame `450` / `15.000s`, 4->20 horizontal slice cascade) |
| `slide_panel.wav` | Earshot `slide/panel` (`https://leonxlnx.github.io/earshot-site/sounds/slide/panel.mp3`) | MIT / Public Domain | `Cue17PreviewLift` (Frame `555` / `18.500s`, X seamless feed preview lift) |
| `swoosh_outro.wav` | Earshot `send/swoosh` (`https://leonxlnx.github.io/earshot-site/sounds/send/swoosh.mp3`) | MIT / Public Domain | `Cue24ToOutro` (Frame `759` / `25.300s`, sweep into closing stage) |
| `tock_glass.wav` | Earshot `tock/glass` (`https://leonxlnx.github.io/earshot-site/sounds/tock/glass.mp3`) | MIT / Public Domain | `Cue23PrivacyStats` (Frame `705` / `23.500s`, E4 glassy privacy metric lock) |
| `toggle_on.wav` | Earshot `toggle/on` (`https://leonxlnx.github.io/earshot-site/sounds/toggle/on.mp3`) | MIT / Public Domain | `Cue16SeamlessToggle` (Frame `510` / `17.000s`, X Seamless Flow toggle ON) |
| `whoosh_soft.wav` | Earshot `whoosh/soft` (`https://leonxlnx.github.io/earshot-site/sounds/whoosh/soft.mp3`) | MIT / Public Domain | `Cue06ToStitcher` (Frame `156` / `5.200s`), `Cue19ToPlatform` (Frame `624` / `20.800s`) |
| `whoosh_tight.wav` | Earshot `whoosh_fast/tight` (`https://leonxlnx.github.io/earshot-site/sounds/whoosh_fast/tight.mp3`) | MIT / Public Domain | `Cue02ToPain` (Frame `38` / `1.267s`), `Cue12ToSplitter` (Frame `384` / `12.800s`) |
