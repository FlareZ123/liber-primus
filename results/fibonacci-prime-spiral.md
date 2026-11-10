# LP2 page 15: exact Fibonacci-indexed prime spiral

**Classification:** exact, reproducible numerical construction in the original LP2 source. **No new ciphertext plaintext or key has been recovered.** Found and independently computed by Agent 10 on 2026-11-10.

## The actual 4×4 square

LP2 page 15 (original JPEG \`32.jpg\`) prints these 16 numbers, with **3299 in red**:

| | | | |
|---:|---:|---:|---:|
| 3258 | 3222 | 3152 | 3038 |
| 3278 | **3299** | 3298 | 2838 |
| 3288 | 3294 | 3296 | 2472 |
| 4516 | 1206 | 708 | 1820 |

The 16 entries are **all exactly** explained by one indexed-prime construction. Define \`p_k\` to be the kth prime, \`F_n\` the nth Fibonacci number with \`F_0=0\`, \`F_1=1\`, and \`a_n=abs(3301-p_(F_n+1))\`. Retain the **first 16 distinct Fibonacci values** (the value 1 occurs at both F1 and F2), calculate their corresponding primes, and place the resulting \`a_n\` values in a **clockwise outward spiral**, starting at row 2, column 2 (the red 3299). The full readout is:

| Spiral position | Unique Fibonacci number | Prime ordinal | Actual prime | \`abs(3301-prime)\` |
|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 2 | 3299 |
| 2 | 1 | 2 | 3 | 3298 |
| 3 | 2 | 3 | 5 | 3296 |
| 4 | 3 | 4 | 7 | 3294 |
| 5 | 5 | 6 | 13 | 3288 |
| 6 | 8 | 9 | 23 | 3278 |
| 7 | 13 | 14 | 43 | 3258 |
| 8 | 21 | 22 | 79 | 3222 |
| 9 | 34 | 35 | 149 | 3152 |
| 10 | 55 | 56 | 263 | 3038 |
| 11 | 89 | 90 | 463 | 2838 |
| 12 | 144 | 145 | 829 | 2472 |
| 13 | 233 | 234 | 1481 | 1820 |
| 14 | 377 | 378 | 2593 | 708 |
| 15 | 610 | 611 | 4507 | 1206 |
| 16 | 987 | 988 | 7817 | 4516 |

In particular, the final **1206** and **4516** arise because the two largest primes exceed 3301, requiring the *absolute value* of the difference. The highlighted center supplies the unambiguous visual starting point. Each of the sixteen values, their precise spatial order, and the 3301 reference point are explained without free per-entry choices.

**Interpretation:** this is a precise, clue-derived prime-selection mechanism with a Fibonacci index schedule and an explicit spiral reading order. It supplies viable mathematical material for constructing or recognizing a cipher key. It does **not** demonstrate that these integers are an LP2 keystream or distinguish all possible uses of the clue.

## Consequences for key material: bounded negative decryption screens

The exact numerical construction supplies two natural but distinct cryptographic interpretations. Both have been tested on the original ciphertext without fitting an unknown key.

**A periodic 16-rune additive pad:** Five fixed integer streams taken from the square and its construction (clockwise values, prime values, prime ordinals, printed row-major values, reverse clockwise values), each at all 16 cyclic offsets and both signs modulo 29, give **160 configurations per interval**:

| LP2 interval | Ciphertext runes | Raw IoC | Best deciphered IoC |
|---|---:|---:|---:|
| Page 16, directly after square | 267 | 0.033539 | **0.036045** |
| Pages 16–22 concatenated | 1,744 | 0.034510 | **0.034776** |
| All unsolved pages 0–55 | 12,956 | 0.034478 | **0.034574** |

The original test re-encrypts and precisely recovers 251 actual solved LP1 GP runes using the selected test pad, verifying that the direct operation is reversible. Its longer real-LP2 scores remain near the uniform-rune IoC baseline 1/29.

**A 256-bit secret from the sixteen printed values:** Each square number occupies at most 16 bits; serializing all sixteen as 16 unsigned 16-bit fields produces **exactly 32 bytes**, a natural AES-256 or ChaCha20 key. The added [clue-derived key test](../sims/fibonacci_spiral_key_derivation.cjs) explores 32 fixed seed variants (absolute square values, underlying prime numbers, prime ordinals and Fibonacci numbers, either spiral or row-major, big- or little-endian, raw or SHA-256 hashed). Each is passed through an existing AES-256-CTR/ChaCha20/RC4 rune pad implementation at alternate page IVs, drop offsets, byte-to-rune mappings and signs. This yields **2,432 configurations per interval**, with one key draw for each ciphertext rune and page-reset alignment.

| LP2 interval | Best key-masked IoC across 2,432 tests |
|---|---:|
| Page 16, 267 runes | 0.0390865 |
| Pages 16–22, 1,744 runes | 0.0351767 |
| Entire 12,956-rune unsolved corpus | **0.0345751** |

A planted GP-English-like corpus encrypted under the literal **clockwise absolute-values 32-byte big-endian key**, AES-256-CTR and an 81% adjacent-repeat rewrite, is correctly recovered as the **top candidate**, IoC **0.0654700**. The real ciphertext shows no corresponding nonuniform distribution or readable plaintext under this prescribed aligned-key family. More complicated key skips, changed mapping, other serialization and mixed encryption layers remain untested.

**The numeric table as an AES-256 payload:** A separate [binary-grid test](../sims/fibonacci_square_grid_payload.cjs) asks whether the very same clue-derived 32-byte keys decrypt the 256-byte base-60 table on pages 49–51. It tests 36 raw or hashed square-derived AES-256 keys, five physical grid readout layouts, ECB/CBC/CTR/CFB/OFB and four IV choices where applicable, for **3,060 configurations**. Top printable-byte output is only **128/256**, and the highest count of low-range 0–28 GP-index bytes is **48/256**; no candidate resembles plaintext or a self-evident serialized rune message. A genuine AES-256-CBC 256-byte English plant decrypts exactly, with **256/256 printable bytes**. These are recognizability screens and cannot exclude a second encryption layer or a binary plaintext with no recognizable header.

**Conclusion:** The square is a genuine, precisely derived mathematical clue with potential cryptographic significance. Its simple periodic-pad, natural 32-byte stream-key, and direct AES-256 grid-payload interpretations have produced no actual LP2 decryption. Selection over large finite test families is accounted for in their descriptive scope; isolated short-window maxima are not recognized as hits.

## Reproduction and next attack

Run \`node sims/fibonacci_prime_spiral.cjs\` with Node.js 22 at repository root. Inputs: \`resources/transcriptions/liber_primus_master.txt\`, \`resources/liber-primus/lp2-corpus.json\`, and \`sims/authentic_lp1_p03_p04_vigenere_recovery.cjs\` for recovered LP1 plaintext. The code uses exact integer prime/Fibonacci generation, parses the square from the master transcript, constructs the spiral coordinates, asserts 16/16 equality, and executes all 160 candidate-key tests per span. Original-image visual reference: \`resources/liber-primus/32.jpg\`. The nearby red heading and square are visible directly in that scan.

**Most useful next step:** constrain the manuscript's use of the Fibonacci-indexed primes from independent image/text evidence. Once a particular stream, key-length convention, or transformation is specified, attack the ciphertext immediately following page 15 and demand a second independently predicted interval. Do not promote one of the many possible number-to-key transforms based on an isolated short readable output.
