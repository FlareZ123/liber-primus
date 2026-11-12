# The 1729 taxicab / 729 first-chapter cross-chapter clock gate

**12 November 2026, Agent14. Evidence class: a new source-length hypothesis and an exact key-independent original-cipher necessary condition, calibrated against independently fixed native-GP prose.** No previously unknown LP2 plaintext, authentic key, original authorial cube instruction or intended destination has been recovered.

## A bounded possible human solve path

The actual original-image red-heading/13-dot chapter map selects the first unsolved chapter **physical pp0–2**, whose combined length is **729** GP runes, and the tree/insect chapter **pp8–14**, whose combined length is **1,729** runes. These are the unmodified source rune inventories in `resources/liber-primus/lp2-corpus.json`. The second total is the famous smallest taxicab number:

```
729  = 9³
1729 = 9³ + 10³ = 1³ + 12³
```

This yields **two fixed, independently specified 729-rune windows** in the tree chapter: offsets **[0,729)** and **[1000,1729)**. Both could hypothetically be compared with the whole 729-rune first chapter under a repeated shared stream of 729 secret substitutions, as occurred on a smaller scale in some earlier Cicada Vigenère stages. There are no fitted offsets, secret permutations, candidate English cribs or language scores selecting the two windows.

**Critical obstacle to authorial selection:** neither cube split is a visible page/chapter boundary. Offset729 cuts inside physical p10 at local rune offset206, and offset1000 cuts inside physical p11 at offset214. The distinct decomposition **1³+12³** cuts immediately after the first character of p8's longer original red opening. The manuscript nowhere instructs readers to compute the taxicab decomposition or reuse a key between these chapters. The arithmetic alone is a research-selector hypothesis, not an established cipher architecture.

## Complete key-independent shared-state test

For the strongest practical version of this proposed route, grant an **arbitrary secret 29-way alphabet bijection independently at each of 729 positions**, provided the *same bijection at the same position* is reused on both chapters. This includes every shared 729-symbol modular additive pad, every common position-specific Atbash/Caesar map, and much more elaborate secret single-symbol permutations. If ciphertexts are `C[i]=F_i(P[i])` and `D[i]=F_i(Q[i])`, the exact equality invariant is:

```
C[i] == D[i]   if and only if   P[i] == Q[i].
```

Every possible secret `F_i` preserves the **number of equal aligned positions**. No search for a key is required. On the complete **original, untouched** source:

| Source-frozen alignment | Equal GP rune identities /729 | Rate |
| --- | ---: | ---: |
| Original pp0–2 versus pp8–14 offsets **0–728** | **20** | **2.7435%** |
| Original pp0–2 versus pp8–14 offsets **1000–1728** | **24** | **3.2922%** |

An authentic common position-wise bijection would force *its unknown plaintexts* to share these exact equality counts. To calibrate ordinary GP-native English, independently freeze the repository's Shakespeare `first300k` text and Gibran *The Prophet*, transliterate each by the standard GP longest-token convention including ING, then draw **20,000 deterministic independent 729-rune window pairs** (xorshift32 seed `0x1729729`). The resulting source-native counts are **217,644** Shakespeare runes and **62,696** Gibran runes.

| Native-GP English control statistic | Observed |
| --- | ---: |
| Mean equal positions in a pair | **43.5556 /729** |
| Smallest in 20,000 native pairs | **21** |
| Native pairs with at most **20** equal positions | **0/20,000** |
| Native pairs with at most **24** equal positions | **18/20,000** |

The conditional sample upper-tail for equally sparse or sparser shared-position matches is **≤1/20,001** at the 729-prefix cut and **19/20,001** at the 729-suffix cut using add-one calibration. These figures are *not* a discovery-calibrated p-value, because the numerical relationship was noticed in the already studied chapter lengths. They show the candidate is **poorly supported as an ordinary native-English shared-cipher model** under both natural cube placements, especially the first.

## Reversible positive control and precise decision

The companion read-only CommonJS SFT uses the unchanged original 729/1729 GP-index streams, whole independent source corpora, and 20,000 deterministic native pairs. As a direct cipher control, it creates **729 independent random secret alphabet permutations**, applies the same secret permutation at each position to two separately sourced 729-rune native plaintexts, then inverts **both entire 729-rune outputs** exactly. It asserts that their original equality count is preserved under *every* generated secret alphabet, rather than presuming this from an additive-only synthetic plant. The code also asserts original page-local cube cuts and computes the corresponding additive-difference zero counts.

**Decision:** Do not spend resources recovering a 729-symbol common key from this postulated 9³/10³ relationship. The original aligned equality inventories are substantially sparser than native-GP prose under a shared arbitrary per-position bijection. More importantly, the cube boundaries are not source-marked. A future independent original instruction naming a shared cube/key, an alternate plaintext register, a position-dependent state that differs between the paired blocks, or a concrete unknown-page plaintext would define a different question. The present test supplies no decrypted words and should not be promoted to `results/`.

Reproducer: [`sims/lp2_taxicab1729_cube729_sharedstate_sft.cjs`](../sims/lp2_taxicab1729_cube729_sharedstate_sft.cjs).
