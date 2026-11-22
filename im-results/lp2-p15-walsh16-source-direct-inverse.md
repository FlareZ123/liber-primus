# p15 4×4 Walsh16 inverse on authentic pp16–22

**Agent 13, 13 November 2026. Outcome:** a new finite, exactly reversible *direct original-cipher test* of a compact 16-position mathematical interpretation of the original p15 clue. **No unknown plaintext, historical key, or original mechanism recovered.** This is supporting evidence rather than an established solution.

## Source-led operation and weak premise

The original LP2 physical p15 JPEG (archive 32.jpg) prints a 4×4 Fibonacci-prime square. Its independently reconstructed clockwise spiral is the zero-based cell permutation [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12] (see [the established source construction](../results/lp2-p15-fibonacci-prime-spiral.md)). A solver could regard the 16 cells as a 16-position register and try a **single** invertible fixed matrix transform on 16 adjacent GP29 rune indices in the immediately following original pages p16–22. The chosen operation is the Sylvester Walsh/Hadamard matrix H with H(i,j)=(-1)^popcount(i&j); H²=16I (mod29), so H⁻¹=20H (mod29).

The square does **not** actually prescribe a Walsh/Hadamard transform. This is an intentionally small, falsifiable candidate using an original 16-cell object. Do not elevate its failure or success to evidence about the actual author-selected cipher.

## Exact original-input inverse

Use the canonical [source physical pages](../resources/liber-primus/lp2-corpus.json), retaining **1,744 original runes** across p16–22. In each complete 16-rune block, test three nonfitted source orderings (printed row-major, spiral and inverse spiral) for both input and output cells. Test both signs, H or H⁻¹, and the clock either continuously across all seven physical pages (1,744 tested runes) or reset at each page (1,696 complete-block runes and 48 untouched remainders). This gives **72 exactly specified original inverse candidates**, with no unknown fitted matrix entries, key phrases, IVs or state.

The scorer is a GP29 trigram model trained on the pinned Shakespeare control. It uses a source-calibrated compound-rune tokenizer including a single NG rune for ING and a single IA rune for IO, which is necessary for the independently observed historical GP spellings; raw previous output is not fed back into the model selection. A separate Gibran control is retained for the planted inverse.

| Fixed input | Result (mean trigram log likelihood; nats/rune) |
| --- | ---: |
| Original p16–22 rune order, unchanged | **−4.657964** |
| Best of 72 frozen Walsh16 inverse variants, continuous clock, inverse spiral→spiral, positive H⁻¹ | **−4.636304** |
| Independent Gibran 1,600-rune native GP source | **−2.356627** |
| The same 1,600-rune text after exact H16 encryption with source spiral input/inverse-spatial output | **−4.662130** |
| Recovery by exact matching inverse | **1,600/1,600 GP runes** |

The best original inverse starts with GP transliterations D F IA EA Y U H N E B T J F J TH C and remains at the random-like language score of the input. Exactly reversing a native plaintext plant produces the native-score separation the method would need. The best source configuration has no semantic or independently-authenticated reason to be selected.

## Decision

The **direct, key-free GF29 Walsh16 operation** in these p15-source layouts does not decrypt the original immediately following chapter. It does not exclude other 16-cell transformations, keyed matrices, different intermediary alphabets, F-transparent clocks, a larger book region, or a second layer; none is selected by this square alone. An additional arbitrary layer to rescue this failed fixed candidate would need independent source evidence first.

[Full reproducible CJS single-file test](../sims/lp2_p15_walsh16_direct_inverse_sft.cjs), including the exact original inputs, frozen 72-variant search, GP-native scorer and a 1,600/1,600 independent text plant. No automatic CI workflow was added.
