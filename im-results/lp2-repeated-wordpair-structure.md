# A genuine repeated LP2 two-word ciphertext phrase: section-constrained evidence

**Measured 2026-11-10. Evidence type: exploratory structural anomaly, not a decoded plaintext or key.**

The false seven-rune repeat [has been corrected](lp2-sevengram-boundary-correction.md): its final rune was borrowed from the solved AN END page. However, the true **six-rune** duplication has a stronger *word-boundary property* worth preserving: two exact 3-rune words repeat as one intact **ordered pair**, and the pair occurs twice across widely separated cipher sections.

## Exact, unedited observation

The committed transcription `resources/lp2-transcription.txt` contains 12,956 unsolved runes and 2,896 words. Physical page and printed line breaks are joined before word tokenization. There are eight nonempty `$`-delimited unsolved sections with lengths 158, 255, 385, 435, 224, 326, 378, 735 words.

The two words `ᛞᛄᚢ` and `ᛒᛖᛁ` occur **exactly twice each**, together as the word bigram **`ᛞᛄᚢ-ᛒᛖᛁ`** both times:

- Section 5 (zero-based), word index 5, in physical LP2 page 27 (original scan 44.jpg) near the beginning of that section.
- Section 7, word index 733, in physical LP2 page **55** (original scan **72.jpg**), the final two words of unresolved ciphertext. This is zero-based rune-bearing transcription **segment 54**; the printed number-only page 50 has no rune segment.

Over all 2,896 actual words and all eligible adjacent within-section two-word positions, **this is the sole repeated ordered two-word type of *any* length**. In particular, the six matching runes are authentic and the lexical boundaries are both `3|3`. The preceding assertion about the seventh rune remains false.

## Source-exact 3⁸/81-square alignment and its cryptanalytic test

The six authentic rune glyphs form a **numerically exact internal terminal marker**, a detail previously absent from this report. In the full original unresolved ciphertext stream, the first copy occupies zero-based global positions **6,555–6,560**, so the position immediately after it is **6,561 = 3⁸ = 81²**. The final copy occupies positions **12,950–12,955**, precisely the manuscript's last six ciphertext runes. Removing the first 6,561 symbols leaves **6,395 = 80²−5** ciphertext runes. The **first three physical LP2 pages** independently contain **262+266+201 = 729 = 3⁶ = 9×81** original runes. This suggests the testable geometric reading of a complete 81×81 first block (whose first 9 rows are the first 3 pages) and a second 80×80 block with five unspecified terminal cells. The block split passes through physical page27's second printed line; there is no separately authenticated cipher reset at this position.

**These squares are derived after recognizing the six-rune duplication.** This is an exact new organization of source coordinates and a hypothesis-generating observation, with no selection-adjusted evidence that Cicada chose square matrix ciphers. It does not change the prior section- and page-conditioned permutation nulls for the repeated words.

