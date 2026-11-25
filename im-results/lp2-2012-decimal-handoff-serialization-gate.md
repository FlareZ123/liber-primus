# 2012 decimal RSA handoff: exact output serialization, no LP2 consumer

Agent9, 25 November 2026, #2825. A bounded representation-specific source decision, distinct from the earlier RSA decryption, hash, Stage03/04, OpenPuff, and timestamp searches.

The archived signed 2012 participant page `resources/historical/cicada2012-message-only-displayed.asc` explicitly names Crypt::RSA 1.99 and says that the encrypted message is a number, to be entered at the same URL after recovery. It also explicitly states that each participant received a unique message encrypted with a unique key. The recovered data object is the concatenated OAEP plaintext, not the original RSA modulus, compressed armor, or original emailed /NUM route. #94 and `im-results/2012-rsa-participant-page-recovery.md` already reconstruct all three archived response numbers (only the valid-participant copy is reported signature-valid; the other two are redacted). Reuse those exact known outputs; do not re-run RSA recovery.

| Recovered decimal | ASCII payload hex (20 bytes) | Minimal unsigned big-endian integer (9 bytes) |
|---|---|---|
| 33521494043430258676 | 3333353231343934303433343330323538363736 | 01d134453a5f0887f4 |
| 29201928111913239376 | 3239323031393238313131393133323339333736 | 01954216e63b150350 |
| 25121996842107342310 | 3235313231393936383432313037333432333130 | 015ca343069e4b0de6 |

These conversions were computed with exact BigInt and ASCII in connected V8. The 65-bit numbers cannot be represented losslessly as a single unsigned 64-bit integer. The actual historical producer emits four five-byte ASCII chunks, so its concatenated 20-byte output is selected by the named module and exact decrypted payload. The consumer is the participant-specific decimal submission (not the 9-byte minimal integer). This is a real representation distinction; it is not a universal rule to use ASCII digits for later ciphertext or to choose the first archived participant's number as a common key.

The exact original HTTP submission and follow-on response are not preserved. The 2021 participant-style account records the correct response and subsequent MIDI email, but does not establish the original HTTP request body, field normalization, or a shared key. More importantly, the original instruction explicitly selects a participant-specific result; it does not supply a common deterministic LP2 operand. The LP2 release does not label a decimal RSA response or an ASCII 20-byte key consumer. The observed p50 two-character tokens, inline p10 numeral7, red list numerals and p56 hexadecimal digest do not supply this typed handoff.

**Decision:** no new executable LP2 inverse can be frozen from this serialization. Prior #2497 has already resolved coordinate-policy differences; #2123 resolves Stage7-to-10; #637 resolves Stage08 compression; #2809 resolves the exact MIDI codebook transfer. No genuinely untested source-selected shared handoff was found after excluding those routes. Do not repackage the 2012 numbers as additive keys, base29 digits or offsets without a separately observed selector. The missing first-party artifact would be an explicit later instruction binding one exact shared representation to an LP2 target and receiver, or an authenticated common delivery that fixes those bytes. Redirect to internal clues rather than broad external key enumeration. No new plaintext or key.
