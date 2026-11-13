# Original LP2 cumulative-difference zero-symbol gate

**Status (13 November 2026): bounded, source-original negative result.** This tests the simplest reversible explanation for LP2's rare adjacent repeated runes without selecting a key from language scores. It recovers no unknown plaintext or actual cipher.

## Distinguishing invariant and original observations

Consider any **stationary**, continuous cumulative GP29 encoder

\[
C_i=(C_{i-1}+h(P_i))\bmod29,
\]

where \(h\) is **any secret bijection** of the 29 GP symbols. The condition \(C_i=C_{i-1}\) holds precisely when \(P_i=h^{-1}(0)\). Thus every ciphertext doublet locates one and the same (unknown) plaintext rune. All 29 choices for that rune are covered without finding the other 28 entries of \(h\).

The exact p0–p55 source transcription, with 32 unmarked physical-page word continuations joined, contains **12,956 runes** in **2,896 printed words**. Its 86 adjacent equal-rune transitions comprise **63 inside words** and **23 across word separators**. To avoid treating sentence/page punctuation as a continuous cipher clock, this experiment uses only the **22 doublets across 2,720 literal hyphen word boundaries**, plus **19 doublets at the last rune of 2,813 words of length at least two**. The other cross-word doublet follows a period and is excluded from the test.

## Independent fixed-English comparison

The three pinned control files Shakespeare, Gibran and Emerson provide **149,072 words**, encoded as GP29 using the independently solved-LP1 orthography, including one-rune ING and IO. For each original printed word length, treat its hypothetical plaintext as an independent uniform draw from the control words of the same *GP-rune* length. This is a finite, length-stratified model of English, not an assertion that the author wrote those texts.

For every candidate \(g=h^{-1}(0)\), calculate expected GP-\(g\) counts at positions following literal hyphens and at within-word terminal positions. The resulting model gives:

| Candidate \(g\) | Expected ordinary word starts | Expected word-final positions | Original doublets |
|---|---:|---:|---|
| U (least excluded candidate) | 55.091 | 47.965 | 22 / 19 |
| G | 65.762 | 6.208 | 22 / 19 |
| EA | 7.628 | 1.178 | 22 / 19 |
| NG/ING | 0.292 | 58.073 | 22 / 19 |
| IA/IO | 0.034 | 3.317 | 22 / 19 |

For each of the **29** unknown special runes, the probability of getting *both* observed counts is no larger than the smaller one-sided Chernoff tail of the two length-stratified Poisson-binomial marginals. A conservative sum over all 29 choices gives **1.8276376395094553 × 10⁻⁶**. This bound is valid **under the specified independent-word sampling model**; it is neither an exact authorial probability nor a deterministic prohibition on all English.

An independent, nontrivial cumulative-cipher positive plant uses \(h(p)=(p-21)\bmod29\) on genuine native-GP words; the doublet positions equal the plaintext NG positions exactly. The test also checks original word/rune counts, both observed position counts, and source-native ING/IO encodings.

## Independent visual-chapter reset sensitivity

The manuscript itself visibly delineates nine red-heading chapters with original GP-rune end offsets **729, 1,874, 3,603, 5,506, 6,527, 7,960, 9,640, 12,648 and 12,956**. Allow the completely unknown special zero-rune \(h_j^{-1}(0)\) to be independently chosen in each chapter, retaining each original word and the same GP-native English model. Omit any ordinary word-boundary event whose predecessor crosses a chapter boundary. This distributes the **22 ordinary boundary** and **19 word-terminal** observed doublets across the chapters without adding or deleting runes.

| Visual chapter | Original printed words | Ordinary-boundary doublets | Word-final doublets | Conservative all-29-rune union bound |
|---|---:|---:|---:|---:|
| pp0–2 | 158 | 2 | 1 | 1 (uninformative) |
| pp3–7 | 255 | 2 | 0 | 1 (uninformative) |
| pp8–14 | 383 | 2 | 2 | 0.121516 |
| pp15–22 | 437 | 0 | 3 | 0.145524 |
| pp23–26 | 224 | 2 | 4 | 0.560080 |
| pp27–32 | 326 | 5 | 2 | 0.825667 |
| pp33–39 | 378 | 3 | 3 | 0.281445 |
| pp40–53 | 669 | 4 | 4 | 0.0206975 |
| pp54–55 | 66 | 2 | 0 | 1 (uninformative) |

Because independent words in different chapters are independent **within the same stipulated control model**, the product of these conservative per-chapter bounds is **4.7635848401690264 × 10⁻⁵**. This also disfavors one freely secret stationary cumulative alphabet *per original red chapter*, though less strongly than the single-global-alphabet gate. Each probability remains conditional on word-length-matched independent control sampling, constant alphabet within a chapter, and preserved printed boundaries. It is not an exact probability that the author used such a cipher and has no key/plaintext output.

## Keyless rank-spectrum exclusion (stronger, simpler invariant)

