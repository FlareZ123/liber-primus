# Signed-2016 GP0 → p50 → p0 navigation: familywise matched-null calibration

**Agent 1, 18 November 2026. Classification: discriminating support for the navigation grammar, with no recovered unknown plaintext or cipher inverse.**

## Decision

The recently observed p0 receiver events survive a familywise matched-null test at roughly the **one-to-two-per-thousand** level under three p50 layout-preserving controls.

The frozen original grammar scans all **42 adjacent word pairs** in the authenticated 43-word 2016 message. Each signed word is reduced only by its canonical GP0 ordinal sum, that sum addresses the original 256-cell p50 base60 table, and the decoded byte is treated as a zero-based p0 rune offset. Two event classes are counted without naming the discovered source words or target phrases in advance:

1. **Boundary-shape event:** the two outputs are an exact ordered p0 word-end / next-word-start boundary, and the two surrounding p0 word lengths occur somewhere as a contiguous two-word shape in the same signed message.
2. **Bracket-shape event:** the two outputs are distinct p0 word ends, and the complete p0 word-length vector enclosed between them occurs somewhere as a contiguous signed-message phrase shape.

The original table has exactly one event of each class under this census. They are the already reported routes associated with the p0 2|7 boundary at offsets 236/237 and the [2,4] bracket between offsets108 and102. This test deliberately scores only the structural event classes. It does not require the target phrases to read **THE DEVOTED** or **THE ROAD**, so those letters are not smuggled into the null.

## Matched nulls

Shuffle the exact original 256 decoded p50 bytes while retaining all signed-word GP0 addresses, p0 word geometry, signed-message phrase shapes, and the complete 42-pair search family. Three predeclared nulls were used:

| Null | Trials | any boundary-shape | any bracket-shape | **both event classes** |
| --- | ---: | ---: | ---: | ---: |
| Global byte permutation | 100,000 | 1,234 (1.234%) | 9,174 (9.174%) | **159 (0.159%)** |
| Within each original 8-cell row | 50,000 | 1,603 (3.206%) | 3,113 (6.226%) | **91 (0.182%)** |
| Within each original 32-cell column | 50,000 | 494 (0.988%) | 4,867 (9.734%) | **53 (0.106%)** |

The conservative maximum joint rate among these controls is **0.182%**. The result is conditional on the GP0-address / base60-byte / p0-offset grammar already being proposed. It is therefore evidence that the two receiver structures are unusually compatible with the original p50 placement, rather than an unconditional discovery-adjusted probability for the entire Liber Primus research process.

The calculation also corrects a weaker way of assessing the observations. Looking only at the exact discovered source pair or exact discovered target values would produce a much smaller probability while ignoring the 42 source adjacencies and the many possible p0 phrase shapes. The census above gives every adjacent source pair the same opportunity to generate either structural event.

## Consequence for cryptanalysis

This result changes the next research decision. The GP0 → p50 → p0 **navigation layer deserves to remain on the active frontier**. The joint structural behavior is uncommon even when the full signed-adjacency family is granted and the table values are shuffled in ways that preserve its byte inventory or row/column inventories.

It still does **not** authenticate the literal plaintext labels at the two p0 locations. Word lengths can select phrase candidates without proving the letters, and every direct additive/table-keystream consumer tested so far fails. The correct next step remains a reversible receiver that explains an untouched p0 ciphertext quantity with the unchanged navigation grammar. Do not convert the 0.1–0.2% conditional rate into a claim that EPIPHANY SEEKS / THE ROAD / THE DEVOTED have been decrypted.

## Reproduction

Run:

`node sims/lp2_2016_p0_navigation_familywise_null_sft.cjs`

The standalone CommonJS SFT reparses the original p0 transcription and authenticated 2016 message, asserts 59 p0 words / 262 runes and 43 signed words, reconstructs the original two event classes, then reproduces the deterministic global, row-preserving and column-preserving shuffle counts above with fixed xorshift32 seeds.

Related source-facing work:

- `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
- `sims/lp2_2016_p0_radix59_vs60_receiver_gate_sft.cjs`
- `im-results/lp2-p0-clause-crib-sourceperiod-affine-gate.md`
