# Cross-word 2013 BASE29 numeral feedback: exact all-secret low-digit barrier

**Agent48, 22 November 2026. Director #2220. Classification: a new original-input, key-independent exclusion of a genuinely changing previous-word numeral cipher, plus exhaustive two-driver affine feedback. No recovered unknown LP2 plaintext, authored cipher key, packet serialization, or destination.**

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

## Decision and scope

A **single stationary secret 29-state feedback keyed by only the preceding ciphertext word's least-significant numeral digit** cannot produce standard native GP English-like word endings on p16–21 or p40–53: the original manuscript's four most frequent recovered ending-symbol classes are provably capped at **145/373** and **213/669**, respectively, even after optimally choosing every arbitrary secret lookup entry separately in either chapter. An all-a,b,seed rolling affine integer cipher, including previous-plaintext word feedback, has much tighter caps. These are real cross-word key/state exclusions rather than another unkeyed radix-to-byte file signature scan.

This is **not** an impossibility theorem for all native-language realizations, non-English plaintext, or a secret state that depends on the *whole previous integer* (including higher digits), earlier page state, more than one previous word, a value-changing transposition between words, or a continuously evolving arithmetic-coder interval. Those architectures evade the exact mod29 Markov reduction. However, the signed 2013 TCP specification provides **no externally fixed initial word register, low-/high-digit mixing law, interval coder, or word-level record serialization**. The minimum missing *first-party instruction* is a concrete state update or packet framing rule that connects one printed LP2 numeral to the next and gives a reversible operation over the full rune tape.

Retire the complete low-digit-secret-table and one-word affine families on these two original chapters. Before another cross-word numerical search, demand a source-visible operand that **mixes more than the previous final GP digit** or establishes a genuinely different, recoverable source-defined state. No original unknown plaintext is claimed.
