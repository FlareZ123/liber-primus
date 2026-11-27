# Historical stophruna versus LP2 10/13/23-dot templates

**Agent16 · 27 November 2026. Classification: solved-page rejection of a direct historical dot-coordinate receiver. No unknown plaintext/key recovered.**

## Source-selected hypothesis

Derolez's critical text of the Salzburg Isruna tract describes `stopfruna/strophruna`, a secret writing made **only of dots**: one dot count gives the futhorc group and the other gives the letter's position. The same tract explicitly defines the group/position semantics used by its other cipher-runes.

LP2 has stable large punctuation templates with measured column populations:

- 10-dot: 3 / 4 / 3;
- 13-dot: 4 / 5 / 4;
- 23-dot: the 13-template widened by two additional five-dot center columns.

The strongest charitable historical read is to take one outer column plus the center count as the two stophruna coordinates:

- 13-dot (and its widened 23-dot terminator): 4/5 → historical Ior/IO in the full Anglo-Saxon row → GP IA, index 27;
- 10-dot: 3/4 → M, GP index 19.

This is already imperfect morphology: the historical dot cipher has two count fields (above/below, sometimes reversed), whereas the LP glyph has a mirrored third column. The interpretation therefore must pass solved controls before touching unknown pages.

## Solved p56 state control

Original solved p56 contains large marks at rune offsets 5, 45, and 85 with dot counts 13, 10, 13. Its authenticated cipher is the prime-minus-one GP29 additive stream with literal-F clock holds.

The proposed marker values are therefore IA(27), M(19), IA(27). At the marks:

| offset | mark | candidate | state immediately before / after |
|---:|---:|---|---|
| 5 | 13 | IA=27 | previous P=23, C=4, shift=10; next P=7, C=19, shift=12 |
| 45 | 10 | M=19 | previous P=3, C=25, shift=22; next P=10, C=5, shift=24 |
| 85 | 13 | IA=27 | final P=18, C=15, shift=26; next prime shift would be 3 |

Neither marker value matches a consistent adjacent plaintext rune, ciphertext rune, current/next key shift, or direct terminal state. The authenticated p56 key clock also passes through these punctuation sites without a marker-defined reset.

## Clear p57 plaintext control

Original clear p57 has a 13-dot template immediately after the red heading `PARABLE` and the widened 23-dot terminator after final `EMERGE`. The independently known source-native plaintext contains punctuation at those positions, not an additional IA rune.

Therefore the proposed 4/5 → IA interpretation fails as a literal hidden plaintext symbol on both solved occurrences. Reading the 23-dot expansion as the same coordinate does not repair this: it remains a typographic terminator at a known cleartext boundary.

## Decision

**Reject LP2's 10/13/23 templates as direct historical stophruna hidden-rune values or direct p56 cipher-state readouts.**

The historical connection is real enough to have deserved this check—Anglo-Saxon runes plus a documented dot-only coordinate cipher plus conspicuous dot glyphs—but the source geometry and solved pages do not support the direct receiver. A dual-use punctuation ornament could still carry information under a separately instructed operation, but that would require a new original selector. Do not mine alternate rotations, choose arbitrary pairs of the three/five columns, or fit marker values to unknown ciphertext.

## Reproduction

`sims/lp2_stophruna_dot_coordinate_gate.cjs`

Pinned inputs:
- `resources/liber-primus/lp2-corpus.json`
- `resources/external/relikd-solved-gp29-native-v1.json`
- `resources/liber-primus/lp2-ink-annotations.json`
