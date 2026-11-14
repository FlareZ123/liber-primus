# Fixed plaintext-rune interpretation of LP2 ciphertext doublets: original-source gate

**Classification: original-input, source-native-English conditional negative. No plaintext or authentic key recovered.** Tested 14 November 2026 by Agent6. Reproducer: [`sims/lp2_fixed_reserved_rune_doublet_gate_sft.cjs`](../sims/lp2_fixed_reserved_rune_doublet_gate_sft.cjs). Do not construe this as a general exclusion of stateful ciphers or other plaintext registers.

## Source-visible motivation and exact mechanism

Across the untouched 12,956 ciphertext runes of physical pp0–55, only 86 of 12,901 page-local adjacent pairs are equal: 23/2,873 at a printed word start after a prior word, and 63/10,028 within printed words. This suggests testing whether a repeated ciphertext rune is an explicit encoding of one distinguished plaintext symbol `R`. Unlike a source-independent statistical no-repeat generator, this proposal would yield **86 exact plaintext positions** without recovering any other key material.

For each position with a predecessor on its physical page, set `D_i=(C_i-C_(i-1)) mod 29`. Fix a plaintext rune `R` in the 29-rune GP alphabet. The encoder emits `D_i=0` if and only if `P_i=R`; the other 28 plaintext runes are mapped bijectively to `D_i=1,...,28`. The 28-way mapping may change with arbitrary secret state, position or page: the zero locations remain exactly the occurrences of `R` and can be checked without knowing the secret maps. A page's first rune is carried separately. This is a reversible architecture, provided `R`, the 28-way maps and the page starts are known; however, **no original image or authenticated instruction selects it**.

## Discriminating untouched-original prediction

Keep the original 2,896 printed word lengths and all 55 rune-bearing physical page boundaries. Count the observed `D=0` slots as `[23 word-start, 63 word-internal]`. For a plaintext from the authenticated GP-native English register, one single rune `R` must occupy these exact totals. Sample 300 original-word-length-matched GP-native word sequences separately from each of the frozen Shakespeare, Gibran and Emerson text controls, using the [source-calibrated ING/IO encoder](../sims/lp2_native_gp_source_orthography_sft.cjs) and xorshift32 seed `0x33015635`. No secret 28-way permutation can change either required marginal count.

| Corpus | GP `F` word-start count, mean (sample range) | GP `F` internal count, mean (sample range) | Closest other candidate across all 29 runes, by worst absolute standardized deviation |
| --- | ---: | ---: | --- |
| Shakespeare | 109.91 (83–141) | 129.04 (93–163) | G, 7.26 standard deviations |
| Gibran | 126.81 (97–154) | 167.69 (123–201) | EA, 4.79 standard deviations |
| Emerson | 120.59 (93–152) | 174.69 (138–214) | EA, 4.39 standard deviations |

The authentic previously observed `F` exception is therefore inconsistent with this specific equality marker: the target `[23,63]` lies outside both `F` count ranges in every corpus. **No one of the 29 runes** is simultaneously within two sampled standard deviations of the required word-start and internal totals in any of the three corpus samples. This is a finite matched-register discrepancy, not an empirical p-value or a universal English exclusion. The corpus words are sampled independently, so these controls do not preserve source syntax or long-range dependencies.

A complete synthetic positive plant uses `R=F` and a secret page/position-dependent bijection on the other 28 runes, preserving exact planted reserved-rune positions and reconstructing all **12,956/12,956** GP runes. The test checks the unchanged canonical transcription's complete word/rune alignment, original per-page boundary counts, all 29 candidate runes, and source-native orthography.

## Decision and limitations

**Retire the fixed-reserved-plaintext-rune marker as the direct explanation of LP2's 86 equal pairs under unchanged printed words and the tested source-native English register.** Do not try 29 independent arbitrary permutations or adjustable zero-symbol placements; the equality invariant already covers all such secret permutations. This does not rule out source-driven state-dependent reserved symbols, variable-length coding with an escape channel, altered plaintext word boundaries, or a different language or intermediate register. The original book supplies no specific `R`, 28-way maps, or decoder for the first rune of each page. A successor requires a genuine independent selector for at least one of those missing inputs and an original-cipher prediction of actual previously unknown plaintext.

## Reproduction

Run `node sims/lp2_fixed_reserved_rune_doublet_gate_sft.cjs` from the repository root on Node.js 22. Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`, the three `resources/control/` corpora and `sims/lp2_native_gp_source_orthography_sft.cjs`. The script makes no file writes and fails on source-mapping, counts, positive-inverse, or corpus-gate mismatch.
