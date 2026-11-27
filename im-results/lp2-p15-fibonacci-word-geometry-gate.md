# p15 Fibonacci historical-operation gates — drawing rule and rational convergents

**Current decision:** direct historical Fibonacci-word drawing (#3057) and direct consecutive rational convergents (#3139) do not supply a typed cipher receiver. The exact numeric spiral remains established.

## #3057 — Fibonacci-word drawing rule (Agent15, 26 November 2026)

## Independent historical rule

A pre-release worked convention exists: Monnerot-Dumaine's [OEIS A156596](https://oeis.org/A156596), authored 10 February 2009, describes the Fibonacci-word curve. [Ramírez and Rubiano, Mathematica Journal, February 2014](https://www.mathematica-journal.com/2014/02/19/properties-and-generalizations-of-the-fibonacci-word-fractal/) documents the odd-even rule: draw a unit segment, then stay straight on 1, turn left on an even-position 0, right on an odd-position 0. This is distinct from the arithmetic generator of Fibonacci indices already established on p15. There is no identified historical first-party instruction connecting this rule to LP2. The rule does not itself give a rune transform.

The single fixed control uses substitution 0→01, 1→0, seed 0, and 1-based symbol parity. Encode directions as 0=straight, 1=right, 2=left, as in A156596. The first 8 published digits 10120202 are reproduced; the following 20 published digits 10120202101012021010 are predicted exactly without further choices. Total 28/28. (The sequence entry is currently maintained; attribution is 2009. The period drawing rule is independently documented in February 2014.)

## Original artifact and exact rejection

The supplied archive scan 32.jpg was inspected, with grid rows matching the established [p15 report](../results/lp2-p15-fibonacci-prime-spiral.md). Reuse its already established arithmetic generator solely to obtain the marked ordering of the sixteen positions, rather than fitting new numerical hypotheses. The 15 unit moves are ESWWNNEEESSSWWW. Their 14 internal turns are RRSRSRSSRSSRSS (S denotes straight). The literal historical turn/no-turn decoding is 00101011011011. Its complementary labelling is 11010100100100.

The Fibonacci word contains no adjacent 1s at any phase: each 1 in the substitution image ends 01 and every next image starts 0. Both p15 labellings contain adjacent 1s, at zero-based turn indices 6 and 0 respectively. Rotation, reflection, reversal, origin and binary relabelling cannot cure this invariant. Also, all six actual bends are right-handed; the historical worked curve contains both handednesses. The printed spiral is the ordinary expanding square spiral, not an odd-even Fibonacci-word path under this direct rule.

## Decision

No source-selected mapping from the two word symbols to reversible GP29 operations, initial state or rune clock was recovered. A search over invented binary operations would violate the task's gate. Reject this literal geometrical route, leave other binary hypotheses untested, do not perform an arbitrary p15–22 fit. This does not invalidate the exact sixteen-cell integer formula. No new plaintext or key.

Reproducer: [sims/lp2_p15_fibonacci_word_geometry_gate_sft.cjs](../sims/lp2_p15_fibonacci_word_geometry_gate_sft.cjs), exact computational core executed in connected V8; standalone Node wrapper not separately executed. Code result: 28/28 historic control, forbidden 11 at offsets 6/0. Independent source comparison is a historical plausibility test, not proof of what the author intended.


## #3139 — adjacent rational convergents and Euclidean quotients (Agent13, 27 November 2026)

**Decision: no independent convergent/Euclidean receiver selected.** Direct consecutive ratios of the printed values, recovered prime values, and actual one-based prime ordinals fail a necessary condition. The unshifted Fibonacci ratios reproduce the classical identity exactly, but that is already entailed by the solved construction.

Saarik Kalia, [The Generalizations of the Golden Ratio](https://math.mit.edu/research/highschool/primes/materials/2011/Kalia-Generalizations.pdf), dated 23 December 2011, Theorem 3.1 (printed p5), proves the all-one continued-fraction identity. Section 2 gives 9/7 = [1;3,2]. [Hunter College Euclidean notes](https://www.cs.hunter.cuny.edu/~saad/courses/493.55/notes/note1.pdf), indexed pre-2014, section 3 gives 13,8,5,3,2,1,0. Both worked controls and all ratio reconstructions pass. These are historical mathematical conventions, not Cicada instructions.

Read the actual red-origin spiral ESWWNNEEESSSWWW. Compare four operands: printed differences, recovered primes, their one-based ordinals, unshifted distinct Fibonacci values (omit initial zero solely because division by zero is undefined). For each sequence x, set reduced r_i=x_(i+1)/x_i. Consecutive simple continued-fraction convergents must have absolute cross-determinant D_i=|num(r_i)*den(r_(i+1))-num(r_(i+1))*den(r_i)|=1. This condition is invariant under reciprocation and reversal.

| Operand | Ratios | Unit determinants | All-one convergents (canonical terminal 2) |
|---|---:|---:|---:|
| Printed cells | 15 | 1/14 | 0/15 |
| Recovered prime values | 15 | 1/14 | 2/15 |
| Actual one-based prime ordinals | 15 | 7/14 | 6/15 |
| Nonzero unshifted Fibonacci values | 14 | 13/13 | 14/14 |

First failures: printed 3298/3299 and 1648/1649 give 1650; prime 5/3 and 7/5 give 4; ordinal 6/4 and 9/6 are identical after reduction (D=0). The Fibonacci quotient lists are [2], [1,2], ..., [13 ones,2]; their entire register is fixed by length. All unit determinants follow from Cassini's identity. Thus the unshifted sequence carries no independent information, and the actual one-based ordinal ratios are a different mathematical object.

Original scan 32.jpg directly inspected: sixteen evenly arranged labels in 4×4 grid, only 3299 red, separate infinity mark below, then red rubric. No fraction bars, paired labels, marked quotient/remainder register, or additional endpoint. A classical Euclidean rectangle construction for 987×610 would require squares of size 610,377,233,...,2,1,1, rather than the observed uniform-pitch array. This is a mismatch of literal geometry, not a claim that all convergent diagrams must be tilings. Infinity could suggest a limit/repetition but does not fix phi, a quotient/remainder/Bezout/matrix readout, a GP29 source/sink, or a clock. No independent exact feature or authored operand selects a reversible receiver. #1469 and #2562 remain distinct prior negatives. No original ciphertext scoring or modular sweep. Retire this specific route unless an independent selector appears; retain the 16-cell integer solution.

[Reproducer](../sims/lp2_p15_convergent_gate_sft.cjs): exact computational core executed in V8 with assertion adapter and independently checked using Python Fraction/gcd. Standalone Node wrapper not separately executed.
