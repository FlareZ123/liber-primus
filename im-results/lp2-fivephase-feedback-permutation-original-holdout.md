# Five-phase ciphertext-feedback permutation: source-native key recovery and original holdout

**Decision.** A compact, reversible five-phase GP29 feedback cipher can be recovered by an exact assignment algorithm when it actually encrypts source-native English. Applied unchanged to original Liber Primus, its inferred keys produce near-uniform glyphs on a complete held-out 3,316-rune interval. This bounded exploratory mechanism has **not** recovered an unknown plaintext, true key, or author-selected operation.

## Tested mechanism

Let each rune be its canonical Gematria Primus integer in 0..28. The five secret states are independent bijections `S_0..S_4` of those integers, and the ciphertext operates continuously across printed words and physical pages:

```
C[i] = S_(i mod 5)((P[i] + C[i-1]) mod 29), C[-1] = 0
P[i] = (S_(i mod 5)^(-1)(C[i]) - C[i-1]) mod 29
```

The five-state period was chosen **before original inversion**, as a simple changing-state alternative to previously exhausted stationary predecessor maps and as a possible interpretation of the manuscript's visible five-item motifs. No 2014 source actually instructs this exact arithmetic, period, permutation update, or continuous clock. Its status is **exploratory**, and it is not offered as an authentic Cicada cipher.

## Recovering the unknown secret keys

The cipher's inverse is a permutation-assignment problem. For each phase and output glyph `C[i]`, count the previous glyph `C[i-1]`. If the unknown inverse sends that output glyph to index `x`, the implied plaintext is `(x-C[i-1]) mod29`. Score every candidate `x` using an independently estimated, Laplace-smoothed GP29 unigram distribution from the first 300,000 characters of the Shakespeare control corpus. The 29×29 Hungarian minimum-cost assignment recovers a full bijection, with **no fitted plaintext or candidate word crib**. This is the exact maximum-likelihood key under the specified independent-unigram model.

The GP English tokenizer treats ING as NG, keeps the published multigraph runes, and maps Latin V/K/Q/Z to U/C/C/S. Other spelling conventions could change fitted keys; they would require an independent language reason to select them.

## Original evidence and control

| Test | Source | Result |
|---|---|---|
| Independent encrypted control | 12,000 normalized GP runes of *The Prophet*, five pseudorandom secret phase permutations (xorshift seed `0x33012014`); train on first 9,000 | **145/145** secret inverse-key assignments recovered exactly |
| Control holdout | Remaining 3,000 GP runes; appended authentic LP2 p57 PARABLE GP sequence, 95 runes | **3,095/3,095** rune recovery, including 95/95 Cicada-derived rune control |
| Actual original training | Every runic LP2 page p0–p39, 9,640 ciphertext runes | Fitted-decode IoC **0.036253017**, far below native English |
| Actual original holdout | Every original runic LP2 page p40–p55 (p50 rune-free), 3,316 ciphertext runes | IoC **0.034535785**; average log Shakespeare-GP unigram probability **−4.312851968** |
| Native comparator | Independent 3,000-runic *Prophet* text after the training cutoff | IoC **0.061124375**; average log probability **−2.951695835** |

The original holdout remains essentially uniform (ideal GP29 random coincidence probability 1/29≈0.03448) and has no contiguous recovered readable sentence. Under the fixed trained inverse, its mean unigram log likelihood is even below the uniform-GP baseline (−4.269797479); spelling that looks like English is absent. Original training already fails to concentrate recovered letters. Complete output is reproducible from [the standalone CommonJS SFT](../sims/lp2_fivephase_feedback_permutation_hungarian_sft.cjs), which reads the repository's original-cipher corpus and the two fixed literary controls.

## Cryptanalytic significance and limits

The planted positive demonstrates that this exact model and key-recovery procedure can recover a 145-entry state key from a manuscript-sized GP English sample without a plaintext crib. The original result makes this **specific learning-based five-state feedback route** a poor next investment. The test does not constitute an all-key exclusion, nor does it exclude altered word boundaries, alternate state clocks, a non-English register, a different feedback operator, or a further cipher layer. An authentic first-party source selecting a clock and state operation, or a recovered original-page plaintext, would justify a new test.

No modification to the authoritative established-results synthesis is warranted because the experiment does not establish a new LP2 decoding mechanism.
