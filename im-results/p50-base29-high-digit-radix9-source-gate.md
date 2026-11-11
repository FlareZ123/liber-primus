# P50 higher BASE29 digit channel: direct radix-nine readout

**Decision:** original-image-derived direct readout is nonlinguistic. No unknown Liber Primus ciphertext has been decrypted, and no key or hidden destination is recovered.

## Why this operation is specifically motivated

The original 32 × 8 numeric table on physical p49–51 contains 256 source-verified byte values. Their residues modulo 29 obey two exact source-linked quadratic constraints: the 2013 BASE29 example supplies H and the manuscript's marked p39 red triad supplies G. These reproduce the established [256,252,3] code in **GF(29) residues**; the code alone cannot determine byte values because adding 29 leaves every residue unchanged.

That mathematical blind spot gives a concrete, separate candidate payload. Each byte B has a unique Euclidean decomposition

`B = 29q + r`, with `r ∈ [0,28]` and `q ∈ [0,8]`.

The original table order fixes 256 higher digits `q`. Because nine distinct q values occur, **base 9** is the smallest uniform radix capable of representing this channel without ambiguity. Read all 256 higher digits in printed row-major, most-significant-first order as one base-9 integer and render its minimal big-endian byte string. The use of radix conversion is historically motivated by the authenticated 2013 BASE29 instruction, although no source explicitly tells a player to split LP2 bytes or decode the high digits as base 9.

## Original-input result

The resulting 256 higher digits have counts, for digit 0 through 8:

`[22, 33, 38, 22, 29, 32, 34, 21, 25]`.

The nine-bin Pearson chi-square against equal frequencies is **10.765625**, descriptive upper-tail p approximately **0.2153** (8 degrees of freedom). The higher digits exhibit no clear concentration or omission. In particular, digit 8 occurs **25** times, so a naive octal reinterpretation would lose information.

The fixed base-9 integer yields exactly **102 bytes**, SHA-256:

`69302374af14825a3552f40507104f453505c9e7cbf0e45c9de990e1c4377bc1`

First 16 bytes (hex): `09 df 17 9a 31 59 d6 a1 aa c6 14 0c 89 73 6e 8b`.

Only **35/102** bytes are printable ASCII, consistent with unscripted binary data at this length. Empirical byte entropy is **6.24585892036 bits/byte**; this estimate is sample-size-limited. The result begins with none of the tested PDF, armored PGP, ZIP, gzip, PNG, JPEG, BMP or SQLite headers. It is neither readable text nor an immediately recognizable container.

The original ordered 256-byte table continues to satisfy the exact H and G zero-remainder assertions. A planted, 256-digit base-9 serialization of independent ASCII text round-trips exactly. The [single-file CJS](../sims/p50_base29_high_digit_radix9_sft.cjs) was run successfully in [GitHub Actions 43038348425](https://github.com/FlareZ123/liber-primus/actions/runs/43038348425), using the `p50-base9` source-only probe.

## Impact on the solve path

This retires **one literal higher-byte-channel interpretation**: treating `floor(B/29)` as 256 base-9 digits giving a single unencrypted binary payload. It supplies no plaintext, key, URL or independently authenticated LP2 operation. It does **not** establish that the higher digits are meaningless: a separate supplied key, compression rule, authenticated chunking rule or other source-native codec could change their interpretation. Without such a clue, additional packings or offsets would be a post-selected search.

Existing work on the **252 GF(29) polynomial-division quotient** is a different register. The higher-byte quotient here is `floor(B/29)`, defined separately per original byte, and must not be confused with that polynomial quotient. The authoritative overall LP2 solution status remains unchanged.
