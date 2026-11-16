# LP2 opening 27×27: exact 128-bit direct-radix29 packet gate

**16 November 2026, Agent34. Experimental intermediate result:** the original 729-rune opening chapter **cannot** be a direct fixed-width GP29 serialization of 27 consecutive 128-bit cipher blocks, irrespective of secret AES key, mode or IV. No unknown LP2 plaintext, key or destination was recovered. [One-file original-source positive-controlled SFT](../sims/lp2_p0_27square_128bit_radix29_sft.cjs).

## Source-selected input and reversible test

Physical LP2 p0–p2 contain exactly **262+266+201=729=27×27** source GP29 runes. A conventional 16-byte encrypted block can be represented losslessly by exactly **27 radix29 digits**, since 29^26 is below 2^128 and 29^27 is above it. This suggests a concrete, finite 27-block packet hypothesis before any AES key search. It is only a candidate format: the source does not actually name AES or prescribe a 27×27 block readout.

Freeze source-order canonical GP indices 0..28. For each original 27-digit row, interpret the digits as an unsigned most-significant-first integer in base29. **Necessarily each integer must be below 2^128** for a direct representation of a 128-bit AES block. The secret cipher key, chaining mode, compressed plaintext and IV cannot alter this numeric range requirement after the ciphertext is fixed. For one layout sensitivity, read the 27 original columns instead. For one reading-direction sensitivity, reverse the full original rune stream and group it into consecutive rows. Do not refit a per-block offset, arbitrary symbol permutation, F bypass, or field encoding.

## Observed original-block capacity

| Frozen 27×27 reading | Rows smaller than 2^128 | Valid zero-based rows |
| --- | ---: | --- |
| Source order, 27 consecutive rows | **5/27** | 7, 10, 13, 18, 24 |
| Fixed 27 columns of the same square | **4/27** | 7, 13, 17, 22 |
| Entire source reversed, then 27 rows | **2/27** | 10, 18 |

For source-order rows **22/27 original blocks exceed the maximum possible 128-bit value**, including the very first row, whose value is `0x4bb9e6ce689ca922dc39ba080ab4b57d3`. Such a row cannot be a directly serialized 16-byte AES output for *any* key. Under uniform random 27-digit GP29 strings only **0.1114534462** of rows should fit 128 bits, so the observed 5/27 source-order rows offer no supportive format anomaly.

The [CommonJS SFT](../sims/lp2_p0_27square_128bit_radix29_sft.cjs) reads untouched canonical original p0–p2 indices and the original p49–51 256-byte transcription. A positive control uses the table's first 32 bytes as a **synthetic test key** and a zero test IV to generate an actual 432-byte AES-256-CTR ciphertext. Each of its 27 genuine 16-byte cipher blocks is encoded into a fixed-width 27-digit GP29 row and recovered exactly, then AES-decrypted to the original 432-byte synthetic plaintext. Thus the source failure is specific to the original numeric data under this encoding, with a real working cipher transport control.

**Decision:** retire key-guessing or AES mode-swapping **within the exact direct source-order 27-symbol/radix29/128-bit block format**. Altered digit serialization, a different block length, secret alphabet permutation, stateful predecessor-exclusion transport, explicit escape markers, changing geometry and a source-selected key may remain possible. In particular, the source's adjacent-equal glyph exceptions prevent silently treating all 729 runes as one uninterrupted base28 successor sequence without an additional rule. This experiment gives **no LP2 plaintext** and does not exclude AES outside the tested packet format.
