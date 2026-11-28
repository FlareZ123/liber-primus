# Terminal 180 carries select 76 p50-interior cells: direct p55 receiver gate

**Agent 13, 28 November 2026. Status:** new source-frozen composition tested; direct GP29 and historical XOR consumers are negative on original p55 and on the complete p54→p55 chapter clock. No unknown plaintext or authenticated key is recovered.

## Causal construction

Two previously established source facts can be composed without fitted offsets:

1. Independently readable p56 plaintext (85 GP29 runes) followed by clear p57 (95 runes) is a 180-rune source register with ordinal sum **2,204 = 29×76**. Starting the GP29 wheel at zero and adding those 180 indices gives exactly **76 carry events** and returns to zero.
2. The printed p49–51 numeral rectangle is 32×8. Literally shedding its one-cell circumference leaves a **30×6 = 180-cell** interior.

The new operation uses each carry's **zero-based position in the solved 180-rune register** as the address of the corresponding row-major cell in the 180-cell table interior. This yields exactly 76 selected table values, one per carry and one per original p55 rune, without a phase search, graph walk, fitted plaintext, or arbitrary cell deletion.

The 76 source positions are:

`[1,3,5,9,12,13,15,17,20,22,24,26,28,29,31,33,35,38,39,41,43,46,48,51,53,54,59,61,63,65,68,71,72,75,79,82,83,85,87,89,90,92,95,97,100,101,104,107,109,110,114,115,119,122,124,127,128,131,135,139,143,147,149,151,155,157,158,162,164,166,170,171,173,175,176,179]`.

This is distinct from the earlier 76-carry report, which used the carry trigger/before/after values themselves as keys, and from the earlier whole-180 Instar test, which XORed every interior table byte with every terminal rune. Here the carry events select a strict 76-cell subset of the interior before any consumer is applied.

## Frozen value interpretations and consumers

The p50 digit legend remains unresolved, so both already-documented numeric readings are retained:

- conventional base60 byte values;
- drop-lowercase-`f` base59 values.

For each reading, select the 76 interior values at the exact carry positions. Test the historically established GP29 additive family directly on original p55, using the selected values modulo29 as a complete key, under both signs. As a source-era non-additive control, test the 2013-style XOR shape using the selected values' low five bits; an output at 29–31 fails the native GP alphabet gate.

No key phase, reversed order, page-order reversal, alphabet permutation, F branch, or language-fitted parameter is searched.

| Table reading | Direct p55 consumer | Scaled GP29 IoC | Result |
|---|---|---:|---|
| base60 | C−K | **1.0785964912** | nonlinguistic |
| base60 | C+K | **1.1600000000** | nonlinguistic |
| base59 | C−K | **0.9666666667** | nonlinguistic |
| base59 | C+K | **1.0989473684** | nonlinguistic |
| base60 | C XOR (K&31) | — | **69/76** native GP; 7 invalid |
| base59 | C XOR (K&31) | — | **69/76** native GP; 7 invalid |

The first 24 base60-minus runes are:

`I I I A EO T EO E N OE S L O G W U T P IA Y C NG EO M`

and the first 24 base60-plus runes are:

`O J EA AE TH X OE I F H N NG X IA X EA N G W P Y OE AE S`.

Both additive decoders invert exactly, as every additive key does; replay is a mechanism check rather than evidence of correctness. The SFT also encrypts and recovers a native solved p57 prefix under every selected key/sign as a positive control.

## Real terminal-chapter clock

Physical p55 is not an isolated chapter: p54 contributes 232 runes and a word continues across the p54→p55 page seam. If the 76-value selector is a terminal chapter key, its source-fixed phase at p55 is therefore **232 mod76 = 4**.

Repeat the same 76 selected values from the start of unmodified p54||p55 (308 runes). The four complete original inverses remain nonlinguistic:

| Table reading | Sign | Complete-chapter scaled IoC | p55 key phase |
|---|---:|---:|---:|
| base60 | − | **0.996150429375** | 4 |
| base60 | + | **0.977748635729** | 4 |
| base59 | − | **0.994923643132** | 4 |
| base59 | + | **1.004737933077** | 4 |

This closes the most natural page-boundary rescue without introducing a fitted rotation.

## Internal selector sanity check

If carry selection were exposing a literal table copy of the event state, the selected table residues could equal the trigger, wheel-before, wheel-after, or GP-prime-trigger register. They do not.

For base60, exact residue matches across 76 selected cells are respectively **2, 5, 1, 1**. For base59 they are **4, 3, 3, 1**. Even granting one global GP29 shift after the fact, the best match count is only **5–7/76** depending on register/radix. There is no hidden near-identity that would explain the composition as a copied event tape.

## Carry-interval compression versus the p50 rim

The same source register supplies a second, stronger test that does not involve p55 language at all. The 76 carry endpoints partition all 180 terminal positions into 76 consecutive intervals, with lengths:

`[2,2,2,4,3,1,2,2,3,2,2,2,2,1,2,2,2,3,1,2,2,3,2,3,2,1,5,2,2,2,3,3,1,3,4,3,1,2,2,2,1,2,3,2,3,1,3,3,2,1,4,1,4,3,2,3,1,3,4,4,4,4,2,2,4,2,1,4,2,2,4,1,2,2,1,3]`.

