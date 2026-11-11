# LP2 numerical-table base29 complement: direct hidden-message test

**Status, 11 November 2026:** bounded negative on two literal text transports using only the *unconstrained high digits* of the original 256-byte table. No recovered LP2 plaintext, author-selected key, or cipher mechanism. [Reproducer](../sims/lp2_grid_base29_highdigit_channel_sft.cjs).

## Motivation, independent source, and scope

The 32×8 two-character numerical table on physical LP2 pp49–51 has 256 source-derived byte values under the original base60 reading. Their SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Over GF29, those bytes are coefficients of a polynomial with two previously established, independently visible factors: the signed 2013 `BASE29 3301 → 3QO` digit quadratic, and the red p39 three-rune quadratic ([earlier finding](2013-base29-gf29-grid-factor.md)). Those factors constrain the coefficients **modulo 29**.

A different payload could be carried in each byte's *high quotient* without altering the entire known mod29 factorization. Fix the exact decomposition of every printed byte `b=29q+r`, with `0≤r≤28` and `0≤q≤8`. The 256 high digits `q` provide up to about 811 bits of additional nominal capacity. No original instruction states that the high quotients contain text, so test only two particularly economical readouts that make use of the original 32×8 printed geometry:

1. Pair adjacent base9 digits to give 128 integers 0–80; add 32 to obtain ordinary ASCII characters. Four paired characters occur in each of 32 printed rows.
2. Read the 256 base9 digits as a single unsigned big-endian integer and serialize it as unsigned bytes. This produces 102 bytes for all four tested natural traversals.

Read the printed table in row-major order, fully reversed, column-major, and reversed column-major. This finite family fixes all operations and source positions without fitting a password, invented character map, or language model.

## Results on the original 256 bytes

The exact high-quotient histogram for digits 0 through 8 is **[22, 33, 38, 22, 29, 32, 34, 21, 25]**. All 256 bytes reconstruct identically as `29q+r`.

| Original high-digit traversal | Letters/spaces among 128 paired ASCII | Longest paired letters/spaces run | Printable bytes among 102 binary bytes | Longest printable binary run |
| --- | ---: | ---: | ---: | ---: |
| Printed | 74 | 7 | 35 | 3 |
| Fully reversed | 57 | 5 | 38 | 6 |
| Column-major | 59 | 4 | 44 | 4 |
| Reversed column-major | 61 | 6 | 39 | 5 |

The first 24 printed-order ASCII characters are `fSCJCTh]J!?5AMOH>W+D4"bX`; the first eight big-integer binary bytes are `09df179a3159d6a1`. Neither natural readout reveals continuous human-language text or a recognizable direct file header. The two synthetic controls encode and exactly decode an independent 128-character ASCII instruction and a separate native ASCII byte string through these same maps.

**Decision:** the known GF29 polynomial factorization does not by itself disclose a simple plaintext complement channel in the base29 high digits under these exact transports. This does **not** rule out a different source-selected byte packing, ciphertext or compressed binary hidden in the high-digit channel, or any stateful key derivation. None of the eight decoded outputs supplies a credible unknown-LP2 plaintext fragment. Avoid expanding these same unconstrained digits into arbitrary KDF/key/phase searches without new original-source guidance.

## Reproduction

Run `node sims/lp2_grid_base29_highdigit_channel_sft.cjs` in the repository root (Node 22, no third-party dependencies). It asserts the original 256-byte hash, byte reconstruction, exact original output statistics, and both positive controls. The authoritative [research synthesis](../results/README.md) remains unchanged because this finite negative does not alter the established decipherment state.
