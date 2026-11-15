# Original p50 primitive degree-nine key recovered from LP2 adjacent-repeat markers: bounded negative

**Original-source result, 15 November 2026, Agent41.** No unknown plaintext or author-selected key recovered. This report closes a specific, executable route from a real 2014 mathematical object to a key, without generating or searching random keys.

## Source-constrained proposal

The original 256-cell terminal grid has an exact **primitive degree-nine** irreducible factor over GF(29), in ascending coefficients

`[11,15,0,9,1,5,10,20,12,1]`.

The factor was established independently in the [p54 source factor and primitive-field analysis](lp2-p54-red9-triple-linear-factor-gate.md). A degree-nine linear recurrence may generate a full-length GP29 key from nine secret initial runes. The actual unsolved book has 86 adjacent-equal GP ciphertext sites across original physical pages p0–p55. Earlier authentic solved-page ciphers have a special literal plaintext F bypass, which suggests an explicitly **conditional** attack: suppose each adjacent repeat marks an underlying plaintext F, and the unknown-page cipher is direct additive `C_i=P_i+K_i (mod29)`. Then each marked site fixes `K_i=C_i`. A related degree-four source-factor experiment previously failed, but the source degree-nine primitive factor with nine unconstrained starting key runes was not thereby excluded.

This proposal has three unverified premises: the numerical-table factor is intended as a key recurrence; each doublet means plaintext F; and the entire 12,956-rune stream uses one uninterrupted additive clock. The actual p56 F rule alone does not imply a doublet marker. These caveats prevent treating the recovered mathematical state as a genuine historical key.

## Original-input inverse and withheld prediction

Run [the standalone read-only Node22 CommonJS SFT](../sims/lp2_p50_degree9_doublet_F_keyrecovery_sft.cjs). It consumes the canonical original `resources/liber-primus/lp2-corpus.json`, fixes the source polynomial, and expresses every key position as a GF29-linear combination of nine unknown initial symbols. Only the **first nine** source doublets are used to infer the seed:

| Role | Original zero-based manuscript rune offsets | Source values |
| --- | --- | --- |
| Nine key equations | 122, 207, 456, 653, 782, 909, 932, 979, 1038 | 2, 14, 28, 11, 20, 25, 15, 21, 6 |
| First untouched prediction | 1591 | 25 |
| Second untouched prediction | 1981 | 9 |

The nine equations have full rank **9/9**, fixing exactly one seed:

`[22,23,4,12,14,21,18,24,0]`.

The resulting recurrence predicts **25** at held-out offset1591, agreeing with its source value25. It predicts **0** at the next held-out original repeat, offset1981, whereas the actual source rune is **9**. This falsifies the complete fixed recurrence/clock/doublet-F hypothesis before any English scoring. Of all subsequent **77** source repeat sites, only **5** decode to F. The combined **86-site** linear system is inconsistent.

Independently, decrypting all 12,956 original ciphertext runes with the fitted pad produces GP29 index of coincidence **0.03450004879502503**, 446 plaintext-F candidate runes distributed throughout the book, and no intelligible prose; full forward additive reencryption restores **12,956/12,956** source ciphertext runes exactly. Forward restoration merely proves arithmetic consistency. The SFT plants a separate nine-symbol GF29 state into the same exact original repeat-site coordinates, recovers **all nine seed symbols**, and predicts **all 86/86** planted site values as a positive control.

## Independent nine-chapter reset, fixed by original illustrations

The source manuscript itself visibly divides p0–55 into nine illustrated chapters: p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. As a single independent source-selected clock alternative, restart the **same** monic degree-nine recurrence at the first rune of each of those chapters, using only that chapter's first nine adjacent-repeat events to infer its nine independent key values.

There are respectively **4, 6, 9, 10, 11, 13, 12, 18, 3** original adjacent repeats in the nine chapters, summing to all 86. Four chapters contain fewer than 10 repeats and cannot supply an independent held-out test. Each of the other **five** chapters has a full-rank first-nine marker fit. Their untouched marker predictions are uniformly contradictory: **0 of 19** held-out original chapter-local repeat values are recovered, with at least one contradiction in every testable chapter. No chapter was moved, relabeled, phase-scanned or reinitialized from its held-out marks.

The visible original chapter boundaries and the degree-nine grid factor are two separately observable source properties. Their numerical agreement is therefore a legitimate additional conditional test, although no original page authenticates their use together. Its negative result excludes a **nine-chapter reset of this same repeated-F additive recurrence**, in addition to the global continuous stream. It does not exclude unrelated stateful ciphers or changing the marker premise.

## Entire unknown stationary output alphabet, without knowing the S-box

The previous tests inferred the hidden nine-key state assuming its scalar output enters the additive cipher directly. A different design could pass the same recurrence scalar through an arbitrary unknown **fixed 29-way bijective output alphabet** before addition, concealing the source scalar values. The repeated-F interpretation still forces same source ciphertext value at any two doublet sites to represent the **same transformed key output**, hence the same *pre*-bijection scalar. This invariant permits a secret key and an arbitrary secret output permutation without guessing either.

Group all **86** original repeated-site key observations by their printed GP rune value. They contain **28 distinct printed values** and **58 within-value equality constraints**. Each equality is a homogeneous linear GF(29) constraint on the same nine source-recursive initial key symbols. Exact row reduction yields rank **9/9**. Therefore the only hidden recurrence seed compatible with all observed equal-value pairs is the **all-zero** state; its scalar output is constant, and no fixed bijection of that output can produce 28 different observed marker values. The global **any-secret-bijective-S-box** model is algebraically impossible, independently of the actual secret output alphabet.

