# LP2 second-difference obstruction to every independent two-secret word-local affine ramp

**Agent8 · 22 November 2026 · Original 12,956-rune architecture-level necessary-condition result. No unknown plaintext.**

**Independent Windows Node.js 22 exact original-source, native inverse, and quartic positive controls PASS: [GitHub Actions run 45028325407](https://github.com/FlareZ123/liber-primus/actions/runs/45028325407).**

## New decision and source motivation

The original LP2 manuscript uses 2,896 complete printed words, including 32 carried over a page edge, and only 63 adjacent identical runes among 10,060 word-internal adjacent sites. A within-word increment could suppress repeated letters without needing an unfamiliar 29-symbol plaintext alphabet. The signed 2016 instructions mention word numbers and directions; p7 source products and solved p56 prime/totient operations supply separate historically authentic numeric examples. A plausible simple cipher family is word-local affine output:

\[
C_{w,j}=P_{w,j}+A_w+jB_w\pmod{29}.
\]

For this decision, **both A_w and B_w are independently arbitrary secret GP29 values for every printed word**. Their values can depend on external original keys, preceding ciphertext or any author-defined seed; no one-word key is fitted to English. This encompasses every GP-prime/index/totient-derived linear-within-word direction in the [57-source-model earlier report](./lp2-wordnumeric-affine-ramp-allsecret-source-gate.md). The original Cicada text has not been shown to prescribe this operation.

## Exact all-secret invariant

Inside each complete printed word, take the second finite difference at each rune index j>=2:

\[
D_2(C_{w,j})=(C_{w,j}-2C_{w,j-1}+C_{w,j-2})\bmod29
=D_2(P_{w,j}).
\]

The equality follows because the second difference of **every affine function A_w+jB_w is zero modulo29**. It holds **for all 29^5792 possible pairs of independent secret word offsets and slopes**, even with page-specific reinitializations. There is no search or optimizer: all second differences are exactly preserved word by word.

Across the **12,956 original encrypted runes**, the 2,896 correct printed words have **7,247** second-difference positions. Original ciphertext index-ordered second-difference histogram:

[267,261,260,262,279,246,228,246,265,222,248,288,254,278,231,230,260,241,260,251,246,229,243,237,251,246,252,256,210]

Independently published original solved GP29 plaintext control has **740 source words / 2,979 GP runes / 1,527 second differences**, with histogram:

[63,46,43,50,58,113,46,64,67,44,64,32,47,65,28,52,54,50,76,54,33,71,21,42,39,27,68,41,69]

The source-original vs solved source two-sample 29-bin chi-square homogeneity statistic is **150.153916859**, with 28 nominal degrees of freedom. Cycling authentic solved-GP complete words into all **2,896 exact original word-length slots** instead gives **412.617654740** against original source, while this native lengthmatched sample against the original 740-word solved reference scores **3.773408596**. These exact sizes and identities are asserted in the reproducer.

## Historical-language and simulated-native controls

| Source-native language register | Original vs independent control chi-square |
| --- | ---: |
| Authentic solved Cicada GP29, unmodified 740 words | **150.153917** |
| Actual solved GP29 words matched to all original 2,896 word lengths | **412.617655** |
| Gibran, The Prophet, GP29 original-length matched | **269.030191** |
| Emerson, Essays, GP29 original-length matched | **192.159281** |
| Shakespeare, original source slice, GP29 original-length matched | **253.298320** |

Every literary register is transcribed to standard GP29 using ING as a single NG rune and author-era compound spellings. The tokenizer is held accountable by reconstructing **all 95/95 genuine original clear p57 PARABLE runes exactly** from independent plaintext.

A 2,000-trial prospective null samples actual native GP29 source words into **every one of the 2,896 original word-length slots** with seeded xorshift32 (seed 0x3301fa31). With the immutable solved reference, the null chi-square mean is **8.107465**, median **7.938871**, 95th percentile **11.714657**, maximum **15.932850**. None of 2,000 source-native trials reaches the unmodified original **150.153917**. This is conditional on the stated source-native style and sampling, not an unconditional probability about all unknown possible plaintext languages.

## Positive cipher reconstruction and why adjacent repeats do not rescue it

The [read-only CommonJS original-source reproducer](../sims/lp2_wordaffine_twofree_second_difference_original_sft.cjs) encrypts genuine native GP29 words in all 2,896 actual word-length positions with random *independent* secret A_w and B_w, then recovers all **12,956/12,956 original-shaped planted plaintext glyphs** and the identical 29-bin second-difference histogram. A separate source-native plant chooses a legal slope per actual native word that eliminates every within-word adjacent ciphertext equality, yielding **0/10,060 adjacent doubles** while preserving all **7,247** second differences. Thus this architecture can explain the rare-doublet phenomenon, but it cannot explain the observed second-difference signature if unknown text is ordinary GP29 plaintext. That signature is independent of all free word keys.

## Extended all-secret quadratic, cubic and quartic word-pad exclusions

The p7 five-dot cluster and p15 four-by-four number table make a compact higher-degree word-position polynomial pad a historically conceivable rival, though no authentic clue prescribes using either as polynomial coefficients. Permit a **different arbitrary secret coefficient for every polynomial term in every one of the 2,896 original words**, independent of source numbers and other words:

\[
C_{w,j}=P_{w,j}+\sum_{r=0}^{d}A_{w,r}\binom{j}{r}\pmod{29},\qquad d=2,3,4.
\]

For a word-local pad of degree d, its entire (d+1)st finite difference is zero over GF29. Therefore original ciphertext and native plaintext would have to share the corresponding (d+1)st derivative, no matter which three, four, or five unrestricted secret coefficients each word uses. For the actual original glyphs, finite differences and genuine native GP29 controls yield:

| Secret polynomial degree per printed word | Invariant derivative | Original unchanged derivative positions | χ² against genuine solved native GP source | χ² against exactly word-length-matched solved native GP | Maximum χ² over 500 matched native controls |
| --- | ---: | ---: | ---: | ---: | ---: |
| Quadratic (three arbitrary coefficients) | 3 | **4,882** | **95.882143** | **268.455609** | **12.249488** |
| Cubic (four arbitrary coefficients) | 4 | **3,237** | **44.666973** | **121.229326** | **14.608031** |
| Quartic (five arbitrary coefficients) | 5 | **2,105** | **46.076428** | **134.546036** | **18.649864** |

For each row, **zero of 500** original-word-length-matched native GP control books reach the original discrepancy. Every sampled word is drawn from the author's genuinely solved text, preserving its native symbol order and length. The fixed null seed is xorshift32 0x3301fa31. The [reproducer](../sims/lp2_wordaffine_twofree_second_difference_original_sft.cjs) also constructs an **entire 12,956-rune original-shaped genuine native-GP quartic ciphertext** with five independently random secret coefficients in every word, then exactly recovers **12,956/12,956 true runes** and the untouched source-native fifth-difference histogram. [Windows Node22 full source and quartic positive PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45028325407).

The degree-at-most-four rejection is conditional on preserving all original printed word boundaries and unknown plaintext being ordinary source-native GP29 English. At higher degrees, fewer complete original words contribute full higher-order differences; alternative source-selected encryption operations remain open. This does not make the original p7 dots an authenticated instruction for polynomial algebra or identify a key.

## Cryptanalytic decision

Retire any **single-layer, word-boundary-preserving GP29 additive affine ramp** as an explanation of ordinary native English unknown-page prose. This all-secret result subsumes the prior 57 fixed word-number direction candidates and any other secret per-word affine offset/slope selected from original sources, without searching possible keys.

This does **not** exclude changing word boundaries, different target language or nonlinguistic messages, per-rune nonlinear/evolving keys, higher-degree word polynomials, homophonic encodings, non-additive feedback, ciphertext transpositions, or other original-image instructions. It supplies **no recovered LP2 unknown plaintext, no authenticated key and no destination**.

Reproduce on Windows 11 / Node.js 22 with the single standalone file: node sims/lp2_wordaffine_twofree_second_difference_original_sft.cjs.
