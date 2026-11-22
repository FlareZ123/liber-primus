# The 256-byte p50 grid and the exact GP29→Latin26 sidecar capacity

**Agent 3, 22 November 2026, Director task #2178. Outcome: a source-led, fully lossless candidate code is mathematically defined and its natural original-grid receiver is excluded. No unknown LP2 plaintext, authentic key or destination recovered.**

## Why this specific architecture is attractive

Two first-party affordances coexist: the manuscript's **29-symbol Gematria Primus alphabet** and ordinary Latin **26-letter A–Z** text. Its original 55 rune-bearing unresolved pages p0–55 contain exactly **12,956** GP29 symbols. The physical pp49–51 numerical object contains exactly **256 cells**, each convertible to one source-defined byte under conventional base60, with a base59 reading also recorded.

An exact fixed-length, lossless base29-to-base26 recoding of the complete unknown rune sequence needs an auxiliary register: a length-12,956 base29 integer has more states than a length-12,956 base26 integer. The number of additional bits is

`12,956 × log2(29/26) = 2,041.1047846368 bits.`

The largest possible integer quotient requires **2,042 whole bits**, stored in exactly **256 bytes**, leaving six unused bits in a 2,048-bit byte container. Thus the printed 256-cell table is **numerically large enough to store an entire exact base29→base26 quotient** for all 12,956 source symbols. This is a more discriminating length relation than an arbitrary 256-cell table coincidence. Yet the original art/messages do **not** specify a base26 re-encoding, a 256-byte quotient, or a connection between the grid and all unknown pages. The capacity fit is a premise for a concrete test, not evidence by itself of an intended mechanism.

## Frozen reversible code and independent positive plant

Let `N=12956`. Take all original GP29 digits `d_i ∈ 0..28` in physical rune order, continuing through word/page gaps and omitting the rune-free p50 table. Define

`X = ∑ d_i 29^(N−1−i)`, `B=26^N`, `Q=floor(X/B)`, and `R=X mod B`.

`R` is exactly **N base26 digits** including leading zeroes, hence an N-letter Latin26 stream under fixed `0=A, …, 25=Z`. `Q` is the 256-byte, unsigned, big-endian sidecar. The inverse is simply `X=Q B + R` followed by exactly N base29 digits, provided `Q B+R < 29^N`. Thus the schema is completely lossless and its original rune order, word/page carry clock, radix, byte order and output length are frozen.

The source-independent positive constructs an actual **12,956-letter Gibran** Latin control, chooses a legal 2,041-bit quotient, encodes the pair as exactly 12,956 GP29 symbols, then recovers the exact Latin control and quotient. It validates this exact decoder using genuine text, without a guessed secret.

## Universal original-grid obstruction

The exact maximum legal unsigned quotient, over **every possible GP29 source of N=12,956 digits**, is

`Q_max = floor((29^12956 − 1) / 26^12956)`.

This has **2,042 bits**, and begins **`02 26 92 28 b1 c4 5f ce`** as a fixed 256-byte big-endian integer. Consequently, the most significant input byte of any valid complete 256-byte sidecar must be **0x00, 0x01, or 0x02**. The source-printed table's natural orientations all violate this before consulting any runes:

| Source-grid byte interpretation | Eight fixed row/column traversals | First byte range | Complete table bit lengths | Could encode any legal quotient? |
| --- | --- | --- | --- | --- |
| Conventional base60 | Printed row/column major; each physical axis forward or reversed | **0x50–0xCB** | **2047–2048** | **No, 0/8** |
| Alternate base59 | The same eight physical traversals | **0x4F–0xC8** | **2047–2048** | **No, 0/8** |

This is an exact **all-source** rejection under the chosen full-register, unsigned-quotient byte contract. No source GP29 plaintext string could make the table a legal quotient in these 16 fixed orders, even with a separately hidden base29 message.

As a second original-input check, the canonical GP29 ciphertext, its reverse, the continuous first-difference stream (first digit preserved), and that stream's reverse give actual true quotient bit lengths **2041, 2040, 2041 and 2041**, respectively. None equals the original p50 bytes in either radix and any of the 16 natural layouts. Their base26 remainders are inspected independently for complete Latin text; no author-selected coherent decoded message is obtained. This does not license post-hoc reordering or secret byte masks.

## Decision and next admissible lead

**Reject the 256-byte table as a literal full-book GP29→Latin26 high quotient under the tested real physical readouts.** The close 2,042-bit/256-byte capacity fit is intriguing and suggests a different source-selected 29-to-26 recoding could in principle use a 256-byte external sidecar. The full ciphertext and table do not authenticate such a step, and a variable-length or keyed arithmetic coder would need a fresh first-party serialization rule.

Other sidecar architectures, such as sparse repeat-escape bits or keyed carries, are unaffected. The exact capacity fact is kept as conditional intermediate evidence and **must not be promoted to a solved plaintext or a genuine authored opcode**.

Reproducer: [`sims/lp2_p50_radix29to26_256byte_sidecar_sft.cjs`](../sims/lp2_p50_radix29to26_256byte_sidecar_sft.cjs); original inputs [GP29 corpus](../resources/liber-primus/lp2-corpus.json), [printed table](../resources/liber-primus/lp2-grid-256.json), and [independent Latin plant](../resources/control/gibran_prophet_58585.txt). Run with Node.js 22; the code is read-only and fully deterministic.
