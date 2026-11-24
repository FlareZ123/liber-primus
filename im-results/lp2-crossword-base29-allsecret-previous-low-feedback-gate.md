# Cross-word 2013 BASE29 numeral feedback: exact all-secret low-digit barrier

**Agent48, 22 November 2026; Agent25 arbitrary previous-plaintext extension, 24 November 2026. Director #2220. Classification: a new original-input, key-independent exclusion of a genuinely changing previous-word numeral cipher, plus exhaustive two-driver affine feedback. No recovered unknown LP2 plaintext, authored cipher key, packet serialization, or destination.**

## Why this architectural question matters

The signed 2013 Cicada TCP challenge authenticates **ordinary integer BASE29 conversion** `3301 → 3QO`. This establishes a historically plausible numeral representation. It does **not** instruct the solver to convert the 2014 LP2 words to numbers, define a cipher feedback register, use GP ordinal glyphs as positional digits, interpret printed word spaces as packet boundaries, or serialize a file. These are experimental premises, not source assertions.

Earlier work excluded stationary whole-word 29-adic unit operations and page/chapter-by-length hidden digit coordinates [here](lp2-word-base29-additive-allsecret-carry.md); other tests tried unkeyed numeral-to-byte codecs and the *prime-sum* of a previous ciphertext word as a rune-local shift [here](lp2-previous-cipher-wordprime-original-inverse.md). The present receiver is **cross-word, stateful and whole-integer**, and its upper-digit arithmetic has real carries. Each original printed word is retained as a complete object, including the 32 authentic words continued across printed pages, while the 55 rune-bearing source pages and the rune-free physical p50 remain in their original locations.

## Explicit family and key-free invariant

Let a printed word's `L_i` original GP29 digits be interpreted as big-endian integer `C_i` in `[0,29^{L_i})`. Define `P_i` as a candidate plaintext numeral of the same original width. Consider a reversible rolling word feedback:

`C_i = (P_i + K(C_(i−1) mod29)) mod29^{L_i}`,

where `K` is an **arbitrary completely unknown 29-entry integer function** of the **previous ciphertext word's least-significant digit**, fixed throughout one chapter. The complete secret function, all hidden high-order carry digits, and a separate unknown first-word initialization are granted to the model. Given `C_i`, the previous ciphertext word is known, so the encoder and inverse are deterministic. This is a significantly richer key model than a previous-word Caesar shift.

Reduction modulo29 is unavoidable, even when higher digits carry:

`p_i = (c_i - k(c_(i−1))) mod29`,

where lower-case letters denote the least-significant rune and `k=K mod29` is any secret map of 29 inputs to 29 shifts. This identifies an exact **necessary condition** for any proposed native-GP plaintext without fitting the unknown key.

For an arbitrary choice of four recovered plaintext ending-symbol classes `S`, build the observed original ciphertext 29×29 transition matrix `h[u,v]` from consecutive printed word endings. For each previous-symbol state `u`, choose its secret shift to maximize the number of output symbols falling into `S`. The exact maximum over **all** secret functions is

`M(S)=1+sum_u max_(k=0..28) sum_(v in S) h[u,(v+k) mod29]`.

The **+1** grants the very first word an unconstrained successful output. The best set of four arbitrary plaintext classes can be found by enumerating **all 3,276 four-sets containing zero**, since simultaneous translation of all four classes is absorbed by each state's secret shift. This is exact for **every one of the 29²⁹ possible low-digit feedback functions**, with *no English model fitted to ciphertext*, no assumption about hidden higher carries, and even a completely unknown stationary GP29 output-alphabet relabeling.

The original first rune in each printed word is separately examined as a reversed-digit-position sensitivity check. Only the **last rune** reflects the 2013 standard big-endian integer convention.

## Two unchanged original chapters and independent native controls

Select p16–21, a long text-dominant chapter corridor, and p40–53, the 14-page floral unit with an internal rune-free numeric table. These contain **373 original printed whole words / 1,615 runes** and **669 original whole words / 3,008 runes**, respectively. Different secret lookup functions are freely allowed in the two chapters, so this test does not rely on transferring a learned key or treating the page transition as a reset.

