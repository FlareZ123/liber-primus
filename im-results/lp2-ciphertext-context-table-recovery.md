# Shared predecessor-ciphertext table: blind key recovery and exact singleton limit

**24 November 2026 · Agent 9.** No unknown LP2 plaintext or authentic key recovered. This is a constructive key-recovery implementation for a family already strongly challenged by earlier arbitrary-row collision and singleton capacity results. Do not commission further variants of the same one-step public-state family.

## Mechanism and actual recovery

Test the reversible GP29 law `C_i = P_i + K[C_(i-1)] mod29`, with an arbitrary shared 29-entry additive key table and public previous ciphertext state. It can suppress equal adjacent runes by mapping an uncommon plaintext rune to the previous output. No authenticated source selects this law. The previous Agent9 prime-weight state clock is different because its state depends on unknown plaintext rather than public ciphertext.

The [recovery implementation](../sims/lp2_ciphertext_context_table_recovery_sft.cjs) fits a GP29 position-conditioned initial frequency model, then jointly optimizes the 29 shifts against smoothed trigram and word-frequency log scores using four deterministic coordinate-ascent starts. The TextBlob frequency list is the only language-model training source. It normalizes GP digraphs and excludes physical-page first/last word fragments rather than treating a wrapped word as complete. p0–39 is the original fitting domain; p40–55 is untouched during optimization.

| Input | Fit rune coverage | Held-out rune coverage | Held-out score (per rune) |
| --- | ---: | ---: | ---: |
| LP1 derived solved-text plant, p57 holdout | 2,815/2,956 (95.23%) | 55/82 (67.07%) | -1.1768 |
| Original p0–39, p40–55 holdout | 407/9,338 (4.36%) | 88/3,205 (2.75%) | -6.3333 |

All four planted restarts recover all **29/29** independently generated key entries; p57 is consequently decoded exactly within the scored interior-word positions. Its dictionary coverage is lower than exact recovery because the frozen lexicon does not contain every GP orthographic form. The four original restarts do not agree on a key; the best training score is -5.93245/rune. Its original continuation is nonprose. Exact forward replay holds on all scored original positions, as required for any table in the bijective family, and is not evidence of correct key choice. The full [actual executed output](lp2-ciphertext-context-table-recovery-output.json) preserves keys, scores, and previews.

## Existing stronger obstructions and conservative witness

The pre-existing [arbitrary predecessor-row collision gate](lp2-previous-cipher-row-collision-allsecret-gate.md) and [singleton capacity SFT](../sims/singleton_word_key_capacity.cjs) already cover this model with much greater secret freedom. The new blind optimizer establishes recoverability on a genuine solved-text plant, not a new family exclusion. The [small conservative singleton witness](../sims/lp2_ciphertext_context_singleton_obstruction_sft.cjs) independently considers just the 81 interior, same-page printed singleton words (the older complete-word parser counts 82 with known same-page predecessors). It requires at least six possible native one-rune word symbols under a stationary predecessor-only map: after predecessor B, the six distinct outputs are X,S,M,NG,OE,EA; after D, they are U,R,I,J,T,M. For allowed singleton vocabulary sizes 1 through 6, exact minimum exceptions under arbitrary independent bijective rows are 49,30,15,6,2,0. For the fixed A/I/O vocabulary and arbitrary cyclic shift per row, at least 38/81 exceptions are forced. The witness uses a deliberately reduced interior-word subset and does not revise the older canonical full-word census.

These are exact finite conditional bounds, not an assumption-free exclusion of every language or cipher. The earlier reports already rule against related first-order and short public-history lookup tables under native-language controls. No extra parameter sweeps are justified. Reuse the recovery optimizer only when a new source clue fixes a materially different, shared low-dimensional key architecture that is not subsumed by those results.
