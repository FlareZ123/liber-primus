# Nine-chapter all-secret first-difference capacity gate

**Scope:** one new key-independent restriction on a historically plausible 29-rune *differential alphabet*, not a recovered key or plaintext. Original GP29 rune data, nine visually observed section boundaries, and held-out native-language windows are frozen before comparison. This extends the earlier 28-nonzero-step/periodic-key tests to **nine independent arbitrary secret 29! chapter alphabets**, including zero steps.

## Exact original-cipher model

Within each physical page, keep the first ciphertext rune freely given. At every subsequent rune, decode

```text
D_i = (C_i - C_(i-1)) mod 29
P_i = sigma_chapter(D_i)
```

where each `sigma_chapter` is any bijection on all 29 GP runes. The chapter changes are only at original red-heading boundaries, in physical page groups `[0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53, 54–55]`. This is an extremely generous model: it grants the unknown cipher nine unrelated 29-symbol substitution keys, and the 55 physical-page initial rune values are exempt.

Any such bijection preserves the multiset of 29 source symbol counts in its chapter. Therefore the **largest** recovered GP-letter count is exactly the largest original GP-difference-bin count for that chapter, independently of the secret key. The model is testable without choosing, solving, or searching those nine keys.

## Original result against source-independent GP29 English

The 12,956 unknown LP2 runes yield 12,901 within-page differences, including all 86 source doublets. The 29-bin difference histogram has maximum **510**; the native GP29 English controls have maximum **at least 1,410** at those same 12,901 global positions, already rejecting a single unknown constant alphabet. The nine separate original chapter alphabets still fail all **90/90** chapter-window comparisons against ten predeclared held-out GP29 windows, five Shakespeare and five Gibran:

| Visually marked chapter | Original within-page steps | Greatest original step count | Lowest corresponding native GP symbol maximum |
| --- | ---: | ---: | ---: |
| p0–2 | 726 | 38 | 71 |
| p3–7 | 1,140 | 55 | 108 |
| p8–14 | 1,722 | 77 | 175 |
| p15–22 | 1,895 | 87 | 195 |
| p23–26 | 1,017 | 47 | 99 |
| p27–32 | 1,427 | 65 | 147 |
| p33–39 | 1,673 | 82 | 179 |
| p40–53 | 2,995 | 123 | 316 |
| p54–55 | 306 | 20 | 31 |

The independently matched native windows are offsets `[20000,56000,92000,128000,164000]` in `resources/control/shakespeare_first300k.txt` and `[1000,11000,21000,31000,41000]` in `resources/control/gibran_prophet_58585.txt`. The existing GP chart gives the greedy grapheme transliteration and explicit K→C, V→U, Z→S, Q→C normalization; no candidate plaintext or key is fitted.

A stronger exact count uses the permutation-minimal histogram edit distance `(1/2)*sum(abs(sort(A)-sort(B)))`. The original difference counts require **at least 4,011** rune identity changes to equal even the *closest* complete-window native histogram under one arbitrary permutation. Granting **all nine independent chapter permutations** reduces this only to **3,638 of 12,901 differences (28.19936%)**, at the closest of all ten controls. That is a finite empirical lower bound against these controls, not a universal bound over every author-composed English paragraph.

## Direct native-text positive and limits

The reproducer plants a full-length 12,956-symbol Shakespeare native-GP passage using nine independently seeded, arbitrary GP29 permutation keys and the exact original physical-page/section layout. It recovers **12,956/12,956** original-layout plaintext symbols, reversibly checks **12,901/12,901** differential transitions, and gets only **451/12,901** matches when applying deliberately wrong adjacent-chapter keys. The synthetic plant validates the cipher implementation; it is no evidence that Cicada used this mechanism.

**Decision:** A direct native-English GP29 plaintext under a fixed secret map from predecessor differences within each of the nine source-visible chapters is strongly disfavored. The source's near-uniform 28 nonzero steps are incompatible with ordinary native GP English even after independent secret chapter substitutions. **Do not multiply root28, chapter seeds, or substitution guesses in this stationary family.** A viable successor must introduce a source-selected *evolving* alphabet/state, an intermediate non-GP register, symbol insertion/deletion or codebook decoding, with independent evidence defining the additional operation. Existing reports on short-period 28-step keys already disfavor many periodic attempts; this new bound specifically addresses nine independent nonperiodic chapter-static keys. No authentic unknown-page plaintext or new key is recovered.

**Reproduction:** [CJS SFT](../sims/lp2_delta_chapter_allsecret_capacity_sft.cjs), [successful Windows Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43247092196), [original source corpus](../resources/liber-primus/lp2-corpus.json), and [visible-section map](lp2-global-original-visual-section-map.md).
