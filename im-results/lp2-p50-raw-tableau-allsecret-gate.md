# p50 table as stationary GP29 tableau selector: exact all-secret gates

**Decision (updated 24 November 2026):** five stationary GP29 alphabet-selection models from the p49–51 numeric table fail exact key-independent language-histogram gates. The fixed predecessor-rune alignment places 33/86 adjacent-equality events on the 60 leading-zero cells and survives table-geometry-preserving nulls. However, the phase is not independently source-authenticated: exact circular-shift enumeration gives fixed-predecessor p=0.00247 *if preselected*, but max-phase p=0.46820 and max-family p=0.50918. Therefore the leading-zero association remains a conditional structural candidate, not an established cipher selector. The same 60-cell class does not form an exceptional literal 32×8 bitmap under fixed morphology tests. No authentic cipher inverse or plaintext is recovered.

## Candidate and frozen models

The original LP2 physical pages 49–51 print a 32×8 table of 256 two-character numeral cells. Its current canonical byte rendering is in resources/liber-primus/lp2-grid-256.json; base60 conversion is conditional, with radix59 still a live alternative.

Two distinct clocks were tested, each with two selector registers. A third, source-motivated selector uses the five possible leading base60 digits:

1. **Per-rune continuous:** the first table byte selects the alphabet for the first p0 rune; the stream continues row-major and repeats every 256 runes. The selector is either the raw byte (161 distinct values) or byte modulo 29 (29 values).
2. **Per-word indexed:** the first table byte selects the alphabet for the first printed word; the selector advances once per word and repeats every 256 words. Every rune in that word uses the same selector. Again, the selector is either the raw byte or byte modulo 29.
3. **Five-state leading digit:** under the continuous global rune clock, the first base60 digit (0–4) of the table cell selects one of five arbitrary GP29 alphabets. The repeated five-dot ornament on p50 makes a five-way partition worth testing, but does not authenticate it.

For every selector value v, the cipher is granted an arbitrary fixed permutation T_v of all 29 GP symbols. No secret table is searched or fitted. The first-cell/zero-offset order is fixed. These models do not include skips, nulls, page resets, word-reset rune clocks, evolving tables, or non-bijective encoders. The per-word clock is a natural interpretation of a 256-cell table against a word-delimited manuscript, but is not author-authenticated.

## Exact all-secret invariant

For each selector v, let n(v,r) count ciphertext rune r at positions assigned to v. Since T_v is a bijection, it only relabels the 29 bins: the sorted per-selector histogram is identical in plaintext and ciphertext, regardless of every secret permutation.

For k=1,…,12 define U(k) as the sum, over selector groups, of the k largest bins in each group. U(k) is an exact invariant. The conditional pair coincidence

\[
I=\frac{\sum_v\sum_r {n(v,r)\choose2}}{\sum_v{n(v)\choose2}}
\]

is invariant too. These statistics test all independent 29-symbol permutations per selector, including any additional fixed global alphabet relabeling, without a key search.

## Inputs and controls

- Original ciphertext: resources/liber-primus/lp2-corpus.json, pages 0–55, 12,956 runes.
- Original words: resources/lp2-transcription.txt, with the source's slash-newline continuations joined before tokenization; 2,896 words and 12,956 runes, with word lengths 1–14 across 14 length classes.
- Selector: resources/liber-primus/lp2-grid-256.json, 256 row-major bytes.
- English controls: Shakespeare, Gibran and Emerson, encoded with source-calibrated GP29 orthography (ING and IO contracted only within a word; V=U, K/Q=C, Z=S).
- Latin control: the independently sourced, word-preserving GP29 Vulgate in resources/control/latin-vulgate-gp-wholewords.txt.

For the **per-rune** clock, controls are contiguous 12,956-rune windows stepping by 6,478 and including the final complete window: 33 Shakespeare, 9 Gibran, 49 Emerson and 31 Vulgate windows, 122 total. These overlap and are deterministic comparisons, not independent trials or a p-value.

For the **per-word** clock, 500 samples were generated from each of the four source word pools (2,000 total). At every word position, a control word was sampled with replacement from that source's pool of words having exactly the same GP29 rune length as the corresponding original word. Thus all 2,896 original word lengths and their positions are preserved. Seeds are fixed in the reproducer. These are word-length-matched source controls, not natural continuous excerpts.

## Results

### Per-rune continuous selector

| Measure | Raw bytes | Byte mod 29 |
|---|---:|---:|
| Selector groups | 161 | 29 |
| Original equal pairs / available pairs | 22,339 / 646,599 | 117,679 / 3,429,119 |
| Original conditional coincidence | **0.0345484605** | **0.0343175609** |
| Minimum control-window coincidence | **0.0569997788** | **0.0577673157** |

Original U(k), k=1…12:

- Raw: [1039, 1944, 2773, 3537, 4248, 4927, 5570, 6176, 6737, 7260, 7769, 8269]
- Mod29: [664, 1291, 1883, 2449, 2999, 3538, 4067, 4578, 5083, 5575, 6060, 6533]

Minimum U(k) across all 122 control windows:

- Raw: [1634, 2938, 4052, 5051, 5952, 6775, 7531, 8230, 8870, 9460, 10000, 10499]
- Mod29: [1472, 2593, 3575, 4478, 5314, 6103, 6844, 7523, 8170, 8762, 9310, 9821]

### Per-word indexed selector

| Measure | Raw bytes | Byte mod 29 |
|---|---:|---:|
| Selector groups | 161 | 29 |
| Original equal pairs / available pairs | 22,494 / 654,139 | 118,871 / 3,433,607 |
| Original conditional coincidence | **0.0343871868** | **0.0346198619** |
| Minimum of 2,000 matched-control coincidences | **0.0573425526** | **0.0580520718** |

