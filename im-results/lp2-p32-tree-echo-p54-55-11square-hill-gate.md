# P32 tree-source 11-square Hill test on terminal p54–55

**Status, updated 23 November 2026: no plaintext from either the direct original-input test or the source-composed prime-totient → tree-Hill candidate.** The 11×11 reflow and Hill opcode remain hypotheses; neither is printed or explicitly instructed.

## Source rationale and key

The signed 2016 tree carrier has prime pixel dimensions 563×569; these are exactly the first-row and first-column GP-prime sums when p32's 121 runes are reflowed into 11×11. The same tree silhouette appears faintly on original p55. The terminal visual chapter p54–55 has 232+76=308 runes=28×11, including the first p55 NG rune carried from p54.

The original p32 121 indices form a nonsingular matrix over GF(29), determinant **8**. Two source representations are tested: GP ordinal indices and GP prime weights modulo29. For each, the fixed family comprises the matrix and inverse, both transposed orientations, and both contiguous 28×11 row-block and 11×28 column-block layouts. No fitted offset, padding, unknown key, or English optimization is used.

## Direct original-input test

The intact original 308-rune p54–55 input has IoC **0.03382123**. All **16** source-key operations invert their own encipherment of a 176-rune positive plant drawn from actual solved p57 plaintext. The best of the 16 operations on untouched original p54–55 reaches only **0.03616904** (ordinal GP values, forward transposed matrix, vertical-column layout); all other outputs lie **0.03310208–0.03597868**. The outputs remain nonlinguistic, while the clear p57 positive plant has IoC above0.05.

This retires the direct source-matrix Hill family on the original p54–55 input.

## Sequential candidate: prime-totient first layer, then p32 tree-Hill

A separate, explicitly provisional p54–55 first-layer candidate was identified in the all-464-start prime-minus-one/F-transparent search:

- start index167, prime997, selected by the post hoc arithmetic relation 1033−physical p36=997 (1033 appears in the cuneiform/2014 magic-square material; p36 begins the five numbered units);
- literal-F skips at global p54–55 offsets **[65,195,247]**, corresponding to p54-local65 and195 and p55-local15. These offsets match the distinct products 5×13, 3×5×13 and 3×5, using the visible 3/5 berry motif and 13-dot red marker on p54–55.

This is a candidate selector, not an authenticated instruction: neither subtraction nor multiplication is explicitly stated, and the resulting 308-rune stream is still nonprose (IoC **0.03492110**). The 464-prime cyclic interpretation changes only the final eight symbols and has IoC **0.03473074**.

To test the most natural source-composed second layer, both the linear and cyclic versions of that candidate 308-rune intermediate were passed through the same **16** p32 tree-Hill operations above: **32 sequential outputs** in total. The best linear-first-layer output has IoC **0.03862262**; the best cyclic-first-layer output has IoC **0.03858031**. Every output remains below0.04 and nonlinguistic. Thus the exact candidate prime-totient → p32 Hill-11 composition does not recover plaintext.

The candidate first layer and its source-selector assumptions are documented separately in [the all-start prime-totient report](lp2-prime-totient-all464-true-Fbranch-original-complete-inverses.md). This sequential test does not authenticate those assumptions; it only closes this particular two-layer receiver.

## Reproduction and decision

Run from the repository root:

`node sims/lp2_p32_p54_55_11square_hill_sft.cjs`

The standalone Node 22 SFT reads `resources/liber-primus/lp2-corpus.json`, checks the 563/569 tree dimensions and the p57 positive plant, reproduces all 16 direct operations, constructs both candidate prime-totient intermediates, and evaluates all 32 sequential operations.

**Decision:** no original p54–55 plaintext, no key and no decoder are recovered. Retire the direct p32 Hill-11 family and this specific prime-totient → p32 Hill-11 composition. Do not widen the result into arbitrary matrix layouts or additional fitted layers. The p32 tree relationship may still matter, but a further receiver needs an independently specified operation or a new discriminating prediction on original material.
