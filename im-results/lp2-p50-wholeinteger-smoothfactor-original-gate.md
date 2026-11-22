# P50 missing-F digit, prime-ordinal 179, and whole-table integer

**Decision (22 November 2026, Agent42).** Interpreting the 256 original p49–p51 tokens as conventional-base60 bytes in row-major order gives a 2048-bit integer with an unusually large small-prime factor. **The only missing trailing digit in the complete 60-digit alphabet is lowercase `f`, with numerical index 41; the 41st prime is 179, which is a squared factor of that integer and the unique original p53 rune count.** This gives a new source-visible route to a factor previously selected retrospectively. It remains an *interpretation*: the manuscript does not explicitly say to map an omitted base60 digit to a one-based prime ordinal, and this construction recovers no unknown plaintext.

## Original input and exact result

Input: `resources/liber-primus/lp2-grid-256.json`, cross-checked there against source JPEGs `66.jpg`–`68.jpg`. The table is 32 printed rows, eight entries per row, spread over physical pages p49, p50 and p51; physical p50 itself has no runes. Let `b[0..255]` be the 256 conventional-base60 bytes, with source order preserved. Read the big-endian integer

`N = sum_{i=0}^{255} b[i] * 256^(255-i)`.

The complete prime factorization of `N` below one million is:

`2^4 * 3^3 * 7 * 13 * 29 * 179^2 = 36,528,277,968`.

The complementary cofactor `Q=N/36,528,277,968` has exactly 2013 bits, has no prime divisor at most 1,000,000, and is **composite**, as witnessed by `2^(Q-1) mod Q != 1`. This is a partial factorization. No efficient method for fully factoring the 2013-bit cofactor has been established.

For context, 29 is the GP alphabet size, 13 is the manuscript's conspicuous dotted-mark length, and **p53 uniquely contains 179 runes** among rune-bearing unknown pages. The `179^2` observation was already mentioned in `results/README.md`; the full small-factor inventory and the bounded smooth-factor comparison are recorded here as a consolidated decision. The associations to 13, 29 and 179 could be postselected.


## Missing lowercase f as a bounded prime-ordinal selector

Across all **256 source token second digits**, exactly one symbol of the printed table's conventional 60-character numeral alphabet does not occur: `f`. The alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, so `f` has a **zero-based numerical digit value 41**. The **41st one-based prime** is **179**. Physical p53 (source JPEG 70.jpg) independently contains exactly **179 GP rune symbols**; no other rune-bearing original p0–55 page has that length. Under the already established big-endian/base60 convention, `179²` exactly divides `N`; `179³` does not.

The source-prime chain can then reproduce an existing navigation readout without selecting 179 by factoring a 2048-bit integer first:

1. Source table's only omitted low digit `f` has numeral value **41**; prime ordinal **41** gives **179**.
2. Divide the original integer by `179²`. Its remainder modulo179 is **55**, the independently identified GP0(READ). The quotient has exactly one factor **29**, the GP alphabet size.
3. Divide the quotient by **29** and take its residue modulo179: exactly **113**. This is the **30th prime**.
4. The **30th one-based alphabetic word** of Cicada's authenticated 2016 PGP-signed text is **DIRECTION**. Its previously studied GP0(98) address gives `p50[98]=1C`=72 under base60, selecting the established p0 boundary; the preceding signed word THE maps to p50[20]=102.

The **original number-to-word operations are still not printed instructions**. The omitted lowercase digit and its index are genuine original-table facts, but mapping a base60 digit index to a one-based prime ordinal, stripping 179 twice, stripping 29, and indexing a separate signed 2016 message are **candidate typing choices** recognized after earlier 179/DIRECTION results. The doublet is evidence of an arithmetic alignment, not a cryptographic key, complete inverse, or authentic plaintext.

The omitted-`f` observation has a useful in-artifact control. Under a fixed-seed Fisher–Yates permutation of the *same original 256-byte multiset*, each of **1,000,000** shuffled row-major readings preserves every digit-frequency property, including the missing `f`; exactly **30** have `N mod179²=0`, and **5** have both `N mod179²=0` and `N mod29=0`. The original source satisfies both. These numbers measure alignment relative to this narrow shuffled-order null; selection after examining the original table prevents interpreting them as a discovery-wide p-value. The original 179-adic DIRECTION route and its boundary interpretations already predate this missing-digit observation. This is an additional independent-looking *selector candidate*, not evidence that its historical authors intended the route.

