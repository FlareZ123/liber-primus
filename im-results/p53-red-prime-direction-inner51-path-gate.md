# p53 red-rune / p57 inner-51 operations: bounded negatives

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

This tests both prime-weight mod 8 and rune-ordinal mod 8. A previously assumed p15 heading cue does not survive source inspection: the large red arrow-like initial on p15 is the enlarged GP rune ᛚ at page-local offset 9, the first rune of the annotated 11-rune red span, not a separate arrow. Likewise, the upward-pointing red mark at p53 offset 128 is GP rune ᛏ, the first rune of the 51-rune red span, not a separate arrow. The two original images and `resources/liber-primus/lp2-ink-annotations.json` / `lp2-page53-red-span.json` classify both as runes within red text. A relative 45-degree-turn control was also run from an arbitrary east heading, under both turn polarities; it is exploratory only and is not a source-fixed orientation.

## Results

The 51 prime-weight residues mod 8 have counts [0, 13, 1, 14, 0, 14, 0, 9]. This is structurally restrictive: except for the rune of prime weight 2, all prime weights are odd, so residues 0, 4 and 6 never occur.

| Direction encoding | Convention | Mappings | Best distinct cells visited | Result |
|---|---|---:|---:|---|
| Prime weight mod 8 | Absolute compass | 16 | 5/51 | all exit or revisit by step 5 |
| Rune ordinal mod 8 | Absolute compass | 16 | 8/51 | all exit or revisit by step 8 |
| Prime weight mod 8 | Relative turns, east start | 2 | 4/51 | both exit by step 4 |
| Rune ordinal mod 8 | Relative turns, east start | 2 | 7/51 | both exit by step 7 |

No mapping reaches the final exit instruction. The exact paths and every tested rotation/handedness are reproduced by the script.

## Direct 51-to-51 additive readout

The exact 51-to-51 length match also motivates the simplest reversible GP29 operation: treat either stream as the key and apply additive/subtractive shifts to the other, using the native 29-symbol alphabet. This is the same basic shift family used by the independently solved p56 page. No phase, offset, word reset, or key fitting was used.

Two source-native key encodings were tested: the inner51 rune indices themselves, and their GP-prime weights reduced mod29. Both possible signs were evaluated in each direction. None yields readable plaintext:

| Fixed operation | 51-rune output |
|---|---|
| red − inner rune index | SRIADASUNFLOECWROENEODAAEIGTHEAEYLHUAYOMNGNGXTHJOXTOEDOEWJEASMEA |
| red + inner rune index | BOETUGEARSRIADWSROEEATNGAEAEEAJOENGTHEAEAXSPWDIAUNGNGIENGADDDPAEEAOOEWM |
| red − inner prime weight mod29 | PPWOFSTCYFPOFTHBIEENGSJULJINGAPREREJEOIAMDALEOGAEPNGUTOAEAJW |
| red + inner prime weight mod29 | MPWNGUEAEMWEONOEGHWWSIACPLHFXGUGEIARSSCADEOBNEOOXOAECTWGPSJ |
| inner − red prime weight mod29 | FAMGAETHPLYENGPAEEROIAXLPRUMOJIIDAPIAFAETHJHJTTYNGCNGIAOHIEAWNI |
| inner + red prime weight mod29 | THDEAUSJMSWENEEOJSWNAJBEAFYRGAENGXJULIAGIANGAENGLNGETHNTHBIWCFHI |

This retires the direct one-time-pad/Vigenère interpretation of the 51-cell correspondence. It does not reject a more structured path or a different source-specified use of the red passage.

## Decision and scope

Retire the direct “51 red values are mod-8 compass directions through the 3×17 inner-51” interpretation across all tested absolute rotations/handedness, and the direct 51-to-51 additive/subtractive GP29 readout using inner rune indices or prime weights. The east-start relative-turn variant also fails, but its start heading was arbitrary; the p15/p53 arrow-like glyphs are ordinary GP runes, not independent direction markers. These tests do **not** reject the exact 5×19 / inner-51 structural correspondence, nor every possible use of the p53 red passage. They reject the specified direct compass/turn and additive GP29 constructions, not a source-authenticated direction rule.

Do not rescue the path by changing the modulus, start cell, phase, or direction alphabet. A different traversal would require a new independent source instruction.

**Reproducer:** [sims/p53_red_prime_direction_inner51_path_gate.cjs](../sims/p53_red_prime_direction_inner51_path_gate.cjs). It reads the original corpus and ink annotations, asserts the exact 51-rune alignment, tests all 16 absolute mappings for both numeric encodings, and records the relative-turn controls.
