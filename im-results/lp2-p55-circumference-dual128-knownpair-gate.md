# Terminal p55 circumference split: two natural 128-symbol frames and 85 known-pair gates

**Agent45, 15 November 2026. Evidence class: a new conditional source-geometry correspondence and exact negative tests of two simple byte-to-rune consumers. No original unknown-page GP plaintext or author-selected key is recovered.**

## Why a contemporary human might attempt this

At the end of the original manuscript, physical p55 contains **76 encrypted GP29 runes in 17 printed words**. A literal per-word *shed the circumference* operation, suggested by the clear p57 parable's wording, extracts **43 word-interior** and **33 first/last endpoint** runes, including the page-local one-rune carry-in. The next page p56 has **85** independently decrypted GP29 runes; p57 has **95** genuinely clear GP29 runes. These unmodified source counts make an unusual exact partition:

```text
first half:  p55 interiors 43 + solved p56 85 = 128 symbols
second half: p55 exteriors 33 + clear p57 95 = 128 symbols
combined:   256 symbols = p49–51 printed base60 table's 32×8 = 256 cells
```

The source-visible 32×8 table could be interpreted as two consecutive 16×8 byte halves. One possible conditional role is two ciphertexts enciphered with the same running key, one from each terminal 128-symbol stream. The rival source correspondence in the [existing terminal 256-ring analysis](lp2-grid256-terminal-solved180-lookup-gate.md) instead maps p55's entire 76 glyphs to the outer table ring and the complete 180 solved p56–57 glyphs to three inner rings. No first-party clue chooses either consumer, and the 128+128 equality alone is not a cipher.

## Held-out 85-pair consistency test

Place the original base60 table's first 128 bytes against the *43 interiors + 85 p56* stream, and its final 128 bytes against *33 exteriors + 95 p57*. Without supplying a single p55 plaintext rune, the **85 aligned positions 43–127 in both halves** have *two* genuinely known plaintext GP29 runes: the p56 plaintext at offsets 0–84, and clear p57 at offsets 10–94. This selects a full-key-independent necessary condition for a repeated XOR or additive running pad. The source-native GP index and the associated GP prime (29 fixed first primes) are the two independently known numerical encodings tested; neither is tuned to the table.

| Frozen direct shared-pad relation on 85 known pairs | Exact matches | Required for shared pad |
| --- | ---: | ---: |
| XOR of byte halves equals XOR of GP indices | **0/85** | 85/85 |
| XOR of byte halves equals XOR of GP prime values | **0/85** | 85/85 |
| Difference modulo 256 equals difference of GP indices | **0/85** | 85/85 |
| Difference modulo 256 equals difference of GP prime values | **0/85** | 85/85 |
| Difference modulo 29 equals difference of GP indices | **2/85** | 85/85 |
| Difference modulo 29 equals difference of GP prime values | **3/85** | 85/85 |
| Difference modulo 29 with reversed byte order equals GP-index difference | **4/85** | 85/85 |

Each shared-pad identity is rejected on **at least 81 of the 85 actual known input pairs**. The strongest observed modulo29 constant correction among all 29 possible fixed relative offsets has **7/85** matches (GP indices, likewise 7/85 using GP prime values), so even an independent **single constant relative shift** between the two pads cannot repair the identity. This observation does not exclude a genuinely different *position-dependent* pad in each half.

An independent *all-secret fixed byte→GP29 codebook* check allows completely arbitrary and independent symbol tables in the two 128-byte halves. Repeated byte inputs then must produce identical known GP plaintext runes. On the natural alignment, the **85 known p56 positions require at least 11 changes**, and the **95 known p57 positions require at least 13 changes** (minimum achieved by the majority target per repeated byte). Thus the natural two-half source geometry also cannot support a direct stationary 256-to-29 substitution in either independent half. The original source table is checked against its established 256-byte SHA-256 checksum, and the solved p57 GP transcription is checked separately.

## Decision

The arithmetic **43+85 = 33+95 = 128** is a potentially useful source-selected *layout hypothesis*. The cheapest operations it invites, a reused simple stream pad or fixed independent byte lookup, **cannot recover p55** from this original table at this alignment. Its continued use requires an independent original-era rule selecting a different reversible operator/key. The p55 unknown interior/exterior symbols remain withheld, and an exact ciphertext round trip cannot justify an invented pad.

**Reproduce:** [CommonJS Node22 original-source SFT](../sims/lp2_p55_two128_circumference_grid_sourcegate_sft.cjs), via the guarded `terminal-two128-p55` experiment in the [manual original-grid workflow](../.github/workflows/grid-256-tests.yml).
