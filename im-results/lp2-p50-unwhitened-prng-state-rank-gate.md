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

## All secret seeds and all fixed byte slices of four period-relevant LCGs

An ordinary historical script might take **high bytes** rather than low bytes from a congruential generator. The preceding affine-byte-LCG equation alone does not reject that. The exact [full hidden-state recovery SFT](../sims/lp2_p50_allbyte_lcg_state_recovery_sft.py) therefore broadens the original literal-table test to **every contiguous eight-bit slice** of each of four fixed, common LCG recurrences, with the hidden seed/state entirely unknown:

| Generator | Exact recurrence, modulus | Eight-bit slices tested | Original printed byte streams | Total exact seed-independent gates |
| --- | --- | ---: | ---: | ---: |
| Java Random / drand48 | a=0x5DEECE66D, c=11, modulo 2^48 | 41, shifts 0–40 | 4 | **164** |
| ANSI C / glibc TYPE_0 LCG | a=1103515245, c=12345, modulo 2^31 | 24, shifts 0–23 | 4 | **96** |
| MSVC rand() state | a=214013, c=2531011, modulo 2^32 | 25, shifts 0–24 | 4 | **100** |
| Numerical Recipes LCG | a=1664525, c=1013904223, modulo 2^32 | 25, shifts 0–24 | 4 | **100** |
| **Total** | | **115 distinct slice laws** | **4 source-natural readings each** | **460** |

These include high-bit extraction in Java's `nextInt(256)` and Perl's `int(drand48()*256)`, MSVC's conventional `rand()%256` (state bits16–23), and raw low-byte LCG outputs. Even where the full generator has a 48-bit state, an observed output slice at bit-offset s depends only on the state **modulo 2^(s+8)**. That projected lower state follows the *same* affine congruence. This is an exact algebraic reduction, so testing all 41/24/25/25 slices truly covers **all original seeds** under these output contracts.

**Exact state recovery instead of seed sampling.** For a fixed slice shift s, write Q=2^s, M=256Q, and LCG law `x_{i+1}=a*x_i+c mod M`. Observing original byte y_i constrains `y_i Q ≤ x_i < (y_i+1)Q`. Since `x_i=a^i x_0+b_i mod M`, the first eight outputs are an affine-lattice bounded-distance problem. Construct the eight-dimensional integer row lattice with basis

`[1,a,a²,...,a⁷]` (mod M), followed by `M*e_1, ..., M*e_7`.

LLL reduction preserves the full lattice; the implementation **proves its determinant |det|=M^7 and checks each reduced row's modular membership**. It then enumerates *every* lattice point inside the circumscribed sphere of the eight independent observed-byte intervals. Gram-Schmidt coefficients, squared distances, branch bounds and final state checks all use **exact integer/Fraction arithmetic**, with conservative integer-square-root enumeration bounds. Because every true generator state necessarily lies inside the cube, **zero points found is an all-key impossibility certificate**, independent of LLL's approximation quality. There is no inference from failing to find a seed with a heuristic nearest-plane search.

For every original source radix/order and every one of the **115** laws, the exact search finds **zero states consistent with even the first eight printed bytes**. Consequently no complete 256-byte stream can match. Twenty deliberately generated states (five separated shifts per generator) all recover their complete first eight and reproduce every planted 256-byte output, exercising low, intermediate and highest extraction slices. The original-input table hashes are asserted in the same SFT. This is a complete bounded negative for the four named **unmodified consecutive-byte** output families; it says nothing about skipped/rejected draws, independent per-column streams, nonlinear postprocessing, other generators or keys.

`drand48` is a strong period-relevant candidate because a historical 2014 Linux/Perl runtime could naturally produce bytes by multiplying a floating `rand()` draw by256. These original-data gates exclude that **literal** answer and its simple fixed-byte-slice alternatives without trying any passwords or rune ciphertext scoring. The distinguishing next step would be source evidence for a nonliteral table-to-keystream operation.

## Independent 32-byte column seeds: a stronger historical escape route closed

The 32×8 printed table has **eight exactly 32-byte columns**, which could supply **eight independently seeded chapter keystreams**, escaping the continuous 256-byte obstruction. The LP2 rune manuscript independently has eight section terminators through p54; source evidence does not join those sections to the table, nor select a PRNG.

Grant every original column its *own arbitrary secret state* and *its own arbitrary fixed output byte-slice offset* from one of the four historically plausible LCG families above. For each top-to-bottom 32-byte column and each of both original base60/base59 readings, recover every possible hidden state from its first eight authentic bytes using the certified bounded-distance lattice enumerator. This yields **2 radices × 8 independent columns × 115 exact generator/slice laws = 1,840 separate all-key original tests**, with no restrictions shared between columns.

| Generator | Independent original-column tests | States fitting first 8 original bytes | Complete 32-byte states |
| --- | ---: | ---: | ---: |
| Java/drand48 | 656 | **0** | **0** |
| glibc TYPE_0/ANSI | 384 | **0** | **0** |
| MSVC | 400 | **0** | **0** |
| Numerical Recipes | 400 | **0** | **0** |
| **Total** | **1,840** | **0** | **0** |

Every one of these original column streams therefore fails its direct historical LCG-output model even under a separate arbitrary generator seed. Each candidate contradicts at least one of its first eight bytes. **32 planted entire-column positive tests** (eight different seeds per family) all recover the original hidden state and re-output all 32 bytes, in addition to the earlier full256 controls. Combined with the 460 continuous stream gates, the original panel now rules out **2,300 exact source-order, all-secret byte-output contracts**, without language scoring or password guessing.

This leaves cryptographic DRBG, independent nonlinear column transforms, skipped outputs, shuffled bytes, or original numbers used as *seeds*, ciphertext, or addresses. The required original instruction to turn these bytes into LP2 plaintext remains unidentified.

## Reproduce and research decision

[Read-only Node.js 22 single-file SFT](../sims/lp2_p50_unwhitened_prng_state_rank_sft.cjs). Run it from the repository with Node.js 22; it reconstructs the original row/column streams, asserts the SHA-256 hashes of both radix readings, performs exact GF(2) elimination and the all-secret recurrence tests, and requires three independent positive plants to pass. It writes no files. The same calculations and plants passed locally on Node.js 22.16.0 using the source-token-identical fixture; the repository script reads the authoritative 256-cell JSON directly.

The most direct recovery route, **recognize p50 as 256 consecutive unmodified outputs of a small binary-linear, additive 31/3, or one of four fixed historical LCG generators, recover the state, and extend a candidate pad**, is excluded for the specified source-natural readings. Avoid revisiting these exact families through larger seed sweeps. The independent Python 3/SymPy 1.14 [all-slice exact-state SFT](../sims/lp2_p50_allbyte_lcg_state_recovery_sft.py) operates directly on the same source and passed locally under Python 3.13.5 with 20 planted generator states and all 460 original cases; it writes no files. A potential next decoding route needs an independently signaled output transformation, a nonlinear generator/KDF, a distinct table ordering, or an external clue explaining how the bytes become a reversible rune key. The panel may instead be ciphertext, fixed numerical navigation data, or a cryptographic random source. This result does not exclude such interpretations and does not alter the established unsolved status of LP2.
