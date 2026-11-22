# Clue-derived 256-bit keys from LP2's Fibonacci prime square

**Evidence class:** finite, well-specified negative decryptions under an exact external clue. Agent 19, 2026-11-10. No original LP2 plaintext, key, or next-stage destination recovered.

## Grounded key source

LP2 page 15 (JPEG 32.jpg) contains an **exact** 4×4 clockwise spiral of values \`abs(3301-prime(F_n+1))\`, where \`F_n\` enumerates the first sixteen distinct Fibonacci numbers. The 16 values, clockwise from red 3299, are:

\`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516\`.

These fit in 16-bit unsigned integers. Encoding the complete 16-number sequence using **two bytes per number** gives exactly **32 bytes**, a 256-bit seed for AES-256 or ChaCha20. This is an independently clue-derived candidate rather than an unconstrained dictionary key. The exact source construction and physical layout are established separately in [the canonical numeric-result synthesis](../results/fibonacci-prime-spiral.md).

## Direct stream-key attack on the actual runes

[The CommonJS reproducer](../sims/fibonacci_spiral_key_derivation.cjs) tests 32 prespecified 32-byte keys formed from four sets of sixteen integers (absolute differences, underlying primes, one-based prime ordinals, and unique Fibonacci numbers); two physical orders (clockwise spiral or printed row-major), two byte orders (big/little endian), and either raw 32-byte field serialization or its SHA-256 digest.

The existing shared [AES/ChaCha/RC4 pad implementation](../sims/base60_seeded_stream.cjs) applies alternative IVs (zero or a page-index position), byte-offset drops, byte-to-rune mappings (modulo 29 or 29/256 scaling), and both additive signs to each candidate. A total of **2,432** candidate decoding configurations are evaluated on each of three fixed intervals, using exact one-pad-symbol-per-rune alignment.

| Real LP2 input | Runic symbols | Best decoded whole-window IoC | Winning candidate |
|---|---:|---:|---|
| Page 16 | 267 | **0.03908648** | SHA256(Fibonacci-spiral:BE), AES-256-CTR, zero IV |
| Pages 16–22 | 1,744 | **0.03517675** | SHA256(prime-row-major:LE), AES-256-CTR, page-last BE IV |
| Entire unsolved LP2 | 12,956 | **0.03457507** | SHA256(absolute-row-major:LE), AES-256-CTR, page-last BE IV |

The longest-span maximum barely exceeds the uniform-rune benchmark 1/29 = 0.03448276. The 267-rune maximum was selected from 2,432 tests and lacks an independent-language check; it is not a credible decryption. The experiment does not account for unknown key-pointer skips, a different generator, a secret salt/nonce or an outer rune substitution.

**Positive check:** an actual GP-English-like source is re-enciphered under the literal \`absolute-spiral:BE\` 32-byte key, AES-256-CTR with zero IV and modulo-29 mapping, with an 81% chance of overwriting attempted adjacent ciphertext repeats without consuming another key byte. The true key and cipher combination rank **first of 2,432** on the exact page-length layout, recovered IoC **0.06547003**. This demonstrates that the tested family could reveal a key of the prescribed form when the rune-key pointer stays aligned despite replacement events.

[Successful manual GitHub Actions run 42753169796](https://github.com/FlareZ123/liber-primus/actions/runs/42753169796).

## Same clue-derived keys applied to the 256-byte base-60 grid

A distinct hypothesis is that page15's 256-bit source key decrypts the 256-byte base-60 table printed on pages49–51 (scans66–68). The [table-payload executable](../sims/fibonacci_square_grid_payload.cjs) reads the exact corrected 256-byte grid, whose SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. It tests the 32 keys above plus four 16-bit signed-value representations, five table traversal layouts (row-major, reverse, column-major, row-snake, row-mirror), AES-256 ECB/CBC/CTR/CFB/OFB, and four IV hypotheses where applicable, for **3,060** full-length decryptions.

The strongest outputs according to generic plaintext recognizability are:

| Measurement | Strongest decrypt | Baseline implication |
|---|---:|---|
| Printable ASCII including CR/LF/TAB | **128 / 256** bytes | Only half of output resembles printable text |
| Byte values 0–28 as GP numeric indices | **48 / 256** bytes | Far below a literal byte-per-rune plaintext |
| Lowest measured byte entropy | **6.9526** bits/byte | Still high, no recognizable low-entropy passage |
| Definite file/text magic | **none identified** | No straightforward interpreted data |

The low-byte best is the literal \`absolute-spiral:BE\` key under AES-256-CBC with row-major byte order and an IV taken from the last ciphertext block. Its 48/256 low-range count is insufficient evidence of a GP byte alphabet or a mixed-format payload, especially after trying 3,060 configurations. The IV variations of AES-CBC share nearly all output blocks and are correlated. No visible ASCII text, GP-index stream, or readily recognizable header emerges.

**Positive check:** 256 authentic English source bytes are AES-256-CBC encrypted with the literal 32-byte Fibonacci-spiral key and a zero IV; the same decoder recovers the exact 256-byte source with **256/256 printable bytes**. This confirms byte order, cipher use, padding state and key length in the planted model, without establishing realistic power for compressed or multi-layer binary content.

[Successful manual Actions run 42753459289](https://github.com/FlareZ123/liber-primus/actions/runs/42753459289).

## Interpretation and inversion directions

The exact Fibonacci-prime square is mathematical key-generation evidence; these finite experiments rule out its **direct** use in the specified narrow encodings. Future investment should require an independently constrained route from the square to a key schedule, nonlinear alphabet, grid transformation, or page-specific nonce. An alternative approach might use the original 4×4 spatial spiral as an explicit traversal rule or the Fibonacci-indexed primes as offsets in another artifact. Those remain hypotheses pending a key or readable original ciphertext.

Unchanged inputs, expected checksums, exact GP alphabet, methods, all candidate variants and one planted readable control per attack are preserved in the two programs. They run through the manual-only [Fibonacci-256-key workflow](../.github/workflows/fibonacci-spinal-key-256.yml). Original artwork and numeric transcription are fixed inputs, with no fitted plaintext strings.
