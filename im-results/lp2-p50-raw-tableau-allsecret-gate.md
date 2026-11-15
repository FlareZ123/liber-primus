# p50 table as stationary GP29 tableau selector: exact all-secret gates

**Decision (15 November 2026):** two natural ways of using the conditional base60 p49–51 table as a repeating selector for non-affine GP29 alphabets fail exact, key-independent histogram tests against source-native English and Latin controls. This is a bounded negative, not a decipherment.

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

### New cross-channel result: repeat sites align with low p50 table values

The independent [Round44 doublet-site analysis](https://github.com/Dukotah/cicada3301/tree/main/liber-primus/analysis/round44/W2-B3-doublet-sites) reports 86 adjacent repeated-rune sites and a nonstationary gap sequence. Recomputing from the local canonical LP2 corpus reproduces exactly **86** sites in 12,955 adjacent-pair opportunities. The external list records the first rune of each pair; the local script uses the corresponding pair-start index `i-1`.

For each pair start, read the p50 table continuously at `pairStart mod 256` (row-major, zero offset). Sort the 256 table cells by their base60 numeric value and partition them into five equal-rank groups. The lowest group is exactly **52 cells** (20.3% of the table; base60 values at or below 54). At the natural global/first-rune alignment:

- **30/86** doublets (34.9%) occur at the lowest-quintile cells, versus **2,632/12,955** opportunities (20.3%). The event rate is 1.140% in this group and 0.543% elsewhere: **2.10× enrichment**.
- Across all 256 circular table offsets and all five quintiles (1,280 combinations), the observed count 30 is the maximum, tied at three combinations: empirical familywise `p = 3/1280 = 0.00234`.
- A separate 100,000-trial random-subset test, preserving the 86 event counts per table residue but choosing 52 of 256 residues uniformly, gives `p = 0.00393` (fixed seed in the reproducer).
- Applying the same fixed mask and global clock to **122 source-native English control windows** gives a maximum bottom-quintile share of 25.19% of their doublets and a maximum rate ratio of 1.32×; none reaches the LP2 share of 34.88% or its 2.10× rate ratio. This makes a generic English double-letter pattern an inadequate explanation.
- The same cell-rank partition is obtained under the radix59 alternative. The effect is specific to the global first-rune alignment: the second-rune, page-local and word-local clocks do not reproduce it. Lag-2 through lag-10 same-rune controls show no comparable 2.10× enrichment (their largest bottom-quintile rate ratio is about 1.25×).
- The leading base60 digit 0 class (60 cells; 23.4% of the table) contains **33/86** doublets (38.4%): 1.087% repeat rate versus 0.534% in the other four classes, or **2.03×**. Its count is the maximum across 256 phases for digit 0; after scanning all five leading digits ×256 phases, 7/1,280 counts are at least 33 (empirical p=0.00547). This is a repeat-state association, not evidence for the five-alphabet selector rejected above.

This is a **soft association, not a deterministic mask**: 56 of the 86 repeats occur outside the lowest quintile. It suggests the p50 table may modulate adjacent-repeat suppression or a stateful key clock, but it does not specify how. The external gap autocorrelation is not fully explained by this effect. The five-dot artwork and five base60 leading-digit classes make a five-way partition a plausible human test, not proof of author intent.


## Positive controls

For each of the four model variants, the reproducer applies independently shuffled 29-symbol permutations per selector to a native-English control (a contiguous Shakespeare window for the per-rune model; a word-length-matched Shakespeare sample for the per-word model), using fixed seeds. Selector-group sizes, equal-pair counts, conditional coincidence and all twelve U(k) values are preserved exactly. The script asserts the plants and original/control bounds.

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
