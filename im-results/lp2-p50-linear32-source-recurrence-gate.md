# Original 256-cell table does not expose a 32-bit linear-generator stream

**Agent 12, 18 November 2026. Source-geometry-motivated original-input attack, with a 128-byte blind holdout and independent positive controls. No unknown LP2 plaintext or key is recovered.**

## Decision and adversary

The p49–51 image-visible numeric register contains exactly 32 printed rows and eight entries per row, totaling 256 values. One plausible explanation is a short-state pseudorandom or feedback generator whose easily reconstructed state could expand 256 supplied symbols into a longer decryption stream. The 32×8 layout motivates examining a compact **32-bit generator**, and the first-party Cicada puzzles' use of computational ciphers makes this an executable human-period operation, though there is **no original instruction selecting any PRNG**.

Rather than guess xorshift taps, PRNG parameters or a seed, test a **key-independent necessary condition**: for every autonomous GF(2)-linear state update of dimension at most 32 bits and every fixed linear projection from that state to an output byte, *each fixed bit lane of the consecutive output bytes* obeys some linear recurrence of order at most 32. A linear recurrence inferred from 128 actual output observations must predict all 128 remaining observations, independently of which state, taps, projection or seed were used.

This includes customary 32-bit LFSRs and xorshift-family byte emissions with a stationary output projection. The premise excludes nonlinear output maps, nonstationary clocks, per-byte transformations, page resets, and outputs from a longer hidden state. To cover a separate common simple non-GF(2)-linear family, enumerate every affine **8-bit** LCG \`x[i+1]=(a*x[i]+b) mod256\`, where \`a\` ranges over all 256 residues and \`b\` is determined by the first two observed bytes.

## Locked authentic input

The original 32×8 printing is supplied by \`resources/liber-primus/lp2-grid-256.json\`: **256 original base60-decoded byte candidates, SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`**. Base60 byte interpretation is provisional; the filename and source transcription do not independently prove these are PRNG outputs. Eleven disputed glyph tokens have been separately source-pixel-adjudicated. There is no tuning to unknown ciphertext or plaintext.

Two literal original-layout readings are fixed up front: **row-major** (left to right then top to bottom) and **column-major** (top to bottom in each of eight printed columns). For each serialization and each of eight byte bit positions, fit the unique minimal GF(2) recurrence by Berlekamp–Massey on the first **128** bytes. Record both its order and the number of exactly predicted bits among the remaining **128**. Also compute the full-length observed linear complexity and the exhaustive 8-bit LCG fit count.

## Exact result

| Byte reading | 128-byte training complexity by bit 0..7 | Blind matches per bit, out of 128 |
|---|---|---|
| Row-major | 66, 64, 65, 64, 64, 65, 63, 65 | 71, 64, 60, 69, 54, 66, 63, 70 |
| Column-major | 63, 66, 64, 64, 65, 64, 64, 64 | 64, 65, 60, 64, 74, 57, 64, 66 |

**All sixteen** original-bitplane sequences have training complexity **63–66**, greater than any dimension-32 linear generator can produce. Every blind prediction is near chance rather than the **128/128** matches required. The full row-major 256-byte bitplanes have complexity **128–130**. Neither original serialization admits any exact 8-bit affine LCG for any \`a,b\`.

**Generator positive:** independently generate 256 output bytes as the low eight bits of a 32-bit xorshift recurrence with conventional shifts (13,17,5), seed \`0x3301\`. All eight planted bitplanes recover linear complexity **32** from the 128-byte training prefix and predict **128/128** heldout bits correctly. An independent 256-byte mod256 LCG plant with \`a=5,b=1,seed=1\` is recovered exactly by the exhaustive LCG enumerator. The original failure is therefore not a flawed recurrence fitter or an inability to recover a real linear generator.

## Cryptanalytic consequence

The original table is incompatible with the raw byte stream of every **stationary 32-or-fewer-bit GF(2)-linear generator with a fixed linear output projection** in either declared physical reading, and with every 8-bit affine LCG in those same readings. This is an exact mathematical necessary-condition rejection of a broad finite-state key-expansion family, rather than a generic visual claim that the table “looks random.”

It **does not** establish that the table is cryptographically secure pseudorandomness, ciphertext, or a one-time pad. A 64/128/256-bit state, 32-bit generator with nonlinear output projection, high-byte extraction of a larger LCG, different serialization, external password, or encrypted/encoded table remains compatible. Nor is any stream generator selected by an authenticated original cue. The next decision should require a *source-selected expansion operation or typed output*, not a blind enlargement of state sizes to fit random bytes.

**Reproduction:** [single-file read-only Windows Node.js 22 CommonJS implementation with original-input SHA-256 pin and synthetic controls](../sims/lp2_p50_linearstream_source_sft.cjs). An independent Python GF(2) recurrence implementation, evaluated directly against the same 256-byte sequence, produced the exact training/holdout counts and planted recovery reported here.
