# The 256 ink events and 256 printed bytes do not share a stationary lookup

**Original-source key-independent exclusions, 11–13 November 2026.** A direct stationary byte-to-ink lookup conflicts with the source-ordinal original symbols. Independently, the 30 red ink markers exceed every possible five-bit field multiplicity of the 256 source table bytes under either documented numeral radix, even with arbitrary alignment and secret alphabet mapping. These exclude two simple source-shaped formats; no unknown LP2 plaintext, key, or message is recovered.

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

## Alignment-free 5+3-bit ink packing obstruction (Agent20, 13 November 2026)

The separate original-source counts provide a second, stronger constraint than same-ordinal lookup: **225 red GP runes plus 30 red thirteen-dot markers and one black thirteen-dot marker = 256 ink events**, while the original numeric grid is **32 rows × 8 columns = 256 bytes**. A natural bit-serialization hypothesis is that one ink-event class supplies a five-bit value (32 possibilities), with an independent three-bit column/position tag (eight possibilities), making one byte per event. This is a candidate interpretation motivated by the source shapes; no signed instruction identifies it.

Any **stationary deterministic** assignment of the 30 source ink-event classes (29 runes and one common dot-mark class) to five-bit values must give all **31 copies of the same thirteen-dot glyph** the identical field value. The black mark may be treated as a separate class. Consequently the 256 table bytes must have **some five-bit value appearing at least 30 times**. This requirement is independent of the order of the ink events, any arbitrary permutation of the table cells, any 29/30-way secret alphabet relabeling, and the choice of which event gets which table cell.

| Complete original numeral interpretation | Max occupancy of high five bits (\`byte>>3\`) | Max occupancy of low five bits (\`byte&31\`) |
| --- | ---: | ---: |
| Printed radix60 | **16** | **14** |
| Existing lowercase-f-omitting radix59 | **14** | **14** |
| Source-mark requirement for 30 red marks | **30** | **30** |

For a stateful reinterpretation that permits the same red mark to receive multiple distinct five-bit codes, the sorted original bin occupancies give a further exact lower bound: fitting **all 30 red markers** requires at least **two distinct codes** under base60/high-five-bit packing (largest bins 16+16=32), and at least **three distinct codes** under each of base60/low-five-bit, base59/high-five-bit and base59/low-five-bit packing (the respective two largest bins hold only 27, 26 and 27 cells). These are necessary cardinality bounds on additional state/position dependence, not a reconstruction of such a code or an encrypted key. The SFT asserts every minimum independently from the original table bytes.

There is no place for the 30 red same-class markers in any one of the four bitfield layouts, even if an omniscient solver chooses every event/table permutation and five-bit alphabet map. The base60 high-five-bit histogram is fully occupied and its two largest bins contain 16 entries each. Permitting noninjective class labels cannot decrease the required marker multiplicity. This is an **exact format impossibility**, independent of plaintext language and the historical p50 polynomial factors.

A positional state, special punctuation semantics, variable-length representation, or table as a separate cryptographic seed would constitute a different mechanism. These counts do not supply a key or unknown plaintext. The [same original-data SFT](../sims/ink256_grid256_fixed_lookup_sft.cjs) pins both complete radix readings, asserts the source's 30 red plus one black marks and the four field-bin maxima, and supplies a synthetic 30-identical-red-marker positive carrier. This new alignment-free obstruction is separate from the earlier source-ordinal stationary byte-to-rune lookup exclusion.

## Decision

**Retire both the direct stationary byte-to-ink-event lookup under the literal source-ordinal alignment and the stationary 5+3-bit ink/event grid-byte packing under all alignments.** The source equality 256=256 remains interesting, and the two streams may participate in a positional permutation, secret state generator, field operation, encryption, or different serialization. Neither a fixed offset scan nor a new arbitrary alphabet can repair this specific mapping without supplying a separate original clue. Since the two streams include events from solved pp56–57, the test by itself does not imply that their joint 256-event length encodes the 12,956 unresolved runes.

Reproduce directly with [`sims/ink256_grid256_fixed_lookup_sft.cjs`](../sims/ink256_grid256_fixed_lookup_sft.cjs), Node.js CommonJS. It reads the original source-indexed ink data, the 256 printed bytes and canonical GP indices, asserts exact source counts, evaluates the full stationary lookup family, all 256 shift controls, and a planted positive function. The earlier [linear-recurrence test](ink256-grid256-lfsr-original.md) and [Cicada RSA4096 signature test](lp2_ink_grid_4096_signature_gate.md) assess materially different operations and remain separate.
