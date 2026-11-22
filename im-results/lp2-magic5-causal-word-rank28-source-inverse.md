# Printed-word prime direction into the authentic 5×5 square: reversible original-cipher test

**Agent 38, 16 November 2026. Classification: bounded cryptanalytic negative.** None of the four complete original-input inverses below recovers GP-native English, an authentic key, or a Liber Primus continuation. The original ciphertext remains unchanged, and a separate solved-page positive tests the full encoder and decoder. [Source-original Windows Node 22 CI, run 43852357358](https://github.com/FlareZ123/liber-primus/actions/runs/43852357358).

## Distinct proposed operation and motivation

There are two visible, historically meaningful puzzle objects: the solved LP1 p05 square with **25 numbers in five rows**, each row totaling **1,033**, and the signed 2016 direction clue, which says that Liber Primus's words and their numbers provide the map. The original LP2 has **2,896** printed words, including **32** continued across source page breaks. Independent original-cipher lag-five within-word repeats motivate asking whether a *word-local five-phase key* might survive the otherwise near-uniform rune stream.

The specific human-readable but **unattested** proposal is to select square row `r = (GP-prime sum of the previous *ciphertext* word) mod 5`, beginning with a zero-valued predecessor. At glyph position `j` in the current complete printed word, use `k = square[r][j mod 5]`. The preceding ciphertext word is known when decoding, so the row selection is a causal, reversible state operation, even for the 32 page-spanning words. There is no secret dictionary, word index fitted to the output, or page-specific free phase.

Two fully specified candidate emitters were tested, each with both historical additive signs:

1. **GP29 Caesar:** `C = (P ± k) mod 29`.
2. **Previous-ciphertext-excluding GP28 rank:** at every glyph, map plaintext `P=28` to a literal repeat of the prior ciphertext rune; map each `P<28` to one of the 28 ciphertext values excluding the prior rune using cyclic rank `(P ± k) mod28`. The predecessor is initially GP index zero (F) and then advances across every word and page. This 29-to-29 map is bijective, directly models suppressed ciphertext doublets, and is distinct from a simple positionwise additive stream. **The interpretation of GP index28 (EA) as the repeat marker is conjectural.**

The square is the printed original solved-LP1 object, in exact row/column order:

```
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

## Complete original results

For unchanged physical LP2 p0–55, the exact printed-word parser reproduces **12,956/12,956** source runes and **2,896** words; the row selections visit rows 0–4 respectively **587, 561, 548, 589, 611** times. The source ciphertext's index of coincidence is **0.0344783979** and its full-stream adjacent identical pairs total **86**.

| Source-fixed bijection | Forward sign | Decoded GP29 IoC | Consecutive decoded doublets | Literal EA |
| --- | --- | ---: | ---: | ---: |
| GP29 Caesar | + | 0.0344505150 | 448 | 459 |
| GP29 Caesar | − | 0.0344594518 | 414 | 457 |
| GP28 previous-excluding rank | + | 0.0352767536 | 448 | 86 |
| GP28 previous-excluding rank | − | 0.0352992744 | 458 | 86 |

All four **full-output rune sequences** remain near the uniform GP29 IoC baseline (1/29≈0.03448276) and begin with nonlinguistic text. The GP28 model transports exactly the original 86 adjacent repeats to 86 literal EA plaintext symbols **by definition**; that agreement is a feature of its bijection, not a discovered semantic key. No candidate delivers authentic contiguous native-GP prose.

The exact same encoder/decoder applied to the original **95 already-clear p57 GP runes**, in their actual printed words, recovers all **95/95** symbols in **every one of the four configurations** without knowing the ciphertext in advance. A deliberate one-glyph corruption cannot reproduce the solved positive. Every reconstructed original unknown plaintext candidate also forward-reenciphers the **entire 12,956/12,956 source ciphertext**, as any correctly implemented invertible decoder must.

## Decision

The particular original **LP1 five-square → preceding-cipherword GP prime sum → five-phase direct additive/rank28 inverse** does **not** yield original unknown-page plaintext. A five-phase or no-repeat word cipher could still exist under an independently selected key, symbol convention, or state law, but further parameter fitting around this failed four-member family would be unconstrained. The missing input remains a creator-era instruction that selects an emission law and genuine key. The author-signed 2016 prose does not itself prescribe the hypothetical square lookup.

**Exact reproduction:** [single-file Node.js/CommonJS SFT](../sims/lp2_magic5_causal_word_rank28_inverse_sft.cjs), which reads the committed original corpus and word parser, asserts the four statistics, and runs all independent 95-rune positives. The archived original source materials are never rewritten.
