# p50 raw-byte repeating tableau: exact keyless histogram gate

**Decision (15 November 2026):** the natural zero-drift interpretation of the conditional base60 p50 table as a repeating selector stream for a non-affine GP29 tableau is incompatible with the tested source-native English and Latin controls. This is a bounded negative, not a decipherment.

## Candidate and frozen model

The original LP2 physical pages 49–51 print a 32×8 table of 256 two-character numeral cells. Its current canonical byte rendering is in resources/liber-primus/lp2-grid-256.json; base60 conversion is conditional, with radix59 still a live alternative. This test asks whether each table value selects a keyed GP29 alphabet rather than acting as an additive shift.

Let B be the row-major 256-byte table and C the original concatenation of p0–p55 (12,956 GP29 runes). The tested model is

\[
C_i=T_{K_i}(P_i),\qquad K_i=B_{i\bmod256},
\]

where each T_v is an arbitrary permutation of the 29-symbol alphabet. The pointer starts at B[0] on p0 and runs continuously. A second register uses B modulo 29. No initial offset, key, language score, or permutation is fitted; there are no skips, nulls, page/word resets or changing tables.

This is distinct from the 76/180 terminal-ring consumer and from the existing direct additive/RC4 tests.

## Exact all-secret invariant

For each selector v, let n(v,r) count ciphertext rune r at positions with selector v. Since T_v is a bijection, it only relabels the 29 bins: the sorted per-selector histogram is identical in plaintext and ciphertext, regardless of every secret permutation.

For k=1,…,12 define U(k) as the sum, over selector groups, of the k largest bins in each group. U(k) is therefore an exact invariant. The conditional pair coincidence

\[
I=\frac{\sum_v\sum_r {n(v,r)\choose2}}{\sum_v{n(v)\choose2}}
\]

is invariant too. This covers every independent 29-symbol permutation per selector, including an additional fixed global alphabet relabeling.

## Inputs and controls

- Original ciphertext: resources/liber-primus/lp2-corpus.json, pages 0–55, 12,956 runes.
- Selector: resources/liber-primus/lp2-grid-256.json, 256 row-major bytes.
- English controls: Shakespeare, Gibran and Emerson, encoded with the source-calibrated GP29 orthography (ING and IO contracted only within a word; V=U, K/Q=C, Z=S).
- Latin control: the independently sourced word-preserving GP29 Vulgate in resources/control/latin-vulgate-gp-wholewords.txt.
- Each source is screened in 12,956-rune windows, stepping by 6,478 and including the final complete window: 33 Shakespeare, 9 Gibran, 49 Emerson and 31 Vulgate windows, 122 total. These windows overlap; they are deterministic controls, not independent trials or a p-value.

## Results

| Measure | Raw byte selectors | Byte mod 29 selectors |
|---|---:|---:|
| Selector groups | 161 | 29 |
| Original equal pairs / available pairs | 22,339 / 646,599 | 117,679 / 3,429,119 |
| Original conditional coincidence | **0.0345484605** | **0.0343175609** |
| Lowest control-window coincidence | **0.0569997788** | **0.0577673157** |

Original U(k), k=1…12:

- Raw: [1039, 1944, 2773, 3537, 4248, 4927, 5570, 6176, 6737, 7260, 7769, 8269]
- Mod29: [664, 1291, 1883, 2449, 2999, 3538, 4067, 4578, 5083, 5575, 6060, 6533]

Minimum U(k) across all 122 source-native windows:

- Raw: [1634, 2938, 4052, 5051, 5952, 6775, 7531, 8230, 8870, 9460, 10000, 10499]
- Mod29: [1472, 2593, 3575, 4478, 5314, 6103, 6844, 7523, 8170, 8762, 9310, 9821]

For both selector interpretations, all twelve original U(k) values are below the minimum from every control window. No secret choice of the per-selector alphabets can change those histograms.

## Positive control

The reproducer applies independently shuffled 29-symbol permutations per selector to a native Shakespeare window, using fixed seed 0x17c0ffee. For both selector registers, selector-group sizes, equal-pair counts, conditional coincidence and all twelve U(k) values are preserved exactly. The script asserts both plants and every original/control count.

## Decision and limits

Reject only the continuous, zero-offset, no-skip/no-reset p50-table selector model with a fixed arbitrary GP29 permutation per raw byte or per byte mod29. This is a key-independent exclusion of two natural stationary tableau registers.

It does not reject skip/null drift, page- or word-reset clocks, evolving tables, non-bijective or homophonic encoders, another source stream, another alphabet, or an intermediate non-English plaintext. The base60 rendering is conditional and radix59 is untested.

No unknown LP2 plaintext, authentic key, original cipher or destination is recovered. The next useful step is a separately source-selected operation or key stream, not another unconstrained permutation search.

## Reproduction

Run from the repository root:

    node sims/lp2_p50_raw_tableau_allsecret_gate.cjs

The standalone CommonJS script uses Node.js built-ins and the frozen original/control resources. It asserts the source counts, all 122 windows, the twelve all-secret inequalities and native-English positive plants.
