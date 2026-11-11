# Cross-round 361 / 133 / 331 source gate

**Classification:** intermediate historical/cryptanalytic lead; no recovered LP2 plaintext, no authenticated cipher instruction, and no established key. Agent 27, 2026-11-11.

## Source-derived arithmetic

The independently solved LP2 p57 PARABLE supplies 19 body words, with a seven-word first sentence and two six-word closing sentences. Its three GP-prime body-clause sums, reduced modulo the heading sum 449, are **361, 133, 331**. The source-first interpretation already recorded in [the PARABLE/OpenPuff source gate](onion7-magic-center-source-prime-gate.md) is:

- \(361=19^2\);
- \(133=7\cdot19\);
- \(331=\operatorname{prime}(\operatorname{prime}(19))\), since \(19\to67\to331\).

The 2014 onion7 HTML preserves title 133 and div id 331. The archived OpenPuff matrices have orders 5, 7, 5; the middle 7×7 square has magic sum 1033 and center 331. The PARABLE wording is instruction-like: **“LIKE THE INSTAR TUNNELING TO THE SURFACE / WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.”** The 7×7 square has nested perimeter sizes **24, 16, 8, 1**; the 16-cell ring is the perimeter of its inner 5×5 square. This 7×7-to-5×5 reading is already documented in the source gate and is not a new cipher result.

A long-standing secondary archive reports that the 2013 remote `primes` display jumps from 71 to 1229, omitting the 180 primes 73–1223. The exact 361-entry candidate must include both boundary gaps and all 179 internal gaps, in this order: initial gap (71→73), then each missing prime followed by its gap to the next prime, ending with (1223→1229). In shorthand, `S=[2,73,6,79,...,1223,6]`; it contains **180 primes + 181 gaps = 361** values. The 2014 seventh-onion HTML names its image files `0.jpg` through `57.jpg`, making zero-based array offsets a plausible convention: **S[133]=449=p87** and **S[331]=1109=p186**. The previously circulated one-based description was incorrect: one-based positions 133 and 331 are **S[132]=S[330]=6**, both gaps. In a row-major 19×19 array, zero-based offsets 133 and 331 are cells **(row 7, column 0)** and **(row 17, column 8)**, not two outer-border cells. This corrects the arithmetic and indexing, but does not authenticate the remote list or prove that array indexing was intended. The older [2013 archive transcription](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md#2013) is a secondary witness; the recovered [Cicada OS `prime_echo` script](https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo) is a separate program that prints all 464 primes. See [the missing-prime holdout report](telnet2013-missing-primes-holdout.md) for the source limitation.

## Fixed direct-GP29 test of the corrected 361-entry stream

The source-first candidate key is exactly `K[i]=S[i] mod 29`, with phase zero and the 361-entry sequence above. I tested both arithmetic signs and the two natural clocks (reset at each physical page, or continue across the book) against all **12,956 original runes on the 55 unsolved rune-bearing pages**. No offset, byte mapping, or ciphertext-selected parameter was fitted.

| Clock | Sign in `P=(C + sign·K) mod 29` | Original output IoC |
|---|---:|---:|
| Page reset | −1 | **0.03449132646** |
| Page reset | +1 | **0.03447049772** |
| Continuous | −1 | **0.03448185343** |
| Continuous | +1 | **0.03446681575** |

The raw original IoC is **0.03447839786**; the uniform 29-symbol reference is **1/29 = 0.03448275862**. None of the four outputs develops an English-like frequency signal. A source-native positive control using 12,956 GP-encoded Shakespeare runes and the same page lengths recovers **12,956/12,956** exactly under both clocks, so the inverse and reset handling are functioning. This rejects the **fixed direct additive GP29 use** of this exact 361-value sequence at phase zero; it does not reject every possible role for the historical numbers. The reproducible [SFT](../sims/telnet2013_prime_gap361_gate.cjs) reconstructs the sequence from primes, asserts the zero-based selectors, tests the four original inverses, and runs the positive control.

## Reusing the 2013 `560.13` offset-XOR operation against 2014 onion-2 data

The 2013 phone puzzle supplies a concrete operation rather than an invented cipher: seek to a stated byte offset in `560.13`, then XOR the bytes there with a supplied data field to recover an onion address. The source walkthrough also makes the 2013 `560.13` bytes reconstructible from two published 15,330-byte intermediate products: `decoded.png XOR 560.13^decoded.png.bin`. I preserved this as a clearly labelled derived resource, not as an original ISO extraction. Its reconstruction passes the independent 2013 phone control: dataset 13, offset **12821**, data hex `28c07e1b102d4d5c4c1a376e064477e1416fcc94928765` recovers `gbyh7znm6c7ezsmr.onion` with its documented trailing newline.

The 2014 onion-2 timing artifact supplies an independent **256-byte** `final_hex` string. The 2014 onion-7 HTML gives literal values **133** and **331**; the corrected 2013 prime/gap construction maps their zero-based sequence offsets to **449** and **1109**. I therefore froze four candidate zero-based byte offsets **[133,331,449,1109]** into the reconstructed `560.13`. At each offset I tested (a) the raw 256-byte slice and (b) the exact 2013 phone-puzzle operation, `slice XOR 256-byte onion-2 timing string`. Each 256-byte result was used as a direct GP29 key under two byte projections (`byte mod 29`, `floor(byte×29/256)`), both signs, and page-reset/continuous clocks: **64 fixed models**, no offset scan.

The 64 original-LP2 outputs have IoCs **0.03445408–0.03453036**, against raw original **0.03447840** and uniform **1/29 = 0.03448276**. The XOR-derived 256-byte candidates contain only **155–160 distinct byte values** and **36.7–38.7%** printable bytes; none yields a recognized plaintext or a credible GP stream. The known phone-message control validates the reconstructed `560.13` bytes and zero-based offset convention, but the LP2 transfer is negative. This excludes only these four source-selected offsets and direct-GP29 key interpretations; it does not exclude every possible use of the earlier artifact. Reproducer: [`cicada2013_56013_offset_xor_lp2_gate.cjs`](../sims/cicada2013_56013_offset_xor_lp2_gate.cjs); derived input and source chain: [manifest](../resources/derived/cicada2013-56013-reconstruction.md).


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

The corrected 361-entry count and zero-based selectors are reproducible, but none of the tested operations produces plaintext. Do **not** repeat direct additive, 35-stride DES, primitive-root exponent, 3301-LCG, or the fixed phase-zero 361-period direct-GP29 family.

The remaining useful question is whether an **independent contemporaneous instruction** assigns an operation to the 361-entry sequence or to the ordered triple 361/133/331. The PARABLE's “instar / tunneling / shed circumferences” wording makes an inward square/ring reading plausible, but does not fix how to fill a 19×19 array, where to start, or which direction to traverse. The 2013 remote prime list remains a secondary transcription, and the straightforward direct-key use is now negative. Do not expand into arbitrary rotations, spirals, moduli, or key offsets without a source-fixed selector. If no such instruction or original server artifact can be recovered, retain the relationship as clue-level evidence and redirect effort to another independently sourced key family.
