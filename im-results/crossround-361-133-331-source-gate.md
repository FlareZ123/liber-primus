# Cross-round 361 / 133 / 331 source gate

**Classification:** intermediate historical/cryptanalytic lead; no recovered LP2 plaintext, no authenticated cipher instruction, and no established key. Agent 27, 2026-11-11.

## Source-derived arithmetic

The independently solved LP2 p57 PARABLE supplies 19 body words, with a seven-word first sentence and two six-word closing sentences. Its three GP-prime body-clause sums, reduced modulo the heading sum 449, are **361, 133, 331**. The source-first interpretation already recorded in [the PARABLE/OpenPuff source gate](onion7-magic-center-source-prime-gate.md) is:

- \(361=19^2\);
- \(133=7\cdot19\);
- \(331=\operatorname{prime}(\operatorname{prime}(19))\), since \(19\to67\to331\).

The 2014 onion7 HTML preserves title 133 and div id 331. The archived OpenPuff matrices have orders 5, 7, 5; the middle 7×7 square has magic sum 1033 and center 331. The PARABLE wording is instruction-like: **“LIKE THE INSTAR TUNNELING TO THE SURFACE / WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.”** The 7×7 square has nested perimeter sizes **24, 16, 8, 1**; the 16-cell ring is the perimeter of its inner 5×5 square. This 7×7-to-5×5 reading is already documented in the source gate and is not a new cipher result.

A separate historical report describes a 2013 telnet primes display omitting the 180 primes from 73 through 1223. Interleaving those primes with their 179 internal gaps and two boundary gaps gives a **361-entry** candidate sequence. Under the reported one-based convention, positions 133 and 331 select **449** and **1109**. In a row-major 19×19 arrangement those positions are cells (row 7, column 19) and (row 18, column 8), both on the outer border. The nested perimeter lengths of a 19×19 square are **72, 64, 56, 48, 40, 32, 24, 16, 8, 1**; its 7×7 and 5×5 perimeters therefore have the same 24- and 16-cell sizes as the OpenPuff shells.

This is a plausible geometric reading of “shed circumferences,” not proof that the 2013 list was intended as a 19×19 matrix. The 2013 remote-server transcript/binary is not authenticated; the published gap analysis is secondary, and the recovered 2013 ISO prime_echo script prints all 464 primes. See [the missing-prime holdout report](telnet2013-missing-primes-holdout.md) for that provenance limitation.

## A cross-round modular construction was tested

The original p32 contains **121 runes**, and its 121st prime is **661**. The original 2016 image resources/historical/cicada2016-4gq25.jpg is 563×569; those dimensions also equal p32's first-row and first-column GP-prime sums.

Using the 2014 HTML values as base and exponent gives:

\[
331^{133}\equiv566\pmod{661},
\]

exactly the midpoint \((563+569)/2=566\). The base 331 is a primitive root modulo 661, and:

\[
\log_{331}(133)=36,\qquad 36-\log_{331}(331)=35=5\cdot7.
\]

The two unique OpenPuff square orders are 5 and 7. This fixes a candidate permutation of the original 256-byte base60 grid:

\[
G_i'=G_{(54+35i)\bmod256},\qquad 54=566\bmod256.
\]

Because \(\gcd(35,256)=1\), this visits every grid byte exactly once. The construction is source-constrained enough to test, but the assignment of HTML id/title to base/exponent and the use of the resulting permutation as a key remain hypotheses.

## Original-input tests: no plaintext

1. **Direct additive GP29 pad:** the 256-byte permutation, projected by both byte-mod-29 and scaled-to-29 mappings, was tested in both signs with book-continuous and page-reset clocks (8 models). IoCs ranged **0.034453–0.034492**, against the uniform baseline \(1/29=0.034483\). No language recovery.

2. **32 DES keys from the same permutation:** consecutive groups of eight permuted bytes were used as 32 DES keys, one per original 13-dot-delimited fragment. A finite 64-model family covered CTR/OFB, zero/fragment IV, forward/reversed key bytes, direct29/difference28 decoding, two byte projections, and both signs. The best original training score was **−6.08685**, with frozen heldout score **−6.16191**; the no-key scores were **−6.19142 / −6.18533**. The decoded prefix remained nonlinguistic. The synthetic source-native positive control recovered exactly and ranked its true mode first, so the negative is not a broken implementation.

3. **Primitive-root exponent key:** each permuted table byte \(b\) was mapped to \(331^b\bmod661\bmod29\), then tested as a periodic GP29 additive/difference key with both signs and book/page clocks (8 models). The best training score was **−6.16744**, but heldout was **−6.19584**, worse than the no-key heldout baseline. No plaintext. The synthetic control recovered exactly.

The reproducible DES and group-power tests are in [the source-gate program](../sims/crossround_mod661_des35_inverse.cjs), run by [the focused workflow](https://github.com/FlareZ123/liber-primus/actions/runs/42939675680). The direct additive test used the same fixed permutation and is specified above; it was a bounded local check.

## Related historical LCG check

The 2013 selectors' values also satisfy \(1109-449=660=\varphi(661)\), and \(3301=5\cdot660+1\). Modulo 3301, 1109 is a primitive root (order 3300), while 449 has order 1100. This motivated a narrow 2014 onion2 timing-generator check using the affine recurrence \(x_{n+1}=ax_n+c\bmod3301\), with \((a,c)=(1109,449)\) or the reverse.

An exhaustive search over all 3301 states found no exact match to the 256-byte onion2 string under low-byte or scaled-byte output, either output phase. A self-clocked model also required each state to generate a 1–7 five-minute delay and advance by that delay; with the two unobserved bridge intervals constrained to the five published splits, the best candidate matched only **31/112** exact intervals and **2/114** observed bytes. This was an exploratory finite check, not a recovered generator state; it does not justify further parameter or offset sweeps.

## Decision and next useful action

The exact arithmetic is worth preserving as a cross-round structural lead, but none of the tested operations produces plaintext. Do **not** repeat direct additive, 35-stride DES, primitive-root exponent, or 3301-LCG variants.

The highest-value next step for this issue is not another modulus/key-offset search. It is to find an **independent historical instruction** that assigns a concrete operation to 361 or to the ordered triple 361/133/331. In particular, establish whether the original 2013 prime/gap sequence is authentic and exactly ordered, and whether the PARABLE's “instar / tunneling / shed circumferences” language prescribes a specific 19×19 spiral or ring traversal. The row-major 19×19 construction has not matched the OpenPuff square entries or magic sums directly; a spiral should only be tested if an independently motivated source convention fixes its fill and direction. Keep all of this in im-results, not results, until an original-cipher prediction or reproducible plaintext is obtained.
