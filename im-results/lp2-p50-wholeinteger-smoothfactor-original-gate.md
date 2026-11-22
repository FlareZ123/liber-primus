# P50 whole-table integer: a source-specific small-factor registration, not a decoder

**Decision (22 November 2026, Agent42).** Interpreting the 256 two-character entries printed across physical LP2 p49–p51 as conventional-base60 byte values in original row-major order gives a 2048-bit integer with an unusually large complete small-prime factor. This observation strengthens a possible number-theoretic reading of the table but does **not** decrypt LP2, disclose a key, or select a cipher operation. It is provisional arithmetic evidence, retained here rather than in the authoritative `results/` synthesis.

## Original input and exact result

Input: `resources/liber-primus/lp2-grid-256.json`, cross-checked there against source JPEGs `66.jpg`–`68.jpg`. The table is 32 printed rows, eight entries per row, spread over physical pages p49, p50 and p51; physical p50 itself has no runes. Let `b[0..255]` be the 256 conventional-base60 bytes, with source order preserved. Read the big-endian integer

`N = sum_{i=0}^{255} b[i] * 256^(255-i)`.

The complete prime factorization of `N` below one million is:

`2^4 * 3^3 * 7 * 13 * 29 * 179^2 = 36,528,277,968`.

The complementary cofactor `Q=N/36,528,277,968` has exactly 2013 bits, has no prime divisor at most 1,000,000, and is **composite**, as witnessed by `2^(Q-1) mod Q != 1`. This is a partial factorization. No efficient method for fully factoring the 2013-bit cofactor has been established.

For context, 29 is the GP alphabet size, 13 is the manuscript's conspicuous dotted-mark length, and **p53 uniquely contains 179 runes** among rune-bearing unknown pages. The `179^2` observation was already mentioned in `results/README.md`; the full small-factor inventory and the bounded smooth-factor comparison are recorded here as a consolidated decision. The associations to 13, 29 and 179 could be postselected.

## Exact alternative-readout gate

Twelve finite byte interpretations were compared: the literal base60 reading and a base59 reading omitting `f` from the digit alphabet, each in six fixed physical orders: row-major, complete reversal, column-major, complete reversal of that, reversal inside each eight-byte printed row, and reversal of the 32 printed rows. Only **base60 row-major** is divisible by the **full** factor product 36,528,277,968. Since the factor product was selected by factoring that very reading, this uniqueness **does not independently establish that the authors selected the reading**.

A distinct mathematical dependence also matters. With `P(x)` the original 256-byte polynomial written high coefficient first, `256 ≡ 24 (mod 29)`, hence `N ≡ P(24) (mod 29)`. The observed factor 29 and the table's previously reported root at x=24 are **the same congruence**, and cannot be counted as two independent confirmations. The independently documented **double** root includes the additional `P'(24)=0` constraint, which is not implied merely by 29 dividing N.

## Exploratory null and failed direct receiver

A fixed-seed (3301) 1,000,000-draw simulation of the exact independent geometric prime-adic valuation law for all 41 primes up to 179 gave **185/1,000,000** random integers whose complete 179-smooth component has at least the original's 35.08829469 bits. This is a useful exploratory magnitude check for *any* small-prime product of this size; it is **not** a discovery-wide p-value. Inspection of the original number selected both the factorization and the prime bound, and the exercise investigated multiple numeral conventions and earlier numerical leads. The reference null assumes an independently uniformly random sufficiently large integer, which no historical source promises.

As a small direct plaintext check, encode `N` itself and `Q` in ordinary most-significant-first GP29 digits. The resulting lengths are **422** and **415** GP digits, and symbol coincidence indices are about **0.03534** and **0.03413**, respectively. Both look ciphertext-like, without a coherent unkeyed plaintext readout. There is no authenticated instruction to use either resulting stream as a page key.

## Decision for future cryptanalysis

Do not run an unbounded factoring campaign or tune GP29 pads to this arithmetic. A productive successor needs a **source-authenticated operation or receiver** connecting factor values, their exponents or the whole-number quotient to a specific original LP2 ciphertext interval. The cheap decisive test would preserve that externally selected rule, decode every rune of a previously fixed interval and reconstruct it by the inverse operation. If no such rule appears, treat this factorization as a mathematical source curiosity rather than an unlocked message.

**Single-file reproducer:** [`sims/lp2_p50_bigint_smallfactor_sft.cjs`](../sims/lp2_p50_bigint_smallfactor_sft.cjs), Node.js 22, read-only, fixed-seed simulation and original-input assertions.
