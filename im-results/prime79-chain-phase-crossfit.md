# LP2's literal 79-red-rune source key and 4×41×79 lattice: bounded inverses and phase evidence

**Status (2026-11-10, Agents 50 and 7): verified source arithmetic and a literal 79-rune red key candidate, provisional 79-phase rank correlation, and completed tests rejecting direct source-key pads and 79×164 separable English pads. No unknown LP2 plaintext, actual cryptographic key, verified 79-stage generator, or destination recovered.** Selection and statistical probabilities are conditional on declared comparisons, not authorial intent.

## Why 4×41×79 is an explicit candidate rather than a fitted free-key search

The corrected **nine-rune red title on physical LP2 page 15**, immediately above the already identified 4×4 Fibonacci-prime spiral, has GP prime sum **638 = 29×22**. The **22nd prime is 79**. The independently red-marked **51-rune stanza on page 53** has GP sum **2262 = 29×78**, with **78 = φ(79)**. Source annotation fixes all rune offsets. This red-to-red arithmetic was discovered by Agent 30 and was **postselected**, with no key-use rule; see [the exact source test](red-prime-totient-crosslink.md).

The **13-dot large punctuation stencil** (31 physical LP2 marks including one black exception) provides a possible, independently visible ordinal **13**, whose ordinary prime is **41**. The page-15 number square is visibly **4×4**. The 55 unresolved rune-bearing LP2 pages contain **exactly**

\[
12,956 = 4\times41\times79 = 4\times3,239.
\]

Consequently there is a source-motivated but unproven **four-plane, 41-row, 79-column** reshape of the *complete canonical unsolved ciphertext*. The three ingredient choices and the desire to factor the ciphertext length were made after knowing the manuscript; no authorial design probability or plaintext follows from the equality. Alternative interpretations of 13, 4 and the red sums remain possible.

