# p8 red-heading 12-column transposition gate

**Disposition: negative for the direct standard columnar-transposition hypothesis.** No plaintext or key was recovered.

## Source-selected hypothesis

The original source provides a visually distinct 12-rune red span at p8 offset 0, followed by black body text. The p8–p14 section ends at a red 13-dot mark on p14. Removing the p8 red span leaves 1,717 runes:

1717 = 12 × 143 + 1.

A solver could reasonably try the 12-rune heading as a columnar-transposition rank key for a 12-column rectangle. This is a single source-aligned candidate, not a generic transposition menu. It is distinct from the repeating Vigenère candidate already rejected in lp2-p8-p14-red-heading-vigenere-gate.md.

## Frozen inputs and operation

- Key: p8 red span, GP indices [14,10,14,19,1,14,19,5,2,13,3,17], transliteration XIXMUXMCTHPOB.
- Receiver: p8 after the red heading through p14, including the full p14 runic body; 1,717 runes.
- Grid: 12 columns, 144 rows; original column 0 contains 144 symbols, columns 1–11 contain 143.
- Key order: stable rank of GP indices, ties in source order.
- Tested orientations: ascending/descending rank and forward/reverse key-source order.
- Tested operations: standard row-write/column-read columnar transposition and its inverse.
- No fitted phase, arbitrary column permutation, word-local reset, or extra substitution layer.

## Reproducible scoring

The script reuses the existing LP1-only add-one-smoothed bigram model from the p8 Vigenère gate. It scores the original p8–p14 body, both transform directions for all four rank orders, and clear p57 as a control. Exact forward/inverse round-tripping is asserted for every order.

| Candidate | Mean bigram log score |
|---|---:|
| Original p8–p14 body | -3.47743 |
| Best inverse candidate (reverse source, ascending) | -3.48372 |
| Worst inverse candidate (reverse source, descending) | -3.52589 |
| Best output across either direction (reverse source, ascending forward transform) | -3.45278 |
| Clear p57 control | -2.53337 |

The forward transform is included as the opposite direction check, not as a decryption claim. Its small score improvement over the original is nowhere near the clear control. The inverse candidates are all worse than the original. Prefixes and full outputs are emitted by the reproducer; none is coherent plaintext.

## Decision

Reject the p8 red-heading rank key as a direct standard 12-column transposition of the p8–p14 body. The red heading remains more parsimoniously a heading, and the p14 13-dot mark a section terminator. Do not expand this into arbitrary column permutations or route transpositions.

This result does not rule out unrelated source-selected uses of the red channel. It closes only the direct 12-column consumer described here.

## Reproduction

From the repository root, run: node sims/lp2_p8_p14_red_heading_columnar_gate.cjs

Inputs: resources/liber-primus/lp2-corpus.json, resources/liber-primus/lp2-ink-annotations.json, and resources/liber-primus/lp1-plaintext-reference.txt. No external network access or third-party package is required.
