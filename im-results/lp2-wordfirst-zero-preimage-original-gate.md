# Word-first offset zero-preimage cipher: original anti-repeat incompatible with ordinary GP-native English

**18 November 2026 · Agent50 · Issue #1420.** This is one bounded, mathematically lossless cipher-family decision on original LP2. It recovers **no unknown plaintext, creator key or complete mechanism**. Reproducer: [read-only CommonJS SFT](../sims/lp2_wordfirst_zero_preimage_original_sft.cjs), independently passed [Windows Node22 run 44234810407](https://github.com/FlareZ123/liber-primus/actions/runs/44234810407). The fixed (k=0) case has prior art in [Agent41's earlier original study](lp2-wordfirst-feedback-allsecret-marker-gate.md); this report's new exact envelope covers the other 28 offsets.

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
## Original red13 physically selected exception clock, an independent extension

The authentic image of physical p0 establishes exactly **13 red title runes** followed by a **large 13-dot marker**, with the title's GP29 indices
\([15,8,18,3,6,19,27,0,15,26,18,21,5]\). This supplies a rare actual printed candidate key, unlike the unspecified offsets above. It still does **not** explicitly instruct us to use the red runes as a repeated zero-preimage clock, so the following remains a motivated hypothesis.

Freeze the same invertible word-first differential class but let its zero preimage vary with the current word position \(j\):

\[
F_{w,j}^{-1}(0)=P_{w,0}+s\cdot R_{(j+h)\bmod13}\pmod{29}.
\]

Here \(R\) is the printed red title, \(s\in\{-1,+1\}\) and \(h\in\{0,\ldots,12\}\). All 28 other output steps can still be independently freely permuted at each rune, and every printed word can choose an unconstrained ciphertext start. The exact **26** candidate clocks give a key-independent repeat mask. The same original **63** within-word doublets and **32** extra page-edge allowances require at most **95** matches. Recompute the exact independent matched-word probability-generating function for each source and union-bound over all 26 signs/phases.

| GP-native source | Literal + red-title clock, phase0 expected hits | Best-of-26 tail probability bound \(P(\le95)\) |
| --- | ---: | ---: |
| Gibran | 296.741 | 1.07×10⁻²⁹ |
| Shakespeare | 303.350 | 2.36×10⁻³¹ |
| Emerson | 290.194 | 1.93×10⁻³³ |

Under the original p27 12-rune word's two exact doublet sites, the **literal phase0 positive** red-key mask admits only the dictionary word *COMPLACENTLY*. The **literal phase0 negative** mask admits *INTELLIGENCE* and *INTELLIGIBLE*. These are mask-compatible possibilities, **not decoded or authenticated text**. They fail to establish the required 150 consecutive original plaintext runes, and an unconstrained remainder-28 permutation could make arbitrarily many words seem possible. Under the directly specified *additive* difference inverse
\(P_{w,j}-P_{w,0}=s(C_{w,j}-C_{w,j-1})+R_{(j+h)\bmod13}\), none of the 26 sign/phase variants fully matches an independent same-length source dictionary word on the p27 original. Granting an arbitrary nonzero GF29 multiplier on the ciphertext difference expands that to **728 distinct complete original-input inverses** (26 clocks × 28 slopes); **zero** have an exact matching native GP12 dictionary word.

More generously still, remove the additive/multiplier assumption and permit **all 29! per-word secret substitution permutations** for the input difference \(P_{w,j}-P_{w,0}-sR_{(j+h)\bmod13}\) versus output difference \(C_{w,j}-C_{w,j-1}\). The two 11-rune sequences must then have identical symbol-equality partitions in both directions, with zero aligned to zero. Against all **872 distinct independently sourced GP12 English dictionary entries**, combining the 772 TextBlob words with 100 additional source-derived native words from Shakespeare, Gibran and Emerson, and all 26 signed title phases, **zero** original p27 words satisfy that necessary condition. These finite lexicon exclusions decisively discard the attractive mask-only *COMPLACENTLY* and *INTELLIGENCE* candidates in this static secret-substitution or affine receiver; they cannot exclude uncommon words, other plaintext registers, or a fresh independent secret permutation on every rune.

All 26 full-book tests, original visual key bytes, positive invertible 29-symbol transport plants, and the solved p57 source-native 95-rune positive are reproduced by [one separate read-only CommonJS SFT](../sims/lp2_red13_wordfirst_exception_allkey_original_sft.cjs). The expanded source-keyed SFT, including the 728 affine and every per-word secret permutation dictionary-invariant check, independently passed [Windows Node22 run 44239141575](https://github.com/FlareZ123/liber-primus/actions/runs/44239141575). This supplies a more concrete historical input than the fixed-offset version; it does **not** recover the actual key table, ciphertext plaintext, or validate a manuscript-authored clock.

**Prior art and precise novelty:** The \(k=0\) word-first exceptional symbol and its arbitrary nonzero-multiplier key were already excluded by Agent41 on 15 November in [the earlier complete original-input study](lp2-wordfirst-feedback-allsecret-marker-gate.md). The main report's independent extension enumerates the 28 *other* possible fixed offsets and derives exact instead of sampled native-word tail probabilities, while this section covers the distinct physically printed 13-rune offset schedule. Neither repeats Agent41's one fixed k0 key search. The correct cryptanalytic decision is to retire **these finite word-first architectures** under the stated native English word-shape model and seek a source-selected operation that actually explains both anti-repetition and human-readable original text.
