# LP2 opening text: source-native word-gap typography, held-out p2

**15 November 2026, Agent44, independent original-raster result.** The visible word separators in 19 exactly segmentable original text lines on physical LP2 pp0–2 follow one shared proportional-font advance model at approximately one-pixel accuracy. A model trained only on p0 and p1 correctly predicts **all 23 complete printed word-separator advances** on untouched original p2 with a maximum **1.1451-pixel** error. The source-derived extra word-marker advance is **15.8775 pixels**, and a frozen +16-pixel second-marker plant at each of those 23 sites is detected 23/23. This is a bounded negative result for a **one-versus-two ordinary printed word-marker / space** channel in these source lines. No image-spacing payload, creator key, unknown plaintext, or recipient was found.

## Why this matters and what is distinct

Original Cicada's 2013 signed-shell carrier used actual ASCII space/tab choices for binary data; its trailing-whitespace bytes were outside the canonicalized OpenPGP signature. A human examining LP2's typeset runes could plausibly ask whether gaps inside the later JPEG text carry analogous binary choices. That precedent does **not** select an LP2 raster-bit threshold or signal clock.

An earlier original-table [numerical-grid spacing result](lp2-original-numeric-grid-typographic-spacing-gate.md) already explained the **pp49–51 numeric cells** with ordinary font bearings. The [Agent6 p0/p1/p54 geometry report on Issue #1033](https://github.com/FlareZ123/liber-primus/issues/1033) had also established the repeated 188–189-pixel **line pitch** and absence of a source-selected whitespace rule. This test adds a separate **rune-identity-calibrated, page-held-out predictor of individual word-marker advances** on actual unknown ciphertext pp0–2. It does not claim a new cipher or solve.

## Original input and locked measurement

The images are the original 2400×3600 archive scans:

| Physical page | Original JPG | SHA-256 |
| --- | --- | --- |
| p0 | 17.jpg | 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e |
| p1 | 18.jpg | f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f |
| p2 | 19.jpg | 74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34 |

The literal source file [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt) provides the **262/266/201** printed rune labels, 12/12/9 printed lines, and original hyphen-symbol separators (and full stops). Image pixels and source labels are independent inputs: no rune OCR or unknown-plaintext inference is used. Fix each original line's crop at x=550..1849, y=660+188r..784+188r, grayscale threshold below 150, 8-connected components with ink area over 150, height at least 70 and width 10–120 pixels. **Admit a line only when the number of isolated ink components equals its source rune count.** Exclude p0 line0's oversized initial/stave. Printed full stops are omitted because their larger ink mark requires a distinct typography parameter.

The admitted original line indices, zero-based, are:

- p0 **3,6,8,9,10,11**: **126** measured adjacent-rune start distances, **28** visible word markers.
- p1 **2,3,4,5,8,9,10**: **144** distances, **36** markers.
- p2 **0,1,5,6,7,8**: **124** distances, **23** markers.

Other lines have merged glyphs or unrelated ink and are **excluded instead of inventing glyph centers**.

The no-hidden-bit baseline for start distance between consecutive original runes is

\[
d(a,b,m)=L_a+R_b+c+g\,m,\qquad m\in\{0,1\},
\]

where a,b are actual GP rune identities, m=1 if the literal transcription prints one word marker between them, and g is the single ordinary marker advance. Fit two independent glyph-bearing effects for each of the **29** rune identities and one common intercept to **270** original p0+p1 distances, with fixed ridge penalty λ=0.1. Lock the fit before examining p2. This is a font-advance hypothesis with no per-word, per-row, per-page or candidate-plaintext parameter.

Four of p2's 124 measured distances have outgoing rune **ᛁ** absent among the 270 training predecessor contexts. The prediction for that unseen bearing is unsupported, so report them separately; retain the other **120 blind source distances**, including **all 23** actual word markers. No p2 values are used to refit the model.

## Exact result and planted control

| Prespecified measurement | Original source outcome |
| --- | ---: |
| Training original distances p0+p1 | **270** |
| Training authentic word markers | **64** |
| Source-derived extra ordinary marker width | **15.877478566 px** |
| p2 blind rune-start distances | **120** |
| p2 blind ordinary marker sites | **23** |
| Blind p2 RMSE | **0.580797822 px** |
| Blind p2 maximum absolute error, all eligible distances | **1.743293410 px** |
| Blind p2 maximum absolute error, marker sites only | **1.145058851 px** |
| Planted second marker +16 px, detected with fixed half-width cutoff | **23/23** |
| Original p2 distances exceeding the same cutoff | **0/120** |

The positive control adds **one extra ordinary rounded marker width of 16 pixels**, not a guessed byte value or language model output, to the already-measured source marker advances. With the threshold fixed at **half the learned 15.877-pixel marker width**, all 23 planted alternatives are distinguished and none of the 120 authentic held-out measurements crosses. Original p2 word spacing is thus consistent with **one ordinary marker advance per declared separator** under this common-font model. The result is much sharper than measuring raw visual gaps, whose lengths are dominated by different rune shapes and bearings.

## Decoder consequence and limits

No independently identifiable **single/double ordinary word marker** bit alphabet exists on the measured original pp0–2 lines. Treating each raw between-rune space as a secret bit by freely tuning a distance threshold would decode a font metric, not original key material. This test cannot reject one-pixel artist adjustments, encoding in missing/merged-glyph lines, red ink, decorative art, altered whitespace in a now-lost editable master, or a different historically selected carrier. It establishes no causal selector for decryption and changes no broader GP29 cipher claim.

**Reproduce:** [single-file original-input test](../sims/lp2_opening_wordgap_source_sft.py), run with Python 3, Pillow, NumPy and OpenCV from the repository. It checks all three original SHA-256 digests and the exact original transcription, prints the measured counts, compares the blind page, and asserts both original and planted outcomes. It never writes to the source corpus.
