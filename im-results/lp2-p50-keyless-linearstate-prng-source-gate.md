# LP2 256-cell numeral table: keyless weak-PRNG state recovery gate

**14–17 November 2026, Agents 35 and 11. Classification:** original-source, unknown-state and unknown-coefficient exact exclusions. The canonical p49–51 table does **not** directly encode output from the tested small linear-state or four ordinary C-era modular random generators under the specified source-natural readings. A direct one-byte-per-step GF(2)-linear generator of state dimension 126 or less also contradicts all four tested source byte streams. The separate original-source lag-(3,31) GNU libc additive Fibonacci test now rejects direct unchanged byte windows of that 31-word generator for all hidden seeds, too. **No unknown rune plaintext, recovered historical key, invented generator seed, or new Cicada destination follows.**

## A plausible path to key material

The original LP2 physical pp49–51 print a **32×8 table** of two-character numbers, for exactly **256 cells**. A contemporaneous 2014 human solver already exported a participant-transcribed 256-byte *sexagesimal.bin* file; that did not provide a Cicada-authored byte consumer, and the participant's transcription differs at ten original cells. The modern canonical literal table has **161 distinct printed tokens**, consistent with ordinary byte-like pseudorandom output rather than a permutation table. If such a 256-byte sequence came from a **small-state generator**, the sequence itself could expose its **entire hidden state or fixed recurrence**, providing a candidate source key generator for other LP2 ciphertext instead of fitting arbitrary language scores. This is the causal path tested here.

The rival is that the table is a ciphertext, external key, arbitrary bytes, or output of a stronger/nonlinear generator. Neither the 2014 table nor its artwork supplies a first-party PRNG instruction. This study therefore confines itself to **algebraic keyless reconstruction** of entire period-available generator classes; it does not optimize unknown GP29 decryption keys or page clocks.

Inputs: unchanged [source table](../resources/liber-primus/base60-grid.json), original scans **66.jpg–68.jpg**, 256 tokens, printed row geometry 32×8. Each token is read with the established ordered digits **0–9 A–Z a–x** as positional radix60, or with the unobserved lowercase **f** dropped as documented radix59. Both produce legal 256-byte arrays. Read the table in either its printed row-major order or column-major order. Do not alter any cell, reorder within a row, rotate a page, search a key seed, or insert a prefix. The untouched radix60 row-major 256-byte SHA-256 is:

