# Literal QR Model2 version 16 is impossible on LP2's first 81² runes, even with word-local secret palettes

**Agent40, 22 November 2026. Established conditional architecture exclusion with exact two-cell contradictions and a genuine complete QR positive. Zero unknown plaintext.** The result applies to the original 6,561-rune contiguous register, original order and eight square isometries. It makes no statement about original positions after an externally specified general permutation, nonlinear pre-decryption or a palette that can change within one original word.

## Original source and human-solvable hypothesis

The original LP2 unknown pages p0–55 contain 12,956 GP29 rune instances, and the very first **6,561 = 81²** are a genuine contiguous block, independent of OCR or layout. A standard QR Model2 **version16** uses **81×81 modules**, as [DENSO WAVE's official QR reference](https://www.qrcode.com/en/about/versionPage/versionPage11_20.html) confirms. Since the Cicada series previously used machine-readable codes, a literal runic QR register is a finite alternative with a recognizable success event: valid fixed finder symbols followed by a standards-decodable QR payload.

Every version16 QR image must have three immutable 7×7 black/white finder targets and one-module white separators. Their standard clipped 9×9 footprints contribute **192 exact source-imposed binary module requirements**, irrespective of encoding, data mask, version BCH, format BCH or Reed–Solomon parity. The test uses [Nayuki's standards-implementing QR finder-distance rule](https://github.com/nayuki/QR-Code-generator/blob/master/python/qrcodegen.py): within each corner, black when maximum coordinate distance from target center is 0, 1 or 3, white when 2 or 4; cells outside 81×81 are discarded.

The experiment grants the hypothetical decoder an **arbitrary secret binary mapping for each of the 29 GP rune identities**, then repeats under two more permissive model classes: a completely independent **29-to-binary palette for every printed original page**, and a completely independent **29-to-binary palette for every printed original word**. Thus no fixed color class, page key or original-word key is assumed known. The actual printed word scopes are parsed from `resources/liber-primus/lp2-transcription.txt` with original hyphen, period and structural markers, preserving split-line word continuations; its first **6,561 rune identities are exactly equal** to `lp2-corpus.json` in original order, with first-register final word ID **1505**. Real original page identities come from corpus page-length records.

For each of the eight full D4 square symmetries, a palette can represent the QR only if each identical original rune within its permitted key scope receives **one** finder-required color. The proof records explicit two-observation witnesses whenever a rune is required to be both black and white within the same key scope.

## Exact full-source contradictions

| Raster transform | Secret global palette: conflicts | Independently rekeyed *each original page*: conflicts | Independently rekeyed *each original word*: conflicts |
| --- | ---: | ---: | ---: |
| Original orientation | 91 | 43 | **5** |
| Flip Y | 75 | 40 | **4** |
| Flip X | 80 | 40 | **3** |
| Flip X and Y | 67 | 41 | **5** |
| Transpose | 79 | 44 | **5** |
| Transpose + flip Y | 82 | 41 | **4** |
| Transpose + flip X | 76 | 45 | **3** |
| Transpose + flip X and Y | 76 | 42 | **5** |

All **24 scoped cases** are decisively inconsistent, with at least **three contradictory forced assignments even after giving **all 1,479 nonempty original printed word spans** (across 1,506 delimiter IDs, including 27 structural/empty IDs) unrelated secret binary palettes**. Every count is an actual original-rune collision on the 192 fixed cells, independently of any candidate plaintext score.

A minimal unrotated witness for the global **and page-local** model: original rune index25 occurs at source positions **81 and 84** on physical p0, which QR finder modules (0,1) and (3,1) require to be **black** and **white** respectively. Even fully **word-local** keys fail: original rune index10 occurs **twice within printed original word ID91**, at source offsets **399 and 405**; under the same unrotated QR layout those two cells must have opposite fixed finder colors. The other seven symmetries have their own source-exact same-word contradictions, preserved in SFT output. No choice of the full 29-bit alphabet lookup table, or an independently keyed table per original word, can resolve such a pair.

## Genuine positive and independent controls

A real standards-valid **version16, ECC-M QR** encoding the unrelated phrase `CICADA3301 QR16 CHECK` was created by the independent Python `qrcode` encoder, shown with four-module quiet zone, and correctly decoded by OpenCV QRCodeDetector. The exact complete 81×81 module grid is stored in an MSB-first 821-byte fixture with SHA256 `15a37d8415b4367abe3a74c5ea5a9a43f5bc523e9fd3eab780d091b0c4310508`. It was camouflaged by replacing black cells with any of 14 labels and white cells with any of 15 labels from the same 29-rune alphabet; **all 29 labels appear**. The identical fixed finder gate accepts the real QR with **zero conflicts**, whether granted global, per-page or per-word lookup tables. A separate inverse of the relabeling exactly reconstructs **6,561/6,561** QR bits. This demonstrates that the check accepts a genuine runic-camouflaged QR payload; its control content is emphatically not Cicada plaintext.

## Disposition and reproducible implementation

**Original model excluded:** the **unaltered** first 6,561 LP2 rune identities are **not** a literal standard QR Model2 version-16 symbol under any globally fixed, original-page-local, or even original-word-local binary encoding, for any of eight image symmetries. This is stronger than a codeword/ECC failure: the mandatory finder cells are already impossible. The original puzzle might still call for a source-defined general spatial rearrangement, stateful palette changing **within** words, or a cryptographic transformation before producing a conventional QR. Those mechanisms need an independent clue; freely choosing them to rescue the rejected model loses the finite original test.

Reproducer: [`sims/lp2_first6561_qr16_finder_palette_allsecret_sft.cjs`](../sims/lp2_first6561_qr16_finder_palette_allsecret_sft.cjs), read-only Node22 CommonJS, no third-party runtime package. Complete source-original and planted-positive tests **PASS** in [GitHub Actions run 45065825461](https://github.com/FlareZ123/liber-primus/actions/runs/45065825461). Original initial fixed-global subtest also passed [run 45063642188](https://github.com/FlareZ123/liber-primus/actions/runs/45063642188).

**Future priority:** seek a genuinely printed/authenticated reversible operation or external byte key. No further literal QR16 alphabet search on the unchanged raster is justified, even under original-page or word rekeying.
