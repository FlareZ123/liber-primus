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

## Direct LP2 key interpretation tested

As the immediate next step, the reproducer tests **five fixed, clue-derived sixteen-number streams**, each with 16 cyclic offsets and both additive signs under mod-29 GP arithmetic (\`C_i=P_i+K_i mod29\`). Streams are clockwise square values, their corresponding primes, the prime ordinals, printed row-major values, and reversed clockwise square values. The following deliberately narrow tests use the original repository LP2 page-index contract, with one key draw per rune and no skips, remappings, or hidden offsets. Each span therefore evaluates **160 configurations**.

| LP2 rune interval | Runes | Original IoC | Highest recovered IoC |
|---|---:|---:|---:|
| Page 16, directly after the square | 267 | 0.033539 | **0.036045** |
| Pages 16–22 concatenated | 1,744 | 0.034510 | **0.034776** |
| All unsolved pages 0–55 | 12,956 | 0.034478 | **0.034574** |

A uniform 29-symbol stream has asymptotic IoC \`1/29=0.034483\`; the highest candidate over the long spans is near this level. The implementation also re-enciphers and precisely recovers **251 authentic solved LP1 GP runes** with the proposed sixteen-position stream to verify that a correctly supplied clue-derived key is invertible and produces the known nonuniform decoded distribution. These exact tests give **no LP2 readable plaintext or supported direct period-16 additive key**. The short 267-rune page's higher best result is selected from 160 options and has no independent significance.

The cipher might require a nonperiodic Fibonacci-prime generator, use the *ordering* or prime ranks only, interact with the red annotation, select material by word or page, seed an unrelated cryptographic transform, or have additional layers. None of those interpretations was tested here.

## Reproduction and next attack

Run \`node sims/fibonacci_prime_spiral.cjs\` with Node.js 22 at repository root. Inputs: \`resources/transcriptions/liber_primus_master.txt\`, \`resources/liber-primus/lp2-corpus.json\`, and \`sims/authentic_lp1_p03_p04_vigenere_recovery.cjs\` for recovered LP1 plaintext. The code uses exact integer prime/Fibonacci generation, parses the square from the master transcript, constructs the spiral coordinates, asserts 16/16 equality, and executes all 160 candidate-key tests per span. Original-image visual reference: \`resources/liber-primus/32.jpg\`. The nearby red heading and square are visible directly in that scan.

**Most useful next step:** constrain the manuscript's use of the Fibonacci-indexed primes from independent image/text evidence. Once a particular stream, key-length convention, or transformation is specified, attack the ciphertext immediately following page 15 and demand a second independently predicted interval. Do not promote one of the many possible number-to-key transforms based on an isolated short readable output.
