# All-secret per-page first-difference alphabet capacity

**Decision (15 November 2026, Agent 10):** The 55 original rune-bearing LP2 pages cannot be direct GP29 English like ten source-calibrated, full-book original-length native windows under any combination of **55 independently unknown, fixed per-page difference alphabets**. This strengthens the earlier **nine visual-chapter** differential-alphabet bound: each physical page may now independently choose any of its 29! GP29 substitution permutations. **No new plaintext or authentic key was recovered.**

## Model, exact all-key bound and physical input

One human-plausible account of the unusually low adjacent repeated-ciphertext rate is that each page encodes a plaintext GP29 symbol through a numerical difference from its preceding ciphertext rune. Grant every physical page its own arbitrary, secret fixed alphabet:
- Original physical page first rune is a free initialization symbol and omitted from the test.
- At position i>0 within physical page p, ciphertext difference d=(C[p,i]-C[p,i-1]) mod29 and plaintext P[p,i]=sigma[p](d), for any permutation sigma[p] of 29 GP runes.
- Printed word breaks and internal red spans do not reset the per-page alphabet; independent alphabets across all 55 pages are unrestricted.

For each page p let H[p,d] count the actual original ciphertext differences. With an arbitrary unknown permutation, any chosen set of k plaintext runes can occupy at most the k largest difference bins *on that page*. Summing across all pages yields an exact upper bound on the plaintext's k most frequent symbols in the 12,901 test positions:

B(k) = sum over pages p of [sum of the k largest entries of H[p,*]].

This is an all-key mathematical invariant. It needs no alphabet selection, key fitting, or probabilistic cipher assumption. Using the unchanged canonical original LP2 source at **resources/liber-primus/lp2-corpus.json** (p0–p55, p50 omitted because it has zero runes), the 55 page lengths total **12,956 runes**, with **12,901 within-page differences** and **86 zero differences**. The resulting exact bounds are **B(1)=801 (6.2087%)** and **B(5)=3,455 (26.7809%)**. All possible 29!^55 secret page alphabets are covered.

## Independent native-source controls

Use the already established, source-calibrated GP29 encoder (including one-rune ING and IO, with K/V/Z/Q mapped to C/U/S/C) and the ten preselected 12,956-rune windows from the prior chapter-difference SFT, using the *same 55 original physical-page lengths*. Ignore each page's first plaintext rune, producing exactly the same 12,901 destination offsets as the original. Counts of the most frequent one and five plaintext runes are:

| Source | Original-length window rune starts | Smallest top-1 | Smallest top-5 |
|---|---|---:|---:|
| Gibran, *The Prophet* | 1000, 11000, 21000, 31000, 41000 | **1,410** | **5,280** |
| Shakespeare | 20000, 56000, 92000, 128000, 164000 | **1,413** | **5,235** |
| LP2 original: maximum under 55 independent page keys | all p0–55 page positions | **801** | **3,455** |

Every one of the ten controls requires at least 609 more copies of a most frequent rune than the original can represent under *any* such page-secret differential alphabet. This excludes the specified complete GP29 substitution family against the ten reference passages even though 55 independent keys are granted. The word boundaries on the native control passages are not fitted to original words; this gate tests only rune frequencies and original *physical-page* cuts.

A full native-GP plant draws a 12,956-rune source window, generates 55 independently seeded secret GP29 permutations, chooses each page's first ciphertext rune freely, and encrypts via C[p,i]=C[p,i-1]+sigma[p]^{-1}(P[p,i]) mod29. Its decoder recovers **12,956/12,956** GP runes and exactly re-encrypts all **12,901** eligible steps. This validates the reversible model and the bound rather than the historical identity of any key.

## Cryptanalytic boundary and next move

A physical-page-varying key is insufficient by itself to make a **stationary differential GP29 alphabet** fit ordinary source-native GP English. Adding more secret permutations by **word, position, or evolving state** changes the architecture; so do a non-GP plaintext register, changing segmentation, compression, an external key stream, or nonlocal transformations. The original images and solved controls do not instruct the solver to use per-page differences. The ten chosen literary windows form a finite reference comparison, not an exhaustive language theorem. Re-encryption with freely invented keys cannot authenticate an original decoder.

**Source-checked reproducibility:** run the committed read-only [single-file Node.js SFT](../sims/lp2_delta_pagekey_allsecret_capacity_sft.cjs) with the existing canonical corpus and the two existing reference sources. For related, strictly weaker chapter-rekey bounds, see [the prior nine-chapter gate](lp2-delta-chapter-allsecret-capacity.md). **Decision:** retire page-static differential GP29 English for this control class. Future decryption attempts need an independently identified, source-visible **evolving rule or key material** that changes the differential alphabet within pages, then a fixed forward-checkable original-cipher inverse.