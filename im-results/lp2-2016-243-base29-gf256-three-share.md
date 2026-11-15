# First-chapter 3×243 BASE29 byte-domain Shamir reconstruction

**15 November 2026, Agent26. Result: two original-byte inverses are nonlinguistic; no authentic LP2 plaintext or key recovered.** This narrows a materially different byte-oriented interpretation of the earlier three-share hypothesis. It is not an additional cipher layer supported by a Cicada instruction.

## Why this particular operation is a plausible human experiment

The first three original encrypted physical LP2 pages contain **262+266+201=729** GP29 runes. The authenticated 2016 Cicada message contains **HELLO** and **LIBER**, both having GP prime sum **243**, so the first chapter can be split into **three 243-digit registers**. A historical Cicada stage also used multi-share reconstruction, and the signed 2013 BASE29 example provides a direct route from 29-symbol sequences to integers and binary.

That supplies a finite binary alternative to [the previously closed all-secret GF29 pointwise three-share test](../sims/lp2_2016_signed243_firstchapter_three_share_sft.cjs). The 2016 message does not literally instruct the 243-way split, the byte width, or the use of 2014 Shamir sharing. Those assumptions remain provisional.

## Exact executable candidate

Read the unchanged original p0–p2 GP-index tape. Freeze the only two simple chapter layouts: **consecutive** 243-rune slices, or **interleaved** columns of every third rune. Interpret each 243-digit slice as a single most-significant-digit-first BASE29 integer, then serialize to **148 big-endian bytes** with left-zero padding. This width fits any 243-digit base29 integer without losing information.

For a 3-of-3 quadratic Shamir sharing over GF(256) at known evaluation points x=1,2,3, the recovered constant term has a particularly simple exact form: **P = S1 XOR S2 XOR S3**. This is because 1 XOR 2 XOR 3=0 and the same identity holds for their squares. The algorithm therefore has no share coefficients to fit after the grouping is fixed. The reproducer constructs 148 known synthetic plaintext bytes, evaluates independently varying GF256 quadratic polynomials at x=1,2,3 under AES's field polynomial, and recovers **148/148** bytes exactly.

| Original 729-rune layout | Recovered bytes | Printable ASCII controls | First 16 recovered bytes (hex) |
| --- | ---: | ---: | --- |
| Three consecutive 243-digit tapes | 148 | 56/148 | \`08db7ed2fd4dedbc5a38fe50ad34e53f\` |
| Three interleaved 243-digit tapes | 148 | 54/148 | \`03948b8bb1e3c1fc008b3f98e3229cc7\` |

Neither result begins with GZIP, bzip2, PNG, ZIP or PDF magic, nor with a valid high-bit-set OpenPGP packet header. Neither output is clear ASCII prose, and neither provides a source-labelled file or identifiable key. The byte counts and exact 32-byte prefixes are asserted directly from unchanged original runes in the [Windows Node 22 standalone reproducer](../sims/lp2_2016_243_base29_gf256_three_share_sft.cjs).

## Decision

Retire **only the two frozen BASE29 big-endian/GF256 x=1,2,3 constructions as direct clear-text or recognized file transports**. Arbitrary encrypted binary could look equally random, so neither byte stream is a proof that no three-share algorithm could exist. In particular, this result does not alter the stronger but distinct GF29 all-coefficient stationary-language exclusion, and it does not license key, share-order, escape, byte-offset or field-polynomial sweeps without an independently visible instruction. The next meaningful decision still requires a first-party instruction selecting a further reversible step or an independently recovered unknown-page plaintext witness.
