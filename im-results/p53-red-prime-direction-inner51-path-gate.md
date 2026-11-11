# p53 red-rune directions through the p57 inner-51: bounded negative

**Classification:** source-motivated geometric/navigation test. The p57 5×19 structure and p53 51-rune red span are exact source observations; treating the red stream as a direct compass path is not supported by the test. No plaintext or key is recovered.

## Source-fixed geometry

The solved p57 PARABLE page contains 95 runes. Read in printed order as a 5×19 rectangle, its outer border has 44 cells and its interior has 3×17 = **51 cells**. The p57 wording explicitly includes “tunneling to the surface,” “shed our own circumferences,” and “find the divinity within and emerge.” The 3×17 interior begins at the second rune of row 2 and ends before the last border column; its exact transliteration is:

\`\`\`
UNNELNGTOTHESURFACEMUSTSHEDOUROWNCIRMFERENCESFINDTHEDI
\`\`\`

The original p53 annotation identifies a separate **51-rune red span** at page-local rune offset 128. Its length exactly matches the p57 interior. The 2016 signed message's “numbers are direction” language motivates a bounded navigation test: use the red rune numbers to traverse the interior from its unique central cell (row 1, column 8, zero-based).

The red span's prime weights are the natural Gematria Primus numeric values. A second, distinct encoding is the one-based rune ordinal (1–29). Both were tested modulo 8, the natural number of compass directions in an eight-neighbour rectangular grid.

## Frozen path criterion

A direct path interpretation must satisfy all of the following without fitted start positions or phase:

1. Start at the unique centre cell of the 3×17 interior.
2. Use the first 50 red values as one-cell moves, visiting every one of the 51 interior cells exactly once.
3. Use the 51st red value to leave the rectangle, matching “surface / emerge.”
4. Map residues 0–7 to N, NE, E, SE, S, SW, W, NW. Test only the eight cyclic rotations and two handedness conventions.

This tests both prime-weight mod 8 and rune-ordinal mod 8. As a separate control, the same two numeric streams were tested as relative 45-degree turns, with the initial heading fixed east by the p15 red-arrow direction; both turn polarities were tested.

## Results

The 51 prime-weight residues mod 8 have counts [0, 13, 1, 14, 0, 14, 0, 9]. This is structurally restrictive: except for the rune of prime weight 2, all prime weights are odd, so residues 0, 4 and 6 never occur.

| Direction encoding | Convention | Mappings | Best distinct cells visited | Result |
|---|---|---:|---:|---|
| Prime weight mod 8 | Absolute compass | 16 | 5/51 | all exit or revisit by step 5 |
| Rune ordinal mod 8 | Absolute compass | 16 | 8/51 | all exit or revisit by step 8 |
| Prime weight mod 8 | Relative turns, east start | 2 | 4/51 | both exit by step 4 |
| Rune ordinal mod 8 | Relative turns, east start | 2 | 7/51 | both exit by step 7 |

No mapping reaches the final exit instruction. The exact paths and every tested rotation/handedness are reproduced by the script.

## Decision and scope

Retire the direct “51 red values are mod-8 compass directions through the 3×17 inner-51” interpretation, including the tested east-seeded relative-turn variant. The test does **not** reject the exact 5×19 / inner-51 structural correspondence, nor every possible use of the p53 red passage. It only shows that the most direct direction-reading fails decisively under the source-fixed centre start and eight-neighbour geometry.

Do not rescue the path by changing the modulus, start cell, phase, or direction alphabet. A different traversal would require a new independent source instruction.

**Reproducer:** [sims/p53_red_prime_direction_inner51_path_gate.cjs](../sims/p53_red_prime_direction_inner51_path_gate.cjs). It reads the original corpus and ink annotations, asserts the exact 51-rune alignment, tests all 16 absolute mappings for both numeric encodings, and records the relative-turn controls.