| Original region | Word count | Best secret feedback, final-rune top four | Best secret feedback, reversed first-rune top four | Exhaustive affine feedback, final / first rune |
| --- | ---: | ---: | ---: | ---: |
| p16–21 | **373** | **145** | **141** | **90 / 87** |
| p40–53 | **669** | **213** | **219** | **142 / 141** |

The **affine** result exhaustively tests both one-word ciphertext feedback and one-word plaintext feedback `p_i = c_i−a x_(i−1)−b (mod29)`, with **all 29 a × 29 b × 29 initial-symbol seeds** per driver and both digit orientations. These are lower-digit consequences of full integer affine rolling transport. The much more generous arbitrary 29-entry function controls the previous-**ciphertext**-ending variant only; an arbitrary plaintext-feedback hidden lookup is outside that bound.

For a native-GP prose benchmark, sample the real solved-LP1 / solved-LP2 reference word pool from `resources/external/relikd-solved-gp29-native-v1.json`, matching the original **exact word lengths**. Perform **500** deterministic, predeclared independent word samplings per chapter, with xorshift32 seed `0x3301a48f` and identical input treatment. These controls represent direct native GP runes, not a model of every possible LP2 underlying language.

| Independent native-GP matched-length cohort | Top-four final-rune mean (minimum) | Synthetic controls able to fit *any* original secret-feedback bound |
| --- | ---: | ---: |
| p16–21, 373 real words per sample | **189.772** (162) | **0 / 500** below or equal to 145 |
| p40–53, 669 real words per sample | **344.804** (306) | **0 / 500** below or equal to 213 |

For the reversed first-rune sensitivity case, the controls have means **154.790** and **265.342**, with **19/500** meeting or under the p16–21 bound141 and **0/500** under the p40–53 bound219. The reversed first-rune short cohort is therefore weaker. The strong, historically natural final-rune finding holds independently in both original regions.

## Complete positive receiver controls

The [single-file read-only Node22 SFT](../sims/lp2_base29_wordcarry_allsecret_previousword_sft.cjs) first verifies the 2,896 complete original words, 12,956 exact original rune symbols, 32 full across-page words, and both exact chapter sizes. It then **actually encrypts and reverses all 669 GP-native control words with full modulo29^L integer carries** for both cipher and plaintext one-word feedback and both normal/reversed rune significance, using independent synthetic constants `A=7, B=19` and a synthetic initial previous numeral `3301`. Both directions recover every complete original-language planted word.

As a separate positive for the arbitrary secret lookup theorem, a **nonlinear previous-cipher-ending key** `k(u)=u²+3u+7 mod29` is applied to real solved native words. Their plaintext final-rune top-four count is **348**; the all-secret exact original model bound on that genuinely encrypted positive is **353**, so the power test correctly admits a real nonlinear cipher. All 500 prose comparison trials retain genuine GP29 word spellings and source-matched word sizes.

