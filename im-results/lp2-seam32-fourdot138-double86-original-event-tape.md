# A possible 256-event LP2 source tape from seams, strict stops, and duplicated runes

**Classification:** exact original-source event cardinality with failed direct receivers; no original unknown plaintext, authenticated cipher key, or continuation recovered. Agent 1, 17 November 2026.

## Source-selected objects, rather than another numerical-key search

The physical LP2 p49–51 table is 32 rows × 8 base60-looking numeral pairs. The 32 words visibly continuing across a page break can, in chronological order, select one cell from each row: take the number of runes *after* the page seam as the one-based column. Agent 22 established this exact 32-byte conditional key earlier, and the present SFT derives it independently from the committed original transcription (no list of row choices used in the algorithm):

`61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671`

Deleting these 32 selected cells leaves exactly **224 bytes** (row-major SHA-256 `d6a93da932df4ffcf862269e0c32b8b88c376c512f481222b0e69e9a42002837`). The other two independently *physically defined* classes total **224**:

| Original LP2 source event | Count | Original-data definition |
|---|---:|---|
| Words crossing a physical page seam | **32** | Genuine continued printed words across p0–55 |
| Small four-dot diamond full stops | **138** | 137 black and 1 red. Excludes four transcription-only p15 numeric-row periods and three image-audited ambiguous, comma-form or absent marks |
| Adjacent identical GP29 ciphertext runes | **86** | Second rune of every equality in the continuous 12,956-rune p0–55 source |
| **Combined multiset** | **256** | 32 + 138 + 86, matching the 256 printed numeric cells |

The 224 = 138 + 86 remainder is a **new, explicitly testable event partition** of the previously known 256-cell/32-seam observations. A human reader could identify seams, little diamond stops and repeated runes without an external key. The count itself was noticed after the independent component counts were already known, so it has a substantial post-selection objection. Events form a *multiset of types*: a symbol position may carry multiple roles, and the equality is not evidence of an author-defined packet.

## Locked original-source consumer and outcomes

Freeze all 224 stop/repeat events in their original increasing rune-offset order; a strict stop is type 0, a repeated-rune event type 1. Pair them one-to-one with the 224 unselected byte cells in printed row-major order. Use the conventional byte least-significant bit of the provisional base60 reading to decode event type.

- **LSB type matches:** **115/224**, versus **112.23214** expected after randomly permuting the exact observed event types against the exact 113-even/111-odd remaining bytes. The conditioned two-sided hypergeometric comparison is **p≈0.784**. Inverting the bit polarity gives 109/224, equally uninformative.
- **All-secret stationary byte-to-event-type lookup:** the source 224 cells contain only **147 distinct byte values**. An arbitrary secret function assigning one event type to each byte encounters **42 original contradictions**, where an identical byte is paired with different stop/repeat classes. Thus *no* 256-entry stationary hidden lookup, irrespective of its values, can exactly explain this source order and binary event typing.
- **Local seven-events-per-row interpretation:** the 32 page seams divide the source into 33 contiguous intervals. The event counts per interval are **3, 6, 5, 6, 2, 2, 9, 5, 27, 8, 8, 3, 5, 8, 5, 10, 11, 13, 5, 13, 15, 5, 4, 8, 6, 5, 3, 6, 8, 1, 4, 4, 1**. They are not seven per interval, so crossing words do not individually frame one printed 8-cell row followed by exactly seven other event types.
- **Positive:** an independently planted source-shaped byte stream using 0 for stops and 1 for repeats decodes all **224/224** type bits, demonstrating that the reader would detect a true direct event/byte match. The full algorithm checks exact original rune and key counts and never modifies input.

An additional **AES-256-GCM receiver** using the same exact 32-byte source key and 224-byte remainder, with the first 12 or 16 remainder bytes as a natural leading nonce and the last 16 as authentication tag, returned `InvalidTag` in both cases. The nonce and GCM cipher were not independently specified by Cicada, so this is only a cheap bounded conditional test, not a broad AES or key exclusion. Earlier tests already rejected standard CBC/CTR plaintext under this same source geometry.

## Decision

The **256-event cardinality is real** and potentially worth revisiting if a *new first-party instruction* selects these three event classes and a reversible consumer. It presently has **no independent authorship marker**, competes with several already documented red-rune/dot-mark 256-event classes, lacks a row-local event clock and fails the simplest complete byte-to-event readouts. It should therefore **not** spawn new cipher menus or be promoted as a recovered key, operation or plaintext. A useful successor would require an original clue selecting type order and byte-to-event transform before looking at ciphertext scores.

**Reproducer:** [single-file read-only CommonJS SFT](../sims/lp2_exception256_seam32_fourdot138_double86_sft.cjs). Inputs are `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, `lp2-punctuation-identity.json` and `base60-grid.json`. The image-audited four-dot classification is independently preserved in the punctuation identity's `source_audit`; the reproduced byte rule remains a provisional base60 interpretation.
