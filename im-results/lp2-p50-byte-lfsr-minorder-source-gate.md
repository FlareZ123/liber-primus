# LP2 numerical table: complete small linear-generator obstruction (17 November 2026)

**Classification:** a bounded, source-exact generator exclusion. No original unknown-page plaintext, author key, or operation recovered.

## Why this is a finite decision

Original physical pp49–51 print a 32×8 array of two-character numerals. Under the repository's conventional, provisional base60 interpretation they produce 256 bytes. The printed p49 **ten-dot 3/4/3 punctuation** (previously misdescribed as a 3×3 nine-dot marker), p15's 16-cell numerical square, and eight table columns are plausible human cues to compact fixed-state generators. An exact finite question is whether the ordered 256-byte array itself is the unmasked output of a **short linear feedback shift register**, with any secret feedback coefficients or initial state, rather than a generated key/ciphertext. The rival is a random-looking table or a nonlinear/encrypted output.

## Original-data exact minimum orders

Input: `resources/liber-primus/base60-grid.json`, row-major byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. A source-pinned Berlekamp–Massey decoder over the AES polynomial GF(2^8) (modulus `0x11b`) eliminates every unknown linear feedback coefficient; a separate GF(2) run processes concatenated bits and individual bitplanes. No language scoring, key or source-byte modification is used.

| Original table reading | Minimum GF256 recurrence in bytes | Minimum GF2 recurrence in 2,048 bits (MSB/LSB first) | Eight 256-bit bitplane orders, LSB to MSB |
| --- | ---: | ---: | --- |
| Printed row-major | **128** | **1,024 / 1,024** | 128,130,129,128,128,128,128,128 |
| Column-major | **128** | **1,022 / 1,025** | 128,131,128,130,128,129,128,129 |
| Alternating direction of printed rows | **128** | **1,024 / 1,024** | 128,128,128,129,128,128,128,129 |

The exact source-minimal GF256 order of **128 bytes** in all three natural reads is incompatible with **any deterministic order-1 through order-127 GF256 linear recurrence** emitting those bytes under a fixed key and the tested clock. It directly excludes order9, order16, order32 or any other small fixed linear shift register, without fitting a generator. Likewise GF2 orders above 1,021 reject all binary recurrences with at most 1,021 state bits for those three flat byte-to-bit serializations. These statements depend on the exact source register and orientation; another radix, nonlinear output, whitening, moving state/key, or external encrypted bytes is outside the test.

## Positive and honest decision

The same program generates a 256-byte stream from a hidden order-nine GF256 feedback rule and independently recovers **order exactly 9** with four nonzero feedback coefficients. It also checks actual AES field multiplication/inversion, source SHA-256, all recurrence equations, and every original orientation. This calibration demonstrates the ability to recognize a short generator when present; it does not select a historical cipher. The source's observed orders are typical of near-uniform-looking data and **not** evidence that the bytes are cryptographically random or an independently selected key.

[Complete, standalone Windows Node22 SFT](../sims/lp2_p50_byte_lfsr_minimum_order_sft.cjs).

**Research fork:** no compact unmasked linear recurrence explains these original numeric values. Do not test additional freely fitted small LFSR coefficients. A live p50 lead requires an independent period-available **source naming a nonlinear generator, keyed transformation, or exact consumer**, followed by a source-frozen original ciphertext inverse. This table test alone recovers no LP2 plaintext.
