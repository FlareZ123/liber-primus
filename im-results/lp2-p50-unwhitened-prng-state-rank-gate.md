# LP2 p49–51 byte table: exact all-key obstruction to low-state PRNG continuation

**23 November 2026, Agent 48. Classification:** bounded mathematical exclusion on the original 256-cell numerical panel. No unknown LP2 plaintext, authentic author key, or continuation recovered.

## Why this could have yielded a key

The original p49–51 pages display **32 rows × 8 columns** of two-character numerals, physically split 10/13/9 rows across the three pages. The conserved transcription is [the original-image-adjudicated table](../resources/liber-primus/lp2-grid-256.json). Reading the 256 cells as consecutive bytes under the published base60 alphabet, or the historically motivated omitted-lowercase-f base59 alphabet, gives a natural seed/output object. If this were the directly printed output of a recoverable deterministic PRNG, reproducing its hidden state would permit expansion beyond these 256 bytes, potentially selecting an LP2 keystream.

The tested premise is explicitly **direct and consecutive generation** in either natural printed traversal, row-major or column-major. No cipher key, seed or page ciphertext was used to fit the tests. The resulting conclusions are algebraic: each family has an invariant necessary under **every secret state/key**, so no seed sweep is needed.

## All-secret bit-linear state limit

Consider any fixed, stationary GF(2)-linear state generator with n bits of hidden state:

\[
S_{t+1}=A S_t,\qquad y_t=B S_t\in\mathbb F_2^8.
\]

Its observed byte output produces a block-Hankel matrix with **29 delayed byte observations**, each expanded into eight binary bitplane rows, and **228 consecutive starting positions**. The resulting matrix has **232 rows × 228 columns**:

\[
H_{(i,b),j}=\operatorname{bit}_b(y_{i+j}),\quad
0\le i<29,\ 0\le b<8,\ 0\le j<228.
\]

Each column is a linear projection of the underlying state at time j, hence **rank(H) ≤ n**, independent of the secret initial state, feedback matrix, extraction matrix, or equivalent invertible *binary-linear* whitening. Adding any secret but *fixed* XOR byte constant raises rank by at most one: **rank(H) ≤ n+1**. The choice 29 maximizes the possible rank from exactly 256 observations; it was fixed by the matrix dimensions, before the rank was measured.

The exact original-byte ranks by GF(2) elimination:

| Original interpretation | rank(H) | direct GF(2)-linear state n requires | with fixed affine byte offset n requires |
| --- | ---: | ---: | ---: |
| Base60, row-major | **227/228** | n≥227 | n≥226 |
| Base60, column-major | **228/228** | n≥228 | n≥227 |
| Base59, row-major | **228/228** | n≥228 | n≥227 |
| Base59, column-major | **228/228** | n≥228 | n≥227 |

Thus **every one** of these four original literal readings excludes **every stationary GF(2)-linear byte-output generator with state ≤226 bits**, or ≤225 bits with even an unknown constant byte-XOR offset. In particular, direct xorshift32, xorshift64, xorshift128 and small linear-feedback register streams cannot be a raw output register of the panel. An independently generated **32-bit xorshift** and **128-bit xorshift** each satisfy their respective rank ceilings (≤32 and ≤128), proving that the instrument detects the claimed property when it is present.

The original ranks are consistent with an ordinary random-looking 256-byte object. They do **not** identify a 226-bit key or demonstrate the presence of any generator.

## Two independent direct-byte recurrence exclusions

1. **GNU libc additive random()/rand() style with lags 31 and 3.** Its underlying 32-bit additive state obeys \(S_i=S_{i-3}+S_{i-31}\pmod{2^{32}}\). Taking any fixed eight-bit slice of each consecutive output, including the low byte of libc's 31-bit \`random()\` result or its highest eight bits, necessarily yields \((y_i-y_{i-3}-y_{i-31})\bmod256\in\{0,1\}\). In the exact original panel, only **4/225**, **2/225**, **3/225**, **2/225** of these necessary equations pass (base60 row/column, base59 row/column). **All four fail immediately at index31**. For example, base60 row-major \(y_{31}=133\), \(y_{28}=150\), \(y_0=203\), giving \(133-150-203\equiv36\pmod{256}\), forbidden. A planted 32-bit 31/3 additive generator passes **225/225**. The conclusion excludes unmodified, consecutive fixed-byte-slice outputs under this recurrence, independently of seed. It does not test glibc's alternate type0 state or a generator that skips/mixes outputs.

2. **Any single-byte affine LCG.** For \(y_i=a y_{i-1}+b\pmod{256}\), every possible secret \(a\in[0,255]\) is enumerated and \(b\) is fixed by the first pair. **Zero** pairs reproduce any one of the four complete streams. The exact same test covers the low eight state bits of any higher-word-size LCG with a power-of-two modulus and a fixed affine recurrence. A planted byte LCG is fully recovered.

The specific GNU libc 31/3 recurrence is grounded in its documented default \`random()\` implementation, not inferred from the table: [GNU libc source](https://codebrowser.dev/glibc/glibc/stdlib/random_r.c.html), [Linux manual](https://www.kernel.org/pub/linux/docs/man-pages/book/man-pages-6.10.pdf). The direct-byte premise is still unverified by the puzzle.

## Reproduce and research decision

[Read-only Node.js 22 single-file SFT](../sims/lp2_p50_unwhitened_prng_state_rank_sft.cjs). Run it from the repository with Node.js 22; it reconstructs the original row/column streams, asserts the SHA-256 hashes of both radix readings, performs exact GF(2) elimination and the all-secret recurrence tests, and requires three independent positive plants to pass. It writes no files. The same calculations and plants passed locally on Node.js 22.16.0 using the source-token-identical fixture; the repository script reads the authoritative 256-cell JSON directly.

The most direct recovery route, **recognize p50 as the first 256 consecutive unwhitened bytes of a small linear or 31/3 additive PRNG, recover the state, extend a candidate pad**, is excluded for the specified source-natural readings. Avoid revisiting these exact families through larger seed sweeps. A potential next decoding route needs an independently signaled output transformation, a nonlinear generator/KDF, a distinct table ordering, or an external clue explaining how the bytes become a reversible rune key. The panel may instead be ciphertext, fixed numerical navigation data, or a cryptographic random source. This result does not exclude such interpretations and does not alter the established unsolved status of LP2.