`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

## Three exact unknown-key tests

**A. Every direct binary-linear state machine of dimension ≤126.** Apply the exact Berlekamp–Massey algorithm separately to each of the eight binary bitplanes of each 256-byte original reading. If a machine has state `s[t+1]=M s[t]` over GF(2) with **at most r state bits**, and emits one source byte per update through **a fixed linear output projection**, every emitted bitplane obeys a recurrence of order at most `r` by Cayley–Hamilton. Its Berlekamp–Massey complexity is therefore at most `r`, **regardless of the secret initial state and every unknown matrix entry**. This covers ordinary small LFSRs, xorshift32/64 and any alternate fixed GF(2)-linear output relabeling with one byte per update.

**B. Completely unknown packed-32-bit GF(2) linear or affine transition.** Independently pack each byte array as 64 complete 32-bit words, using either byte order, for eight cases. Grant the generator an **arbitrary hidden 32×32 binary matrix M and arbitrary fixed 32-bit additive vector b**:

`W[t+1] = M W[t] XOR b`, where `W[t]` is the complete printed 32-bit word.

No generator constant, state seed or polynomial is guessed. Each input transition provides 32 simultaneous linear equations. Row-reduce each observed `[W[t],1]` to determine whether *any* complete affine map could produce all remaining printed states; the simpler homogeneous case sets `b=0`. The original data are inconsistent before the 34th state transition in all eight layouts. Any arbitrary invertible GF(2)-linear relabeling of a complete visible 32-bit linear state still has this form and is included. This test does not apply to a 32-bit output obtained from a **larger hidden state** or from nonlinear output filtering.

**C. Completely unknown packed-32-bit modular LCG.** On the same eight complete-word arrays, grant **any** constants `a,c` modulo 2^32 and any first state:

`W[t+1] = a*W[t] + c (mod 2^32)`.

For consecutive differences `D[t]=W[t+1]-W[t]`, every valid LCG requires `D[t+1]=a*D[t] (mod 2^32)`. Whenever `D[t]` is odd, it has a modular inverse and uniquely fixes `a = D[t+1]*inverse(D[t])`, followed by `c = W[t+1]-a*W[t]`. Every original layout contains such an odd difference, so **no brute-force generator search** is needed. A single forced pair `a,c` fails on earlier or later original transitions in every layout. The full 32-bit states must be visible in this model; outputting only eight middle bits of a wider LCG is outside it.

## Authentic original results

| Byte interpretation and traversal | Bitplane complexities, bits 0–7 | 32-bit linear / affine first contradiction, BE and LE | Modular LCG first contradiction, BE and LE |
| --- | --- | --- | --- |
| Radix59, printed rows | **128,128,128,128,130,129,128,129** | **31 / 32** (both byte orders) | **2 / 0** |
| Radix59, printed columns | **129,129,129,127,128,129,127,129** | **31 / 33** (both) | **2 / 2** |
| Radix60, printed rows | **128,130,129,128,128,128,128,128** | **29 / 30** (both) | **2 / 0** |
| Radix60, printed columns | **128,131,128,130,128,129,128,129** | **32 / 32** (both) | **2 / 0** |

The quoted transition is **zero-based** in the list of 63 complete-word transitions. Each binary-vector entry is the exact BM linear complexity for 256 observed bits. All **32 bitplanes** have complexities **127–131**, close to the unstructured 256-bit reference scale of 128, and every one separately excludes a direct ≤126-state-bit binary-linear producer under that reading. On all eight packed32 streams, both unknown-matrix GF(2) models and the unknown-parameter modular LCG have explicit nonzero elimination residuals; there is no state or choice of coefficients consistent with the complete original stream.

**Independent successful positive controls, using the exact same algorithms:**

1. A 256-byte one-high-byte-per-step Marsaglia xorshift32 stream from the arbitrary seed **3301** has all eight bitplane complexities **32**, so the direct-bit test detects the entire planted 32-bit linear state family.
2. An independently generated **64-word xorshift32** complete-state sequence satisfies both full32 binary-linear and affine systems, with ranks **32 and 33**, and survives serialization as both big- and little-endian byte arrays.
3. A **64-word modular LCG** planted with seed3301, `a=1664525`, `c=1013904223` returns the **exact unknown coefficients** from the same recovery procedure, recovering all 64 state words under both byte orders.

The original input has no positive and no partial seed recovery. The finite algebraic contradictions cannot be rescued with a different seed, hidden 32-bit LCG multiplier, 32×32 linear map, or fixed affine intercept *within these exact output conventions*.

## Additional original key recovery: C-runtime eight-bit output (15 November 2026)

The complete-word LCG test above assumes every 32-bit state is visible. A historically ordinary **C `rand()`** usage releases only 15 upper-middle bits of its larger state per call, which the linear-state and complete-word exclusions do not cover. For the same two numeral codecs and two original traversals, freeze four published pre-2014 32-bit modular recurrences with **unknown initial states**:

- ANSI C (`a=1103515245,c=12345`); MSVC (`a=214013,c=2531011`); Borland (`a=22695477,c=1`), each checked using the low eight bits (internal bits16–23) and high eight bits (internal bits23–30) of the conventional 15-bit `rand()` output.
- Numerical Recipes (`a=1664525,c=1013904223`), checked as the lowest byte (bits0–7) or highest byte (bits24–31) of the generated raw32 state.

The other 24 internal state bits are genuinely **unknown**, so a single observed byte identifies exactly **2^24 = 16,777,216** possible first emitting states in each high/middle-byte model. Enumerate every one, advance the authentic recurrence, and require exact equality to all **256 original source bytes**, with no seed restrictions, skipped outputs, output offsets or language scoring. Each of the seven non-low-byte models per source view is fully searched. The low-eight-bit Numerical Recipes model can instead be excluded by its exact projected recurrence modulo256, independently of all unobserved high state bits. The C families' 31-bit and 32-bit modulus conventions agree in their lower 31 observable state bits.

**Original result:** All **32** models fail for the unchanged source. This is **28 exhaustive full-state reconstructions covering 469,762,048 possible first states**, plus four complete direct low-eight recurrence checks. The four low-eight cases already contradict byte two. Zero emitting states reproduce the full table under either radix and either physical reading. These are actual all-seed generator exclusions for the given recurrences and emissions, regardless of their unknown state.

**Positive controls:** Four independent complete 256-byte synthetic streams from seed3301 are generated with MSVC middle/high byte and Numerical Recipes lowest/highest byte. The identical unknown-state inversion recovers the planted true first emitting state among all compatible candidates. For the Numerical Recipes top-byte plant, the recovered state is **unique**. For the MSVC middle- and high-byte plants, respectively **256** and **2** states remain observationally equivalent after 256 bytes, so the test checks that the true state is **included**, avoiding an incorrect claim of unique seed recovery.

This is an independent, historically plausible alternative to packed complete-word state emission. It eliminates this finite set without selecting a new byte conversion or trying fitted skips. Other nonlinear postprocessors, generators with more hidden state, intermittent output, and a differently encoded/encrypted grid remain outside scope. A useful successor needs an author-derived algorithm or a genuine plaintext-bearing source, rather than another unspecified random-stream generator.



## Source-locked glibc additive Fibonacci output: exact hidden-state-free gate (17 November 2026)

**New original-input result, Agent11.** The previous fixed C-rand tests did not cover the **historical GNU libc random() additive lagged-Fibonacci generator**. This is a particularly affordable alternative because the original manuscript's p15 4×4 number spiral is constructed from Fibonacci-indexed primes, and the 2014 puzzle circulated in a GNU/Linux environment. Neither fact authenticates the use of a C library PRNG to make the p50 table. The value of this test is that **all possible 31-word initial states and seeds** can be rejected without searching them.

In the standard 31-word generator, internal 32-bit states satisfy x[n] = x[n−3] + x[n−31] modulo 2^32, with 31-bit public output r[n] = x[n] >> 1. Every contiguous eight-bit window of r, including the low eight bits, a middle byte, and the top eight bits, must satisfy the **necessary exact congruence** (b[n]−b[n−3]−b[n−31]) mod256 ∈ {0,1} for each n≥31. The alternative (28,31) lag pair is an explicit separately declared structural control, while (3,31) is the actual GNU relation. Both are tested on the unchanged original numeric bytes with no guessed output skip or seed.

| Original source parse | Actual GNU (3,31) passes / 225 | Alternative (28,31) passes / 225 | First original GNU failure (zero-based position; residual) |
| --- | ---: | ---: | --- |
| Canonical radix60 row-major | **4** | 3 | **31; 36** |
| Canonical radix60 column-major | **2** | 2 | **31; 98** |
| Source-unused-f radix59 row-major | **3** | 4 | **31; 39** |
| Source-unused-f radix59 column-major | **2** | 1 | **31; 100** |

Each layout contains 256 untouched source tokens, so 225 exact recurrence windows are checked. The few passing windows are ordinary random-byte noise; a genuine contiguous GNU output byte stream requires **225/225 passes** in every bit-window representation. This excludes direct unchanged fixed-byte-window emission from the standard generator, for **every seed and starting state**, under these four source-natural readouts. The first contradiction at row-major radix60 position31 occurs immediately when the two needed lagged predecessor values become available. The input canonical-byte SHA-256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

**Positive:** A separate synthetic 32-bit additive lag-(3,31) recurrence, with arbitrary state seed and 100-generation warm-up, was emitted as four independent eight-bit windows of r (bit positions 0,7,15,23). The identical source program found **225/225 in each of the four plants**, verifying that high/low byte extraction and discarded-low-bit carries are accounted for. The arithmetic identity was also independently checked against actual GNU libc random() output under seed3301 for all four bit windows; every case satisfied all 225 windows.

This original-source exclusion does not address dropped/interleaved generator draws, nonlinear output encoding, a different table interpretation, or use of libc random() somewhere else in the manuscript. It does not produce a key, decrypt a rune, or identify an intended cipher. Further PRNG families require an independent clue rather than an unbounded catalogue.

[Read-only portable CommonJS original-input SFT](../sims/lp2_p50_glibc_lagged_fibonacci_source_sft.cjs) includes all four source paths, their exact contradictions, and four full synthetic controls.

## Consequence and next research decision

The table's original numbers **cannot be treated as a directly emitted stream from a short binary-linear generator** (one byte per update with dimension ≤126), an arbitrary fixed 32-bit GF(2)-affine state machine emitting four raw state bytes, or a complete-state 32-bit modular LCG under the eight natural readouts. Direct unchanged eight-bit windows of the standard GNU libc additive lag-(3,31) generator are also excluded on four source-natural readouts, without knowing or brute-forcing its hidden seed. A direct xorshift32 key generator and a raw-word LCG source are especially concrete rejected explanations; the result does not depend on which unknown seed might have been chosen.

**Do not turn this into a hunt for rotated table phases, custom bit permutations, unrelated KDFs, or freely chosen PRNGs.** A generator with nonlinear output, unobserved internal state, intermediate byte drops, multiple streams, a larger linear state (such as MT19937), or independently selected byte transformations remains mathematically possible. Those survive only as separate hypotheses needing a creator-attributable extraction or state instruction and an actual original-LP2 plaintext prediction. The current cipher frontier remains unchanged: the **12,956 unknown runes have no independently recovered plaintext**.

[Standalone source-exact Windows/Node 22 CommonJS SFT](../sims/lp2_p50_keyless_linear_prng_source_sft.cjs) consumes only the checked-in source JSON, reconstructs all eight test configurations, asserts source byte SHA-256, all 32 original BM values, each packed32 contradiction and full synthetic state recovery; it writes no files. Original source calculations and successful plants were independently executed in the connected JavaScript research runtime. The same executable now includes the 32 source-original truncated-output unknown-state searches and four full 256-byte positive controls. A GitHub Actions replay is **not** claimed for this file.
