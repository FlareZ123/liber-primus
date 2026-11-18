# Critic: distinguish source-defined p27 clues from the inferred DH closure

**Time:** 2026-11-18T22:09:02Z  
**Scope:** current p27 red13/DH transducer report and SFT; #1615 and its post-closure comment; #1625, #1626, #1628; the human-solve-path frontier; and the current `results/README.md`.

## Audit result

The arithmetic is reproducible as documented. The six-object census is a real source observation: red spans of at least 13 runes immediately followed by a red 13-dot mark occur on pp0, 3, 7, 23, 27 and 53; p27 alone has prime GP-prime sum 1109, whose prime ordinal is 186. On p27, the visible 19-rune span and 13-dot mark give a 6-rune remainder, and the 13th rune is I/31. The table lookups and DH exponent checks in the SFT are arithmetically consistent.

The important distinction is between those observations and the operations used to join them:

- The source does not explicitly select the multiplication `GPprime(rune13) × (red_length−13)`, although its result 186 closes back to the heading's prime ordinal.
- It does not explicitly select prime-ordinal addressing, the zero-based row-major interpretation of (31,6), the dual reading of token `39`, or the use of base59 table values as pointers.
- The signed DH tuple is known before this construction is evaluated. The common one-based-forward orientation and the p50/DH matches are therefore strong cross-checks of a retrospectively assembled route, not independent evidence that the source instructed each operation.
- The p57 circumference instruction gives a plausible motivation for the two-ring geometry, but interpreting the known DH shared value 2 as the number of rings is itself an inferred bridge.

The six-span result is independent of the p55→p27 repeated-word handoff in the narrow sense that its census does not use those repeated-word positions. It is not independent of the already-known DH target or of the operation choices made while exploring the table. The matched permutation diagnostic is explicitly post-discovery and conditions on the three selected cell/token assignments; it does not correct for selection of the formula, target, coordinates, or radix interpretation. The report correctly states that it is not an authorship probability.

## Classification

Keep the p27/DH circuit as a strong, reproducible **source-constrained structural candidate** and preserve its SFT. Do not describe the product rule, address mapping, dual-radix transducer, or pointer semantics as source-selected/authenticated operations. In the human-path frontier, the weakest assumption should explicitly include the analyst-selected multiplication and prime-ordinal/coordinate bridge, not only the zero-origin and dual-radix interpretation.

Likewise, the new relation materially favors base59 for this particular pointer path; it does not authenticate a global base59 alphabet. The existing qualification that global numeral-map authentication remains provisional is correct. The separate #1611 factor31/onion branch shares the same p27 selector and must not be counted as independent corroboration.

## Recommended next decision

No further arithmetic or KDF/cipher menu is justified. Retain the current stop at the receiver boundary. Prioritize the already identified original-layout/origin audit (#1632) and require any proposed receiver to be selected by an independent source clue and tested on untouched original ciphertext. A fresh prediction should be frozen before inspecting its output.

This is a classification and presentation correction, not a claim that the structural circuit is false.
