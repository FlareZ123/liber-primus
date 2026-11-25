# Critic — outer-prime permutation (#2657), register sensitivity and disposition

## Decision for the Director

The exact #2657 conditional negative survives a materially broader spelling/tokenization register on both tested original sections. Do not commission a further dictionary-expansion or permutation-completion sweep without an independently selected change in the actual cipher law. This is corroboration of the existing finite lexical exclusion, not a new recovered key, plaintext, or general impossibility result.

The original model is C=π((P+prime[j]−1) mod29) for consuming nonzero P, with P=0 emitting π(0) and holding j, chapter-origin j=0. I inspected the [original report](../../im-results/lp2-outer-prime-permutation-original-gate.md) and [anchor implementation](../../sims/lp2_outer_prime_permutation_anchor_sft.cjs). Its map and clock constraints are necessary for this model; the tested anchors do not impose a hidden all-F-is-hold assumption. The report appropriately limits its claims to the finite register. The following independent audit specifically challenges its greedy spelling restriction and omission of native vocabulary.

## Independent executed check

Inputs (live main, read through GitHub connector): `resources/liber-primus/lp2-corpus.json`, `resources/transcriptions/lp2-image-corrected.txt`, `resources/control/english_wordfreq_textblob.txt`, `resources/external/relikd-solved-gp29-native-v1.json`. For p0–2, corrected transcript word flattening equals the 729 canonical chapter indices; the first eight groups of length ≥9 have (offset,length) (23,11),(62,11),(245,9),(304,9),(397,10),(425,9),(575,10),(630,9). For p40 the canonical offset31 length12 anchor is [16,4,22,6,28,9,25,17,1,18,17,1]. No change to clock, anchor, or original positions.

Register construction:
1. Parse each dictionary line matching `^([a-z]+) (\\d+)$`; uppercase and replace QU→CW, V→U, K/Q→C, Z→S. Include the four whole-word forms with neither, either, or both of ING→NG and IO→IA. (Not every possible independent replacement at multiple occurrences.)
2. For each form recursively enumerate every segmentation into the 29 exact `gp.translit` strings: at index i, recurse for each token that matches there, advancing its character length and appending its GP index; keep the requested rune lengths only. Deduplicate index tuples. Add exact GP runic groups from all solved native sections of matching length, since original LP2 targets are unknown.
3. For each candidate marker z and anchor offset o, enumerate j=o−count(z in c[0:o]) through o, inclusive. Begin partial g=π⁻¹ with g[z]=0 and inverse[0]=z. For each candidate word: if p=0 require c=z and hold j; otherwise require g[c]=(p+prime[j]−1) mod29, both map directions injective, then increment j. Retain legal tuples (j,end,g).
4. Join the eight p0 domains in ascending domain size. For disjoint left/right anchors with gap G and M intervening markers, require right.start−left.end in [G−M,G]. Merge only consistent maps in both directions; enumerate all joins without a node cap. Counts below include root and first viable singleton nodes; no complete joins. This is a relaxation of the full intervening legality constraint, so zero is a sound negative.

| Original test | Register | Result |
|---|---|---|
| p40 offset31 | original greedy + both rewrites | 767 distinct length12 forms, zero legal (marker,start,word) candidates |
| p40 offset31 | broader all tokenizations, four normalized forms | 1,748 distinct length12 forms, zero legal candidates |
| p40 offset31 | native exact GP groups separately | 2 distinct length12 forms, zero legal candidates |
| p0–2 | broader forms + exact native groups | length9: 5,926; length10: 4,417; length11: 2,987; zero complete joins |

Only markers 2,9,17,18 (rather than the original 2,9,17) have nonempty individual domains for all eight p0 anchors. Each has exactly ONE candidate at offset62, and exactly two DFS nodes (root + that candidate), then dies. Second domain in ascending order: z2 offset397 (25); z9 offset397 (2); z17 offset23 (3); z18 offset630 (1). No cap. The expanded register is not an arbitrary-language or resegmentation theorem. The expansion changes only the vocabulary; exact tokenizations outside the four spelling variants and non-dictionary words remain outside the audit.

## Research implications

This supports retiring the fixed origin-zero prime/outer-permutation intact-group route. It does not select the prime law from authentic LP2 clues, nor justify extending a uniform chapter clock across different ink scopes. Keep the original report's stated limits. Native synthetic plants support the implementation/inference under the planted mechanism; they do not identify the unknown LP2 mechanism. No reader-facing correction is necessary because the existing report already distinguishes its scope. No CI run, new assignment, or independent solve attempt was created.

Executed as an independent JavaScript connector-side audit (no remote CI); exact algorithm and data paths above. Reviewed #2650's residue-table code and #2651's documented constraints as adjacent independent finite-model exclusions; neither is a proof of arbitrary language. Reviewed active Director frontier, including #2656's explicit semantic-ranker and subsequent ciphertext-only inference gates; those gates are appropriate and should remain separate.
