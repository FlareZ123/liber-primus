# Cuneiform sexagesimal pairs as exact LP2 page:word addresses — source gate

**Classification:** exact extraction completed; the two-coordinate reading remains unverified because no first-party source selects this exact grammar or supplies a receiver operation. **No unknown plaintext, key, or inverse recovered.**

## Frozen hypothesis

Read the repeated p33–39 cuneiform-style sexagesimal pairs as two LP2 coordinates:

- `(17,13)` → zero-based physical LP2 page 17, one-based printed word 13.
- `(55,1)` → zero-based physical LP2 page 55, one-based printed word 1.

This is only the fixed grammar stated in #1393. No alternative page/word bases, line/letter coordinates, other books, or coordinate reinterpretations were searched.

## Exact extraction from the original pages

The original-image archive maps LP2 page `p` to archive image `(p+17).jpg`: p17 is `34.jpg`; p55 is `72.jpg`. The original scans were inspected against the canonical transcription. The transcription uses hyphens as word delimiters and slashes as line breaks; line-wrapped words are joined before splitting at hyphens. The canonical corpus independently checks each page's rune count.

| Address | Original archive image | Page runes / words | Extracted ciphertext word | GP transliteration |
|---|---|---:|---|---|
| p17, word 13 | `34.jpg` | 273 / 64 | `ᚠᚱᛠᛗᛠᚪ` (6 runes) | `FREAMEAA` |
| p55, word 1 | `72.jpg` | 76 / 17 | `ᛝ` (1 rune) | `NG` |

The exact extraction is reproducible with:

```sh
node sims/lp2_cuneiform_pageword_pair_extract_sft.cjs
```

The script asserts the frozen coordinates, transcription/corpus rune counts, word counts, exact rune strings, and transliterations. It is an extraction check, not a decoder.

## Does a first-party source select this grammar?

**Partly motivates it; does not uniquely select it.**

1. The preserved 2014 Stage11 index lists the LP2 image sequence as `0.jpg` through `57.jpg` (`resources/historical/stage11-2014-index.html`). The image-archive README documents the mapping from those 58 LP2 pages to archive images `17.jpg`–`74.jpg`. This supports zero-based page indices.
2. The 2016 Cicada-signed payload says: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” The archived payload's OpenPGP signature verifies under key `7A35090F` (the repository records GPG trust as unknown). This is genuine motivation to inspect word navigation, but it does **not** say that each two-place sexagesimal pair is a `page:word` address, specify one-based word ordinals, define how two addresses are ordered, or prescribe how the extracted ciphertext words are consumed.
3. The same pairs are also the base-60 values **1033** and **3301**. The preserved 2013 `prime_echo` shell program explicitly emits both prime values and pauses at each. That is a separate historically grounded reading of the same numbers; it does not identify a page:word receiver.
4. The documented 2014 Stage08 GEB code has an explicit four-field grammar (`title:exchange:word:letter`). It does not establish this two-field LP2 page:word convention.

The signed 2016 message also warns “Beware false paths.” The most defensible interpretation is therefore that page/word navigation is a plausible human solve-path hypothesis, not an authenticated address grammar. The first-party material fixes the page sequence and motivates word-based navigation, but leaves the proposed pairing and word-index base underdetermined.

## Receiver and decision

The original extraction produces ciphertext fragments FREAMEAA and NG. A later, separate route now maps those selected words through BASE29 positional values, the p50 table, base60 token decoding and mod29 projection back to the visible p33 M/NG markers; see [the p33 state-register report](lp2-p33-dh-layout-state-register.md). This is a concrete retrospective marker correspondence, not a Cicada-authenticated page:word grammar or a source-selected body receiver. The 2016 signed phrase motivates word navigation but does not specify one-based word ordinals, the p50 consumer, or its byte-to-rune projection.

**Decision:** retain (17,13) and (55,1) as an unverified page:word reading with a reproducible M/NG marker return under one finite convention. The original source-selector negative remains: no authentic key, reversible body operation, unknown plaintext, held-out p34 consequence, or forward re-encryption follows. The separate seven-rune concatenated-key tests below remain negative. Do not promote the page:word reading to a cipher mechanism.

## Candidate seven-rune key receiver test

The two extracted words contain six and one GP runes respectively, so concatenating them in address order gives a **seven-rune** candidate key: `ᚠᚱᛠᛗᛠᚪᛝ` (`FREAMEAANG`, seven GP symbols). The stamped section p33–p39 is also seven pages and contains exactly **1,680 runes = 240 × 7**. This is a motivated but potentially coincidental alignment.

Two simple, locked GP29 subtraction tests were run on only that seven-page section:

1. **Continuous repeating key:** `P[i] = C[i] - K[i mod 7] (mod 29)` across all 1,680 runes. The first output words are `DH`, `SSUSOWRWOED`, `CAEEFCEALX`; no readable English plaintext emerges.
2. **One key symbol per stamped page:** use key rune 0 on p33, rune 1 on p34, …, rune 6 on p39, subtracting that fixed value from every rune on its page. p33 begins `DEO XCFIAWHGEOOE FTEOEEAAIASG`; p34 begins `SP CR HM`. Again, no readable English plaintext emerges.

Both tests use the natural decryption direction `P=C-K mod 29`; no key permutation, alternate sign, extra layer, or parameter sweep was tried. The exact reproducible calculations are included in `sims/lp2_cuneiform_pageword_pair_extract_sft.cjs`.

**Decision:** the seven-rune length match does not supply a receiver. The two simplest key uses fail; do not rescue the page:word hypothesis by inventing additional transformations. This negative does not rule out all conceivable uses of the selected words, but none is presently source-selected.

## Source references

- `resources/liber-primus/README.md` — LP2 page/archive-image mapping.
- `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json` — page and word extraction inputs.
- `resources/historical/stage11-2014-index.html` — original Stage11 image sequence 0–57.
- `resources/cicada2016-4gq25.md` and `resources/historical/cicada2016-4gq25-outguess.asc` — 2016 signed-message source record and extracted payload.
- `resources/historical/cicada2013-os-original-prime-echo.sh` — explicit 1033 and 3301 prime echoes.
- `im-results/lp2-sexagesimal-seal-to-terminal-byte-interface-gate.md` — source limitation on transferring the cuneiform values into the separate 256-byte table.
- `im-results/lp2-cuneiform-geb-bookcode-coordinate-negative.md` — corrected distinction between this exact page:word test and the separate prime_echo fourth-word route.
- `im-results/prime-echo-pageword-period7-gate.md` — distinct p17–p45 first-line fourth-word hypothesis and its fixed consumers.
