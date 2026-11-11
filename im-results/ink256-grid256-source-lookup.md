# The 256 ink events and 256 printed bytes do not share a stationary lookup

**Original-source key-independent obstruction, 11 November 2026.** The two independently printed 256-element source sequences do not support an exact fixed mapping from byte value to GP29 event symbol. This is a finite exclusion of a simple, potentially useful alphabet/key relationship, with no recovered unknown LP2 plaintext, key, or message.

## Proposed human route and exact source

Original LP2 has **225 red runes and 31 thirteen-dot marks**, giving **256** ink events in source chronological order. The 32×8 printed numeric table on physical pp49–51 has **256** entries, each specifying an unsigned byte in the original base60 interpretation. A solver noticing the identical cardinality could pair ink events with table bytes and ask whether identical table-byte values always identify the same GP rune. If so, the two sources would reveal a shared *stationary byte→rune lookup* without guessing any mapping.

Read all red runes with their canonical GP index 0–28, and all 13-dot marks with index **0**. Sort by physical page and rune offset, with a mark preceding a rune at the same offset; include the solved-page marks/events because the original source count256 does. Pair each ink symbol with the table byte of the same zero-based ordinal, in printed row-major order. This is the zero-phase source-origin reading, not an alignment chosen to maximize success.

For each byte `b`, group all event symbols attached to `b`. A fixed function `f(b)`, even with arbitrary 256 lookup entries and duplicate outputs, can assign only one symbol per group. The exact minimum unavoidable mismatches is `sum_b(total_b - max_symbol_count_b)`. This does not depend on English statistics, knowledge of a key, cipher scoring or the choice of substitutions.

## Exact result

- **161 distinct grid-byte values** among 256 original cells, giving repeated-byte constraints.
- **64 distinct byte values** are paired with conflicting GP event symbols. The *best possible* postselected stationary lookup still misses **87 / 256 events**.
- There are **127 pairs of positions with equal grid bytes**, but only **8 pairs** also agree on ink-event GP rune.
- To check whether the source's zero alignment is exceptional, shift the ink-event sequence by every cyclic phase while keeping the printed byte order fixed. Across **256** complete source-order rotations, minimum changes range **84–94**; the original score **87** ranks at **58 / 256 = 0.22656** on the lower-is-more-consistent side. The rotations are diagnostic controls, not alternative decryption keys.
- A planted secret arbitrary lookup `f(b)=(7b+11) mod 29` attached to the *actual duplicate-containing 256-byte table* yields **zero errors** and full **127/127** agreement of same-byte pairs.

## Decision

**Retire only the direct stationary byte-to-ink-event lookup under the literal chronological, equal-ordinal alignment.** The source equality 256=256 remains interesting, and the two streams may participate in a positional permutation, secret state generator, field operation, encryption, or different serialization. Neither a fixed offset scan nor a new arbitrary alphabet can repair this specific mapping without supplying a separate original clue. Since the two streams include events from solved pp56–57, the test by itself does not imply that their joint 256-event length encodes the 12,956 unresolved runes.

Reproduce directly with [`sims/ink256_grid256_fixed_lookup_sft.cjs`](../sims/ink256_grid256_fixed_lookup_sft.cjs), Node.js CommonJS. It reads the original source-indexed ink data, the 256 printed bytes and canonical GP indices, asserts exact source counts, evaluates the full stationary lookup family, all 256 shift controls, and a planted positive function. The earlier [linear-recurrence test](ink256-grid256-lfsr-original.md) and [Cicada RSA4096 signature test](lp2_ink_grid_4096_signature_gate.md) assess materially different operations and remain separate.
