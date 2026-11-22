# Original LP2 five-rune rolling-state swap cipher: all-secret upper bound

**Research decision (15 November 2026, Agent12, Director Issue [#1101](https://github.com/FlareZ123/liber-primus/issues/1101)).** A newly specified fully reversible 29-state ciphertext-dependent cipher is incompatible with the unmodified LP2 source under the tested source-native English language register. The decision holds **for every arbitrary secret permutation in its 29 rows** and for every choice of its 29 special symbols, rather than depending on an optimized plaintext guess. It recovers **no unknown-page plaintext, historical key, or puzzle destination**.

## Human-visible motivation and competing explanation

The original manuscript prints word boundaries that carry across some physical pages, has a recurrent five-circle motif, and preserves **104 within-word five-back glyph echoes across 2,105 opportunities**. Its neighboring rune pairs are unusually unlikely to repeat: **63** repetitions within printed words and **23** across them. GP29 arithmetic and transparent source-native F in LP1/p56 are actual historical precedents, but no authentic authorial clue chooses this new operation, the special index EA, or a five-symbol checksum. Those are **hypothesis parameters**. An independently keyed longer-state cipher, an unknown intermediate language, a page-specific operation, or a noncipher text-generation process remains viable.

An earlier original-input gate already excluded an arbitrary secret alphabet indexed **only by the preceding ciphertext symbol** ([prior reproducer](../sims/lp2_prev_cipher_row_collision_allsecret_sft.cjs)), so this experiment tests a materially different hypothesis: a five-rune rolling register within words with a ciphertext-dependent value-changing output permutation that persists across word boundaries.

## Frozen, lossless cipher

Let `P_i`, `C_i` range over GP29 rune indices 0..28. For each original printed word, define `s_i = (C_(i-1)+...+C_(i-k)) mod 29`, summing only the immediately preceding `k=min(5,wordOffset)` ciphertext symbols **in the same original word**. That rolling state restarts at each printed word, but the previous published ciphertext rune carries across words, line wraps and physical page turns.

Give each of the 29 states an **arbitrary unknown 29-symbol permutation** `σ_s` and set `q_s=σ_s(28)`. Index 28 (EA) is the special plaintext marker in this candidate family. Let `swap(x,a,b)` exchange `a` and `b` while leaving other symbols fixed. The encoder is:

```
Y_i = σ_(s_i)(P_i)
C_i = swap(Y_i, q_(s_i), C_(i-1))
```

For the first rune, use the fixed public previous symbol 0. The inverse is:

```
Y_i = swap(C_i, q_(s_i), C_(i-1))
P_i = σ_(s_i)^(-1)(Y_i)
```

Every step is a permutation, so no rune is lost or invented. Except at the very first rune, ciphertext equality `C_i=C_(i-1)` occurs exactly when `P_i=28`. This permits the observed rare doubles without a lossy overwrite rule or arbitrary bit-flip exceptions. The same published ciphertext determines each five-rune state in both encoder and decoder.

## Exact original-source all-secret gate

For **each** of the 29 known rolling states `s`, and for each of its 29 possible unknown `q_s`, undo the ciphertext-dependent swap on every site with that state. The resulting corrected outputs are `σ_s(P_i)`, so all pairs of equal plaintext GP29 symbols must yield equal corrected outputs, whatever hidden permutation `σ_s` was chosen. Maximize the corrected equal-pair count over all 29 possible `q_s` for each state **independently**. Summing these maxima proves an upper bound for all `(29!)^29` possible hidden row-permutation assignments without enumeration; it is an overgenerous oracle score, because it grants a fresh state-optimized `q_s` per region and does not demand global key consistency.

The discrimination is measured only at original word offsets **five or greater** to ensure the rolling state has full history, rather than crediting initial-word frequency differences. The source is the canonical 12,956-index unknown-page GP29 transcript and its original 2,896-word physical layout in [the shared corpus](../resources/liber-primus/lp2-corpus.json) and [the master transcription](../resources/lp2-transcription.txt).

| Original region | Eligible sites | Within-state pairs | All-secret oracle maximum equality rate |
| --- | ---: | ---: | ---: |
| All unknown LP2 pages p0–55 | 2,105 | 76,321 | **0.0375781239764** |
| Training region p0–39 | 1,563 | 41,987 | **0.0380593993379** |
| Frozen holdout p40–55 | 542 | 5,099 | **0.0447146499314** |

The `q_s` values preferred on p0–39, when applied **unchanged** to p40–55, give a holdout equality rate **0.0331437536772**, below even the holdout's permissive new-key oracle maximum. Therefore changing the secret rows after examining the holdout cannot rescue this fixed-state language architecture.

## Source-native controls and exact inverse

Generate 64 independent matched words-per-length manuscripts from each archived source of Shakespeare, Gibran and Emerson, totaling **192 complete 12,956-rune plants**. Keep every original GP word length and position, including the 32 words that cross physical page turns. The GP encoder is source-calibrated to original solved spellings `ING` and `IO`, with historical Latin normalization and the real solved-LP1/p57 reference checks in [the encoder SFT](../sims/lp2_native_gp_source_orthography_sft.cjs). For each plant choose 29 fresh arbitrary unknown GP29 row permutations and **actually encrypt** under the declared feedback-and-swap operation. Each inverse recovers 12,956 of 12,956 planted plaintext signs and re-encrypts exactly. Two independent secret keys similarly round-trip the **real** ciphertext but produce different meaningless outputs, explicitly demonstrating why wrong-key round-trip is no plaintext evidence.

The table uses the **true** secret marker `q_s` for planted controls, which is a lower bound on the oracle maximum obtainable with arbitrary secret markers. All 192 fully inverse-verified sources exceed the original's **oracle maximum**:

| Calibrated source | Plants | Minimum genuine full-book deep collision | Minimum genuine holdout collision | Plants at or below original oracle maximum |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 64 | **0.1082579733** | **0.0944794368** | 0/64 |
| Gibran | 64 | **0.1055663889** | **0.0907020873** | 0/64 |
| Emerson | 64 | **0.0875382361** | **0.0799687927** | 0/64 |

Some plants also match the original **total adjacent doublet count**, and some attain at least its **104 five-back echoes**, so neither favorable surface statistic resolves the model. Their hidden-state equality signatures still decisively disagree with the original. The full independent 192×12,956 inversions cover **2,487,552 plaintext rune recoveries**.

## Fork and research implication

The exact fixed-row rolling-five cipher with a single special-symbol swap is **rejected for the tested GP-native English manuscript register**. The same proof applies regardless of each secret row's order or key material. This is a bounded mathematical exclusion with a deterministic cipher implementation and multiple source-disjoint plants; it is **not** a proof that the author could not have used a different finite-state cipher, a long secret pad or an intermediate non-English register.

The next productive source-dependent decision is whether first-party 2013/2014 material **actually specifies a state update, keyed permutation, or payload transfer** at the five-dot glyph, the physical word boundary, or an authenticated red instruction. Without that independently selected operation, expanding to unrestricted higher-state secret lookup tables would spend compute on a family so expressive that its key is unidentifiable from the observed text. A complete LP2 decipherment still requires source-authenticated plaintext/key or a decoder that predicts untouched native prose with no post-selection.

## Reproduction

- [One-file CommonJS source gate and 192 native control inversions](../sims/lp2_wordfive_rolling_swap_allsecret_sft.cjs).
- [Manual-only GitHub Actions workflow](../.github/workflows/agent12-wordfive-rolling-swap-manual.yml).
- [Successful original-input Windows-independent Ubuntu/Node22 CI run 43705508043](https://github.com/FlareZ123/liber-primus/actions/runs/43705508043) with complete JSON counters.
- Corpus sources: [canonical LP2 source](../resources/liber-primus/lp2-corpus.json), [original transcription](../resources/lp2-transcription.txt), [GP orthography positive controls](../sims/lp2_native_gp_source_orthography_sft.cjs).
