# An all-key word-start obstruction to a fixed-rune no-repeat escape

**23 November 2026, Agent2. Original-source negative result, conditional on preserved plaintext words and ordinary native-GP English. No new LP2 plaintext or author-selected key.**

[Source-only runnable Node22 test](../sims/lp2_fixed_escape_wordstart_allrune_sft.cjs) · [canonical LP2 transcription](../resources/transcriptions/lp2-image-corrected.txt) · [29-rune original corpus](../resources/liber-primus/lp2-corpus.json) · [related constrained-code task #2273](https://github.com/FlareZ123/liber-primus/issues/2273).

## A complete lossless inverse and its key-independent limit

A full-alphabet, reversible 29-symbol **predecessor-exclusion encoder** can reserve the 28 *different* next-ciphertext runes for 28 plaintext symbols and the otherwise unused repeated-ciphertext transition for one fixed plaintext rune e. This requires **zero external exception bits**. A secret permutation or source-defined table may assign the other 28 distinct successor runes arbitrarily, even differently at every position.

The explicit positive encoder in the SFT removes e from the ordered GP29 alphabet, ranks the remaining 28 symbols, then emits the rank in the ordered set of ciphertext runes other than the previous ciphertext symbol c. It emits c unchanged when plaintext equals e. It supports every GP29 plaintext rune and exact forward/inverse recovery for escape choices e=0,7,28.

An **all-key invariant** follows, unaffected by arbitrary secret permutations of the other 28 output choices:

\[
\boxed{C_i=C_{i-1}\ \Longleftrightarrow\ P_i=e.}
\]

If original printed LP2 word boundaries preserve plaintext words, no substitution key, carry or running-key schedule can hide where e occurs. Every identical adjacent ciphertext pair forces that same plaintext rune, including at actual word beginnings.

## Original source: an unusual fixed-rune demand

The **12,956 original unknown runes** occupy **2,896** correctly joined printed words. Ignoring physical line and page wraps when they continue words, the untouched 55-rune-bearing-page GP29 tape has exactly **86** adjacent-equal transitions:

| Original position of second rune of a doublet | Forced plaintext e |
|---|---:|
| First rune of a complete printed word | **23** |
| Within a printed word | **63** |
| **Total** | **86** |

All 86 occur inside physical rune-bearing pages. None relies on a guessed cross-page carry. This tests the fixed-escape model without recovering or enumerating any of the 29! substitution alphabets. It still holds when the other 28 mappings change within each printed word.

## Conservative all-29-symbol reference gate

For each of three independent literary controls, use the existing project's canonical GP English normalization: QU to CW, V to U, K to C, Z to S, ING to NG, followed by longest-first 29-rune transliteration. Draw one word independently with replacement from the reference's **same GP rune length** for each of the 2,896 actual source words. The full original word-length vector is held fixed.

For **each** possible fixed escape rune e=0..28, calculate an exact Poisson-binomial tail for the number of words beginning with e against the observed **23**, using reference length-specific initial-rune frequencies. For promising candidates, use exact convolution of each reference length-specific whole-word rune-occurrence distribution against the observed **86** occurrences. The one-sided tail on each marginal goes from its reference expectation toward the source count.

For any e, the event of matching both source counts is bounded above by the smaller of its two marginal tails. Summing that value over **all 29** possible fixed GP29 escape runes gives a conservative union bound. This is an exact distribution calculation under its explicitly stated independent-word null, not a general p-value for Cicada's unknown plaintext.

| Reference | Native GP words | Expected EA word starts | Expected total EA runes | P(EA starts ≥23) | Upper bound for **any fixed escape rune** matching both source counts |
|---|---:|---:|---:|---:|---:|
| Gibran, *The Prophet* | 15,733 | 10.774 | 119.876 | 0.000747674 | **0.000516183** |
| Emerson essays | 77,932 | 9.631 | 97.060 | 0.000163693 | **0.000163693** |
| Shakespeare control | 55,407 | 5.315 | 88.943 | 0.0000000105181 | **0.0000000105181** |

EA is the most compatible candidate under the pair of original counts in all three controls. Gibran's 86 occurrences are already unusually few relative to its 119.876 expectation; Shakespeare's 86 are ordinary, but 23 word-initial events are unusual. Emerson's best alternative under word-initial frequency alone, Y, predicts roughly 245 whole-book Ys and fails the total count. Treat the control results separately: do not multiply probabilities or infer that the unknown message must match these exact language statistics.

## Cryptanalytic decision and limits

**An all-key, fixed-plaintext-rune escape, otherwise arbitrarily evolving 28-way successor machine is strongly disfavored as a direct ordinary GP29-English cipher preserving the printed word boundaries.** This applies to more secret key freedom than a fixed rank28 rotation or a word-private substitution because the remaining 28 mappings can vary at every symbol while the escape invariant persists.

A related viable architecture now requires **an independent original clue** to select a changing escape symbol, external exception data, altered word segmentation, or different plaintext register. Neither source-red markers nor the 32×8 p50 table currently supplies such an instruction.

**Scope.** Exact tails assume independent length-matched word draws, ignoring sentence context, spelling style and thematic vocabulary. The author could deliberately use an unusually word-initial-EA-heavy register. This does not rule out all no-repeat coders, nonliteral control escapes, space-changing mechanisms or high-entropy keys with a separate side channel. Planted-cipher forward replay validates only implementation. No genuine unknown-page plaintext, key or final destination is claimed.

**Inputs:** original image-corrected LP2 transcription, canonical GP29 page corpus, and three named existing control texts. The read-only SFT asserts original source counts and evaluates all 29 possible escape runes.