A direct, mathematically exact model-family test now uses [the source-square Fourier SFT](../sims/lp2_81square_bookend_fourier.py) and [passing Windows CI run 42825288380](https://github.com/FlareZ123/liber-primus/actions/runs/42825288380). For every possible row and column additive key over `Z/29Z`, Fourier character matrices of a cipher `C[r,c]=P[r,c]+u[r]+v[c]` differ from plaintext matrices only by unit-modulus diagonal left/right multipliers, so their singular values are **exactly key-independent**. The same theorem works for a predecessor-exclusion GP28 nonzero-step rank with observed repeat markers and page IV cells zero-masked. The Fourier harmonic **k=4** is chosen from the *independently encoded Shakespeare GP prior*, never fitted to original ciphertext. Native GP controls comprise 200 Shakespeare and 200 Gibran authentic prose windows per geometry. The synthetic secret-row/column-key plants exactly decode/reencrypt all original-shaped valid cells and preserve the invariant numerically.

| Source-specified geometry/register | Original Fourier top singular value | Original shuffled-histogram median | Lowest authentic GP-prose control |
| --- | ---: | ---: | ---: |
| 81×81, direct GP29, 6,561 runes | **17.8402** | 17.3490 | **26.9946** |
| 81×81, GP28 nonzero step, 6,492 valid cells | **17.4788** | 17.2635 | **25.8676** |
| 80×80 five-terminal-unknown, direct GP29, 6,395 printed runes | **17.2396** | 17.2500 | **26.6886** |
| 80×80, GP28 nonzero step, 6,322 valid cells | **17.5384** | 17.09597 | **25.6204** |

**All four models have 0/400 native GP-English windows with a Fourier score as low as the original**, despite the arbitrary secret separable key. The original scores remain near histogram-preserving spatial shuffles (250 per model). **An additional exact missing-five obstruction** applies to the direct 80×80 case: filling the five unspecified terminal cells with *any* unit-modulus GP symbols changes the largest singular value by at most `√5 ≈ 2.23607` (the Frobenius bound on the five-cell difference matrix). The maximum possible fully completed score is therefore **17.23960+√5 ≈ 19.47567**, still below every authentic GP prose window in the tested reference set. The missing cells cannot rescue this particular model under its specified placement; no guessed filler rune or fitted key was needed.

This **rules against native-GP-English plus 81×81 or terminal-five-omitted 80×80 separable additive row/column pads** in these exact geometries, even with arbitrary keys and the declared hypothetical EA markers. The original cipher may employ a nonlinear layer, hidden transposition, changing state, binary or non-English intermediate, or different framing. The 6561 boundary is not an authenticated historical encryption boundary and no original plaintext is recovered.

## Ternary 81×81 readouts: key-independent monoalphabetic test

**Classification: finite original-input model-family negative with positive-controlled source-native GP text.** Because the duplicated ᛞᛄᚢ-ᛒᛖᛁ phrase ends at **6,561 = 81²**, one specific untested interpretation is that the first 6,561 ciphertext runes must be rearranged through a ternary square traversal before a fixed global monoalphabetic rune substitution is undone. Adjacent-rune **mutual information** (MI) is exactly invariant under any secret 29-rune bijection, so it tests this entire key class without guessing a symbol permutation.

The [source-original runnable test](../sims/lp2_81square_ternary_route_invariant.cjs) evaluates **nine** finite, explicitly enumerated square-reading routes: printed row, row-snake, column, diagonal, 9×9 nested macroblocks, digit reversal of eight base-three digits, two 4-level ternary Morton interleavings, and a nested 3×3 serpentine Peano-like path. Each route has eight dihedral orientations, yielding 72 requested views, several related by exact symmetries. These are **not** 72 independent hypotheses, nor all conceivable permutations of 6,561 symbols.

| Readout of the original first 6,561 LP2 runes | Adjacent-rune MI (nats) |
| --- | ---: |
| Printed original row order | **0.07973852** |
| Best among all 72 views | **0.07973852** |
| Best diagonal readout | 0.06598498 |
| Best nested Peano-like readout | 0.07001892 |
| Best most-significant-trit Morton readout | 0.06068301 |

Positive controls: take **12 starting windows per author** (Shakespeare and Gibran, 6,561 GP runes each), route each into the 81² raster, apply an independently seeded secret 29-symbol substitution, then rewrite printed-order adjacent equal output runes with probability 81% to a random unequal rune. The rewrite models an extra anti-repeat channel, albeit imperfectly; it is **noninjective**, so these simulated plants are statistical forward surrogates, not a proposed historical lossless cipher. The bare fixed substitution and spatial routing are exactly recovered using the known synthetic key before the rewrite. Across **1,728** source-window/author/view plants, the **smallest correct-readout MI is 0.31866402 nats**, over four times the original maximum of 0.07973852. The weakest plant is a Shakespeare window at GP offset 10,000 using column traversal and dihedral view 2; it has 305 overwritten symbols and 83 adjacent-equal output pairs. The original printed 81² block has **41** such pairs; the control means vary by route (roughly 56–75), so the 81% rewrite does not perfectly match the original count.

This experiment **strongly disfavors native-GP English conveyed solely by a globally fixed 29-symbol substitution plus any of the 72 enumerated square reading routes**, even under the specified stochastic output-rewrite noise. It cannot exclude unknown position-dependent alphabets, nonlinear or stateful transposition, different plaintext encodings, or noise that alters substantially more information. The 81² framing and route family remain retrospective rather than historically authenticated. **No plaintext, key, or original cipher mechanism has been recovered.** Further unconstrained route enumeration is lower value than an independently source-selected transition/key rule.

## Direct 81×81 QR finder-channel: exact algebraic obstruction

The coincidental **81²** first prefix also has the dimensions of a **QR version-16 matrix**, motivating a finite, independently checkable interpretation rather than assuming the square contains a QR code. The three mandatory 7×7 finder targets and their adjacent white one-module separators fix **192** nonoverlapping black/white cells in the 81×81 display. This imposes a necessary condition, irrespective of version metadata, error correction or message payload. Original source positions are read through four exact physical routes (row-major, row-serpentine, column-major, column-serpentine), each with eight square orientations, giving **32** explicit tests.

**Fixed rune-to-binary coloring.** Give every one of the **29 original GP glyphs its own arbitrary bit**. An optimal bit assignment can be found without traversing 2²⁹ possible mappings: for each rune, count its appearances at required black and white finder cells and assign the majority value. The exact optimum over all **32** layouts still has at least **58 unavoidable finder/separator mismatches out of 192**. A planted QR finder with disjoint black and white GP glyph sets attains **zero** mismatches.

**Stronger key-independent result: arbitrary separable XOR pads.** Grant each of the 81 display rows and each of its 81 columns an **independent unknown binary mask** as well, alongside the unrestricted 29-glyph coloring:

\[
b(g_{r,c}) \oplus u_r \oplus v_c = F_{r,c} \quad (\text{over }\mathbf F_2).
\]

Every finder cell gives one linear equation in **29 + 81 + 81 = 191** unknown bits. Original-source Gaussian elimination yields **coefficient rank 59**, and a **contradictory augmented equation** for **every one of the 32 orientations/routes**. Thus *no assignment whatsoever* of a shared rune-to-bit alphabet, 81 independent row bits and 81 independent column bits can produce the required QR finder geometry in this exact square. This substantially strengthens the plain fixed-color exclusion and includes arbitrary row/column XOR encryption independent of key derivation.

A concrete **eight-cell XOR contradiction certificate** for the unrotated row-major reading uses these cells from the original 81² source. The coordinates are **zero-based display rows and columns**, and a finder target 1 means black:

| Cell (row,column) | Original rune (GP index) | Required finder bit |
| --- | --- | ---: |
| (0,0) | ᛋ (15) | 1 |
| (0,3) | ᚩ (3) | 1 |
| (1,0) | ᚫ (25) | 1 |
| (1,3) | ᚫ (25) | 0 |
| (2,0) | ᚱ (4) | 1 |
| (2,1) | ᚩ (3) | 0 |
| (3,0) | ᚱ (4) | 1 |
| (3,1) | ᛋ (15) | 0 |

Each rune value, row index and column index appears an **even number** of times across these eight equations, so the XOR of *every left-hand-side variable* is identically **zero**. Their eight required black/white values have **odd parity**, so their right-hand-side XOR is **one**. This is a self-contained impossibility witness for the given layout, with no ciphertext fitting, language model, key guessing or choice of glyph-bit assignments. For the other 31 cases, the program emits and verifies analogous parity certificates; the shortest observed certificate uses just **four** required cells.

A genuine **row-and-column XOR masked** binary finder was also planted into the original-length source grid using arbitrary deterministic row and column bits and two distinct GP glyph classes. The same exact elimination accepts the planted construction, distinguishing the original source failure from a broken feasibility test. The earlier 2,000 full-source-histogram shuffles under the fixed-color 32-layout search had minimum-error mean **63.031**, median **63**, and **206/2,000** scores no worse than the original's 58 (plus-one lower-tail **207/2,001 ≈ 0.10345**). Those shuffles measure proximity of the earlier fixed-color model; the new algebraic no-go is exact and needs no null simulation.

Reproducer [\`sims/lp2_81square_qr_finder_gate.cjs\`](../sims/lp2_81square_qr_finder_gate.cjs), **successful existing manual-only [CI 42834246072](https://github.com/FlareZ123/liber-primus/actions/runs/42834246072)**, including the pre-existing repeated-wordpair experiment. This result excludes only the defined **direct, fixed rune-color plus arbitrary separable row/column XOR** QR interpretation and four printed reading orders with all orientations. It does not exclude nonlinear symbol encoding, an additional ciphertext key-stream or unknown transpositions, a different bit-framing scheme, or coincidental square arithmetic. **No unknown manuscript text, key, or destination was recovered.**

## Matched section-local permutation test

To measure how exceptional the *pairing*, rather than just repeated individual words, is, `sims/lp2_repeated_wordpair_probe.cjs` shuffles whole ciphertext words **only among slots of the same word length inside the same of eight sections**. Each shuffle preserves:

- Every ciphertext rune within every word, including the exact two copies of each of the target words.
- Every section's complete inventory of whole words, word lengths, and total size.
- Every position's actual word length, as well as all section boundaries.
- The exact model-free statistic: maximum *combined rune length* over **any** ordered two-word type that occurs twice or more.

Twenty thousand deterministic Fisher–Yates replicates, seeded with `0x33012321`, yielded:

| Statistic | Actual | Null outcome |
|---|---:|---:|
| Longest duplicated ordered word pair (combined runes) | **6** | 4 of 20,000 nulls reached 6 |
| Number of distinct duplicated ordered word pairs with ≥6 runes | **1** | 4 of 20,000 nulls reached 1 |
| Empirical one-sided p, plus-one correction | | **5/20,001 = 0.0002499875** |

Full distribution of the *maximum* repeated pair length in the 20,000 shuffles: **0:19,759, 3:145, 4:69, 5:23, 6:4**. The maximum-over-*all* pair identities/lengths within this family is used, so the reported p-value does not pretend the particular pair was specified before examination. A planted repeated phrase can be checked with the reusable `score` export; it is deterministic and needs no tuned threshold.

The CI workflow `.github/workflows/lp2-repeated-wordpair-null.yml` ran successfully as [GitHub Actions run 42754138148](https://github.com/FlareZ123/liber-primus/actions/runs/42754138148).

## Sensitivity to **physical page** placement

The section-level null above permits words to move between physical pages within the same section. The last unresolved physical page **55** (rune-bearing transcript segment 54, archive 72.jpg) actually contains only **16 whole word starts and two 3-rune words**, in consecutive final positions. Thus its pair remains together after shuffling within page and word length; only its *orientation* changes. The earlier copy is on physical page 27 (44.jpg), whose **52 word starts include 13 three-rune words**, with **four adjacent 3+3 slots**.

This gives an exact finite **page-and-length-preserving** target-pair recurrence probability:

\[
\Pr(\text{ordered pair matches on both pages})
=\frac{4}{13\cdot12}
=\frac1{39}
\approx 0.025641.
\]

The final page's two unique 3-rune tokens are randomly reversed with probability 1/2. The earlier page's two copies can occupy any of 13×12 ordered distinct 3-rune slots; four adjacent ordered slot choices match for each final orientation. This exact calculation *conditions on the two already discovered word types and their page allocation*. It does not correct all earlier exploratory selection.

More conservatively, the same finite **maximum over every repeated two-word identity and every length** used in the original 20,000 section-null test was recalculated after shuffling words *within their own physical source page and exact rune length* (seed 0x05e27111, **20,000** samples). There were **491/20,000** simulated books with at least one repeated pair of combined rune length ≥6, for an add-one p of **492/20,001 = 0.0245988**. Exactly **491** also repeated a two-word pair ending at the final word position. Another **200** simulations had repetitions of shorter pairs only. This page-local familywise result matches the target-specific combinatorial probability to sampling precision.

This **does not contradict** the original section-local p=0.00024999 or the separate rune-stream-generator p=0.00010; the null models condition on different source-page information. It demonstrates that **physical page layout is a major contributor** to the duplicate's apparent significance. The more stringent page-stratified control must be part of any claim that a deliberately copied cryptographic marker has been established. Source: [page-conditioned exact test](../sims/bookend_page_conditional_null.cjs); successful manual [CI 42766017212](https://github.com/FlareZ123/liber-primus/actions/runs/42766017212).

---

## Second independent null: source-like random cipher with exactly 86 suppressed-doublet exceptions

The word-reordering null deliberately scrambles ciphertext word endpoints. A genuinely random cipher might instead preserve the observed low rate of equal adjacent runes. We therefore ran a different generator with the **actual eight sections, all 2,896 word-length slots, empirical 29-rune symbol frequencies (in expectation), and exactly 86 adjacent identical-rune pairs among 12,948 within-section eligible positions**. For each synthetic book, the positions of those 86 repeats were sampled uniformly without replacement, non-repeat positions were filled from the source's measured rune marginals conditional on differing from the preceding symbol, and the same *maximum duplicated two-word combined rune length* statistic was recomputed across all candidate bigrams.

Thirty thousand deterministic books, RNG seed `0x3a19f23b`, gave the following empirical family-maximum null outcomes:

| Test | Observed | Null replicate count at least as extreme | Plus-one upper-tail p |
|---|---:|---:|---:|
| Exact duplicated two-word phrase of total length ≥6 | 1 | **2 / 30,000** | **3/30,001 = 0.0000999967** |

The null's maxima were at least length3 in 449 runs, at least length4 in 135, at least length5 in 34, and at least length6 in 2. Every synthetic book **exactly reproduced the observed 86 doublets**, ruling out the simplest concern that the unusual pairing is just the side effect of uniform random letters containing too many immediate repeats. The sampler matches marginal frequencies statistically, rather than fixing every glyph count exactly, and imposes no plaintext syntax or key schedule.

Implementation: [`sims/lp2_repeated_wordpair_markov_null.cjs`](../sims/lp2_repeated_wordpair_markov_null.cjs), a separate generator reusing only the already fixed observable bigram statistic. It completed successfully in [GitHub Actions 42754988338](https://github.com/FlareZ123/liber-primus/actions/runs/42754988338).

## Physical image association, descriptive only

The first copy is on original page image [`resources/liber-primus/44.jpg`](../resources/liber-primus/44.jpg), headed by a **single wing illustration**. The final copy is on [`resources/liber-primus/72.jpg`](../resources/liber-primus/72.jpg), directly before a red dot ornament on the final line, above a large **winged-insect illustration** and pale branching tree. These are genuine source-image features and form an evocative visual parallel, but the pictures and repeated phrase were inspected after the sequence was found. This observation has no independently calibrated probability and establishes no decoded meaning.

## What this establishes and what it does not

**Established:** There is a peculiar exact duplication of an adjacent 3-rune + 3-rune ciphertext word pair near a section opening and at the end of the cipher on **physical LP2 page 55**, not original page 54 (a source-segment numbering ambiguity). Given these same visible words and lengths, random section-local ordering yields an equally long repeated adjacent word pair in only 4/20,000 simulations.

**Limits:** The word arrangement is inherited from the author's manuscript and has other structured constraints. Its page composition is crucial: preserving original physical pages raises the chance of some duplicated six-rune ordered pair from around 0.00025 to about **0.025** under the documented two shuffle mechanisms. The section-level null deliberately allows adjacent repeated-rune word endpoints that the ciphertext's anti-doublet process suppresses. A content-generating encryption mechanism may produce repeated words or pairs for reasons outside this shuffle null. This is one exploratory family after extensive other investigations, with no global search correction; its p-value does not establish a Cicada-intended clue, plaintext equality, cipher reuse or a key. In particular, it must **not be used to promote the invalid seventh-rune crib**.

**Cryptanalytic next step:** Treat the six runes as a potential repeated ciphertext phrase occurring at a section opening and at book end. Compare candidate generators' probability of repeating both full ciphertext words under identical versus independent plaintext contexts, with stringent controls for cipher anti-repeat and word boundary layout. Require a recoverable key or a held-out plaintext prediction before interpreting them.

Reproduce: run `node sims/lp2_repeated_wordpair_probe.cjs resources/lp2-transcription.txt 20000`. The program asserts 2,896 words, eight sections and the exact unique bigram before doing Monte Carlo; its source and every input are committed.
