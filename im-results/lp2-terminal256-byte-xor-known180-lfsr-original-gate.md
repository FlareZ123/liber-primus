# Original terminal 180-rune known plaintext excludes a short GF256 byte-XOR table pad

**Agent 11, 17 November 2026. Evidence class:** executed complete original-source known-plaintext attack with a successful 76-rune hidden-plaintext positive plant. **No unknown LP2 rune plaintext, authentic key, new message or destination was recovered.**

## Source-selected premise and intended human operation

The published LP2 pp49–51 numerical block has **32 × 8 = 256 cells**. Under the explicit conditional source-native two-digit base60 interpretation, each is a value in 0..255. The immediate last three physical rune pages have **p55 76 unknown symbols, p56 85 independently decrypted symbols and p57 95 independently visible clear symbols**: precisely **256 rune slots**. Thus a solver can attempt to determine the table's corresponding key for 180 source-known trailing slots and reconstruct the missing 76 prefix symbols. This is a potentially plaintext-recovering test with untouched original ciphertext and no language-model fitting.

The historical 2013 Cicada Twitter/761.MP3 stage demonstrated **bytewise XOR**. The table already supplies native bytes, so test the conditional relation `T[i] = P[i] XOR K[i]` where `P` is the GP rune ordinal 0..28 and `K` an evolving 8-bit key. The **8-column and 32-row** printed geometry motivate testing a secret linear recurrence of order at most 8 or 32 bytes, even with arbitrary coefficients and seed. The common AES field realization **GF(2^8) reduced by 0x11B** is frozen for the experiment; neither the manuscript nor the 2013 XOR precedent specifically instructs that field or states that table bytes encrypt the terminal runes. These remain hypotheses.

This tests a different cipher architecture from [the GF29 additive recurrence on the same 180 known positions](lp2-p50-terminal180-known-lfsr-original-gate.md). That prior original report ruled out GF29 order≤8; it does not cover native-byte XOR and unknown GF256 field coefficients.

## Exact original inputs and constructive inverse

The 256-byte source table is pinned to SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The **85** p56 plain GP values are encoded from independently known `AN END ... OUT THIS PAGE`. Its actual printed ciphertext is regenerated **85/85**, using the genuine consecutive-prime-totient shift and one nonconsuming plaintext-F interrupter at ordinal 56. Physical p57 contributes **95 unchanged clear GP runes**. A separate fixed alternative uses p56 as printed ciphertext, rather than as deciphered plaintext.

For each alternative, derive all known bytes without assuming any unknown p55 plaintext:
`K[76+j] = table[76+j] XOR knownRune[j]`, for `j=0..179`.

Run Berlekamp–Massey over GF(2^8) with 0x11B, first on 90 known bytes and then all 180. A homogeneous recurrence with order ≤32 would necessarily be recovered by 180 samples if it exists; the first-90 fit also gives a **90-byte untouched holdout**. All field arithmetic uses native bytes with no fitting of symbol maps, table offsets, order, direction, or field basis.

| Source-known trailing plaintext register | First 90 minimum order | All 180 minimum order | Predict held-out 90 |
| --- | ---: | ---: | ---: |
| **85 actually solved p56 GP runes + 95 clear p57** | **45** | **90** | **0/90**, first mismatch immediately at index90 |
| **85 printed p56 cipher runes + 95 clear p57** | **45** | **90** | **0/90**, first mismatch immediately at index90 |

The original 180-byte witness therefore **excludes every GF(2^8,0x11B) homogeneous XOR-pad linear recurrence with secret coefficients and initial state of order≤32** for this frozen row-major table-to-terminal alignment. The exact minimum order90 carries about as many free GF256 coefficients as the data can justify, with no holdout confirmation. It is ordinary random-like complexity, not a recovered source key.

## Positive control recovers the actually concealed 76-rune region

A synthetic table uses exactly the authentic source 76+85+95 layout. The first 76 plaintext runes are genuinely known p57 runes concealed from the decoder; p56 and p57 retain their actual known values in the following 180 positions. An unknown degree-four GF256 pad with connection polynomial `[1,5,8,11,17]` and four-byte state `[7,11,13,17]` XORs the whole 256-rune sample.

From only the trailing 180 runes and the planted table, the identical solver obtains **degree4**, predicts **90/90 unseen keystream bytes**, reverses the unknown pad to the first position and recovers **76/76 concealed GP runes exactly**. This specifically demonstrates that the proposed decoder would have recovered p55 text if the original table had used a short linear byte-XOR pad.

## Decision

Retire this **exact direct byte-XOR, short GF256 linear-pad interpretation** of the terminal 256-cell layout. The historical XOR precedent and numerical layout remain real source properties; they do not establish the conjectured table/plaintext alignment or field arithmetic. The result cannot exclude a genuinely nonlinear external keystream, authenticated different table ordering, other finite-field byte representation, compressed payload or independently sourced key. Future work should seek a creator-selected output operation or a real secret source instead of increasing the fitted recurrence order.

**Executable single-file CJS reproducer:** [sims/lp2_terminal256_byte_xor_known180_lfsr_sft.cjs](../sims/lp2_terminal256_byte_xor_known180_lfsr_sft.cjs), standard Node.js 22, Windows-compatible, no dependencies or writes; asserts source table hash, p56 85/85 re-encryption, both original complexity results, 90 withheld failures and 76/76 hidden-rune positive control.
