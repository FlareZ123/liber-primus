# Recursive perimeter parent-feedback: calibrated original p0–2 decision

**Decision (#2483, 24 November 2026): reject the tested three-parameter additive parent-feedback construction.** It does not recover unknown LP2 plaintext, a creator-selected key, or the intended inverse. The negative is specific to this geometry, parent rule, and shared affine state, and to the tested native-register controls. Do not interpret a forward replay as a key discriminator.

## Source rationale and exact mechanism

The solved p57 parable explicitly mentions shedding circumferences. Original p0–2 have 729=27² runes (canonical physical page order). The independently corrected p0 13-red-rune heading and mark at rune13 do not select this key or its parent projection. #30 and #2442 established why the earlier sparse node paths and postselected key/path choices do not constitute a complete inverse. Here every cell is processed, no cell is reused as an independent read, and the plaintext of one complete perimeter is required to unlock the next. Ordinary typesetting arithmetic and poetic language remain strong rivals.

Place the 729 runes in a 27×27 row-major grid in printed order. For coordinates (x,y), let depth d=min(x,y,26−x,26−y). The ordered depths have sizes [104,96,88,80,72,64,56,48,40,32,24,16,8,1]. For a cell of depth d>0 define its parent by taking an outward step on every coordinate attaining a perimeter edge: x=d → x−1; otherwise x=26−d → x+1; otherwise x unchanged; same for y. At the center both lower-bound tests take precedence, selecting northwest. All parents have depth d−1. This convention is an explicit hypothesis, not an authentic clue.

For three shared parameters k,h in GF(29), a in GF(29) nonzero:

- depth 0: C_i=P_i+k (mod 29)
- depth >0: C_i=P_i+a P_parent(i)+h (mod 29).

Inverse subtracts the corresponding term and processes all depths from 0 through 13. All non-rune frame positions can be retained unchanged because the decoded array stays in printed row-major order. This is a recursive plaintext-derived per-cell state rather than a static perimeter mask. The family has 29×28×29=23,548 keys, with an exact inverse for each.

## Prospective parameter recovery

The ranker uses add-0.5 smoothed unigram and adjacent GP29 bigram log likelihoods from seven disjoint solved-native source sections (1,444 runes total; source `resources/external/relikd-solved-gp29-native-v1.json`). The two held-out native donors are `0_koan_1` (780 runes) and `0_loss_of_divinity` (755 runes); none of their symbols enter training. At 12 deterministic independently keyed trials per donor, select a contiguous 729-rune window, encrypt with a hidden key, then estimate k from the 104 outer cells by testing all 29 shifts. With k frozen, test all 812 (a,h) pairs using only the first two perimeters (200 cells). Score only actual contiguous printed-order adjacencies, never fabricated adjacency across a missing cell. Freeze the winning triple and decode 529 previously unscored cells.

The control trials are overlapping donor windows; they are not 24 independent source texts. All 24 keys and all 24 full plaintexts recover exactly, with full forward replay. For original input, the same deterministic fit chooses (20,13,0). The gap over the next (a,h) candidate is only 0.000216841 mean log-likelihood units. All 729 cells replay, but exact replay is true for every key by construction.

| Mean log-likelihood (higher is better) | Native plants, min–max | 24 uniform GP29 nulls, min–max | Original |
|---|---:|---:|---:|
| Outer 104 | −2.985565 to −2.538559 | −3.798371 to −3.653136 | −3.739249 |
| First two rings 200 | −2.858523 to −2.566138 | −3.708128 to −3.578737 | −3.679611 |
| Withheld 529 | −2.792911 to −2.615707 | −3.913008 to −3.796965 | −3.895877 |

Original decoded whole-grid IoC: 0.0342068768. Native control range and null ranges are finite calibrations, not proof of impossibility for every conceivable GP plaintext. Even the outer ring already scores outside all tested native plants and within the null range; the unselected inner state yields null-like held-out output. No authentic phrase or key is established.

## Consequence

The selected model predicts the entire inner grid and is empirically identifiable on native plants; its failure on original LP2 is therefore not a mere implementation or key-search failure. Nevertheless the general recursive architecture remains possible. Do not retune corner parents, add free ring states, or try another arbitrary ring clock solely to rescue the failed hypothesis. A new source-selected operation or an independent ring-state operand would justify a materially different successor. The missing authored input is the precise first key/parent and shared transition, not another exhaustive static perimeter sweep.

## Reproduction

- [Read-only Node22 CommonJS reproducer](../sims/lp2_p0p2_recursive_perimeter_parent_affine_sft.cjs): `node sims/lp2_p0p2_recursive_perimeter_parent_affine_sft.cjs` from the repository root.
- [Full original and control output](lp2-p0p2-recursive-perimeter-parent-affine-output.json), including all 729 candidate indices, each plant's true and recovered parameters, and null score records. Executed through the JavaScript runtime against the actual repository source files.
- [Issue #2483](https://github.com/FlareZ123/liber-primus/issues/2483), [prior #30](https://github.com/FlareZ123/liber-primus/issues/30), [#2442](https://github.com/FlareZ123/liber-primus/issues/2442).

The authoritative status remains 56 unsolved physical pages; no established-result promotion is warranted.