**Reproduce the entire missing-digit-to-DIRECTION route, source-pinned page length and fixed 1-million-shuffle control** with [`sims/lp2_p50_missingf_prime41_selector_sft.cjs`](../sims/lp2_p50_missingf_prime41_selector_sft.cjs). The independent prior numeric route is [documented here](lp2-p15-p53-dh23-179-adic-read-fingerprint.md).


## Full untouched p53 decipherment using the selected table window

The source chain fixes a literal, inexpensive full-page test without fitted key phase: omitted `f` selects **179-rune original p53**, and the signed `DIRECTION` readout gives `GP0(DIRECTION)=98`, whose original p50 token is `1C` (base60 byte **72**). The **179** consecutive table bytes `b[72..250]` fit the whole p53 ciphertext exactly and leave five table bytes unused. For the historically established Cicada 2014 GP29 additive inverse, test

`P[i] = (C_p53[i] - b[72+i]) mod29`, for every `i=0..178`.

The complete original output has **IoC 0.0353399033331241** and no coherent GP-native prose. The opposite-sign control `C+b` has **IoC 0.031636432113489425** and no coherent prose. Both re-encode the original **179/179** rune ciphertext exactly, and an independent solved-p57 native-plaintext plant round-trips **179/179**. These controls establish a functioning cipher implementation; they cannot certify the underlying historical rule. The choice to use consecutive p50 bytes modulo29 as a Vigenère pad is a **hypothesis**, albeit one with source-fixed length, phase and receiver. This negative result closes only that exact cheap consumer, with no phase searches or extra layers.

The full input, output statistics and positive plant are reproducible in [the single-file original-cipher test](../sims/lp2_p50_missingf_prime41_selector_sft.cjs). The five unused bytes are a bookkeeping fact, **not** a new source-proven key or length5 decoding instruction.

## Exact alternative-readout gate

Twelve finite byte interpretations were compared: the literal base60 reading and a base59 reading omitting `f` from the digit alphabet, each in six fixed physical orders: row-major, complete reversal, column-major, complete reversal of that, reversal inside each eight-byte printed row, and reversal of the 32 printed rows. Only **base60 row-major** is divisible by the **full** factor product 36,528,277,968. Since the factor product was selected by factoring that very reading, this uniqueness **does not independently establish that the authors selected the reading**.

A distinct mathematical dependence also matters. With `P(x)` the original 256-byte polynomial written high coefficient first, `256 ≡ 24 (mod 29)`, hence `N ≡ P(24) (mod 29)`. The observed factor 29 and the table's previously reported root at x=24 are **the same congruence**, and cannot be counted as two independent confirmations. The independently documented **double** root includes the additional `P'(24)=0` constraint, which is not implied merely by 29 dividing N.

## Exploratory null and failed direct receiver

A fixed-seed (3301) 1,000,000-draw simulation of the exact independent geometric prime-adic valuation law for all 41 primes up to 179 gave **185/1,000,000** random integers whose complete 179-smooth component has at least the original's 35.08829469 bits. This is a useful exploratory magnitude check for *any* small-prime product of this size; it is **not** a discovery-wide p-value. Inspection of the original number selected both the factorization and the prime bound, and the exercise investigated multiple numeral conventions and earlier numerical leads. The reference null assumes an independently uniformly random sufficiently large integer, which no historical source promises.

As a small direct plaintext check, encode `N` itself and `Q` in ordinary most-significant-first GP29 digits. The resulting lengths are **422** and **415** GP digits, and symbol coincidence indices are about **0.03534** and **0.03413**, respectively. Both look ciphertext-like, without a coherent unkeyed plaintext readout. There is no authenticated instruction to use either resulting stream as a page key.

## Decision for future cryptanalysis

Do not run an unbounded factoring campaign or tune GP29 pads to this arithmetic. A productive successor needs a **source-authenticated operation or receiver** connecting factor values, their exponents or the whole-number quotient to a specific original LP2 ciphertext interval. The cheap decisive test would preserve that externally selected rule, decode every rune of a previously fixed interval and reconstruct it by the inverse operation. If no such rule appears, treat this factorization as a mathematical source curiosity rather than an unlocked message.

**Small-factor inventory reproducer:** [`sims/lp2_p50_bigint_smallfactor_sft.cjs`](../sims/lp2_p50_bigint_smallfactor_sft.cjs), Node.js 22, read-only, fixed-seed simulation and original-input assertions. **Source-ordinal navigation reproducer:** [`sims/lp2_p50_missingf_prime41_selector_sft.cjs`](../sims/lp2_p50_missingf_prime41_selector_sft.cjs).
