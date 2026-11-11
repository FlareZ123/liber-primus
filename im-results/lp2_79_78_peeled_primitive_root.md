# LP2 79/78 circumference peel: source-selected primitive-root and matrix tests

**Status: bounded negative for the tested direct matrix relations. No unknown plaintext or key recovered.**

## Source geometry and conditional matrix construction

The 12,956-rune unknown LP2 stream splits exactly into 81² = 6,561 and 80²−5 = 6,395. The repeated six-rune bookend `DJUBEI` occurs at first-block offsets 6,555–6,560 and second-block offsets 6,389–6,394 (global 12,950–12,955). Treating the five absent terminal cells as the final five positions of the second 80×80 square places all five on its bottom perimeter; that placement is a hypothesis, not an observed image-level fact.

Peeling one outer ring gives a 79×79 first interior and a 78×78 second interior. The p53, p15 and p40 red spans have lengths 51, 9 and 8; their **GP prime-value sums** are respectively 2,262 = 29×78, 638 = 29×22 and 435 = 29×15. The original probe tests the natural primitive-root ordering of the 78 nonzero residues modulo79.

Two earlier root selectors were already tested:

- **Root 53:** the p53 red-span prime sum is 2,262 = 29×78; 53 is a primitive root modulo79. The p15/p40 values 22/15 were also tested as row/column phase offsets.
- **Root 68:** the documented 2013 Parable ID3 number is N = 1,595,277,641 = 1,259×1,031×1,229, the product of the three p57 clause sums. N mod79 = 68, which has order78 modulo79. The same source gives N mod3301 = 70, as documented in [the Parable multiplicative-pad audit](parable-primitive-multiplicative-pad.md).

## New p55/p57 central-core selector: root 6

Agent4's original-image comparison found that p55's 13-dot red mark and p57's 23-dot red mark share the same five central-column dots in their 3×9 lattice ([image-geometry note](../communications/broadcast/20261111T220620Z_agent4_p57-five-instar-glyph-geometry.md)). The solved p57 Parable says to “shed our own circumferences” and “find the divinity within.” This motivates taking the strict interiors of p55's 16 complete printed words: p55 begins with one incoming carry rune, leaving **43 interior runes**. The central five are motivated by the five-dot core, at interior offsets 19–23:

- GP indices: **[21, 20, 15, 23, 27]**
- GP transliterations: **[NG, L, S, D, IA]**
- Canonical GP prime weights: **[79, 73, 53, 89, 107]**
- Central-five sum: **401 = the 79th prime**
- All-43-interior sum: **2,060 = 26×79 + 6**
- Other 38 interior symbols: **1,659 = 21×79**
- Therefore the central five and all 43 interiors share residue **6 modulo79**; the other 38 contribute zero modulo79.

Reducing the central-five sum gives 401 mod79 = 6; **6 has multiplicative order78 modulo79**. This supplies a new, source-motivated primitive-root candidate for the existing 79/78 construction. It is not an authenticated cipher instruction: the five-dot visual selector is source-derived, but summing the GP prime weights and reducing modulo79 is an inference. The 79/78 matrix construction also retains the independent terminal-five placement caveat above.

Across the 39 contiguous five-rune windows of p55's 43 interiors, the source-motivated central window is the only one with prime-weight sum401. This is descriptive, not a calibrated significance claim, because the target79 was recognized from the existing matrix hypothesis.

## Tests and results

The fixed operations are deliberately limited to the two natural direct relations already used for roots53 and68:

1. **Cellwise key-pad relation:** reorder the first 78×78 interior by the selected primitive-root order, then subtract or add it cellwise from the second interior.
2. **78×78 Hill-matrix relation:** use the reordered first interior as a key matrix and test A⁻¹B and BA⁻¹ over GF(29).

For root6, the exact power ordering contains all 78 nonzero residues and closes after 78 steps. The reordered key matrix has full rank **78**.

### Root6 with the first matrix reordered only

| Fixed operation | GP-trigram score (nats/rune) |
| --- | ---: |
| Cellwise B−A | **−4.16395334** |
| Cellwise A−B | **−4.16386023** |
| Hill A⁻¹B | **−4.15787736** |
| Hill BA⁻¹ | **−4.15743083** |
| Untouched second interior B | **−4.15074817** |

These four outputs are ciphertext-level and score no better than raw B.

### Root6 as a common coordinate order for both matrices

A natural alternative is to apply the same powers-of-6 row/column permutation to both interiors, not just the first. The common-ordered second interior alone scores **−4.15515844**. The direct relations give:

| Fixed operation | GP-trigram score (nats/rune) |
| --- | ---: |
| Common-order cellwise B′−A′ | **−4.14431639** |
| Common-order cellwise A′−B′ | **−4.17310013** |
| Common-order Hill A′⁻¹B′ | **−4.13873514** |
| Common-order Hill B′A′⁻¹ | **−4.15983199** |

The best common-order output, −4.13873514, is close to but below the earlier root68 best (−4.1372). It remains far below native Shakespeare (approximately **−2.4185**) and contains no readable passage. The common-coordinate interpretation therefore does not recover GP-English.

Across the combined root53/root68/root6 study, there are **22 cellwise settings** and **16 Hill settings**; all **16 Hill matrices** are full rank. The earlier best scores remain root68 cellwise **−4.1378** and root68 Hill **−4.1372**, still far below native English.

Implementation controls are exact: root6 cellwise and Hill plants recover all **6,084/6,084** planted GP symbols under both the first-matrix-only and common-coordinate interpretations; the existing root53 and root68 positive controls also pass. The scoring model is a continuous GP trigram model (0.8 smoothed trigram + 0.2 smoothed bigram), trained on the first 200,000 Shakespeare characters and evaluated from character 240,000 onward. Exact planted roundtrips validate the declared arithmetic and indexing, not the manuscript's use of the operation.

## Decision

The p55/p57 central-core arithmetic supplies a source-motivated residue6 and primitive-root ordering, and the full 43-interior sum confirms that the 38 noncentral symbols contribute a multiple of79. However, both the first-matrix-only and common-coordinate root6 direct cellwise/Hill uses fail on original ciphertext. Retire these root6 matrix outputs and do not expand into arbitrary phases, orientations, signs, matrix products or other unselected transforms. Reopen this branch only if an independent source clue specifies a different reversible consumer or resolves the terminal-five placement. No unknown LP2 plaintext, authentic key, or complete cipher architecture has been recovered.

**Reproduction:** [updated script](../sims/lp2_79_78_peeled_primitive_root_probe.cjs); [manual workflow](../.github/workflows/lp2-79-78-peeled-root68.yml). Historical source relation: [Parable ID3 multiplicative-pad audit](parable-primitive-multiplicative-pad.md).
