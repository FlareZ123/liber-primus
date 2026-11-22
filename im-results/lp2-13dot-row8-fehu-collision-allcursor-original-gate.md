# Thirty-one 13-dot boundaries, 32 table rows and a strict Fehu/collision cipher

**Agent 4, 17 November 2026. Evidence class: source-aligned, exact original-cipher incompatibility with a complete source-native positive.** No authentic unknown LP2 plaintext, key or final destination is recovered. The first long source interval itself rules out all 16 frozen configurations under the specified key and clock.

## Independent original selection and uncertain operation

The 58 original physical LP2 pages print **31 thirteen-dot separators** (30 red and one black); after inserting them at the exact annotated rune offsets, they partition the entire 13,136-rune manuscript into **32 intervals**. Separately, the pp49–51 numeric field prints **32 rows of eight two-character entries**. As a human-facing clue, one could plausibly try using each table row on the corresponding separator-delimited interval. The rows’ values, radix, repetition convention and cipher rule are not explicitly selected by the manuscript.

The original interval rune lengths are:

```text
13 716 16 103 3 690 11 308 0 14 1729 0 9 11
1883 16 1005 19 1414 10 81 8 1460 3 118 3008
9 299 5 80 7 88
```

The two genuine zero-length intervals occur at adjacent marks on p7 and at the shared p14/p15 mark coordinate. Preserve them rather than compressing the key-row sequence to fit the text. The first **28** intervals total **12,956 unknown** GP29 runes; the last four cover solved p56 and clear p57. The complete 716-rune second interval is bounded by real original thirteen-dot separators.

Previous row8 experiments [tested direct repeating modulo-29 pad and columnar layouts](lp2-13dot-32row-grid-original-cipher-gate.md), while [the authenticated 2014 inverse](lp2-ftransparent-word-lexical-viterbi.md) demonstrates two unusual historical details worth separately incorporating: plaintext Fehu (F/index0) transmits literally without consuming a key symbol, and the unknown LP2 doublet deficit motivates optional ciphertext-equal proposal rejection. The latter is a *cipher proposal*, not an established historic Cicada operation. This experiment combines both details with the original 32-row arrangement instead of stretching an RC4 whole-grid key.

## Complete and reversible finite family

The 32 original table rows are interpreted using their byte-valid **radix60** reading and alternative **radix59** reading (lowercase `f` is absent). For every interval `s`, take the original eight table values in printed or fully reversed order and repeat them as `K[j]=row[j mod 8] mod29`. Test the two conventional signs for GP29 addition/subtraction and either retain or reset the previous *published ciphertext rune* at thirteen-dot boundaries, always resetting the row-key pointer. This is **2×2×2×2=16 configurations**, each with **28 exact source-original unknown intervals**, without fitted key seeds, word edits, arbitrary phase, forced rejections or language-based exclusion.

The proposed encoder at rune `i` is:

- If `P[i] = 0` (Fehu), publish `C[i] = 0` without consuming a key value.
- Otherwise propose `c = (P[i] + sign·K[j]) mod29`. A collision with the last emitted ciphertext rune may be rejected, consuming that key value and drawing the next. A noncollision must be accepted; a collision may also be accepted.

Every hypothetical sequence of rejection decisions is retained. For proposed skips `m≥1` on one plaintext rune, all `m` rejected pad residues must be identical; this **exact constraint** ends the enumeration as soon as they differ. The receiver tracks every achievable key-consumption cursor and both legal routes for observed ciphertext-F. There is no beam search, arbitrary skip cap, English-language prior or prescribed rejection probability in the impossibility test.

A configuration is impossible for the original ciphertext the moment its complete set of lawful hidden cursors becomes empty. This is an algebraic encoding-existence test under an explicit reversible historical-style operation, rather than a low-score guess about an unknown English text.

## Original ciphertext result

All **16/16** configurations die within the intact **716-rune interval index1**. On that source interval the furthest original prefix under any candidate is **522/716 runes**: radix60, reversed row, negative GP sign. Radix59 forward with the negative sign reaches 459/716; the remaining six distinct configurations die earlier. No additional row, reset at a different mark, guessed plaintext, or secret skip decisions can rescue the exact source-row mapping.

| Radix | Row order | Decode-sign setting | Complete original unknown intervals out of 28 | Sum of locally achievable original prefixes |
| --- | --- | --- | ---: | ---: |
| 60 | forward | + | 11 | 1,338 |
| 60 | forward | − | 11 | 1,522 |
| 60 | reversed | + | **14** | 999 |
| 60 | reversed | − | 12 | **2,523** |
| 59 | forward | + | 13 | 1,132 |
| 59 | forward | − | 11 | 909 |
| 59 | reversed | + | 13 | 1,403 |
| 59 | reversed | − | 13 | 961 |

The two choices of previous-ciphertext carry across a 13-dot boundary make **identical** original results here, so the eight entries summarize all sixteen cases. A handful of trivial short intervals survive even incompatible keys; no row mapping can encode the second original interval or all 28 unknown intervals. The maximum independently reached-prefix sum is **2,523 of 12,956** original symbols, and no candidate fully encodes more than **14 of 28** original intervals.

These exclusions concern **literal period-eight row pads** in the two tested radices with exactly the defined Fehu and collision policy. They do not rule out a different first-party row-key consumer or an original cipher operating on a different intermediate alphabet.

## Source-native positive at every interval

The complete independently **clear original p57**, 95 GP29 runes including literal Fs, is cycled into every one of the **28 unchanged source-interval lengths**. For every one of the **16** configurations, an encoder generates ciphertext under the *original corresponding eight-byte table row*, injecting authentic Fehu bypass and stochastically rejecting eligible collisions at fixed q=13/16 (a heuristic from the red-dropcap count, with no claim of an authentic opcode). The deterministic xorshift32 seed is bound to each configuration; the hidden skip positions, F bypass mask and true terminal cursor are withheld from the inverse.

On **448** independent source-aligned interval plants, the same unconstrained all-cursor inverse reaches every generated ciphertext rune and retains the actual consumed-key cursor. The plants include genuine bypasses and collision-rejected proposals per configuration. This tests the implementation's capacity to recognize the exact hypothesized ciphertext, independently of any English scoring or original-text fitting.

## Research decision

Retire this particular **32 marker-delimited interval → corresponding eight-cell numeric table row → repeated GP29 key with transparent-F and collision-only key advances** family. The decisive contradiction already occurs at the second original interval, while all 448 matched source-native plants are invertible. Further options would have to be supplied by independent manuscript instructions or an authentic plaintext crib; unconstrained reassignment of rows, phases or key variants is not a justified next step.

**Executable source and controls:** [single-file read-only Node22 CommonJS test](../sims/lp2_13dot_row8_fehu_collision_allcursor_sft.cjs), which asserts every 32-section length, all 13,136 original indices, all 448 positive plants and the original 16-setting outcome. The source files are `lp2-corpus.json`, `base60-grid.json` and `lp2-ink-annotations.json` under `resources/liber-primus/`.
