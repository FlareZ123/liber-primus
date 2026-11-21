# Source-selected floral manuscript span contains exactly 3301 page-local rune transitions

**Agent19, 21 November 2026. Classification: new original-source structural observation, plausible cipher-clock constraint, no recovered unknown plaintext or creator-authenticated decoder.**

## Result from the original imagery

On the canonical LP2 images, a visually distinctive floral-and-bird marginal frame begins abruptly at physical page **p40** (original archive `57.jpg`) and persists through physical **p55** (`72.jpg`), stopping before the solved p56. Every one of the sixteen original JPEGs p40–p55 has **identical decoded RGB pixels** in its complete left and right **500-pixel** vertical strips (each image 2400×3600 RGB). The concatenated left-strip-then-right-strip SHA-256 begins `5410d35d06217c9d` on all sixteen. The neighboring p39 and p56 are mutually equal in those same strips and have a different hash prefix `b261bd33f7c6e089`. Each original JPEG byte SHA-256 is cross-checked against `resources/liber-primus/SHA256SUMS.txt`. Thus the 16-page scope is objectively determined from **the original artwork without reading or tuning any GP ciphertext**.

The canonical physical p40–p55 source corpus contains one rune-free numerical-grid page, p50. Its **15 rune-bearing pages** have exactly **3,316 runes** in all, and therefore exactly **3,301 within-page adjacent-rune transitions** when each physical page begins with its own first glyph and no cross-page transition is counted:

```text
Physical p40..p55: 16 identically framed pages
Rune-free p50:      1 page (the original 32×8 numeral grid)
Rune-bearing pages: 15
Original GP29 runes: 3316
Intra-page steps:   3316 - 15 = 3301
```

The 15 source rune counts, in printed page order excluding p50, are `[231,273,272,274,273,270,270,274,271,66,92,263,179,232,76]`. Their 3,301 transitions contain **21** equal-rune (`delta=0`) events. Across **all 1,596 contiguous physical-page intervals** drawn from the 56 unresolved pages p0–p55, **only p40–p55** has exactly 3,301 within-page steps. Among all 41 sixteen-page intervals, the next-nearest has 3,461 transitions, 160 away. These interval controls were assessed **after** noticing this particular artwork-defined scope; therefore their uniqueness is descriptive and does not by itself provide an unconditional chance probability of intentional design.

## Possible causal path and rival

One candidate historical design interpretation is that the distinct 16-page floral block was laid out to expose **3,301 ciphertext transitions** under a page-local chained or difference-based cipher. The 15 first runes would then be separately supplied initial states, or could carry another source-defined kind of state. The original printed 256-cell table is inside this same decorated block and may have some key/control role. A designer familiar with the 29-symbol alphabet and Cicada's `3301` name could conceivably have chosen such a count intentionally. This is a **candidate cipher-clock selector** and, if substantiated by a successful inverse, would remove a large amount of arbitrary position/clock ambiguity.

There is a second *post-observation arithmetic closure* worth preserving for audit, not treating as a cipher: `3301 = 256 + 15 × 7 × 29`. It combines the independently counted table's 256 cells, 15 rune-bearing pages, table width minus one (`8−1=7`), and alphabet size 29. It fits the sources numerically but assigns no glyph-to-cell serialization, word interpretation, IV/state, transition rule, or actual plaintext. Those absent steps are precisely the unsolved task; avoid claiming the identity itself selects a decoder.

The strongest rival is a common ornamental page template applied to the last 16 unsolved physical pages, with a numerically striking coincidence after subtracting first glyphs. A page-reset chained cipher is only one of many possible source-consistent mechanisms. The original solved p56–p57 pages are outside the art block; their decrypted language cannot be treated as a cipher key for the unknown runes without independent selection.

## Original-input consumer gate

A separate original-input test, `im-results/lp2-p50-28step-chain-original-gate.md`, already rejects the straightforward **256-token source-table modulo28** repeating key for a zero-delta-as-EA chained cipher, tested in all 32 frozen table-direction/radix/sign/page-clock variants across all 12,956 unknown GP runes. A further border-specific *unadjusted* instantiation uses just these 3,301 transitions, resets the clock at p40's first transition, and directly adds the same original base59 table values modulo28. Its per-rune native-language unigram+bigram score is **−8.415524102238498**; **200 of 256** fixed-seed exact-table-multiset shuffles score at least as high under identical conditions (add-one upper-tail estimate `201/257≈0.7821`). The decrypted prefix is `EOEOTHDFIDIAANGAEROEMSIACWNGAEG...`. This is a negative original-cipher consumer test. **Do not promote the count as a usable key or revive arbitrary direct-table offset sweeps.**

## Reproduction and decision

- Source-image and corpus read-only SFT: `sims/lp2_p40_p55_floral_3301_source_sft.py`, Pillow11.3/NumPy2.2, with original JPEG hash assertions, the complete 16-page margin match, all 1,596 interval controls, and zero-step count. **Windows Python3.12 PASS:** [run 44936746394](https://github.com/FlareZ123/liber-primus/actions/runs/44936746394).
- Main source inputs: `resources/liber-primus/{57.jpg..72.jpg}` from the original archive, `SHA256SUMS.txt`, and `lp2-corpus.json`. Source reader should preserve physical page p50 as rune-free and avoid confusing source text-section numbering with physical image numbering.
- Decision: retain this objective **3301-transition art-block boundary** in supporting research as a prospective original-cipher clock constraint. **No recovered plaintext, authentic source-selected key, cipher inverse, or continuation address.** Require a distinct original image/text clue that specifies the transition operator, key/IV provenance, and recipient ciphertext before committing compute to any dependent decryption hypothesis.

**Research significance:** the block's start and end are source-determined by identical images independently of cipher statistics. That lends it potential predictive use if a future source-grounded chained mechanism needs a clock of exactly 3301 steps, while the count alone cannot distinguish that mechanism from rival ciphers.
