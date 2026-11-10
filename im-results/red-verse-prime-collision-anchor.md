# LP2 page53: exact prime-totient rejection-key inversion on the highlighted word

**Evidence:** completed, source-anchored negative of one historically motivated **invertible** cipher architecture; **no recovered plaintext, key or destination**.

The physical LP2 page53 original JPEG `70.jpg` highlights 51 contiguous runes at offsets [128,179), forming twelve complete words. Its fourth word has **eleven GP runes** at highlighted offsets [13,24). These boundaries are fixed independently by original image markup and the corrected transcription `resources/liber-primus/lp2-page53-red-span.json`.

## Specific mechanism and exact inverse

A genuinely solved later page, LP2 page56, used `K_j=phi(prime_j)=prime_j-1 (mod29)` as its additive decryption stream. A plausible distinct mechanism for the unresolved pages is a *ciphertext-repeat rejection channel*: encrypt each GP-English plaintext rune using the next prime-totient key, but discard and consume a key draw if it would repeat the **previous emitted ciphertext rune**. This would suppress adjacent ciphertext doubles and would shift the key phase irregularly, invalidating a simple periodic-pad test.

Let `P_i = C_i + sK_j (mod29)`, where `s ∈ {-1,+1}`. If position `i` consumes an extra key draw, the skipped candidate `P_i-sK_{j-1}` must equal `C_{i-1}`, so

```text
C[i-1] - C[i] = s*(K[j]-K[j-1])  (mod 29).
```

This is a **plaintext-independent necessary constraint**. It allows a depth-first inverse to enumerate all valid 0-, 1-, and 2-skip trajectories across the eleven-rune anchor efficiently, rather than searching arbitrary corrections or fitting a language score. Two skipped draws before one emitted glyph are checked individually. The resulting exact eleven GP plaintext indices must match an existing 11-GP-rune lexicon word; the lexicon has **1,611** distinct eligible spellings. The first draw's unknown historical offset is free.

The finite test scans **50,000** possible key starts in each of **16** predefined source readings (printed, reverse words, full reversal, individual-word reversal; raw and atbash-carrier signs). A proposed plaintext can be output only if both the *exact key-draw constraints* and the *full source-defined eleven-rune dictionary word* agree. The first 11-rune key draw cannot consume more than two extra draws, and the same prime-totient stream must run through the word. This does not cover secret per-position key jumps, a 3+ collision budget, an unknown plaintext codebook, or independent unrelated cipher layers.

## Actual ciphertext and planted inversion

| Case | Outcome |
| --- | --- |
| Real source, 50,000 starts × 16 cases, no key draws rejected | **0** dictionary-compatible anchors |
| Real source, same search, one extra rejected draw | **0** |
| Real source, same search, two extra rejected draws | **0** |
| Positive: separate 51-rune GP dictionary passage with original twelve word lengths and actual prime-totient key | **PASS** |
| Positive secret page-start prime index | 3215 |
| Positive first anchor prime index / recovered index | **3228 / 3228** |
| Positive exact source-anchor rejection locations | zero-based **[8,9]** within eleven-rune word |
| Positive recovered eleven-rune word | **CONTRACTION** (exact original GP indices) |

The positive control encrypted a complete 51-rune synthetic passage, consumed extra prime draws whenever a tentative rune would repeat its predecessor, selected a deterministic case with exactly two actual key rejections inside the eleven-rune anchor, then inverted that anchor. It recovered the original word and **both** rejection locations under the correct 3228 key-start. The actual source, with the same bounded inverse, yielded **no** word candidate in any reading.

This rules against using the *solved* page56 key generator **together with this explicit duplicate-suppression mechanism** to encrypt an ordinary English GP anchor on page53 within 50,000 key starts. It does not identify the true source of ciphertext repeat suppression. The result adds a mechanistic rejection test independent of the direct-pad case in [red-verse-prime-totient-anchor.md](red-verse-prime-totient-anchor.md).

## Reproduce

- Program and planted generator: [`sims/red_verse_prime_collision_anchor.cjs`](../sims/red_verse_prime_collision_anchor.cjs), CommonJS / Node22.
- [Successful manual workflow 42762449329](https://github.com/FlareZ123/liber-primus/actions/runs/42762449329), 50,000 starts, 16 source cases, positive exact-key test.
- Earlier CI 42762377701 had a **test fixture assertion** that incorrectly prohibited ordinary ciphertext `F` in a synthetic anchor. The assertion was removed. A synthetic `F` output does not automatically imply a Cicada literal-`F` key interrupter. No true data exclusion was affected.
- Authentic source-prime benchmark: [`sims/authentic_lp2_p56_totient_regression.cjs`](../sims/authentic_lp2_p56_totient_regression.cjs).

**Research implication:** Source-fixed plaintext anchoring is highly discriminative against an explicit known key generator when its state path is bounded and reversible. Pursue a cipher state transition or actual visual key clue that produces new unfitted decoded runes. Additional prime offsets under this same model have diminishing return.
