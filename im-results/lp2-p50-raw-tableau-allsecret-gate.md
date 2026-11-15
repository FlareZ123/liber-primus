# p50 table as stationary GP29 tableau selector: exact all-secret gates

**Decision (15 November 2026; nine-chapter stress test):** five stationary GP29 alphabet-selection models from the p49–51 numeric table fail exact key-independent language-histogram gates. A separate leading-zero-table-cell and adjacent-doublet association persists within all nine illustrated chapters under one global 256-rune clock, but supplies no authentic cipher inverse or plaintext.

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

At the physically natural zero shift, the first-digit-zero mask covers **3,025/12,901 eligible pairs** and **33/86 doublets**. Its repeat rate is **33/3,025 = 1.091%**, compared with **53/9,876 = 0.537%** for all other first digits, a **2.0328×** rate ratio (approximate 95% log-rate interval **1.32–3.13**). A one-sided fixed-mask hypergeometric comparison gives **0.001349**. This is an **unadjusted diagnostic**, since the table/clock/doublet hypothesis emerged after a large history of exploratory LP2 tests.

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

**Literal `00` source-cell test (Agent 41, 15 November).** A narrower exact-token hypothesis was checked rather than introducing a new table traversal. The **only** printed `00` cells occupy phases **192 and 229**, and their 256-rune repetitions cover **100/12,901** within-page successor pairs. They coincide with **five of the 86** actual equal-rune pairs: **four** at phase 192 and one at 229. Exact page-level event counts and opportunities are held fixed in [the Windows Node22 source-input SFT](../sims/lp2_p50_literal00_doublet_source_sft.cjs), [run 43738819854](https://github.com/FlareZ123/liber-primus/actions/runs/43738819854). Among 70,000 seeded matched-position randomizations, a **preselected** literal `00` mask reaches five or more in **0.0005143** plus-one proportion (null expectation **0.66658** hits). But the token was recognized **after** studying the broader low-value collision enrichment: scanning **all 161 distinct printed token masks** and comparing their page-conditioned standardized anomalies, the family-maximum probability is **0.04493**; the `00` mask ranks first only retrospectively. The single 256-phase peak at phase 192 contains four repeats, yet scanning **all 256 phases** has matched-null probability **0.08640** of reaching at least four. Moreover the literal `00` mask has **two** equally successful table-clock rotations (0 and 37), and **95/100** encounters of those cells do not yield a repeat. This confirms a narrowly concentrated numerical association while withholding any claim of a deterministic zero-step opcode, exact cipher alignment, recovered key, or plaintext. It does **not** give a second independent positive for the existing digit-zero class because the events and masks overlap.

**Full-step alphabet challenge:** A separate, fixed-natural-clock contingency on **all 29 possible preceding-rune differences** by the **five literally printed first-digit categories** yields Pearson **χ²=113.201706 with 112 degrees of freedom** (ordinary chi-square upper-tail **p≈0.45045**). The strongest individual cell is digit0 / zero difference: **33 observed versus 20.165 expected** under independence. Thus the rare-zero-step excess does **not** extend to a broad dependence between table-leading digits and the other 28 GP29 step symbols. This calculation uses the same original source and is not an independent replication; its unadjusted chi-square tail is a descriptive counterweight to treating the discovered digit0 repeat enrichment as a general key selector. The [source-original chapter SFT](../sims/lp2_p50_digit0_chapter_repeat_sft.cjs) now freezes the full 5×29 table and this exact statistic as well.

**Causal frontier:** the physically printed leading-zero class and the globally continuous original 256-cell clock are associated with the book's unusually rare adjacent doublets in a way that survives nine-chapter stratification and lag controls. This makes a **source-selected, stateful table-controlled collision or escape operation** worth prioritizing if an authentic instruction specifies it. The relationship is far from deterministic: **53 of the 86 doublets are outside the class**, and **2,992 of the 3,025 eligible class-zero positions do not repeat**. The grid appears only late in the book, and no authorial instruction tells a player to run its values over all earlier ciphertext. Without a key and explicit inverse, the association recovers no GP29 plaintext, destination, or authenticated original cipher.

[Source-original standalone CJS replication](../sims/lp2_p50_digit0_chapter_repeat_sft.cjs) reconstructs the exact nine-chapter counts, all 1,280 category/phase controls, both retrospective halves and lags 2–12 using the canonical rune indices and **literal printed token characters**. Its [manual Windows Node22 CI workflow](../.github/workflows/lp2-p50-digit0-chapter-gate.yml) does not fit a key or a language model.

**Stronger dynamic-source negative on the same natural clock:** treating the published GP29 ciphertext as a **cumulative modular sum** instead of a directly permuted rune makes the p50 table a candidate alphabet for each observable preceding-rune step. That distinct architecture now has an exhaustive *all-unknown-secret-codebook* necessary-condition exclusion under exactly 256 phase selectors, 2,303 occupied phase-and-nine-chapter selectors, 161 byte selectors, 29 residue selectors and five visible-digit selectors. Every one has a source-conditioned same-selector difference-pair equality near 0.035, below all 122 original-layout native GP29 controls at 0.057 or higher; the direct source-byte plus/minus step inverses are flat too. A matched source-native plant with a rare-repeat output correctly decrypts. This constrains a **stationary cumulative-step cipher**, not the observed statistical doublet enrichment or an evolving keyed state. [Separate original source and reproducible inverse](lp2-p50-step256-allsecret-inverse.md).

## Positive controls

For each of the four model variants, the reproducer applies independently shuffled 29-symbol permutations per selector to a native-English control (a contiguous Shakespeare window for the per-rune model; a word-length-matched Shakespeare sample for the per-word model), using fixed seeds. Selector-group sizes, equal-pair counts, conditional coincidence and all twelve U(k) values are preserved exactly. The script asserts the plants and original/control bounds.


### Exact zero-only escape obstruction and word-local lag-five comparator

A proposed **lossless** decoder in which a table token whose first printed character is `0` exclusively permits an adjacent-ciphertext-repeat exception has a key-independent necessity: all genuine repeat events must coincide with that table class. The original 56 unknown pages contain **86** identical-adjacent pairs. The 256 printed table tokens have **60** leading-zero entries. Even scanning **all 256 global cyclic offsets** under the one original rune clock, the largest count covered by the zero class is **33** (at the source-natural offset zero); **at least 53** observed adjacent equalities lie outside *every* such zero-only exception rule. Conversely, the fixed natural alignment gives 3,025 leading-zero eligible starts but only 33 repeats, so zero cannot be a deterministic “emit the previous rune” command either.

The independently printed words contain **104** fifth-back rune equalities among **2,105** strictly within-word positions. Under the **same frozen unshifted table clock**, leading-zero cells contain **27/482**, with **77/1,623** in the other cells, for rate ratio **1.1807134774**. The direct adjacent-repeat effect under the same clock is **2.0327958834×**. The narrow zero-class association therefore does not explain the two observed repeat phenomena through an exclusive, common deterministic escape state. The lag-five contrast is descriptive and does not establish a second independent null p-value.

The table itself prints numeric tokens with no original instruction interpreting a leading zero as a null, no rule governing how a 256-cell clock advances over pages and words, and no invertible mapping from any suppressed step to a lost plaintext rune. A probability-modulated or nonlocal generator remains possible, but cannot be asserted without that missing original decoder. This strictly bounded gate uses the same [canonical-source reproducer](../sims/lp2_p50_digit0_chapter_repeat_sft.cjs), extended to assert all 2,896 original printed words, the exact 104/2,105 word-local lag-five count, the 27/482 mask count, and the phase-256 exclusion. It supplies no authentic LP2 plaintext.


## Decision and limits

Reject these four specific stationary tableau models:

- continuous per-rune p50 selector, raw byte;
- continuous per-rune p50 selector, byte modulo 29;
- per-word indexed p50 selector, raw byte;
- per-word indexed p50 selector, byte modulo 29.

The four stationary raw-byte/mod29 selector models and the five-state leading-digit selector are rejected by exact all-secret bounds. The simple global p50 repeat-mask test finds a reproducible, phase-specific enrichment at adjacent-doublet pair starts, but no cipher or plaintext follows from it. The result does not establish a skip/null rule and does not reject more general stateful key clocks, page/word-reset rune clocks, evolving tables, non-bijective/homophonic encoders, another source stream, another alphabet, or an intermediate non-English plaintext. Radix59 is tested for the repeat-site rank comparison (same result), but the original all-secret selector bounds remain conditional on the canonical base60 byte rendering.

**No unknown LP2 plaintext, authentic key, original cipher, or destination is recovered.** The next useful step is a separately source-selected operation or key stream, not another unconstrained permutation search.

## Reproduction

Run from the repository root:

    node sims/lp2_p50_raw_tableau_allsecret_gate.cjs

The standalone CommonJS script uses Node.js built-ins and the frozen original/control resources. It asserts the source counts, all 122 continuous controls, all 2,000 word-length-matched controls, all all-secret inequalities, the five-state selector negative, the 86 doublet sites, the 12 table-clock/radix comparisons, the 256-shift/five-quintile family test, the seeded 100,000 random-subset test, all 122 English repeat-mask control windows, lag-2–10 controls, and the native-English positive plants.
