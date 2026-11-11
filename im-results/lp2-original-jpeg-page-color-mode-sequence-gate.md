# Original LP2 JPEG page-mode sequence: visual-content explanation, no independent cipher-state channel

**11 November 2026, Director Issue #317.** All 58 original LP2 JPEG SOF component counts, image pixels and visible red-ink content were audited against physical page ordering. **35 pages are RGB, 23 are grayscale.** A source-visible model consisting of visibly red content and four recurring illustration families accounts for **58/58 mode choices**. The mode sequence supplies no independently selected key, clock, cipher reset or unknown plaintext. This is a negative decision about the **page-color-mode flag**, not all channels in original images.

## Motivated premise and original source

Original physical p0–57 correspond to `resources/liber-primus/17.jpg`–`74.jpg`. A human could notice that source JPEGs alternate between full three-component color and one-component grayscale, perhaps as a sequence of binary states. Such a state would be meaningful only if page mode changes were not explained by ordinary visible ink/artwork or export structure and if an original clue fixed its use. Earlier [quantized JPEG container and chroma source audits](lp2-jpeg-huffman-container-audit.md) independently found the 35/23 split, identical encoder profiles within each JPEG mode, and ten visually grayscale RGB pages containing none or repeated negligible chroma coefficients. This assignment tests the **58-page temporal sequence itself**, without extracting arbitrary bits, fitted key positions or repeating coefficient analyses.

The [exact runnable Python SFT](../sims/lp2_jpeg_page_mode_sequence_sft.py) examines each original JPEG header **SOF component count** and independently checks that Pillow decodes it as RGB or L. It reads decoded RGB pixels using a fixed visible-red detector `R−G >18, R−B >18, R>55`, and calls a page visually achromatic when the maximum pairwise channel difference anywhere is at most five. Source bytes are fixed by SHA-256 over original image n17–74 in order, prepending each two-byte big-endian filename number and eight-byte big-endian file length:

`37a418e0231524fda775046605a111b945c6e85becc911958512d5bc7c95608a`.

The script checks the original `resources/liber-primus/lp2-ink-annotations.json` as a second source-derived annotation inventory when present. It **does not** use language scores to infer colors, keys or modes.

## Frozen exact mode sequence

R means three-component RGB JPEG; G means one-component grayscale JPEG. Read physical p0 to p57:

```text
RRRRRRRRRRRRRRRRGGGGGGRRGGRRGGGGRRRRRRRRRGGGGGGGGRGGGRRRRR
```

| Run | Physical pages | Length | Distinctive visible condition |
| --- | --- | ---: | --- |
| RGB | p0–15 | 16 | Early crosses, scrollwork and mirrored trees; red ink on 9 of 16 pages |
| Grayscale | p16–21 | 6 | No visible red |
| RGB | p22–23 | 2 | Red section punctuation/heading |
| Grayscale | p24–25 | 2 | No visible red |
| RGB | p26–27 | 2 | Red section punctuation/heading |
| Grayscale | p28–31 | 4 | No visible red |
| RGB | p32–40 | 9 | Red punctuation, headings, numbers and repeated cuneiform motif |
| Grayscale | p41–48 | 8 | No visible red |
| RGB | p49 | 1 | Small original red mark |
| Grayscale | p50–52 | 3 | No visible red |
| RGB | p53–57 | 5 | Red headings/ink including both solved controls |

The ten transitions (first page of each later run) occur at **p16,22,24,26,28,32,41,49,50,53**. No page-mode transition has a source-annotated red-rune section beginning at that same physical page's initial rune. In particular, p53's heading starts *inside* that page at rune offset128, not its first position. Thus the mode transitions are not a natural substitute for the printed red-rune section starts.

## All ten achromatic RGB exceptions have an ordinary source-visible explanation

The **25** RGB pages with clear, threshold-independent red content are:

`0,2,3,6,7,8,14,15,22,23,26,27,32,33,36,37,38,39,40,49,53,54,55,56,57`.

All 25 have at least **992 red pixels** under the frozen detector and original max channel spread ≥199; **none of the 23 grayscale pages** is visibly red. The independent annotated red-rune/punctuation inventory names 24 of these 25. The sole difference is **p37**, whose original image (54.jpg) visibly prints red **Arabic numeral list markers 2, 3, 4**. These are not runes or large punctuations, and so their absence from the red-rune/punctuation *annotation scope* is expected; this is not a claimed transcription error. The adjacent pages carry the red 1 and 5 list labels.

The **ten RGB pages lacking visible red**, namely `p1,4,5,9,10,11,12,13,34,35`, are not solitary randomly distributed positions. They occur within four directly visible, repeated decorative families, all of whose neighboring members use RGB for clearly red text:

| Repeating visual family (identified on decoded original pages) | Fully RGB pages | Achromatic RGB members |
| --- | --- | --- |
| Opening cross figures | p0–2 | p1 |
| Left/right scrollwork figures | p3–7 | p4–5 |
| Mirrored marginal trees | p8–14 | p9–13 |
| Cuneiform top illustrations | p33–40 | p34–35 |

All ten have maximum pairwise RGB spread **0–5 levels** and no red pixels, despite their three-component JPEG encoding. The [existing original quantized-chroma audit](lp2-jpeg-huffman-container-audit.md) separately found zero chroma coefficients on p1 and repeatedly identical small chroma patterns on other achromatic RGB pages: p4/5 (1 coefficient), p9/11/13 and p10/12 (28 each), p34/35 (28 each). This is consistent with pages sharing a color rendering/export pipeline for an illustration family while lacking visible red on particular pages. It is a **descriptive account of original imagery and encodings**; neither source provides an author's export script proving the precise causal setting.

A simple source-observable predictor, **RGB if the page has visible red content or belongs to one of the four repeating illustrated families**, reproduces the full sequence **58/58**, including the isolated p49 RGB page and solved p56/p57 RGB controls. It uses no LP2 ciphertext symbols, secret parameter or fitted cryptanalytic score.

## Decision and limits

**Negative:** The color/grayscale page flag is completely accounted for by visible red ink and visually repeated illustrated family placement. The 11 runs and ten mode transitions therefore do **not** presently select a distinct cipher state or an original-reproducible inverse; no original instruction interprets them as key bits, and no withheld plaintext prediction arises. It is reasonable to retire mode-flag-as-independent-cipher-channel experiments and avoid arbitrary bit-order or 29-symbol mapping searches.

**Not excluded:** Changes to pixel values or quantized coefficients within RGB or grayscale pages; an intentional use of visible red content as a separate clue; a repeated image payload; or an unseen export instruction that independently specifies page-state semantics. Those channels require their own source-led hypotheses. This audit establishes no unknown LP2 plaintext/key or destination.

**Reproduction:** Run the self-contained [source SFT](../sims/lp2_jpeg_page_mode_sequence_sft.py) against repository original `resources/liber-primus/17.jpg`–`74.jpg` (Pillow, NumPy). It also accepts the independently supplied complete original JPEG ZIP through `--zip`. The manual-only [original JPEG mode job](../.github/workflows/jpeg-dct-bitpad-manual.yml) selects `probe=page-mode`, without invoking the existing expensive DCT challenge. [First successful CI execution 43084264498](https://github.com/FlareZ123/liber-primus/actions/runs/43084264498) checks all 58 original JPEGs, source digest, exact mode string, 25 red pages, 10 achromatic RGB pages, annotations and runs. Source-specific controls are original p56/p57 (RGB, visibly red); no synthetic ciphertext was created because this issue tests a source-visible mode inventory, not an encryption family.