**Windows Node22 original-source PASS** [Actions run 45011251044](https://github.com/FlareZ123/liber-primus/actions/runs/45011251044), with every original numerical constant, four forward/reverse affine extrema, 500 sampled controls, nonlinear plant, and full forward/inverse assertions.

## Arbitrary full previous-plaintext word function: singleton-successor pad recovery and obstruction

**Agent25, 24 November 2026.** The low-digit plaintext-affine branch above does not cover an arbitrary nonlinear function of the **entire preceding plaintext numeral**. That broader receiver has an exact high-digit constraint at original singleton-successor pairs, independent of the rest of its state table.

Freeze the 2013 big-endian BASE29 convention, preserve the complete printed words and their widths, and allow any stationary integer function `K` of the preceding plaintext word:
`C_i = (P_i + K(P_{i-1})) mod 29^L_i`.
There is no restriction on the degree, complexity, high digits or secret parameters of K. The exact inverse from a known preceding plaintext is subtraction at the current width, including carries. An arbitrary first state is allowed. If the preceding printed word has length one and represents native prose A, I or O, then the next word's pad is one of at most three residues modulo `29^4 = 707281`. A fourth residue is granted separately for possible uncommon standalone glyphs (the solved fixture itself contains a standalone T).

For every original one-rune word followed by a word of at least four runes, take the next ciphertext's four least-significant digits c. A possible dictionary word w of exactly that printed successor's width demands `k = (c - (w mod 29^4)) mod 29^4`. The candidate set uses TextBlob GP-normalized spelling, pinned Gibran *The Prophet*, and all nine solved-native fixtures. For each residue k record the bitset of original successor anchors admitting it. A solution using three pads must cover all anchors with the union of at most three such bitsets. Identical masks are safely collapsed; descending cardinality supplies a rigorous branch-and-bound upper bound. The computation maximizes coverage over **every** possible residue, not a guessed hash/key family. There is no assumption that the inferred prior singleton identities are actually feasible under the cipher; granting arbitrary assignment only weakens the exclusion.

| Original scope | Successor anchors | Exact maximum with 3 pads | Exact maximum with 4 pads |
|---|---:|---:|---:|
| All 56 physical unknown pages | 47 | 12 | 16 |
| Independent p15–22 chapter | 14 | 10 | 12 |

Across the full manuscript a single residue covers at most four anchors. Even if every original successor belongs to this finite lexical register, at least 12 distinct residues are necessary, incompatible with 3 or 4 plaintext singleton labels. Under three pads, at least 35/47 successor anchors must be OOV or violate some declared premise; four pads still leave at least 31/47. The p15–22 exact five-pad optimum reaches 14/14, so five distinct residues are necessary and sufficient for this relaxed lexical coverage, not for a genuine decryption. This independent chapter-level rejection survives a separate key function for that chapter.

Allow a completely separate stationary previous-plaintext function for each current word width, so cross-width equality of pads is no longer required. The same four-digit necessary test still rejects the shared-book width-4 cohort (9/13 max coverage), width-5 (8/9) and width-8 (6/7). Other tested width cohorts pass this relaxation; independent chapter-and-width functions are not excluded.

### Genuine blind partial pad recovery

Three independent synthetic nonlinear full-integer feedback controls use authentic solved first KOAN (780 GP runes), with K(x)=(3301+s)x²+1033(s+1), s=1,17,53, and unknown initial preceding numeral. The control encrypts and reverses all 780 runes, carrying the exact full integer at every width. The attack is not given K or its parameters; the lexicon excludes the target KOAN section. The four training successor widths are [4,6,6,9], and three withheld widths are [5,6,12]. All four training constraints share a single pad, whose full nine-digit residue is obtained by enumerating the longest training word's candidate offsets and reducing them at shorter widths. The two surviving nine-digit residues differ by a nonzero multiple of 29^6. Both agree on the six low digits, which are the only data used for prediction.

| Plant s | Two candidate residues mod 29^9 | Identified low digits | Withheld exact |
|---:|---|---:|---:|
| 1 | 1904018, 4015654144089 | 6 | 17/17 |
| 17 | 1929762, 4015654169833 | 6 | 17/17 |
| 53 | 1987686, 4015654227757 | 6 | 17/17 |

Two complete withheld words and six least-significant runes of the third are predicted per plant. The true pad is one of the two candidates each time; no high-digit selection is asserted. This is a genuine blind **partial state recovery** control, not full arbitrary-function recovery. The initial singleton truth in these native plants happens to be A; the one-pad attack does not need its label. It does not infer the rest of K from three known suffixes. On original data, the exact union-cover barrier prevents a three/four-pad solution before higher digits or language scoring.

**Decision:** Retire the stationary arbitrary previous-plaintext-only BASE29 additive feedback architecture for intact native singleton labels and this finite register, book-wide and independently on p15–22. This is a distinct all-function generalization beyond the previous affine and previous-cipher-ending tests. It grants full preceding-word digits, arbitrary nonlinear pad values, and true integer carries. Additional evolving state, earlier words, changing key per position, altered segmentation, different language, and width-private chapter states remain possible; no source-authored instruction selects them here. Do not fit arbitrary hidden state to the failed anchor sets.

[Standalone CommonJS SFT](../sims/lp2_previous_plainword_fullinteger_singleton_pad_recovery_sft.cjs) at commit `58ec2d93e73e263e83d6cffb228dffc57a26f436`. All reported calculations executed on exact repository source text in connected JS runtime. Source blobs: transcription `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`, native fixture `1b064ef6d85819b7d96adaff31a82d1ec551598f`, TextBlob `140e1d22b5f8c45deddd2e8b25549d9d6307d938`, Gibran `df260a07d56bf5998d40a6360b6132c35c252d10`. No separate CI run claimed. No unknown original plaintext or key recovered.

## Progressive cross-word integer feedback: all-secret drift extension (Agent50, 24 November 2026)

**New original-input decision.** The preceding stationary endpoint gate does not cover a changing word clock. The period-visible BASE29 operation and later signed words/numbers hint motivate testing one inexpensive progressive integer cipher; they do not authenticate this particular opcode. The competing explanations remain changed segmentation, an independent key generator, or a different register.

For complete printed word i, with width L_i and fixed GP0 big-endian numeral C_i, consider

`C_i = (a P_i + b C_(i-1) + d t_i + e) mod 29^L_i`,

where a is a unit, b,d,e are arbitrary integer coefficients, and t_i is either the zero-based word ordinal or cumulative preceding rune count. The clock may be reduced modulo29 for the low-digit gate; the experiment makes no assumption about high-order clock digits. Each region has independent coefficients and arbitrary initial previous numeral. Reverse digit order is a separate sensitivity case, not part of historical big-endian BASE29.

The exact low-digit inverse is `p_i = a^-1 (c_i - b c_(i-1) - d t_i - e) mod29`. For all 841 pairs (b,d), collect the distinct residuals at every observed singleton (first word excepted). A shared nonzero a and e permute those residuals, so their number is invariant. The nine solved GP-native fixture sections have three distinct singleton glyph indices [10,16,24] (I,T,A). Compare each residual mask to all 812 affine images of this set: the factorized search covers all 682,892 low-digit coefficient quadruples per configuration and arbitrary higher-digit lifts. There is no dictionary score used to eliminate keys.

A larger independently varying alphabet family is also decidable. Let each previous ciphertext low digit u select an arbitrary independent permutation pi_u of the 29 plaintext digits; then c_i = pi_u(p_i)+d t_i (mod29). For each of all 29 drifts, construct rows h[u,v] from v=c_i-d t_i. The sum of the four largest counts in each row, plus one for the unconstrained first word, is the **exact maximum** plaintext top-four concentration for that d: any common four-symbol plaintext set can be mapped to the top four observed outputs independently in each row. Taking the maximum over d gives the complete all-key endpoint bound. This is more generous than the previous arbitrary-shift lookup, and does not depend on singleton labels. The bound applies to any full-integer cipher with this low-digit law, independent of carries or other high-digit behavior. Compare against 500 deterministic width-matched independent draws from the nine solved reference records (xorshift32 seed 0x50d8+first physical page).

| Region | Digit | Clock | Exact top-four maximum | Native minimum | Controls at/below bound /500 | Singleton residual minimum | Affine survivors |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| p0–55 (2896 words) | last | word | 792 | 1404 | 0 | 23 | 0 |
| p0–55 | last | rune | 784 | 1404 | 0 | 23 | 0 |
| p0–55 | first | word | 785 | 1088 | 0 | 23 | 0 |
| p0–55 | first | rune | 799 | 1088 | 0 | 23 | 0 |
| p16–21 (373 words) | last | word | 196 | 166 | 393 | 8 | 0 |
| p16–21 | last | rune | 197 | 166 | 414 | 9 | 0 |
| p16–21 | first | word | 201 | 132 | 500 | 9 | 0 |
| p16–21 | first | rune | 196 | 132 | 500 | 9 | 0 |
| p40–53 (669 words) | last | word | 287 | 314 | 0 | 7 | 0 |
| p40–53 | last | rune | 293 | 314 | 0 | 7 | 0 |
| p40–53 | first | word | 284 | 228 | 480 | 6 | 0 |
| p40–53 | first | rune | 286 | 228 | 484 | 7 | 0 |

The all-affine singleton contradiction survives *any* fixed set of up to five singleton labels, including A/I/O/T, even with separate keys for these regions. In the wider arbitrary-permutation family, the last-digit long-chapter and whole-book bounds exclude every sampled native control. The short chapter and reversed long-chapter bounds **do not** exclude this wider family. These are finite matched-width reference comparisons rather than a theorem for every English text; the affine singleton result is exact under its declared cardinality and alignment premises.

**Constructive blind-control recovery.** Three independent width-matched 3008-rune native plants with seed 0x50da+j use full integer arithmetic, clock reduced mod29, initial previous numeral 3301, and planted coefficients in [0,28]. All 9024 planted runes invert/re-encrypt with the true keys. Infer only from the 13 singleton locations and their ciphertext predecessors; no nonsingleton plaintext is used to select keys. Plant 1 (a,b,d,e)=(7,19,3,11), word clock, and plant 2=(8,18,8,12), rune clock, each yield exactly one low-digit key. Using the explicitly planted small-coefficient/no-higher-lift assumption, the inferred keys recover **2992/2992 held-out nonsingleton runes each**, excluding the first word with its unknown IV. Plant 3=(9,17,13,13), word clock, gives six affine keys with the same correct b,d, including the truth; there is no unique plaintext prediction. Its top-four rank cannot distinguish the affine relabeling. This calibration establishes a constructive key recovery method in a bounded plant family, not a general arbitrary-high-digit decoder.

**Decision:** retire this affine progressive feedback family for intact native singleton groups, and the shared arbitrary endpoint-permutation-plus-linear-drift family for book-wide and native-final-digit p40–53 matched reference concentration. Do not repeat stationary or linearly drifting word-register searches with other coefficient lifts: the low digit already fails. More complicated clocks, word-private state, a nonnative register, or a changed segmentation are distinct, but the sources currently fix none of them. No unknown plaintext or source-authenticated key recovered.

Reproducer: [Node22 CommonJS SFT](../sims/lp2_wordinteger_progressive_feedback_exact_sft.cjs), commit dadea3a88e6e8039da4071b3daee37b17094ea13. Executed twice in connected JS runtime; no separate CI run claimed. Exact input blobs: transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7, corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, solved fixture 1b064ef6d85819b7d96adaff31a82d1ec551598f.

## Decision and scope

A **single stationary secret 29-state feedback keyed by only the preceding ciphertext word's least-significant numeral digit** cannot produce standard native GP English-like word endings on p16–21 or p40–53: the original manuscript's four most frequent recovered ending-symbol classes are provably capped at **145/373** and **213/669**, respectively, even after optimally choosing every arbitrary secret lookup entry separately in either chapter. An all-a,b,seed rolling affine integer cipher, including previous-plaintext word feedback, has much tighter caps. These are real cross-word key/state exclusions rather than another unkeyed radix-to-byte file signature scan.

This is **not** an impossibility theorem for all native-language realizations, non-English plaintext, or a secret state that depends on the *whole previous integer* (including higher digits), earlier page state, more than one previous word, a value-changing transposition between words, or a continuously evolving arithmetic-coder interval. Those architectures evade the exact mod29 Markov reduction. However, the signed 2013 TCP specification provides **no externally fixed initial word register, low-/high-digit mixing law, interval coder, or word-level record serialization**. The minimum missing *first-party instruction* is a concrete state update or packet framing rule that connects one printed LP2 numeral to the next and gives a reversible operation over the full rune tape.

Retire the complete low-digit-secret-table and one-word affine families on these two original chapters, plus the bounded stationary previous-plaintext full-integer additive branch described above. Before another cross-word numerical search, demand a source-visible operand that **mixes more than the previous final GP digit** or establishes a genuinely different, recoverable source-defined state. No original unknown plaintext is claimed.
