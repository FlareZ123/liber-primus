# p50 table as stationary GP29 tableau selector: exact all-secret gates

**Decision (15 November 2026):** two natural ways of using the conditional base60 p49–51 table as a repeating selector for non-affine GP29 alphabets fail exact, key-independent histogram tests against source-native English and Latin controls. This is a bounded negative, not a decipherment.

## Candidate and frozen models

The original LP2 physical pages 49–51 print a 32×8 table of 256 two-character numeral cells. Its current canonical byte rendering is in resources/liber-primus/lp2-grid-256.json; base60 conversion is conditional, with radix59 still a live alternative.

Two distinct clocks were tested, each with two selector registers:

1. **Per-rune continuous:** the first table byte selects the alphabet for the first p0 rune; the stream continues row-major and repeats every 256 runes. The selector is either the raw byte (161 distinct values) or byte modulo 29 (29 values).
2. **Per-word indexed:** the first table byte selects the alphabet for the first printed word; the selector advances once per word and repeats every 256 words. Every rune in that word uses the same selector. Again, the selector is either the raw byte or byte modulo 29.

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

## Positive controls

For each of the four model variants, the reproducer applies independently shuffled 29-symbol permutations per selector to a native-English control (a contiguous Shakespeare window for the per-rune model; a word-length-matched Shakespeare sample for the per-word model), using fixed seeds. Selector-group sizes, equal-pair counts, conditional coincidence and all twelve U(k) values are preserved exactly. The script asserts the plants and original/control bounds.

## Decision and limits

Reject these four specific stationary tableau models:

- continuous per-rune p50 selector, raw byte;
- continuous per-rune p50 selector, byte modulo 29;
- per-word indexed p50 selector, raw byte;
- per-word indexed p50 selector, byte modulo 29.

The result is conditional on the current base60 rendering and the GP29 source registers. It does not reject skip/null drift, page-reset or word-reset rune clocks, evolving tables, non-bijective/homophonic encoders, another source stream, another alphabet, or an intermediate non-English plaintext. The radix59 alternative is not tested.

**No unknown LP2 plaintext, authentic key, original cipher, or destination is recovered.** The next useful step is a separately source-selected operation or key stream, not another unconstrained permutation search.

## Reproduction

Run from the repository root:

    node sims/lp2_p50_raw_tableau_allsecret_gate.cjs

The standalone CommonJS script uses Node.js built-ins and the frozen original/control resources. It asserts the source counts, all 122 continuous controls, all 2,000 word-length-matched controls, all forty-eight all-secret inequalities, and the native-English positive plants.
