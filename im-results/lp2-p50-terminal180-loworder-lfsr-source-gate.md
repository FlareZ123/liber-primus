# P50 interior180 to terminal solved180: low-order LFSR inversion decision

**Classification:** original-source bounded exclusion; no unknown LP2 plaintext or key recovered. **22 November 2026, Agent16.** Full read-only [CJS SFT](../sims/lp2_p50_terminal180_linear_complexity_sft.cjs), using `resources/liber-primus/lp2-grid-256.json` and `lp2-corpus.json`. The original p50 byte interpretation is the explicit conventional base60 byte register, which remains a hypothesis rather than an authenticated extraction instruction.

## The plaintext-producing hypothesis and its rival

The 32×8 source table has **256** two-digit cells. Its one-cell-wide perimeter has **76**, and its strict interior has **30×6=180** cells. Immediately at the end of the manuscript, unsolved physical **p55 has 76** runes, solved **p56 has 85** runes, and transparent plaintext p57 has **95** runes. Thus the table's 76/180 split coincides with the original book's 76/(85+95) suffix. This could have been noticed by a human reader and suggests a potential inverse: pair the inner180 table bytes with the **180 known terminal rune values**, recover a key stream, infer the preceding 76 keys by a small reversible recurrence, and decode unknown p55 against the perimeter. Such a route would have a concrete causal path to plaintext if the source actually selected the recurrence and outer-ring byte consumer.

Strongest rival: counts and cell placements are a coincidental structural match, and the table bytes are random or encrypted with a nonlinearly generated/externally supplied secret; a simple linear keystream is inapplicable. Prior [terminal180 receiver work](../im-results/lp2-terminal180-byte-prng-red-event-inverse-gate.md) checked source-conditioned byte contrasts against event-class state, but does not establish a low-order recurrence or decoder. This test probes the **key-recoverable recurrence** prerequisite directly rather than repeating the earlier event-class search.

## Frozen exact original inputs and decoding

- Table values are the exact canonical **256** `bytes`, in printed row-major order. Take only rows 1..30 and columns 1..6 zero-based as 180 contiguous numeric values, without fitting rotation, traversal, omitted columns, or indexes.
- Decode all 85 authentic p56 ciphertext GP29 runes using its known consecutive-prime-minus-one rule. Original ciphertext **F at zero-based rune offset 56** remains transparent and consumes no prime. The 13-/10-dot marks and 64-byte hex digest consume no prime. The recovered plaintext starts `AN END WITHIN`, independently checked from the known p56 source.
- Concatenate **p57's 95 clear GP29 runes**. Also test raw p56 ciphertext as a deliberately contrasting terminal register. With each, use GP ordinal index `0..28` or GP-prime label `2..109`, then derive one byte per position by table-byte **XOR** value or table-byte **subtraction mod 256**. There are exactly **2×2×2=8** prescribed streams.
- Apply Berlekamp–Massey to each 180-byte stream in **GF(2^8)** with irreducible polynomial **0x11d**, primitive element 2, seeking the minimum exact linear recurrence degree. Independently unpack bytes MSB-first into 1,440 bits and determine minimum exact **GF(2)** LFSR degree. This is an exact all-secret test of the specified linear families, not a language score or cipher hypothesis sweep.

## Independent positive and actual result

A planted 256-byte **GF256 degree-8** keystream with 180 suffix values exposed via the same terminal alignment is recovered exactly by Berlekamp–Massey. The fitted polynomial is `[1,1,0,2,0,0,0,0,7]` and backward recurrence reconstructs **all 76 hidden prefix bytes**; they decrypt a planted source-native 76-rune excerpt of known p57 correctly. Hence the method would genuinely unlock p55 *if* the original source generated such a short recurrence and supplied the matching outer bytes.

| Terminal p56 values | Inner-byte operation | GF256 shortest degree | GF2 shortest degree (1,440 bits) |
| --- | --- | ---: | ---: |
| Original ciphertext | ordinal XOR | 90 | 721 |
| Original ciphertext | ordinal subtract | 90 | 722 |
| Original ciphertext | GP-prime XOR | 90 | 722 |
| Original ciphertext | GP-prime subtract | 90 | 720 |
| Authentic plaintext | ordinal XOR | 90 | 721 |
| Authentic plaintext | ordinal subtract | 90 | 721 |
| Authentic plaintext | GP-prime XOR | 90 | 719 |
| Authentic plaintext | GP-prime subtract | 90 | 722 |

Each original 180-byte stream has shortest possible exact GF256 linear recurrence of **degree 90**, the generic full-length interpolation order. Each derived 1,440-bit stream has shortest GF2 recurrence between **719 and 722**. These results **exclude every GF256 linear state with at most 89 eight-bit stages**, and every direct MSB-first binary LFSR with at most 718 one-bit stages, within the eight fixed source-register interpretations. The generated eight-stage control distinguishes an actual recoverable recurrence from mere ability to fit arbitrary data at order 90.

**Decision:** retire the original p50 interior180 → solved p56/p57 terminal180 **low-order linear-key inversion** branch under these fixed operations. It supplies no key or plaintext to the exterior76/p55 receiver. A 90-stage interpolant on 180 original samples has no independent predictive support; arbitrary extrapolation or second-pass key fitting would retread the same ambiguity. The result does not exclude another original radix, authored ordering, chained/nonlinear state, key stored outside the scans, or p50 serving an entirely different object type. A next investigation should begin only from an **independently source-selected** key transformation or consumer, then test native p55 and heldout unknown pages.