The same cumulative equation has a second necessary condition independent of the equal-rune event: **for every one of the 29! secret bijections \(h\), the unigram count histogram of plaintext \(P_i\) is a permutation of the adjacent ciphertext-difference histogram.** No secret index ordering can repair a mismatch in their *sorted* frequency spectra.

Count all **12,955** adjacent original LP2 rune differences and compare their sorted 29-component frequency vector with the native-GP-English frequency vector from the same pinned 149,072 control words, weighted to match all original printed rune-word lengths. Sorting both vectors gives the **optimal bijection** for total-variation distance *and* multinomial KL divergence by the rearrangement inequality. The first difference bin (zero) has **86** observations, while the other 28 bins span **404–510**. In contrast, the length-matched native-English expected counts run from **approximately 1.16 (AE), 5.70 (EO), 6.01 (OE)** up to **1,556.77 (E)** across 12,956 runes.

**Result:** even the best arbitrary hidden permutation has **minimum total-variation distance 0.3281140532**, and **minimum KL divergence 0.5971402079 nats per ciphertext-difference rune**. A positive plant using real GP-native words drawn with the original word lengths, transformed through an actual secret cumulative bijection, meets the native-spectrum check (deterministic seed and assertion in the SFT).

Allowing the secret alphabet to change independently at **all nine visibly delineated chapter starts**, the individual chapter minimum total-variation distances are:

| Chapter | Runes | Minimum possible TV after all secret bijections |
|---|---:|---:|
| 0 | 729 | 0.276785 |
| 1 | 1,145 | 0.285211 |
| 2 | 1,729 | 0.293876 |
| 3 | 1,903 | 0.300254 |
| 4 | 1,021 | 0.298109 |
| 5 | 1,433 | 0.284513 |
| 6 | 1,680 | 0.290466 |
| 7 | 3,008 | 0.307310 |
| 8 | 308 | 0.203764 |

The table removes one cross-chapter difference at each new chapter and reweights the reference by that chapter's own printed word lengths. The magnitude of the whole-book and chapter-wise mismatch strongly disfavors any source-native-English stationary cumulative alphabet substitution, global or chapter-specific. **TV and KL are descriptive distances under this particular English control distribution**; they are not by themselves authorial probabilities. An alternate non-English/register distribution, variable secret alphabet within chapters, an evolving cipher state with non-bijective emission, or altered word boundaries could escape this constraint. The result does not identify an actual LP2 plaintext or key.

## Arbitrary affine ciphertext feedback with a secret *nonlinear* GP alphabet

Generalize the entire family to \(C_i=a C_{i-1}+h(P_i)\pmod {29}\), allowing **all 29 possible ciphertext-predecessor coefficients \(a=0,\dots,28\)** and any **unknown bijective (possibly nonlinear) alphabet \(h\)**. For a given \(a\), the observable \(C_i-a C_{i-1}\) has exactly the same sorted symbol-frequency spectrum as hypothetical plaintext GP29, regardless of which of the **29!** mappings \(h\) is used. A constant intercept is absorbed into \(h\). This includes simple monoalphabetic substitution at \(a=0\), cumulative substitution at \(a=1\), and any other fixed one-tap affine feedback transport.

Under the same pinned, original-word-length-weighted native GP29 English model, the **best slope of all 29 is \(a=1\)**, with the already reported **minimum TV 0.3281140532**. The second-best is \(a=4\), with TV **0.3390750721**; the worst is \(a=22\), with TV **0.3489554272**. Every possible coefficient is exhausted without guessing a single entry of \(h\). A synthetic independent English plant under **nonunit slope \(a=17\)** and a **nonlinear secret permutation \(h(p)=p^5+7\pmod {29}\)** passes the exact source-native sorted-rank test.

This extension rules against the **complete 29×29! stationary one-tap family** as a direct explanation for the original native-English GP plaintext. It strengthens the prior original-cipher affine feedback scan, which enumerated the 29 slopes using index of coincidence, by comparing its *entire optimally relabelled frequency spectrum* under the original word-length register. As throughout, dynamic hidden alphabet updates, repeated key resets, a plaintext representation other than GP29 native language, and intermediate scrambling remain outside the test.

## Consequence and limits

A simple **word-boundary-preserving, book-stationary, unkeyed cumulative alphabet permutation** fails a discriminating original-input test even when the secret alphabet is unrestricted. Uniform nonzero ciphertext differences alone do not establish a no-repeat cipher. A changing stream key, a reset at each printed word, a different alphabet or spelling register, non-English plaintext, and any operation that breaks the zero-event equality are outside this result. In particular, the 22 ordinary-boundary events cannot test an encoder that resets state at every word.

This is a separate constraint from previous all-secret substitution tables indexed by ciphertext history. Further arbitrary nonzero-difference key scans would avoid this invariant without supplying an intended solve path; a new independently visible source selector would be needed.

**Reproducer:** [offline Windows-compatible CJS SFT](../sims/lp2_cumulative_difference_zero_symbol_sft.cjs). Inputs are the checked-in original transcript, GP inventory and three pinned original control corpora. No network or unseeded simulation is required.
