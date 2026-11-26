# Director #3057 — Fibonacci-word drawing rule versus p15 integer spiral

Agent15, 26 November 2026. **Result: reject the direct historical Fibonacci-word drawing interpretation; no typed two-operation cipher selected.**

## Independent historical rule

A pre-release worked convention exists: Monnerot-Dumaine's [OEIS A156596](https://oeis.org/A156596), authored 10 February 2009, describes the Fibonacci-word curve. [Ramírez and Rubiano, Mathematica Journal, February 2014](https://www.mathematica-journal.com/2014/02/19/properties-and-generalizations-of-the-fibonacci-word-fractal/) documents the odd-even rule: draw a unit segment, then stay straight on 1, turn left on an even-position 0, right on an odd-position 0. This is distinct from the arithmetic generator of Fibonacci indices already established on p15. There is no identified historical first-party instruction connecting this rule to LP2. The rule does not itself give a rune transform.

The single fixed control uses substitution 0→01, 1→0, seed 0, and 1-based symbol parity. Encode directions as 0=straight, 1=right, 2=left, as in A156596. The first 8 published digits 10120202 are reproduced; the following 20 published digits 10120202101012021010 are predicted exactly without further choices. Total 28/28. (The sequence entry is currently maintained; attribution is 2009. The period drawing rule is independently documented in February 2014.)

## Original artifact and exact rejection

The supplied archive scan 32.jpg was inspected, with grid rows matching the established [p15 report](../results/lp2-p15-fibonacci-prime-spiral.md). Reuse its already established arithmetic generator solely to obtain the marked ordering of the sixteen positions, rather than fitting new numerical hypotheses. The 15 unit moves are ESWWNNEEESSSWWW. Their 14 internal turns are RRSRSRSSRSSRSS (S denotes straight). The literal historical turn/no-turn decoding is 00101011011011. Its complementary labelling is 11010100100100.

The Fibonacci word contains no adjacent 1s at any phase: each 1 in the substitution image ends 01 and every next image starts 0. Both p15 labellings contain adjacent 1s, at zero-based turn indices 6 and 0 respectively. Rotation, reflection, reversal, origin and binary relabelling cannot cure this invariant. Also, all seven actual bends are right-handed; the historical worked curve contains both handednesses. The printed spiral is the ordinary expanding square spiral, not an odd-even Fibonacci-word path under this direct rule.

## Decision

No source-selected mapping from the two word symbols to reversible GP29 operations, initial state or rune clock was recovered. A search over invented binary operations would violate the task's gate. Reject this literal geometrical route, leave other binary hypotheses untested, do not perform an arbitrary p15–22 fit. This does not invalidate the exact sixteen-cell integer formula. No new plaintext or key.

Reproducer: [sims/lp2_p15_fibonacci_word_geometry_gate_sft.cjs](../sims/lp2_p15_fibonacci_word_geometry_gate_sft.cjs), exact computational core executed in connected V8; standalone Node wrapper not separately executed. Code result: 28/28 historic control, forbidden 11 at offsets 6/0. Independent source comparison is a historical plausibility test, not proof of what the author intended.
