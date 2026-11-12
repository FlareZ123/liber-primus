# Signed 2016 GP-prime-rank permutation of the original p55 interiors

**Decision (12 November 2026): negative for the single source-fixed stable numeric-rank permutation and its exact inverse.** Neither produces legible original text. No unknown LP2 plaintext, key, or new cipher mechanism is recovered. This bounds a rank-transposition hypothesis; it does not reject unrelated uses of the authenticated 2016 message.

## Original-source motivation and independent inputs

The PGP-verified 2016 instruction says that the manuscript's words are the map, their meaning is the road and their numbers are the direction. The independently solved p57 PARABLE says to shed one's circumferences and find the divinity within. Physical p55 has 17 printed rune-word fragments totaling 76 GP29 runes, of which the 16 nontrivial fragments contain exactly **43 strict-interior runes**; the first fragment is a 1-rune carry from p54. The signed message has exactly **43 alphabetic words** after excluding the numeric tokens 3301 and 7A35090F. The coincidence suggests a one-to-one mapping but does not prove one.

Inputs are `resources/historical/cicada2016-4gq25-outguess.asc` (1,136 bytes; SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`), `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and the independent Shakespeare model source `resources/control/shakespeare_first300k.txt`. The signed-message GP conversion uses the exact existing canonical normalizer (QU→CW, V→U, K/Q→C, Z→S, longest GP transliterations), and the 2013-authenticated 29 consecutive-prime weights in the corpus.

## Frozen keyless permutation

Enumerate alphabetic signed words in signed order 0–42. Their **full GP-prime sums** (before reduction modulo 29) are:

```text
243,72,145,224,343,436,253,72,381,243,212,84,72,219,143,
179,175,72,211,114,319,84,72,204,215,114,295,175,72,
337,200,215,113,196,128,130,120,102,322,292,198,217,249
```

Stable ascending GP-prime-sum order, ties by original position:

```text
1,7,12,17,22,28,11,21,37,32,19,25,36,34,35,
14,2,16,27,15,33,40,30,23,18,10,24,31,41,13,
3,0,9,42,6,39,26,20,38,29,4,8,5
```

With original interior GP indices `C[0..42]`, let `Q` be that frozen permutation. The forward candidate is `P[i]=C[Q[i]]`; the inverse candidate is `P[Q[i]]=C[i]`. **No additive pad, shifted key, optimized rank direction, alternate tie breaker or page reset** was used. The 43 source interiors occupy physical-p55 zero-based offsets:

```text
2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,
30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,
56,57,58,59,60,65,66,67,68,71,74
```

All other **33 original page runes** remain at their exact offsets, including the p54 carry at offset zero. The reproducer emits both full 17-fragment page alignments and source-word/offset data.

## Original-cipher outcomes

| Reading | Complete 43-GP-symbol Latin rendering | GP29 trigram score | Held-out native comparison |
| --- | --- | ---: | --- |
| Ascending stable rank | `IAXPDIFSEASNGHETHTHMEOCEUEOCXIAHEAPGJIGMCEIAMEOLIGDBTH` | **−6.455475** | Worse than 1,018/1,018 windows |
| Exact inverse rank | `GMCXCETHIJSHIAEOGUNGPGPEAEAADIAEOFEHTHMDECLIMXBITHSIEO` | **−6.691259** | Worse than 1,018/1,018 windows |

Each candidate is exactly 43 GP symbols even though multi-letter transliterations make its rendered Latin string longer. The outputs lack coherent words or sentences, including when reattached to the 33 untouched exteriors at printed original offsets. The original interior index of coincidence is **0.0343300111** and is unchanged under both permutations, a necessary invariant that independently contradicts a straightforward plaintext-anagram interpretation in ordinary GP29 English.

A smoothed GP29 additive-backoff trigram model is trained on the first 240,000 characters of the existing independent Shakespeare corpus. The final held-out 43,802 GP-symbol sequence provides **1,018 nonoverlapping 43-symbol windows**; the minimum (worst) score is **−3.118039** and the median is **−2.384825**. An actual 43-rune excerpt of solved p57 scores **−2.593126**. Both original permutation outputs score far below every held-out window. This calibrated mismatch is specific to ordinary native-GP English, not an all-language or all-cipher proof.

The frozen permutation and its inverse return **43/43** original GP indices exactly. A native 43-rune solved-p57 plant, encoded with the inverse of each candidate operation, is decoded **43/43**; the original exterior 33 positions are checked unchanged. A reversed numeric-rank order is included as a wrong-order control and never used to select a candidate. As for all invertible transformations, the exact round trip demonstrates implementation correctness, not historical key validity.

## Verdict and possible successor

This test closes the single explicit ascending GP-prime rank mapping proposed in [Director #573](https://github.com/FlareZ123/liber-primus/issues/573). A literal rank produces no plaintext. A future hypothesis must independently supply another operation and explain why the source numbers select it; an unconstrained variation of rank scoring or tie breaking is not justified.

**Single-file reproducer:** [`sims/lp2_2016_signed_prime_rank_p55_sft.cjs`](../sims/lp2_2016_signed_prime_rank_p55_sft.cjs) (Node.js 22, read-only). It reports the full word list, exact prime sums, permutation, original ciphertext, page offset alignment, both outputs, independent native-window comparisons, wrong-order control and exact original/native-plant inversions.