Original U(k), k=1…12:

- Raw: [1044, 1927, 2748, 3506, 4215, 4888, 5507, 6097, 6664, 7202, 7718, 8208]
- Mod29: [692, 1335, 1947, 2532, 3098, 3641, 4169, 4686, 5189, 5680, 6166, 6641]

Minimum U(k) across all 2,000 matched-control samples:

- Raw: [1613, 2901, 4045, 5065, 5984, 6820, 7589, 8297, 8935, 9533, 10060, 10530]
- Mod29: [1428, 2551, 3532, 4453, 5325, 6154, 6931, 7662, 8319, 8937, 9493, 9979]

For all four model variants, every one of the twelve original U(k) values is below the minimum from every applicable control. The original conditional coincidences are also much flatter than the source-native controls. No choice of secret per-selector alphabets can repair these discrepancies.

### Five-state leading-digit selector

The first base60 digit of each table cell is in {0,1,2,3,4}. Using that digit as a five-state per-rune selector gives an exact all-secret bound too. The original has **5 groups**, 18,712,993 within-group pairs, 645,914 equal pairs, and conditional coincidence **0.0345168728**. Its cumulative top-k mass is:

- Original: [532, 1054, 1570, 2077, 2576, 3073, 3562, 4039, 4512, 4980, 5443, 5902]
- Minimum across 122 source-native control windows: [1428, 2510, 3431, 4321, 5164, 5923, 6641, 7328, 7996, 8626, 9197, 9713]

All twelve original values are below every applicable control minimum. Therefore **no five fixed monoalphabetic permutations selected by the leading base60 digit can recover native English** under this global clock. The five-state selector is rejected; it does not explain the repeat-site correlation below.

### Printed leading-zero cells and rare doublets: nine-chapter stress test

**Classification: retrospective clock association, without a recovered plaintext or cipher.** This is a different observation from the stationary GP29 selector models excluded above. The 256 printed numeric tokens have physically visible first characters. Exactly **60/256 tokens begin with digit 0**, a mask independent of any disputed base59/base60 byte interpretation. Apply that 256-cell sequence repeatedly to the **12,956-rune unknown manuscript**, beginning at the first physical p0 rune. Assign each adjacent within-page pair to the table cell at its **first rune's global zero-based position**. The source has **12,901** such pairs and **86** equal-rune pairs. Printed page turns remain in the global key clock, even though cross-page pairs are excluded from event counts.

At the candidate predecessor alignment (local phase zero; external zero-based phase 255), the first-digit-zero mask covers **3,025/12,901 eligible pairs** and **33/86 doublets**. Its repeat rate is **33/3,025 = 1.091%**, compared with **53/9,876 = 0.537%** for all other first digits, a **2.0328×** rate ratio (approximate 95% log-rate interval **1.32–3.13**). A one-sided fixed-mask hypergeometric comparison gives **0.001349**. This is an **unadjusted diagnostic**, since the table/clock/doublet hypothesis emerged after a large history of exploratory LP2 tests.

The new calculation partitions the *same original observations* by the nine chapters visible in the source manuscript. The first ratio is doublets occurring at leading-zero table cells over all chapter doublets; the second ratio is the chapter's eligible leading-zero positions over all within-page pairs.

| Original visual chapter | Leading-zero events / all events | Leading-zero eligible / all eligible | Rate ratio |
| --- | ---: | ---: | ---: |
| p0–2 | 1/4 | 169/726 | 1.099 |
| p3–7 | 3/6 | 266/1,140 | 3.286 |
| p8–14 | 3/9 | 403/1,722 | 1.636 |
| p15–22 | 5/10 | 447/1,895 | 3.239 |
| p23–26 | 4/11 | 240/1,017 | 1.850 |
| p27–32 | 5/13 | 333/1,427 | 2.053 |
| p33–39 | 5/12 | 392/1,673 | 2.334 |
| p40–53 | 6/18 | 701/2,995 | 1.636 |
| p54–55 | 1/3 | 74/306 | 1.568 |
| **All nine** | **33/86** | **3,025/12,901** | **2.033** |

All **nine chapters** individually have more leading-zero doublets than their local eligible-pair exposure predicts. An additional **retrospective** division into the first four chapters and last five gives **12/29** events from **1,285/5,483** eligible positions (fixed-mask upper tail **0.02399**) and **21/57** from **1,740/7,418** (upper tail **0.01565**) respectively. The second part was not prospectively withheld before discovery, so these are sensitivity checks, not an independent replication.

A fully specified phase/category comparison evaluates **all five physically printed leading numeral classes × all 256 cyclic table shifts = 1,280** alternatives on the same original pair positions and chapter definitions. Exactly **four** give a positive effect in every chapter: (digit, shift) = **(0,0), (3,71), (1,60), (0,207)**. The source's literal leading zero with natural shift zero has the greatest chapter-summed excess among those four: **12.824** repeat events above chapter-specific exposure expectation. It ranks **first of 1,280** by the combined all-chapter-positive / excess criterion. This is a descriptive search rank, **not a calibrated discovery-wide probability**. For digit zero alone, shift zero is the unique highest event count among 256 shifts (**33**, versus **32** at the next-best shift16). Among all five categories and shifts, **seven** alternatives reach at least 33 events, including a digit2/shift195 combination with **40** events but only **eight** positive chapters.

As original-input negative controls, the same digit-zero/shift-zero association for rune-equality **lags 2–12** has pooled relative rates **0.903–1.187**, with only **2–7** positive chapters; none matches lag1's **9/9**. The original broader report had also observed failure of the association under page-local and word-local reset clocks and second-rune global timing, and no matching effect in 122 source-native English control windows. The earlier lowest-numeral-quintile finding remains: the **52/256 cells at or below 54** have **30/86** adjacent-equal events, versus **2,632/12,955** global opportunity starts. The exploratory maximum was tied in three of 1,280 quintile/shift options, with a separate source-event subset randomization tail of **0.00393**. These two masks overlap heavily, so their enrichments must not be treated as independent confirmations.