A further original-image-defined relationship involves the same arithmetic pages: **all original red runes on physical LP2 pages 15, 40, 53 total 20 + 8 + 51 = 79**. The source offsets are page 15 \`[0,9)\` and \`[9,20)\`, page 40 \`[0,8)\`, and page 53 \`[128,179)\`. The concatenation is an exact source-ordered **79-rune literal candidate key**, whose length equals the 22nd prime selected by the page-15 first red title. Four different triples of the 13 red-bearing unsolved physical pages have a red length sum of 79, so the length coincidence alone does not uniquely identify the trio; their red sum/prime/totient arithmetic supplies an additional but postselected rationale.

The candidate's canonical GP indices are

\`0,1,20,19,24,28,26,22,24,20,1,21,9,5,1,17,9,16,0,21,0,9,19,26,6,23,25,8,16,13,7,12,15,7,17,12,2,9,8,6,11,4,27,23,27,2,24,10,12,25,14,20,12,28,27,24,11,8,4,2,13,23,11,21,3,6,0,12,19,5,8,23,3,16,5,1,4,13,9\`.

## A reversible 28-label field on the original rune sequence

Represent each rune by its GP alphabet index \(c_i\in\{0,\dots,28\}\). Within each original physical page, convert every **unequal** predecessor step to

\[
r_i=((c_i-c_{i-1})\bmod29)-1 \in\{0,\dots,27\}.
\]

The first rune of each of 55 physical rune-bearing pages and the 86 immediate repetitions yield **141 erasures**. The absolute original-rune phase advances through them, without resynchronization. This rank map has an exact inverse given an initial rune and the 28-ary step, and can represent a stateful no-repeat ciphertext. It does **not** invert the unknown LP2 cipher.

Compare rank-symbol equality at matching global positions modulo **79** across the four exactly equal 3,239-rune ciphertext quarters. Each quarter contains precisely **41 complete 79-rune rows**. For context, compare the original four consecutive physical-page groups (14/14/14/13 pages), period **78** (the separately sourced prime totient), and sorted predecessor exclusion \(r_i=c_i-\mathbf 1[c_i>c_{i-1}]\). All tests require the original physical-page starts and erasures. Raw ciphertext periodicity provides a negative check.

### Exact source-ciphertext scores

| Equal-quarter pair | Matching rank pairs | Eligible pairs | Match rate |
| --- | ---: | ---: | ---: |
| 0–1 | 4,711 | 130,070 | 0.03621896 |
| 0–2 | 4,723 | 129,870 | 0.03636714 |
| 0–3 | 4,698 | 130,026 | 0.03613124 |
| 1–2 | 4,749 | 129,823 | 0.03658058 |
| 1–3 | 4,804 | 129,982 | 0.03695896 |
| 2–3 | 4,671 | 129,777 | 0.03599251 |

Mean of the six rates: **0.036374896592**; pooled rate **0.036374924957**; minimum **0.035992510229**. Uniform 28-ary coincidence is **1/28=0.035714285714**. Every pair exceeds that baseline, with the overall mean only **0.000660611** higher. The corresponding 14/14/14/13 physical-page partition mean is **0.036319292754**.

The direct **29-rune** modulo-79 phase collision is **0.034530274246**, close to the uniform **1/29** expectation. The direct **one-lag** cyclic-rank identity at 79 is **442/12,598 = 0.035084934117**, below the 28-ary uniform expectation. A straightforward 164×79 transposition therefore has no supporting direct-rune period signal, and a 79-position cipher key remains unrecovered.

## Correcting for the eight candidate interpretations

The source-conditional null independently rotates each *entire observed 28-ary difference sequence within each physical page*, retaining its exact symbols, interior order, length, and original erasure count. The same random page rotations feed all **eight** combinations of two periods (78,79), two excluded-predecessor conventions (cyclic,sorted), and two groupings (four original page groups vs four equal 3,239-rune quarters). For each model the statistic is the unweighted mean of six cross-group equality rates.

In **3,000** fixed-seed controls \`0x7941e170\`:

| Convention and period | Page-group mean (upper p) | Equal-quarter mean (upper p) |
| --- | ---: | ---: |
| Cyclic 78 | 0.03586607 (0.28224) | 0.03570428 (0.56681) |
| **Cyclic 79** | **0.03631929 (0.00367)** | **0.03637490 (0.00167)** |
| Sorted 78 | 0.03545677 (0.90403) | 0.03554991 (0.79207) |
| Sorted 79 | 0.03553935 (0.81939) | 0.03554750 (0.78141) |

The equal-quarter cyclic-79 score is **3.029** simulated standard deviations above its rotation-null mean **0.035741715337**. Calibrating the **largest standardized score across all eight interpretations** against each complete surrogate family yields **22/3,000** null maxima as large as observed: add-one familywise **p=23/3,001=0.00766411**. This finite-model family correction accounts for the two groupings; it does not correct the extensive exploratory history, the discovered factorization, the choice of 13-dot stencils, or the broader space of possible numbers.

An independently calculated **5,000-trial** control retains the first-rune erasure fixed at each original physical page start and cyclically rotates only the remaining difference ranks. The *page-group* 79-phase mean and minimum each have **30** null exceedances (add-one upper p **0.0061988**; seed \`0x79ff1102\`). A separate **2,200-trial** null rotates original complete ciphertext pages before recomputing their ranks and tests the page-group 79-phase signal, producing p **0.00227** (mean) and **0.00318** (minimum). Both test a slightly different source-preservation contract; neither generates plaintext.

## Real-data inverse failure and calibrated positive

The accompanying standalone code encrypts independently sampled GP-encoded English control text with a fully specified **79-position, 28-label additive step key**, then inverts it. Its per-rune 28-symbol plaintext is GP indexed modulo28, its ciphertext step is \((1+p_t+k_{t\bmod79})\bmod29\) from the previous ciphertext rune, and its page-start initial states are source-independent. All **12,901** eligible synthetic positions are recovered **exactly** using the true 79-symbol key. The planted cross-group coincidence exceeds **0.05**, far greater than original LP2's ~0.03637.

A separately computed original-source heldout test learned the phase-rank histogram on the first 41 physical rune-bearing pages and tested the last 14 with independently chosen smoothing parameters. Its best tested smoothing, α=800, produced a **negative heldout log-likelihood improvement of −0.000389 per rune** against the source-specific baseline, with page-rotation upper p≈0.0846 among 1,300 trials. More aggressive smoothing yielded upper p from 0.106 to 0.291. This source/test split failed to recover any text or fixed phase-key profile.

## Independently shifted rows do not rescue the 79-column English pad

The preceding equality/period test assumes that the output rank at a given 79-phase is comparable across widely separated plaintext positions. A more flexible, separately constructed model could have a different **additive key per one of the 164 complete 79-rune rows**, and an unknown but shared **79-column additive key**:

\[
R_{r,c}=(P_{r,c}+A_r+B_c)\pmod{28}.
\]

Here \`P\` is a 28-valued English-GP source rune, \`A_r\` is arbitrary for every row and \`B_c\` is arbitrary for every column. The 141 original erasure positions advance the grid coordinate but supply no usable rank. Under this model, differences between any two rows at the same column eliminate \`B_c\`; \`A_s-A_r\` merely rotates all 28 residue bins. **The Pearson deviation of each row-pair difference histogram from uniform is therefore exactly invariant to every value of the entire 243-parameter row/column pad.** This permits a direct necessary-condition test without fitting any hidden pad or an unknown phase.

The source-fixed test uses **all 164×163/2 = 13,366 unordered row pairs**, with **1,033,062** valid original pair-column comparisons after erasures, rather than only consecutive rows or a chosen page pair. Sum the 28-bin chi-square statistics across those row pairs. For a matched null, independently circularly rotate all 164 original 79-rune rank rows, retaining every rank, erasure, and local row sequence but disrupting shared column positions. The test statistic is shift-invariant only for adding values mod28; a rotation of the *columns* within one row is a different operation and appropriately destroys the hypothesis.

| Gate | Original or controlled outcome |
| --- | ---: |
| Original source 79-column all-row-pair chi-square sum | **360,107.17828139** |
| 250 independently rotated-row nulls, seed \`0x215379ab\` | mean **360,914.51678707**, SD **830.534802** |
| Nulls at least as large as original | **207 / 250**, add-one upper p = **208/251 ≈ 0.82869** |
| Ten planted English-GP row+column pads, identically masked | chi-square sums **400,398.68–408,854.49** |
| Planted exact ciphertext rank recovery | **12,901 / 12,901** page-interior positions in every plant |
| Planted literal repeats | exactly **86**, at the original observed source positions |

The positive controls use an **unfitted final Shakespeare segment**, GP-transliterated and restricted to the 28 non-erasure labels. Every plant draws 164 independent row shifts and 79 column shifts; exactly the original 55 page-start and 86 repeated-rune positions are masked. Each generated 29-rune ciphertext chain is then inverted back to the intended 28-symbol rank at all 12,901 page-interior positions. All ten positive controls exceed the original score by **over 40,000**, far beyond the 250-surrogate variation. Thus a normal English-like source with an additive separable row/column key is detectably different from the actual LP2 ranks, even though the test never estimates any key elements.

**Boundary of this exclusion:** this rejects the specified **28-ary, English-GP-register, additive row/column separable pad** even with an arbitrary hidden shift in *every* row. It does not refute the earlier small empirical period-79 coincidence, whose interpretation remains provisional. Nor does it exclude a 79-column mask that varies nonadditively between rows, a column permutation, nonlinear state evolution, different plaintext register, or unrelated full-length keystream. This directly narrows a previously untested attempt to rescue the period-79 anomaly with independently shifted rows.

Reproduce: [source-locked CommonJS test](../sims/prime79_row_column_cipher_invariant.cjs), passed [manual CI 42781582277](https://github.com/FlareZ123/liber-primus/actions/runs/42781582277). It asserts all original rank and erasure counts, original chi-square, null exceedances and ten full forward/inverse English plants.

## Directly testing the literal 79 red runes as cryptographic key material

The [literal red-key inverse](../sims/red79_source_key_inverse.cjs) reads the above marked glyphs directly from the canonical source, without choosing arbitrary key symbols. It enumerates **5,688** source-fixed possibilities: three key interpretations (29 GP indices, corresponding GP prime values, or indices +1), three reversible cipher channels (raw 29-rune additive, 28-symbol cyclic nonzero predecessor step, and sorted excluded-predecessor rank), two additive signs, forward/reversed source order, global/page key reset, and every 79-position key phase. Its register test fits on the **first 41 original rune-bearing pages, 9,871 runes**, then evaluates the **last 14, 3,085 runes**.

The best *training* GP-English candidate is GP-prime-value, sorted predecessor exclusion, negative sign, reversed, page reset, phase57. It scores **−4.16596219 log-likelihood/rune** and rune coincidence **0.0357800** in train; heldout gives **−4.22488686/rune** and **0.0358062**. The independent GP-English register has **−2.958275/rune** and **0.0600321** coincidence, so the original deciphering candidate remains indistinguishable from a poor cipher-text register and worsens on heldout. The program proves the identical *source-key* inverse works on planted controls, recovering **12,956/12,956** raw-runic GP source symbols and **12,901/12,901** valid 28-rank cyclic-step symbols. [Successful manually triggered CI 42781341996](https://github.com/FlareZ123/liber-primus/actions/runs/42781341996).

A separate [79-source-rune SHA-256 and Viterbi experiment](../sims/red79_hash_viterbi.cjs) derives two deterministic 256-bit keys, one from the **79 UTF-8 rune glyphs** and one from their **79 GP index bytes**. The independently developed collision-skip Viterbi is applied to eight original 300-rune section prefixes under AES-256-CTR / ChaCha20, two key directions, two byte-to-mod29 reducers and two signs, with an explicit all-zero 16-byte IV: **32 settings per KDF**. Sixteen shuffled-red-source null keys receive an identical maximum search. Planted English controls must exceed **85% exact plaintext recovery** and the [manual CI succeeds](https://github.com/FlareZ123/liber-primus/actions/runs/42781947129); the run preserves [its JSON output artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42781947129/artifacts/13745953825). There is no independently verified original plaintext or exact original ciphertext re-encryption associated with either hashed-key candidate. The selected KDF, zero IV and cipher family are explicit experiments, not source-authenticated Cicada instructions.

**Exact direct radix28 byte-capacity exclusion.** The manuscript's rare immediate doublets allow one original-ciphertext binary-packet hypothesis: each ciphertext step's excluded-predecessor 28-ary rank, shifted by the source-selected 79-rune key, encodes **five base-28 digits for three raw bytes**. Any three-byte integer \(V\) satisfies \(0\leq V<256^3\). Its five big-endian base-28 digits may never begin with digit **27 followed by 9 or greater**, because that leading pair already exceeds the three-byte ceiling regardless of its remaining three digits.

The independent [full ciphertext capacity test](../sims/red79_base28_byte_capacity.cjs) enumerates both 28-rank conventions (cyclic and ordered exclusion), two source-key numerical readings (GP rune index or its prime value), both signs and key directions, global/physical-page resets of the 79-rune key, all 79 key phases, whole-manuscript/physical-page five-digit packet framing, all five packet start phases, and both digit reading directions. This totals **50,560 original-ciphertext configurations**. Packets overlapping any of the 141 page-start/doublet erasures are ignored, favoring the proposed model.

**Every one of 50,560 models violates the exact numeric byte-capacity condition.** The best setting has **30 forbidden leading pairs among 2,452 complete five-digit packets**: cyclic rank, GP-index source key, negative sign, reversed key, globally continuous key clock phase49, global packet phase4, little-endian digit reading. A seeded original-length positive encodes random three-byte packets to exact base-28 digits, shifts them with the same red79 key and reconstructs the non-repeating 29-rune chain; the decoder recovers all known packet digits and yields **zero forbidden leaders**. [Successful on-demand Actions run 42783919443](https://github.com/FlareZ123/liber-primus/actions/runs/42783919443). This exact exclusion covers the specified fixed-block radix28 byte model, without excluding other binary formats or nonlinear key-based encodings.

**Conclusion for these direct inverses:** The red source carries an exact 79-rune *candidate*. Direct additive GP-English or 28-rank interpretations fail to recover the LP2 text. The source-key-shifted fixed five-base28-digit/three-byte codec is mathematically incompatible with every tested whole original stream. The other independent affine row/column exclusion above applies even without a source key and further constrains simple 79-column English variants.

## Next mechanism gate

Any true cipher interpretation of the 4×41×79 reshape or the literal red79 candidate must specify **a source-determined traversal, 79-stage state/key and exact forward/inverse rune transformation**, reconstruct *unfitted* original LP2 ciphertext, and yield independently defensible plaintext. The present 0.00066 excess could arise from dependence not reproduced by the null, broad exploratory selection, a weak latent state, or chance. The separable-pad test above independently rules against assigning an arbitrary 28-ary additive row key and a common 79-column key to direct English-GP plaintext, even though the earlier equality statistic is weakly elevated. A more complex hypothesis needs its own original-source inverse and held-out prediction before promotion.

**Reproduction:** [\`sims/prime79_chain_phase_crossfit.cjs\`](../sims/prime79_chain_phase_crossfit.cjs), self-contained Node.js 22/CommonJS program on repository-pinned LP2 corpus, original image-ink annotations and existing Shakespeare/GP encoder. It asserts the original source numbers, all 141 erasures and the exact inverse control; it prints eight original models, the paired 3,000-surrogate family maximum, and a separate original-cipher rotation check. Manual-only [GitHub workflow](../.github/workflows/prime79-chain-phase.yml); previously successful baseline [CI 42779258288](https://github.com/FlareZ123/liber-primus/actions/runs/42779258288). A model-specific statistical p-value is a conditional test result, not proof of Cicada's intended mechanism.