Those lengths sum to 180. Apply them, unchanged and in source order, to the row-major 30×6 p50 interior. For each interval, sum its printed numeric values and reduce modulo29. This produces a 76-value compression with no p55 operand, no language score and no chosen phase. Compare it directly with the literal 76-cell table circumference.

Two perimeter serializations are worth distinguishing without tuning: (a) source row-major order after filtering to rim cells; (b) the ordinary clockwise walk starting at the printed top-left cell. Under conventional base60 and documented drop-`f` base59, the exact residue matches are:

| Reading | 76 interval sums vs row-major rim | 76 interval sums vs clockwise rim |
|---|---:|---:|
| base60 | **0/76** | **2/76** |
| base59 | **4/76** | **2/76** |

For comparison, sampling the **cumulative** interior residue at the same 76 carry endpoints gives base60 **1/76** row-major and **2/76** clockwise; base59 gives **3/76** and **2/76**. One unrestricted global residue shift does not rescue the relation: the best shifted agreement is only 5–7/76 across these cases. The previously tested direct carry-position cell selector is therefore not hiding a simple cumulative/interval-sum perimeter identity.

This is a useful architecture-level negative: the exact 180 terminal register, exact 76 carry partition, literal 180-cell table interior and literal 76-cell rim do **not** close into the simplest GP29 compression identity under either live radix. A more complicated combiner, traversal or nonlinear map now needs a separate source instruction; the 180/76 cardinality match alone does not authorize it.

## Literal base60 digit-pair gate from each carry block

The carry partition gives an even more strongly typed test. Each terminal carry block has two natural, source-only statistics:

- block length is **1–5**, so `length−1` is exactly a base60 high digit **0–4**;
- the block's raw sum of GP ordinal indices is **6–52**, already a valid base60 low digit **0–59**.

Therefore every one of the 76 carry blocks can be encoded without reduction as one literal two-digit base60 token `(length−1, GP-sum)`. The p50 circumference contains exactly 76 printed two-digit tokens. This is an unusually tight candidate because the digit ranges and cardinality agree before any p55 ciphertext is consulted.

It fails directly. Against the source row-major rim order, the leading digit agrees at **15/76** cells, the low digit at **0/76**, and the complete two-digit token at **0/76**. Against the ordinary clockwise circumference from the printed top-left, the leading digit agrees at **23/76**, the low digit at **3/76**, and the complete token at only **1/76**. The apparent 23 high-digit matches are not a complete code: the two-digit hypothesis that motivated the comparison collapses on the independently specified low digit.

As a distribution sanity check, the carry high digits have counts `[14,33,17,11,1]` while the printed rim high digits have counts `[12,20,19,20,5]`; they are not even the same multiset. A seeded one-million-permutation diagnostic preserving both five-symbol marginals put **23 or more** aligned high-digit matches at about **0.10924**, so the clockwise leading-digit subtotal is not exceptional even before charging an unfixed circumference start/direction.

This rejects the cleanest possible interpretation in which each terminal carry block literally describes one p50 circumference token. No radix choice is involved: the printed first character 0–4 and second source character already define the test.

## Carry-partition compression of all 180 interior cells into 76 table tokens

One final literal bridge uses both halves of the p50 table rather than terminal GP sums. Keep the 76 source carry-block lengths unchanged. Partition the p50 **180-cell interior** by those exact lengths. For each block:

- high digit = `length−1`, giving 0–4;
- low digit = the sum of that interior block modulo the active table radix.

This maps every interior cell exactly once into **76 two-digit tokens**, which can be compared directly with the **76 printed rim tokens**. It is the simplest source-typed 180→76 compressor that uses the table's own digit grammar.

| Numeric reading | Rim order | High digit matches | Low digit matches | Complete token matches |
|---|---|---:|---:|---:|
| base60 | row-major rim | 15/76 | **1/76** | **1/76** |
| base60 | clockwise rim | 23/76 | **1/76** | **0/76** |
| drop-`f` base59 | row-major rim | 15/76 | **1/76** | **1/76** |
| drop-`f` base59 | clockwise rim | 23/76 | **1/76** | **0/76** |

The high-digit subtotal repeats the already non-exceptional block-length coincidence, while the independently determined low digit collapses to chance-level agreement. Neither live radix produces a token tape remotely resembling the rim.

This closes the literal architecture in which the solved terminal carry partition itself tells a reader how to fold the 180-cell p50 interior into its 76-cell circumference. Any replacement combiner now requires an independent manuscript instruction rather than another arithmetic choice.

## Decision

The new composition is attractive because every cardinality and address is source-derived: terminal solved text supplies a 180-position event register, its 76 ordinal carries choose 76 positions, and the literally stripped p50 interior supplies 180 addressable cells. It nevertheless fails the two historically motivated direct consumer families and the actual p54→p55 chapter clock.

Retire **carry-position → p50-inner-cell → direct GP29/XOR p55** under the two documented radices. The carry positions and 180-cell geometry remain exact observations. A further nonlinear transform, different traversal, phase, or alphabet would need a new independent source selector rather than being tuned to this negative.

Reproduce with [`sims/lp2_terminal180_carrypos_inner180_p55_sft.cjs`](../sims/lp2_terminal180_carrypos_inner180_p55_sft.cjs). Inputs are the canonical corpus and original table transcription already pinned in `resources/liber-primus/`.
