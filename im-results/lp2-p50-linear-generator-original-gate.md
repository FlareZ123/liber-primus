# LP2 p49–51 printed 256-byte table: exact short GF(2)-linear generator gate

**Agent15, 17 November 2026. Classification: bounded original-input negative, no recovered plaintext or key.** The original printed table is 32×8 two-character numerals spanning source scans 66–68.jpg. Every source token is consumed unchanged from [the canonical row-major transcription](../resources/liber-primus/base60-grid.json), including its independently adjudicated disputed glyph cells. The original gives no explicit generator algorithm, seed, bit order, or instruction to interpret the table as keystream. This test asks whether its printed values could be *direct consecutive outputs* of a compact, GF(2)-linear state machine, which would be a cheap state-recovery opportunity.

## Source-frozen reversible numeral readings

The conventional complete 60-character numeral alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` produces **256 byte values in 0–255**, with 161 distinct bytes. The literal original table omits lowercase `f`, so an alternate source-derived base59 codebook can remove that digit and preserve all other digit positions. That alternate reading has 256 values in **0–251**, also with 161 distinct values; it changes the numeric interpretation and must remain conditional. Both readings preserve exactly the 32 printed rows and eight columns.

For each codebook, compute the eight byte bit-plane sequences over 256 consecutive table positions under **two explicitly fixed physical orders**: row-major (the printed reading direction), and column-major (one conventional table alternative). For each 256-bit sequence, Berlekamp–Massey over GF(2) supplies its *minimum* exact homogeneous linear recurrence length. The row-major 2048-bit serial stream also uses low bit to high bit within each byte, with no breaks.

| Fixed original input | Eight 256-step bit-plane complexities (bit0 through bit7) | Serial 2048-bit complexity |
| --- | --- | ---: |
| base60, row-major | 128, **130**, 129, 128, 128, 128, 128, 128 | **1024** |
| base60, column-major | 126, 128, 128, 128, 128, 129, **130**, 128 | not needed |
| base59, row-major | 128, 128, 128, 128, **130**, 129, 128, 129 | **1024** |
| base59, column-major | 128, **130**, 129, 127, 128, 128, 128, 128 | not needed |

An autonomous GF(2)-linear state generator of dimension at most **128** with a fixed linear byte-output map would make **every** output bit-plane obey a recurrence of order at most 128, regardless of the hidden initial state or state transition coefficients. Each actual source reading has at least one bit plane requiring order130. It is therefore **mathematically incompatible** with this direct-output generator class under either frozen table order or numeral codebook. A fixed affine output map would add at most one constant state bit and is still excluded for a 128-state-bit generator by the order130 plane. No random baseline or guessed key is required for that necessary-condition gate.

**Positive controls:** a 32-bit xorshift and a 64-bit xorshift, each generating 256 consecutive low-eight-bit bytes from explicit nonzero states, return exactly eight complexities of **32** and eight of **64**, respectively. These controls check that the gate identifies the intended class when present. They make no claim about the genuine manuscript cipher.

## The missing-f clue under the direct-byte null

Under 256 independent uniform 8-bit outputs encoded as ordinary radix60, a low digit numbered 16–59 has four preimages among the 256 byte values. Lowercase `f` is digit index41. The exact probability of observing **no `f` in 256 draws** is `(252/256)^256 = 0.017746279621051256`, and the expected number of entirely absent low-digit spellings across the complete 60-character alphabet is `16(251/256)^256 + 44(252/256)^256 = 0.8834396583450819`. Thus absence of one lower-case numeral can arise naturally from a direct base60 rendering of 256 ordinary bytes. This does **not** disprove intentional f omission, the unusual base59 one-root graph, or a combined first-party clue, and the author never specifies independent uniform draws. It reduces the evidentiary weight of *absence alone* as proof that base59 rather than the conventional base60 was intended.

## Cryptanalytic decision

A direct compact linear-feedback/linear-output stream with at most 128 state bits is **not recoverable from this table because it cannot produce these original bytes** under either fixed codebook and either print-natural read. This rejects a concrete low-complexity source-key generation family without brute force or phase hunting. It does **not** exclude nonlinear cryptographic PRNGs, nonlinear output maps, state sizes over128, secret byte permutations, undisclosed skip clocks, block encryption, or the possibility that the table itself is ciphertext. Those alternatives need an independently sourced opcode or key rather than a post-selected generator fit. No unknown LP2 plaintext, author key, final destination, or second-stage receiver has emerged.

**Reproduction:** [Node22 CommonJS original-source SFT](../sims/lp2_p50_linear_generator_original_sft.cjs). It reads `resources/liber-primus/base60-grid.json`, validates the conventional byte transcription, computes both radix/order profiles, checks the exact outputs, and runs planted xorshift32/64 positives. The same pure GF(2) calculation and original JSON table were directly executed for this report; a separate CI run is not claimed.
