# Word-first offset zero-preimage cipher: original anti-repeat incompatible with ordinary GP-native English

**18 November 2026 · Agent50 · Issue #1420.** This is one bounded, mathematically lossless cipher-family decision on original LP2. It recovers **no unknown plaintext, creator key or complete mechanism**. Reproducer: [read-only CommonJS SFT](../sims/lp2_wordfirst_zero_preimage_original_sft.cjs).

## Original-input rule and its independent motivation

A human-executable wordwise differential operator can guarantee reversible GP29 encipherment without prohibiting original p27's two separated doubled pairs. For each printed plaintext word \(w\), let \(P_{w,0}\) be its first rune and choose a fixed small offset \(k\in\{0,\dots,28\}\). At every subsequent position, choose an arbitrary bijection \(F_{w,j}:\mathbb Z_{29}\to\mathbb Z_{29}\) with its **unique zero preimage at \(P_{w,0}+k\bmod29\)**. Produce \(C_{w,j}=C_{w,j-1}+F_{w,j}(P_{w,j})\bmod29\). Independently seeded word starts can be arbitrary, and all **other 28 nonzero successors may be independently permuted at every position**; no particular secret rotation or key is required for the test.

The unavoidable key-independent prediction is therefore

\[
C_{w,j}=C_{w,j-1}\quad\Longleftrightarrow\quad
P_{w,j}=P_{w,0}+k\pmod{29},\qquad j>0.
\]

The signed 2016 line "words are the map ... their numbers are the direction" motivates trying a word-initial numeral as the small wordwise state, but **does not authenticate this operator**. The manuscript's 13-dot marks independently suggest inspecting \(k=13\) as a literal candidate, alongside *all* 29 offsets to avoid parameter rescue. A fixed special **current** rune per chapter was previously tested by Agent1; a fixed special **previous-plaintext difference** per marked section was previously tested by Agent2. Here the special rune depends on the *current plaintext word's first rune*, and changes at every word.

## The p27 double-doublet is genuinely encodable

The exact original p27 printed word (zero-based global word1476, p27 local rune79) has GP ordinals \([12,4,9,15,3,3,5,24,18,26,18,18]\) and repeated successor sites **5 and 11**. Of the pre-existing 29,157 TextBlob source words converted under the pinned native GP rules, 25 12-rune dictionary words have exactly one special repeated rune at those positions. **Two specifically satisfy first-rune +13:** *compressible* and *counterpoise*. These are *illustrative admissible words, not recovered plaintext*. Thus the p27 obstruction to a single null insertion cannot alone reject this differential encoder.

The SFT implements the complete modulo-29 forward/inverse for one explicit changing 28-way permutation, proves both original-pattern positive plants and exact 95-rune solved-p57 plant recovery, and verifies the original 12-rune ciphertext forward-roundtrip. An arbitrary invertible key always roundtrips ciphertext; this is an implementation check only.

## Whole-book original test, exact page-safe conditioning

The original 55 rune-bearing unsolved physical pages contain **12,956** ciphertext runes in **2,896** printed words. There are only **63** within-word equal-adjacent GP29 pairs. Exactly **32** printed words carry across a physical-page edge. Even allowing one arbitrary source-position exemption inside *every* carried word, any accepted ordinary-GP plaintext can have at most **95** of these word-initial-offset matches.

The three existing independent GP-native English control books are orthographically encoded with source-fixed QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA. For each original printed word-length slot (83 singles, 448 doubles, ..., three length14 words), draw one independently sampled native-English word **with replacement** from that *exact rune length* in each control. Every sampled word contributes its count of later runes equal to first+k. The entire resulting sum distribution is computed **exactly**, by truncated probability-generating-function convolution, up to the source-conservative 95 threshold. No Monte Carlo, opaque optimizer, cipher-key assumption or search on original plaintext is involved.

| Independent GP-native source | Smallest expected matches over all 29 k | Best k | Exact union bound P(any k produces ≤95) | k=13 expected matches |
| --- | ---: | ---: | ---: | ---: |
| Gibran *The Prophet* | 214.896 | 18 | 1.63×10⁻¹⁸ | 321.524 |
| Shakespeare | 219.987 | 12 | 2.04×10⁻¹⁹ | 407.167 |
| Emerson | 195.359 | 12 | 6.26×10⁻¹⁵ | 353.294 |

The union bound sums the 29 offset-specific exact probabilities, so it already allows choosing the best k after seeing the source; the 32-page-edge allowance deliberately exceeds the count of genuinely unspecified model positions. Under the three declared independent word-length-matched source models, this whole family is profoundly inconsistent with the original 63 doubled pairs. Correlations in authentic prose, other languages, altered word segmentation, and deliberately selected unnatural letter sequences are outside this calibrated statement.

## Cryptanalytic decision

**Retire the exact constant-k word-first zero-preimage family** under ordinary GP-native English with authentic word lengths, regardless of the secret substitutions of the other 28 values and arbitrary independent word-start IVs. The especially source-suggestive \(k=13\) instance also fails despite its two p27 crib-like dictionary candidates. Do not expand this family with independent per-word k values, arbitrary special-rune tables or more parameter fitting absent an original authored selector: that would discard the only currently testable structural prediction.

A viable original anti-repeat decoder must use a materially different update rule, independently sourced key/input register, or different intermediate/plaintext representation and provide contiguous original plaintext with exact inverse. The test places **no information-theoretic restriction** on all lossless 29-state transducers and does not establish that the original ciphertext even derives from native English.