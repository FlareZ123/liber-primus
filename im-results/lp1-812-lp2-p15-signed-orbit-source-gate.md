# Printed LP1 812 and the conditional LP2 p15 GF(29) matrix clock

## Research decision

There is an independently printed numerical value in solved LP1 that could select an otherwise ambiguous LP2 operation. The solved LP1 physical p16 **5×5** square displays **812 twice**, on its second and fourth rows. LP2 physical p15 prints the 4×4 Fibonacci/prime-number array whose last row begins with the *unsigned* values **4516, 1206**. In an existing retrospective interpretation, those two entries are instead assigned negative signs by taking their differences with 3301.

**Question:** does the independently printed LP1 value 812 select the two sign choices, and does the resulting order-812 linear clock, seeded by the historically attested BASE29 numeral 3301, decrypt the immediately following original LP2 chapter pp16–22?

## Source-anchored, reversible experiment

The original printed LP2 p15 array was reduced modulo 29. Only the two bottom-row sign options were toggled in this bounded test. Each option is evaluated against the exact matrix identity `M^812 = I`, with no ciphertext or plaintext fitting.

| Signs of original bottom entries 4516, 1206 | M^812 = I over GF(29)? |
| --- | --- |
| +, + | No |
| +, − | No |
| −, + | No |
| −, − | **Yes** |

For the double-negative matrix, the exact multiplicative order is **812**, not a proper divisor. This gives a possible independent explanation for why those particular sign choices were previously studied. It remains conditional on the hypothesis that a solver was supposed to introduce signs at all. The LP1 square is in a different release, and there is no historical instruction that explicitly states this matrix rule.

To seek an actual decryption, represent the signed 2013 BASE29 numeral **3301** as `[3,26,24]` and pad with one zero to obtain an original-source candidate seed `[3,26,24,0]`. Starting from each of its four cyclic rotations, repeatedly multiply by the double-negative p15 matrix and use the **first state coordinate at each rune** as a proposed GP29 additive keystream. Try both additive signs. This is eight fixed source-defined models, over the full **1,744 original ciphertext runes of LP2 pp16–22**, where the p15 matrix would be a plausible lead-in.

The eight inverse outputs have index-of-coincidence values between **0.0343582719** and **0.0348339623**. The original ciphertext has **0.0345095980**; the independently known original p57 GP plaintext has **0.0627099664**. Every inverse round-trips exactly to the original ciphertext, and a separately planted 95-rune authentic p57 sample decrypts exactly. No candidate has native plaintext statistics or readable GP text. The strongest candidate is rotation zero with subtractive sign, **0.0348339623**.

The exact inputs, sign-condition comparison, finite matrix order, all eight original output prefixes/IoCs, forward transforms and solved-text positive plant are executable in [`sims/lp1_812_lp2_p15_signed_orbit_source_sft.cjs`](../sims/lp1_812_lp2_p15_signed_orbit_source_sft.cjs). Execute with Node.js 22 from the repository root, `node sims/lp1_812_lp2_p15_signed_orbit_source_sft.cjs`; the script reads canonical on-repo resources only.

## Interpretation and next move

The **812 match is a candidate operation-selector clue**, since it arises in a solved earlier page independently of ciphertext and selects one of four local sign possibilities. This interpretation has a weakness: the choice of which signs to vary, polynomial-field reading, scalar output coordinate, seed padding and chapter alignment are ours rather than instructions printed on LP2. Numerical agreement does not establish creator intent.

The exact tested orbit-pad hypothesis **fails** on original ciphertext. It excludes those eight explicit inverse configurations only. Further seed/phase enumeration is a low-priority extension until a surviving original source clue selects how a matrix state enters the ciphertext. The potentially useful unresolved step is to locate an author-specified **seed or output/readout operation** from the LP1 numerical-square instruction, signed LP2 p15 markings, or adjacent page text. Do not promote the 812 coincidence into an authenticated key.

**Status:** bounded, reproducible intermediate research; **zero unknown plaintext recovered**. The overall state of the manuscript remains as recorded in [`results/README.md`](../results/README.md).
