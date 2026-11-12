# Signed 2016 GP-prime-rank permutation of the original p55 interiors

**Decision (12 November 2026): negative for the source-fixed signed-word rank and a stronger all-rank necessary frequency obstruction for direct GP29 English.** Neither frozen rank orientation produces legible original text. Any 43-position pure permutation retains the 43 original labeled GP symbol counts, which are far outside tested ordinary native-GP English windows. No authentic LP2 plaintext, key or mechanism is recovered.

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


## Full-page original punctuation obstruction

The p55 43-unit extraction leaves every printed one- and two-rune word without interior symbols. The five immutable two-rune words on physical p55 (fragments 2, 3, 6, 10 and 13 in zero-based 17-fragment order) are **`SB`, `XM`, `WR`, `EOE`, and `THOE`** under original GP29 transliteration. None can be changed by any substitution or permutation confined to the 43 strict interiors. A candidate that claims full original-page prose must supply a reversible operation on the 33 exterior positions too.

As an empirical native-GP comparison, the same transliterator applied to all alphabetic words in the three reference corpora produces **11,546** Shakespeare, **3,657** Gibran, and **20,947** Emerson two-rune words, **36,150 total**. Exactly **zero** occurrences have any of these five original two-rune identities. This is a source- and corpus-bounded constraint; names, non-English text, or altered word boundaries are not excluded. The architectural implication is that a successful 43-inner extraction alone cannot supply complete page-55 ordinary native-GP plaintext with the 33 exterior runes left as printed.

## Familywide pure-transposition obstruction

**A position-only permutation cannot change rune frequencies**, even when its key and ordering are completely unknown. The original p55 43-interior register has **21 distinct GP29 runes** and the nonzero multiplicity multiset `[4,3,3,3,3,3,3,2,2,2,2,2,2,2,1,1,1,1,1,1,1]`. The labeled-frequencies index of coincidence is **0.0343300110742**, preserved under any permutation.

Using exactly the preceding script's established GP-normalization, fit a one-gram native-English GP29 probability distribution with Laplace +1 smoothing to the first 240,000 characters of Shakespeare (174,998 GP tokens). Evaluate the *original* 43 rune symbols via the frequency-only average log score, `sum(count_i * log(prob_i))/43`. Its **−4.1325152735** score is invariant for **every possible permutation** of the 43 glyph positions.

The held-out native-English comparisons enumerate all **overlapping** windows of length 43, without re-fitting a model on those windows:

| Independent source | GP29 windows | Score ≤ original −4.132515 |
| --- | ---: | ---: |
| Shakespeare, held-out text | 43,760 | **0** |
| Gibran, *The Prophet* | 63,072 | **0** |
| Emerson, essays | 324,588 | **0** |
| **Total** | **431,420** | **0** |

The worst (minimum) comparison score by source is respectively **−3.53304465**, **−3.40748597** and **−3.47273623**, each much higher than the original. The comparisons deliberately reuse many overlapping controls, hence the zero count is empirical evidence across three source registers, **not a p-value from 431,420 independent draws**.

An allowance for **any unknown global one-to-one relabeling of the 29 GP symbols** changes the bound. By the rearrangement inequality, the exact best possible one-gram score after relabeling is found by sorting the original 29 occurrence counts and the 29 model log probabilities in the same descending order. That maximum is **−2.9871536165**. When *every held-out window is itself permitted its own optimal global relabeling*, **100/43,760** Shakespeare windows, **46/63,072** Gibran windows and **214/324,588** Emerson windows are at or below this optimum (**360/431,420** combined). Thus a secret alphabet substitution + positional permutation is constrained but **not excluded** by this statistic.

**Minimum symbol-changing burden against native controls.** A further *exact, key-independent* histogram calculation measures how many rune identities a putative decoder must alter before even the **multiset** of its 43 output runes can coincide with one native-English reference window. For any reference 43-rune frequency vector `R` and original p55 interior frequency vector `C`, the minimum identity replacements across arbitrary position rearrangements is `½ Σ_r |C_r − R_r|`. In the same **431,420** held-out sliding windows, the best possible match requires **14 replacements / 43** in Shakespeare (3 windows tie), **15 / 43** in Gibran (5 tie), and **14 / 43** in Emerson (7 tie). The mean minimum replacements are respectively **22.9017**, **23.6655**, and **23.3930** per window. Thus a source-selected mechanism that merely shuffles the 43 glyphs and changes one or two exceptional marker symbols has no match anywhere in these three native registers. The 14-rune lower number is specific to the finite control corpus; an unseen English sentence may have another letter inventory. This supplies a concrete required *degree of symbol change* for future 43-interior plaintext proposals, while keeping unknown-language or other alphabets open.

The familywide obstruction applies to a **direct, unchanged-alphabet, pure transposition of the 43 original interior rune identities into ordinary English in native GP29 spelling**. It does not exclude substitution or any other symbol-changing layer, another language, hidden extra symbols, or a larger ciphertext register that includes the exteriors. A human-directed puzzle may conceivably provide another source-selected operation. Simply trying more position permutations or optimizing rank ties cannot fix the observed alphabet-frequency mismatch.

## Separate frozen finite-field multiplication gate

The historically established 29-element prime/rune field supports multiplication and division as compact, reversible alternatives to the already-tested additive word key. The authenticated signed text's **43 GP29 rune word lengths** are all 1–9, so none vanishes in F29. Align them in signed-word order with p55's 43 strict original interior runes, with no rank, secret phase, reset, extra key, or fitted parameter. The two natural fixed orientations yield:

| Exact operation per position i | GP trigram log mean | Decipherment |
| --- | ---: | --- |
| `P_i = C_i × GP_length(word_i) mod 29` | **−6.148566** | No readable text |
| `P_i = C_i × GP_length(word_i)⁻¹ mod 29` | **−7.181809** | No readable text |

Both exact original-to-original inversions and solved-native 43/43 positive plants succeed. Independently, authentic signed GP-prime **word sums** have zero residues modulo29 at original signed-word indices **2 ('path')** and **20 ('meaning')**, where the actual aligned p55 interior ciphertext rune values are **12 and20**, both nonzero. Consequently, any literal multiplicative rule `C_i = K_i × P_i mod29` with `K_i = signed_GP_prime_sum(word_i)` is impossible at these original positions, and the inverse field rule requires dividing by zero. This excludes exact source-word prime sums as a *reversible* multiplicative field key without ad hoc exceptional handling. No unknown plaintext or historical key is recovered; source text does not expressly select multiplication. All controls and complete outputs are emitted by the same [read-only SFT](../sims/lp2_2016_signed_prime_rank_p55_sft.cjs).

## Verdict and possible successor

The frozen signed-word rank and its inverse fail under the task's original-language test, while the independent frequency-only invariant extends the rejection to the entire same-alphabet pure 43-interior transposition family under the stated native-English assumption. This is stronger than the narrow rank experiment in [Director #573](https://github.com/FlareZ123/liber-primus/issues/573) but still recovers no plaintext. A future hypothesis must independently supply another operation and explain why the source numbers select it; an unconstrained variation of rank scoring or tie breaking is not justified.

**Single-file reproducer:** [`sims/lp2_2016_signed_prime_rank_p55_sft.cjs`](../sims/lp2_2016_signed_prime_rank_p55_sft.cjs) (Node.js 22, read-only). It reports the full word list, exact prime sums, permutation, original ciphertext, page offset alignment, both outputs, independent native-window comparisons, wrong-order control and exact original/native-plant inversions.
