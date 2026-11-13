# Terminal 256-byte table: exact binary XOR/LFSR known-interior gate

**Agent 7, 13 November 2026. Classification:** source-geometry-motivated, finite original-cipher inversion negative with a complete planted recovery control. **No original p55 plaintext, author-selected binary key, cipher, or deep-web destination was recovered.** The source-visible terminal 76/180 geometry remains a hypothesis about intended encoding.

## Why this experiment is a distinct potential solution route

The unmodified LP2 numerical table occupies original physical pages **49–51** (32 rows × 8 columns = 256 two-symbol numbers, provisionally interpreted as bytes). A 32×8 rectangle has an outer circumference of exactly **76** cells. Its other rings contain **68 + 60 + 52 = 180** cells. The manuscript's final physical pages have **76 unknown GP runes on p55** and **85 solved p56 + 95 clear p57 = 180 known runes**. Solved p57 says *SHED OUR OWN CIRCUMFERENCES*, giving a genuine human-visible reason to consider this layout, albeit no bytewise cipher instruction. Earlier original 2013 Cicada used bytewise XOR with `761.MP3` as a puzzle operation, providing an independently historical operator. Neither source authenticates a terminal-table XOR operation.

Unlike earlier GF29 additive recurrence/low-rank ring gates, this experiment asks whether the **180 known actual plaintext symbols determine the prefix of one binary XOR keystream**, thereby decrypting p55's entire 76-rune circumference. A source-visible 32×8 table and solved interior supply a held-out known-plaintext test before evaluating any English-like guessed p55 output.

## Original inputs, exact position contract, and exhaustive key bound

Input table: [256 canonical unsigned bytes](../resources/liber-primus/lp2-grid-256.json), in physically printed source row-major order, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its conventional radix-60 byte interpretation is a **conditional transcription**. [Canonical original rune corpus](../resources/liber-primus/lp2-corpus.json) supplies all original p55, p56 and p57 rune indices. The known native-GP p56 text is derived by the established subtract-prime-totient rule, with **only p56 local rune 56** the literal `F` interrupting the prime clock. The SFT asserts the exact 85-rune known p56 plaintext and untouched 95-rune p57.

For each of the four original inner-ring corner origins and both clockwise/anticlockwise directions, traverse the three complete inner rings in order **68,60,52** without positional skips. Two historically observable registers are tested independently: `p56 recovered native-GP plaintext + p57 clear` and `p56 as original printed ciphertext + p57 clear`. Each source symbol is a GP29 index 0–28, represented as one byte. Define the **180-byte inferred XOR mask** at those fixed known positions as

```text
K[i] = grid[innerRingPosition[i]] XOR knownRuneByte[i]
i = 0,...,179.
```

Serialise the 180 mask bytes into 1,440 bits in either MSB-first or LSB-first bit order. **Berlekamp–Massey over GF(2)** finds the minimum order of *any* binary linear recurrence capable of generating all 1,440 observed bits. This eliminates the entire unknown-secret connection polynomial and initial state without testing keys or English scores.

### Exact original-source results

Each matrix entry is the **minimum** LFSR order, written MSB/LSB for the two bit serialization conventions. “Plain” means fully recovered known p56 native-GP runes; “printed” means original p56 encrypted runes. The p57 runes are always clear source glyphs.

| Start corner | Ring direction | Plain order, MSB / LSB | Printed order, MSB / LSB |
|---|---|---|---|
| Top left | Clockwise | 721 / 722 | 721 / 721 |
| Top left | Anticlockwise | 720 / 721 | 721 / 720 |
| Top right | Clockwise | 720 / 719 | 720 / 721 |
| Top right | Anticlockwise | 721 / 722 | 720 / 721 |
| Bottom right | Clockwise | 720 / 720 | 719 / 720 |
| Bottom right | Anticlockwise | 720 / 720 | 721 / 720 |
| Bottom left | Clockwise | 721 / 722 | 722 / 723 |
| Bottom left | Anticlockwise | 721 / 721 | 720 / 719 |

**Result:** all **32** source-fixed inferred masks have binary linear complexity between **719 and 723** over 1,440 original known bits. Therefore, for every tested original layout and bit serialization, **no secret binary linear-feedback shift register of order 718 or smaller**, with any initialization and arbitrary feedback polynomial, can generate the full inferred known-interior XOR mask. The minimum 719 is near the roughly 720 expected for an independent unconstrained bit stream. The original p55 rune values were entirely withheld: this is a direct known-plaintext gate, rather than post-selecting a plausible output.

The bound applies to **one serialized bit at a time** with a constant linear recurrence. It cannot reject a nonlinear generator, byte-substitution output, changing state clock, binary generator whose output bit multiplexing raises serialized linear complexity, different terminal/ring mapping, or an unrelated purpose for the grid. In particular, do not present it as an exclusion of every 32/64/128-bit internal-state PRNG without specifying its output clock. The differing p56 plaintext and ciphertext registers also reflect the known separate p56 cipher; neither is established as the table's actual message register.

## Positive control: real recovery of a hidden 76-rune synthetic page

The same original **32×8 geometry** is used to create a complete 256-byte ciphertext table with a deterministic 47-bit linear recurrence. All **180 known inner rune bytes** remain identical to the independently solved p56+p57 passage. The artificial outer ring contains **76 plaintext GP runes** from the first 76 symbols of solved p57, encrypted under the initial 608 keystream bits. The planted binary mask has a fully declared recurrence and pseudo-randomized 47-bit initial state. The inverse sees only the synthetic **inner table bytes and the actual 180 known runes**. It:

1. Recovers the exact binary recurrence from the resulting 1,440 known *suffix* bits.
2. Requires a nonzero oldest-tap coefficient, making backward stepping uniquely invertible.
3. Extends the key by **608 bits backwards** to the unobserved outer ring.
4. XORs the reconstructed 76 mask bytes against the outer-ring ciphertext.

**Recovered all 76/76 previously withheld synthetic plaintext runes and all 76/76 original synthetic mask bytes exactly.** This positive is a controlled encrypted plant and must **never** be mistaken for a decryption of real p55. It demonstrates that the attack can actually exploit the 180 known symbols to recover the entire 76-rune border when the proposed binary architecture is true.

## Reproduction and decision

- [Runnable CommonJS source-and-plant SFT](../sims/lp2_terminal256_xor_bitlfsr_sft.cjs) (Node 22, built-in modules; original byte checksum, exact known p56, original route counts, 32 Berlekamp–Massey orders and full 76-rune positive recovery asserted).
- [Successful original-source GitHub Actions execution 43346572276](https://github.com/FlareZ123/liber-primus/actions/runs/43346572276), manual dispatch only. Test was successfully executed at 01:39–01:40 UTC on 13 November 2026.
- [Earlier, separate GF29 known-interior ring inversions](lp2-terminal256-original-inner-separable-gates.md) rule out rank≤5 and linear GF29 mask recurrence of order<89 under related fixed placements. Those gates do **not** prove or imply the present 1,440-bit binary XOR bound.

**Research choice:** retire only this well-specified **binary-XOR short-LFSR terminal-ring** model. No unbounded binary state search or alternative ring permutations is justified from this negative. To reopen the terminal p55 route, seek an independent original instruction that identifies the table's actual input register, nonlinear output operation, or a reversible byte-level consumer able to predict the untouched solved180 symbols and therefore recover the complete withheld p55 exterior. The 76/180 alignment is exact and useful as a stringent test bed, yet is still insufficient evidence of the intended cipher.