**Director #1500 source-preserving null completion (Agent18, 18 November 2026).** The primary statistic was frozen as the count of the 86 original adjacent-equal events whose first rune lands on a literal-leading-zero p50 cell under the candidate global clock. The source value is **33**, with a positive exposure-adjusted direction in **all nine chapters** and chapter-summed excess **12.8240**. Three source-preserving nulls now test whether that alignment can be explained by coarse table geometry alone. Exhausting all **8! = 40,320 shared column permutations**, which preserve every printed row's exact leading-zero count, gives **26/40,320 = 0.00064484** masks with at least 33 hits, and only **6/40,320** that also keep all nine chapters positive. A deterministic **100,000 intact-row permutation** sample (xorshift32 seed `0x3301`) gives **878/100,000** with at least 33 hits and **177/100,000** with both at least 33 hits and all nine chapters positive; the null mean is **21.07943** hits.

A stricter null was predeclared in [Director issue #1500](https://github.com/FlareZ123/liber-primus/issues/1500#issuecomment-6989240326) before evaluation. It treats the 32×8 leading-zero mask as binary and applies only checkerboard 2×2 switches, thereby preserving **all 32 row sums and all 8 column sums exactly**, as well as the total 60 cells, original event sites, page divisions and global clock. The exact one-switch neighborhood has **916** legal masks; **487/916** retain at least 33 hits, showing the observed alignment is locally stable under minimal fixed-margin perturbations. This local census is a sensitivity result rather than a chance calibration. After **50,000 accepted-switch burn-in**, a deterministic **100,000-state** switch chain with **32 accepted switches between recorded states** and seed `0xC1CADA33` has mean **20.71855** hits; only **382/100,000** reach at least 33, for a plus-one empirical tail **0.00382996**. Only **112/100,000** simultaneously reach at least 33 and preserve the source's positive direction in all nine chapters, and **111/100,000** are all-nine-positive with chapter-summed excess at least 12.8240.

These are **post-discovery conditional robustness tests**, not discovery-wide significance estimates. They strengthen the claim that the candidate fixed-phase leading-zero/doublet alignment is unusual under table-geometry-preserving alternatives, while leaving the historical clock and causal operation unauthenticated. The relation remains highly nondeterministic: 53/86 doublets occur outside leading-zero cells and 2,992/3,025 leading-zero opportunities do not repeat. No key, reversible decoder or unknown plaintext follows from this result. The [standalone source-exact CJS reproducer](../sims/lp2_p50_digit0_source_preserving_null_sft.cjs) asserts the canonical counts, all null outputs and a source-shaped planted positive control; [Windows Node22 run 44381616340](https://github.com/FlareZ123/liber-primus/actions/runs/44381616340) passed the committed reproducer.

**Director #1512 solved/clear specificity control (Agent31, 18 November 2026).** The exact literal-leading-zero mask and phase-zero clock were frozen before evaluation against four independent manuscript controls. Each control stream starts the unchanged 256-cell mask at phase zero; within-page adjacent pairs are eligible and cross-page pairs are excluded. For LP1, the nine original **printed encrypted** rune pages are concatenated in physical order as the cipher control, while the six original **printed clear-GP** pages p3/p8/p9/p10/p11/p14 form the source-native language control. This preserves original rune order within each selected source class and avoids substituting later plaintext reconstructions for printed ciphertext. Original p56 uses its 85 ciphertext runes; p57 uses its 95 printed clear runes.

| Fixed phase-zero source | Runes | Eligible pairs | Leading-zero eligible | All doublets | Leading-zero doublets | Inside/outside rate ratio | Circular shifts at least as large |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| unknown LP2 p0–55 | 12,956 | 12,901 | 3,025 | 86 | 33 | **2.0328** | **1/256** |
| original encrypted LP1 pages | 1,796 | 1,787 | 418 | 44 | 9 | 0.8422 | 170/256 |
| original printed-clear LP1 pages | 1,001 | 995 | 234 | 28 | 3 | 0.3903 | 247/256 |
| solved p56 original ciphertext | 85 | 84 | 16 | 2 | 0 | 0 | 256/256 |
| clear p57 original runes | 95 | 94 | 18 | 1 | 0 | 0 | 256/256 |

The matched diagnostic null is the complete set of **256 circular alignments of the same mask** on each fixed source. Phase zero is never replaced by a better alignment. Unknown LP2 is the unique maximum under its own 256-shift comparison. The two substantial LP1 controls sit near or below their circular baselines: encrypted LP1 has phase-zero tail **170/256** and printed-clear LP1 **247/256**. The p56/p57 samples contain only two and one adjacent doublets respectively, so their zero phase-zero ratios are weak individually and their circular comparisons are degenerate; they are retained as exact controls rather than treated as strong exclusions.

The same exposure-adjusted direction is positive in **9/9 unknown LP2 chapters**. Under physical-page blocks it is positive in only **4/9 encrypted LP1 pages** and **1/6 printed-clear LP1 pages**; p56 and p57 are nonpositive at phase zero. This makes the association materially more specific to the unknown LP2 ciphertext under the tested fixed controls. It does not authenticate the global p50 clock, prove that leading zero is a cipher bit, or supply an inverse. The result strengthens the case for a clue-constrained causal mechanism while leaving the operation and key unresolved. [Director gate #1512](https://github.com/FlareZ123/liber-primus/issues/1512) · [standalone CommonJS reproducer](../sims/lp2_p50_digit0_control_specificity_sft.cjs) · [Windows Node22 PASS 44384842095](https://github.com/FlareZ123/liber-primus/actions/runs/44384842095).

**Director #1513 literal 32×8 bitmap gate (Agent31, 18 November 2026).** Before assigning cipher state to the same class, the source-visible binary object was frozen as a 32-row × 8-column matrix with one exactly when the printed token's first character is literal `0`. No radix conversion, byte value, threshold, phase shift, OCR parameter, reordering or ciphertext statistic enters this test. The original physical page split is **10+13+9 rows**, carrying **15, 26 and 19** marked cells.

The printed bitmap is:

```text
........
.....#..
..##..#.
...#....
...##..#
..#.....
###.....
.......#
..#.....
......#.
.#...#..
...#..##
...#..#.
..#.#.#.
....#.#.
#..###..
........
#..#.#..
........
.##.#...
.....#..
...#...#
.....#..
..#.#..#
#......#
.......#
#.#.....
...####.
.#...#..
.....#..
..#.##..
.....#..
```

Its fixed morphology is sparse and fragmented. The row sums are **0,1,3,1,3,1,3,1,1,1,2,3,2,3,2,4,0,3,0,3,1,2,1,3,2,1,2,4,2,1,3,1** and the column sums are **4,4,9,10,8,11,7,7**. Four-neighbor morphology gives **33 connected components**, largest size **9**; eight-neighbor morphology gives **23**, largest size **15**. There are **three blank printed rows** and **16 repeated-row pairs**, but no repeated columns.

Transposing to the only equally natural 8×32 text-like orientation exposes the physical-width divisor directly. The four fixed **8×8** cells contain **13,18,13,16** marks and respectively **6,9,12,7** four-neighbor components, with largest components **5,5,2,9**. The eight fixed 8×4 cells likewise remain fragmented, with component counts **3,4,6,5,5,7,5,3**. No segment is a single connected glyph, and the original 10+13+9 page cuts do not coincide with a clean glyph-cell grammar.

A deterministic matched null uses **50,000 uniformly sampled exact-60-of-256 masks** (xorshift32 plus rejection-sampled partial Fisher-Yates, seed `0x3301c1ca`). Every pre-specified simple morphology statistic is ordinary: random masks have at most the source's 33 four-neighbor components in **16,937/50,000** cases, largest component at least9 in **7,613/50,000**, at most23 eight-neighbor components in **37,393/50,000**, largest eight-neighbor component at least15 in **10,703/50,000**, at least16 duplicate-row pairs in **12,382/50,000**, column-projection squared deviation at least46 in **17,561/50,000**, and four-8×8-block imbalance at most the source's 18 in **17,845/50,000**. None is close to a discriminating visual-message feature.

The four natural 8×8 cells also fail a frozen repeated-motif test. After granting each second block its best square D4 rotation/reflection, the six pairwise Hamming distances are **17,18,19,19,18,17**. In a separate 50,000 exact-60-mask run (seed `0x1513cafe`), **43,931/50,000** masks have a minimum pair distance no larger than the source's17, while **7,053/50,000** have a six-pair distance sum no larger than the source's108. Thus the apparent block similarities are not unusually motif-like.

All eight rectangle D4 presentations are rotations/reflections/transposes of this same sparse component structure; none yields a clean orientation-stable direction symbol or fixed equal-cell glyph string under the source-supplied divisors. This **closes the literal-bitmap interpretation in #1513**. It does not weaken the independently measured phase-zero doublet association, because that association uses the binary class as a clocked selector rather than as a picture. Future mechanism work should therefore require an independently authored clock or operation instead of extracting further graphics from this mask. [Director gate #1513](https://github.com/FlareZ123/liber-primus/issues/1513) · [standalone CommonJS reproducer](../sims/lp2_p50_digit0_bitmap_morphology_sft.cjs) · [Windows Node22 PASS 44386061955](https://github.com/FlareZ123/liber-primus/actions/runs/44386061955).

**Frozen low60 adjacent-swap involution (Agent31, 18 November 2026).** The simplest position-only transposition suggested by the enriched class was tested without fitting: preserve the continuous phase-zero p50 clock, scan each physical page left-to-right, leave the current rune in place when the control cell is in the leading-zero/lowest-60 class, otherwise swap it with its immediate right neighbor and advance past the pair. The schedule depends only on source positions, never rune values, and is an exact involution; swaps never cross a physical page boundary.

Applying the involution to original p0–55 changes **11,168/12,956** rune positions. It raises same-page adjacent equalities from **86** to **243** and moves the leading-zero share from **33/86** to **81/243** (inside/outside rate ratio **1.6324**). Under the unchanged printed word boundaries the output still has **zero exact dictionary words of GP length >=5**; short-word chance matches fall from 201 to190.

The stronger causal failure comes from nine source-native GP controls, three long windows each from Shakespeare, Gibran and Emerson, overlaid onto the exact original page lengths. Exact native repeat counts **351–412** become **521–584** after the same transform in every case. Their zero-class rate ratios after transformation are only **1.0486–1.3453**. Thus this involution systematically creates additional adjacent repeats on native language rather than explaining how LP2 reached only86 while concentrating repeats in the low60 class. Exact transform→inverse round trips pass for all controls. Retire this precise hold/swap surface layer; do not tune swap polarity, phase, reset or span after seeing the failure. [Standalone CommonJS reproducer](../sims/lp2_p50_digit0_adjacent_swap_sft.cjs) · [Windows Node22 PASS 44389665813](https://github.com/FlareZ123/liber-primus/actions/runs/44389665813).

**Director #1514 frozen low60 conditional byte-additive gate (Agent31, 18 November 2026).** After #1508 established that literal leading-zero cells are exactly the 60 lowest raw values under both documented table radices, the Director froze one direct value consumer before output inspection. With the canonical row-major base60 bytes and the same continuous phase-zero clock, each original ciphertext rune is decoded by `P=C-(B mod29) mod29` only when **B<60**; every B>=60 position is unchanged. The sign comes from the authentic solved-p56 additive convention. No phase, sign, threshold, radix, reset, rank or collision variant is evaluated.

The inverse is exact and changes **2,835/12,956** original rune positions. Its whole-book GP29 IoC is **0.0344657791**. Under the canonical 2,896 printed-word framing, it produces **189** exact dictionary matches, all GP length1–4, and **zero** exact matches of length>=5. Every source chapter independently has zero length>=5 hits: chapter short-word hit counts are **11,14,27,29,14,32,22,34,6** for p0–2 through p54–55. The opening and the remaining chapters are nonlinguistic, so the required 150-rune coherent span does not exist and there is no blind chapter candidate to promote.

A source-shaped positive repeats the independently solved p57 native-GP runes to the exact 12,956-rune/page layout, applies the frozen forward transform, and recovers all **12,956/12,956** runes under the inverse. Therefore the original failure is a cipher-family decision rather than an implementation failure. **Close exactly this low60 conditional byte-additive consumer.** The predictive low60 class from #1508 remains a structural clue; the next value mechanism must be genuinely stateful or otherwise source-selected rather than another threshold/sign variant. [Director gate #1514](https://github.com/FlareZ123/liber-primus/issues/1514) · [standalone CommonJS reproducer](../sims/lp2_p50_low60_conditional_byte_additive_sft.cjs) · [Windows Node22 PASS 44389677684](https://github.com/FlareZ123/liber-primus/actions/runs/44389677684).

**Director #1530 word-local versus stream-wide gate (Agent31, 18 November 2026).** The exact phase-zero low60/leading-zero class was stratified before any new decoder work by the manuscript's canonical complete-word parser. Hyphens and punctuation terminate words; `/`, whitespace and page turns are physical layout only, so carried words remain intact. Adjacent pairs still cannot cross physical page boundaries. This yields **10,028 within-complete-word opportunities** with 63 repeats and **2,873 cross-word opportunities** with 23 repeats.

The association transfers through the visible word boundary:

| Fixed stratum | Low60 opportunities | Low60 repeats | Outside opportunities | Outside repeats | Inside/outside RR | 9-chapter LOO gain | Positive folds |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| within complete printed groups | 2,349 | 23 | 7,679 | 40 | **1.879704** | **+2.361916** | **8/9** |
| across printed-group boundaries | 676 | 10 | 2,197 | 13 | **2.500000** | **+0.962753** | **6/9** |

The matched source-preserving null is the exact **8! = 40,320 shared-column permutations** used by #1500. It leaves all original rune/repeat event sites, chapter assignment, printed-group stratum, printed row order and every table-row zero count fixed. Within words, only **143/40,320 = 0.00355** permutations reach the source RR and **372/40,320 = 0.00923** reach its LOO gain; **60/40,320 = 0.00149** reach both. Across words, the corresponding tails are **341/40,320 = 0.00846**, **988/40,320 = 0.02450**, and **282/40,320 = 0.00699**. Only **1/40,320** shared-column permutation reaches both source RRs simultaneously.

The cross-word RR is **1.329997×** the within-group RR. A predeclared Haldane-smoothed log-odds interaction has absolute magnitude **0.291122**; **22,010/40,320 = 0.54588** exact null permutations show an interaction at least this large. Thus the difference between the two strata is ordinary sampling/geometry variation, while both strata carry the same direction of enrichment. **Architecture decision: prefer a continuous stream/state explanation over a mechanism that resets or changes register at every visible word boundary.** This does not determine the clock's historical origin or a value operation. [Director gate #1530](https://github.com/FlareZ123/liber-primus/issues/1530) · [standalone CommonJS SFT](../sims/lp2_p50_low60_wordlocal_streamwide_sft.cjs).

**Literal `00` source-cell test (Agent 41, 15 November).** A narrower exact-token hypothesis was checked rather than introducing a new table traversal. The **only** printed `00` cells occupy phases **192 and 229**, and their 256-rune repetitions cover **100/12,901** within-page successor pairs. They coincide with **five of the 86** actual equal-rune pairs: **four** at phase 192 and one at 229. Exact page-level event counts and opportunities are held fixed in [the Windows Node22 source-input SFT](../sims/lp2_p50_literal00_doublet_source_sft.cjs), [run 43738819854](https://github.com/FlareZ123/liber-primus/actions/runs/43738819854). Among 70,000 seeded matched-position randomizations, a **preselected** literal `00` mask reaches five or more in **0.0005143** plus-one proportion (null expectation **0.66658** hits). But the token was recognized **after** studying the broader low-value collision enrichment: scanning **all 161 distinct printed token masks** and comparing their page-conditioned standardized anomalies, the family-maximum probability is **0.04493**; the `00` mask ranks first only retrospectively. The single 256-phase peak at phase 192 contains four repeats, yet scanning **all 256 phases** has matched-null probability **0.08640** of reaching at least four. Moreover the literal `00` mask has **two** equally successful table-clock rotations (0 and 37), and **95/100** encounters of those cells do not yield a repeat. The literal event-glyph readout, in manuscript order, is **`YOUAX`** (four glyphs `Y O U A` at phase192 and an `X` at phase229). Phase192 is physically **row24, column0 on the outer 76-cell perimeter**, whereas phase229 is **row28, column5 in the inner 180 cells**. Selecting only that perimeter cell gives the English-looking prefix **`YOUA`**, but this is four retrospectively chosen glyphs from a sparse event channel, with no independently fixed continuation, original instruction to read identical-adjacent glyphs, or complete deciphered page. It is therefore preserved as a potential selector test, **not** authenticated plaintext. This confirms a narrowly concentrated numerical association while withholding any claim of a deterministic zero-step opcode, exact cipher alignment, recovered key, or plaintext. It does **not** give a second independent positive for the existing digit-zero class because the events and masks overlap.

**Source-byte pointer and perimeter continuation of the literal 00 clue (Agent 14, 16 November).** The printed grid values are all valid indices 0..255, giving a zero-parameter next-site rule `next = B[index]` for the literal outer-perimeter `00` cell at index **192**. Its complete graph walk is **192 → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247 → 192**, an eleven-cell directed cycle. The only other cycle in the full 256-cell table is **249 ↔ 158**. Collect each exact identical-adjacent rune at its natural book-global phase, in original chronological order, then traverse the eleven-cycle from that outer `00`: the result is **`YOUASWEAOE`**. The second `00` cell at phase 229 points into the same cycle but is outside it and contributes a separate original `X` event. No complete native GP29 sentence follows.

The table's **76-cell outer perimeter** also offers two literal, equally simple orientations, both starting at the selected `00` at index 192. Clockwise yields **`YOUAEOWNGAEAEAEHGNHMFLEFTEAOEEOMITRE`**, counterclockwise yields **`YOUAERTIMEOOEEATFLEFHMNHGAEAEAEGNWEO`**. The latter's English-looking first letters do not spell `YOUARE`: printed `E,R` is in the opposite order from `R,E`, and the following `EO` is a distinct GP digraph. Neither orientation supplies an authentic unknown plaintext sentence, a key, or a reproducible decipherment. Both exact source continuations are encoded in the [standalone original-input CJS test](../sims/lp2_p50_00_pointer_doublet_spiral_sft.cjs). They challenge the selected `YOUA` prefix using rule-defined next positions instead of choosing glyphs for a desired message. The rare-repeat/table association remains an open clue pending a genuine original decoding instruction.

**All-order obstruction for the entire 86-event channel (Agent3, 17 November).** The exact original manuscript has **86** within-physical-page adjacent-equal GP29 rune events. Gathering their repeated glyphs in chronological order gives GP29 index of coincidence **0.0336525307798**, virtually the uniform-alphabet baseline. The original p50 table has exactly two literal `00` cells at 256-phase positions **192 and 229**; the first emits **Y,O,U,A** at global rune offsets **2240,5824,6080,8384**, while the second emits **X** at offset8933. The *source-defined* sort of **all 86 event glyphs** by the table's actual numeric byte (ties in physical table phase order, then original occurrence order) begins **`YOUAXLGNGXOD...`**, without a legible continuation. Its exact IoC is **unchanged**. Any other purely permutation-based reading (an arbitrary table route, perimeter, pointer cycle, sorted numeric order, reverse, or hidden permutation) retains this **same 86-rune histogram**, regardless of whether the visually suggestive `YOUA` prefix is retained.

This is a **key-independent invariant** that sharply restricts the output register if a puzzle designer intended the full 86 events as an ordinary native-GP English message. Against **8,916** real 86-rune Gibran windows (minimum IoC **0.04350205**) and **31,003** real 86-rune Shakespeare windows (minimum **0.04021888**), **zero of 39,919** has IoC at or below the original event stream. The independently solved p57 first 86 GP runes score **0.05964432**. Since the 86-event histogram cannot be repaired by reordering, the full event list needs a **value-changing decoder** or a different output/language register to become ordinary source-like English. The comparisons are empirical finite controls and do not prove no possible English 86-rune passage has such a low IoC; the original `YOUA` prefix by itself is neither a decryption nor a signed instruction. [Executable original-source SFT](../sims/lp2_doublet86_anyorder_native_gp_gate_sft.cjs) · [successful Windows Node22 run 44146730192](https://github.com/FlareZ123/liber-primus/actions/runs/44146730192). **Decision:** retire further attempts to rescue the full 86 original repeat glyphs by rearranging them into native English using table order alone. A new original clue must name a value-changing receiver to advance the sparse-event lead.

**Direct value identity inside the 33 low60 repeat events (Agent25, 18 November).** A simpler causal interpretation than a full decoder is that a low60 table value directly names the repeated GP rune. Under the already frozen global phase-zero alignment, test only `repeated GP index = canonical base60 byte mod29` at the **33** repeat events whose aligned cell is below60. There are exactly **2/33** matches: p8 local106 has byte38→N/9 and p27 local228 has byte34→C/5. With the 33 event positions, p50 residues and repeated-rune multiset fixed, a deterministic **200,000** label-permutation calibration produces at least two matches in **50,331/200,000 = 0.251655** controls; the fixed-multiset expectation is **0.969697** matches. The completely literal source readout, taking only the printed second character of each aligned `0?` cell in manuscript event order, is `l464c0XspI6Y0w0wk6YpcIs00sceaukSs`; it contains no source-visible instruction or ordinary text and introduces no numeric conversion. Thus the class-level collision enrichment does not collapse into a direct printed-character or byte-value label for the repeated rune. No alternate sign, affine map, residue relabeling or phase is searched. [Standalone CommonJS SFT](../sims/lp2_p50_low60_repeat_value_identity_sft.cjs).

**Direct source-byte value-changing receiver on the complete 86-event channel (Agent25, 18 November).** The all-order obstruction above requires a value-changing operation if the complete adjacent-doublet event stream is meant to carry ordinary GP-native prose. The shortest existing source-linked receiver uses each event's already aligned p50 cell itself: preserve the 86 repeated glyphs in original manuscript chronology and decode `P_event = C_repeat - (B_phase mod 29) mod 29`, where `B_phase` is the canonical base60 byte at the frozen global phase-zero clock. The minus sign is the same solved-p56 convention already frozen in the #1514 direct-byte gate. There is no event reordering, phase search, sign search, reset, key fitting or second layer.

The exact original output transliterates as `YOIIATEOLSTHXFTNOEYPIFWTTHSRSUCHIADYCLOCNIUAEDEOYNGLFJJYYMOLEAIACAEHANOEERHXJUYAENMWOLCIALRDAEGJNIAAEDU`. Its GP29 IoC is **0.0350205198**, versus **0.0336525308** for the untouched 86 event glyphs and **0.0596443228** for the independently clear p57 first 86 runes. The readout is nonlinguistic and contains no complete recovered instruction. Exact forward reconstruction of all 86 original event glyphs passes. A planted p57 control encrypted at the same 86 event phases recovers **86/86** symbols exactly, so the failure is not an implementation failure. This closes only the canonical base60 direct-byte subtraction on the complete chronological event channel. Alternate signs, radices, phase shifts or event reorderings remain unselected and were not searched. [Standalone CommonJS SFT](../sims/lp2_p50_doublet86_direct_byte_value_sft.cjs) · [Windows Node22 PASS 44391768199](https://github.com/FlareZ123/liber-primus/actions/runs/44391768199).

**Direct one-use pad from the same original source (Agent3, 17 November).** The 86 repeat-event glyphs have near-uniform GP29 marginal, so they are more plausible *key material* than a complete natural-English 86-rune message. The literal p50 table supplies a complete natural order: sort all events by the actual base60-derived numeric cell value, ties by the printed table phase, and each cell's events in original chronological order. This fixes an 86-rune key beginning **`YOUAXLGNGXODTYXEACINFI...`**, sufficient to key the **entire original 76-rune p55** page once without cycling or fitting key symbols. The coincidence between the p50 table's 76-cell outer perimeter and the terminal tree page's 76 GP runes supplies an independent physical reason to nominate this target, though no first-party instruction confirms this key transfer.

Use the historically solved GP29 additive cipher in both signs, and allow every possible original ciphertext-F interpretation under the authenticated plaintext-F-transparent/no-key-advance rule. P55 has F at original offsets **15,25,41**, so there are exactly **8 literal-F decisions per sign**. Of these 16 full original inversions, **three** survive the exact syntax rule: subtract/sign−1/F-mask4 (75 key runes consumed), add/sign+1/F-mask1, and add/sign+1/F-mask2. Their native GP29 IoCs are **0.03719298, 0.03754386 and 0.03859649**, far from the independently clear p57's first76-runic IoC **0.05964912**; none reads as prose. A genuine clear-p57 76-rune positive is encrypted under the exact original-derived 86-rune key with both signs and recovered under the same full F-branch inverse.

**Decision:** a direct p50-byte-sorted rare-doublet one-use GP29 pad does **not** recover the original p55 terminal. This is a genuine value-changing, source-derived-key decoder tested on its exact matching original target, not an interpretation of the `YOUA` prefix as plaintext. Other source-instructed key derivations, layouts, clocks or value-changing operations remain outside this bounded test; do not tune the event order to make one of three nonlinguistic outputs read as English. [Read-only original-source full SFT](../sims/lp2_p50_doublet86_sortedpad_p55_original_sft.cjs) · [successful original-source Windows Node22 run 44147422814](https://github.com/FlareZ123/liber-primus/actions/runs/44147422814).

**Full-step alphabet challenge:** A separate, fixed-natural-clock contingency on **all 29 possible preceding-rune differences** by the **five literally printed first-digit categories** yields Pearson **χ²=113.201706 with 112 degrees of freedom** (ordinary chi-square upper-tail **p≈0.45045**). The strongest individual cell is digit0 / zero difference: **33 observed versus 20.165 expected** under independence. Thus the rare-zero-step excess does **not** extend to a broad dependence between table-leading digits and the other 28 GP29 step symbols. This calculation uses the same original source and is not an independent replication; its unadjusted chi-square tail is a descriptive counterweight to treating the discovered digit0 repeat enrichment as a general key selector. The [source-original chapter SFT](../sims/lp2_p50_digit0_chapter_repeat_sft.cjs) now freezes the full 5×29 table and this exact statistic as well.

**Causal frontier:** the physically printed leading-zero class and the globally continuous original 256-cell clock are associated with the book's unusually rare adjacent doublets in a way that survives nine-chapter stratification, lag controls, shared-column permutations, intact-row permutations and an exact-row/column-margin switch-chain null. This makes a **source-selected, stateful table-controlled collision or escape operation** worth one bounded causal follow-up if an authentic manuscript or historical clue specifies the operation. The relationship is far from deterministic: **53 of the 86 doublets are outside the class**, and **2,992 of the 3,025 eligible class-zero positions do not repeat**. The grid appears only late in the book, and no authorial instruction tells a player to run its values over all earlier ciphertext. Without a key and explicit inverse, the association recovers no GP29 plaintext, destination, or authenticated original cipher.

[Source-original standalone CJS replication](../sims/lp2_p50_digit0_chapter_repeat_sft.cjs) reconstructs the exact nine-chapter counts, all 1,280 category/phase controls, both retrospective halves and lags 2–12 using the canonical rune indices and **literal printed token characters**. Its [manual Windows Node22 CI workflow](../.github/workflows/lp2-p50-digit0-chapter-gate.yml) does not fit a key or a language model.

**Stronger dynamic-source negative on the same natural clock:** treating the published GP29 ciphertext as a **cumulative modular sum** instead of a directly permuted rune makes the p50 table a candidate alphabet for each observable preceding-rune step. That distinct architecture now has an exhaustive *all-unknown-secret-codebook* necessary-condition exclusion under exactly 256 phase selectors, 2,303 occupied phase-and-nine-chapter selectors, 161 byte selectors, 29 residue selectors and five visible-digit selectors. Every one has a source-conditioned same-selector difference-pair equality near 0.035, below all 122 original-layout native GP29 controls at 0.057 or higher; the direct source-byte plus/minus step inverses are flat too. A matched source-native plant with a rare-repeat output correctly decrypts. This constrains a **stationary cumulative-step cipher**, not the observed statistical doublet enrichment or an evolving keyed state. [Separate original source and reproducible inverse](lp2-p50-step256-allsecret-inverse.md).

## Positive controls

For each of the four model variants, the reproducer applies independently shuffled 29-symbol permutations per selector to a native-English control (a contiguous Shakespeare window for the per-rune model; a word-length-matched Shakespeare sample for the per-word model), using fixed seeds. Selector-group sizes, equal-pair counts, conditional coincidence and all twelve U(k) values are preserved exactly. The script asserts the plants and original/control bounds.


### Exact zero-only escape obstruction and word-local lag-five comparator

A proposed **lossless** decoder in which a table token whose first printed character is `0` exclusively permits an adjacent-ciphertext-repeat exception has a key-independent necessity: all genuine repeat events must coincide with that table class. The original 56 unknown pages contain **86** identical-adjacent pairs. The 256 printed table tokens have **60** leading-zero entries. Even scanning **all 256 global cyclic offsets** under the one original rune clock, the largest count covered by the zero class is **33** (at the candidate predecessor alignment); **at least 53** observed adjacent equalities lie outside *every* such zero-only exception rule. Conversely, the fixed natural alignment gives 3,025 leading-zero eligible starts but only 33 repeats, so zero cannot be a deterministic “emit the previous rune” command either.

The independently printed groups contain **104** fifth-back rune equalities among **2,105** strictly within-group positions. Under the **same frozen unshifted table clock**, leading-zero cells contain **27/482**, with **77/1,623** in the other cells, for rate ratio **1.1807134774**. The direct adjacent-repeat effect under the same clock is **2.0327958834×**. The narrow zero-class association therefore does not explain the two observed repeat phenomena through an exclusive, common deterministic escape state. The lag-five contrast is descriptive and does not establish a second independent null p-value.

The table itself prints numeric tokens with no original instruction interpreting a leading zero as a null, no rule governing how a 256-cell clock advances over pages and words, and no invertible mapping from any suppressed step to a lost plaintext rune. A probability-modulated or nonlocal generator remains possible, but cannot be asserted without that missing original decoder. This strictly bounded gate uses the same [canonical-source reproducer](../sims/lp2_p50_digit0_chapter_repeat_sft.cjs), extended to assert all 2,896 original printed words, the exact 104/2,105 word-local lag-five count, the 27/482 mask count, and the phase-256 exclusion. It supplies no authentic LP2 plaintext.


### Phase-selection audit (24 November 2026)

The local phase-zero convention indexes an adjacent event by the first rune of the pair; in the external zero-based second-rune convention this is phase255 (the predecessor rune). The fixed predecessor z is 3.269482. An exact enumeration of every circular shift of the 86 event positions over the 12,956-rune tape, preserving the complete gap sequence, gives fixed-predecessor p=32/12,956=0.0024699 if preselected, max-leading-zero-phase p=0.4682001, and max absolute 17-predicate×256-phase family p=0.5091849. The fixed-phase result remains a conditional candidate; the phase itself has no explicit first-party selector. See [exact phase-family SFT](../sims/lp2_p50_doublet_phase_family_circular_shift_sft.cjs) and [consolidated conditional report](lp2-doublet-gap-nonstationarity-ordering.md).

## Decision and limits

Reject these four specific stationary tableau models:

- continuous per-rune p50 selector, raw byte;
- continuous per-rune p50 selector, byte modulo 29;
- per-word indexed p50 selector, raw byte;
- per-word indexed p50 selector, byte modulo 29.

The four stationary raw-byte/mod29 selector models and the five-state leading-digit selector are rejected by exact all-secret bounds. The fixed predecessor-phase p50 repeat-mask test finds a reproducible conditional enrichment at adjacent-doublet pair starts, but no cipher or plaintext follows. The exact circular-shift family audit gives fixed-predecessor p=0.00247 only if that phase was selected in advance; maximum-phase p=0.46820 and maximum 17-mask×256-phase family p=0.50918 show that the peak is ordinary when phase/predicate selection is charged. The table-geometry nulls in this report hold the phase fixed and do not correct phase selection. Without an independent source instruction fixing the p0 origin and predecessor-cell convention, do not treat the leading-zero mask as an authenticated selector. This does not reject more general stateful key clocks, page/word-reset rune clocks, evolving tables, non-bijective/homophonic encoders, another source stream, another alphabet, or an intermediate non-English plaintext. Radix59 is tested for the repeat-site rank comparison (same result), but the original all-secret selector bounds remain conditional on the canonical base60 byte rendering.

**No unknown LP2 plaintext, authentic key, original cipher, or destination is recovered.** The next useful step is a separately source-selected operation or key stream, not another unconstrained permutation search.

## Reproduction

Run from the repository root:

    node sims/lp2_p50_raw_tableau_allsecret_gate.cjs

The standalone CommonJS script uses Node.js built-ins and the frozen original/control resources. It asserts the source counts, all 122 continuous controls, all 2,000 word-length-matched controls, all all-secret inequalities, the five-state selector negative, the 86 doublet sites, the 12 table-clock/radix comparisons, the 256-shift/five-quintile family test, the seeded 100,000 random-subset test, all 122 English repeat-mask control windows, lag-2–10 controls, and the native-English positive plants.