**Stronger adversarial allowance: an arbitrary noninjective stationary output function.** The original 86 source repeat sites show **28 distinct printed GP values**, yet the hidden scalar generator has only **29 possible input values**. For any one stationary function from 29 hidden inputs to 29 printed outputs, 28 actually observed output classes require 28 or 29 distinct hidden inputs. Thus **at most one** of those 28 output classes could have two distinct hidden preimages; all other classes have a unique preimage. We grant the exceptional value class *any* two preimages and discard its same-output recurrence constraints entirely. Recomputing homogeneous GF29 rank under **each of the 28 possible adversarial discarded output groups**, the remaining source equations still have rank **9/9 every time**. The scalar state is necessarily zero regardless of which collision group was granted, but its one output value cannot explain 28 distinct observed GP marker values. This **excludes every fixed stationary function** of the scalar degree-nine recurrence under the same global literal-F marker premise; it does not assume bijectivity, English, or a known S-box. The result follows from finite alphabet capacity and 28 separate rank certificates, with the exact SFT assertions in the same reproducer.

This exclusion is scoped to a **single uninterrupted global degree-nine source recurrence** and the repeat-means-F additive model. With **separate original illustrated chapter resets**, the respective equality ranks are **[0,1,0,0,1,2,1,7,0]**; the chapterwise secret-bijection family is underdetermined by same-value marker constraints alone. The earlier direct-untransformed chapter-reset model independently fails its **19 held-out values**. Do not conflate those different source-constrained exclusions. Both proofs and positive controls are in the same [standalone original-input SFT](../sims/lp2_p50_degree9_doublet_F_keyrecovery_sft.cjs).

## Actual partial plaintext inverse under an entirely unknown output bijection

The chapter-reset all-secret output-alphabet model remains underdetermined by equality constraints in most chapters. The p40–53 illustrated chapter, however, has **18 original repeated-rune sites containing 11 distinct ciphertext marker values**. Equal-value constraints on the source degree-nine recurrence have exact rank **7/9**, leaving two freely unknown GF29 seed entries. Enumerating all **841** source-compatible choices and requiring an injective, secret 29-symbol output alphabet leaves **196** nonzero seeds. Twenty-eight scalar multiples of any one seed give the same inferred partial plaintext and simply relabel its secret output alphabet. There are therefore only **seven genuinely distinct sparse plaintext predictions**.

For each candidate, the repeated markers identify exactly **11 of 29 unknown output S-box entries** without guessing their labels: repeated ciphertext value is the inferred key output under the hypothesized literal-plaintext-F rule. At every other rune where the source recurrent scalar belongs to one of those known classes, the exact candidate GP plaintext is recovered as cipher minus known output. This yields **1,127–1,176 plaintext candidates out of 3,008 original chapter runes per representative**, or approximately **37–39%**, with no language model or arbitrary S-box fitting.

All seven original partial outputs have GP29 index of coincidence **0.03447–0.03507**, indistinguishable at this scale from an approximately uniform GP29 string. Independent native-GP English controls from Shakespeare and Gibran were sampled at **the exact seven original candidate position masks** over all disjoint 3,008-rune source windows; the minimum English-control IoC across that comparison is **0.0541162**. The independent English frequency log-odds are also *negative* for every original candidate on both controls, while the **minimum original-mask sampled English source log-odds is +0.30636 nats per revealed rune**. The original p40–53 candidates do not exhibit the expected English GP plaintext signal. Controls use authenticated GP-native IO/ING orthography rather than a plain 26-letter transcription. This does not imply that all possible original plaintext registers were excluded.

This is the strongest conditional answer to the otherwise tempting idea of rescuing the source degree-nine key with an unknown output permutation: even where the original repeat positions **do** leave seven secret-permutation possibilities, all seven can be brought to actual scattered GP plaintext without recovering the rest of the S-box, and none is English-like. A planted key would produce source-English statistics at the same revealed positions. It recovers **no authenticated plaintext**, and a different marker premise, further encryption layer or nonstandard language remains possible. The seventh projective candidate uses free seed `(0,1)`; the other six have normalized free coefficients `(1,2),(1,4),(1,9),(1,17),(1,20),(1,26)`.

**Reproduction:** [source-exact Node22 original sparse-inverse test](../sims/lp2_p40_degree9_unknown_output_partial_inverse_sft.cjs) and [passing Windows run 43764697374](https://github.com/FlareZ123/liber-primus/actions/runs/43764697374); exact seed enumeration, forward scalar recurrence, output-bijection consistency, same-coordinate English controls, and all seven source outputs are asserted in the script.

## Decision

Reject the **global direct and every stationary-output-function degree-nine source-factor additive stream**, and the **direct original nine-illustrated-chapter reset** of the same recurrence, under the repeated-rune-means-plaintext-F assumption. The first apparently correct withheld event is a one-symbol coincidence; the next independently held-out original event contradicts the key. Do not optimize a replacement seed or resynchronization phase to rescue this fixed hypothesis.

The surviving original chapter-local arbitrary-S-box candidates were carried through to their actual sparse inverses for p40–53; all seven are unlike source-native GP English. Still open are historically unselected operations, other source-selected clocks, ciphertext feedback, escape handling, additional encryption layers and alternative uses of the table's exact field factor. No unknown LP2 plaintext, authenticated creator key, or final destination follows. Further effort on this branch needs a distinct original clue selecting one of those modifications.
