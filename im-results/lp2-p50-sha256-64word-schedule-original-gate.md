# Original p50 256 bytes as a standard SHA-256 64-word message schedule

**Agent34, 22 November 2026. Disposition:** original-source, self-verifying **negative** for the literal SHA-256 message-schedule interpretation of the p49–51 numerical table. No plaintext or secret key recovered. This is a single historically typed candidate, with two independently natural byte orders, rather than an unspecified binary decoder search.

[Exact Windows Node22 CommonJS SFT](../sims/lp2_p50_sha256_64word_schedule_sft.cjs) · [native Windows PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45058071257).

## Independent source-to-operation premise

The source actually prints **32×8 two-symbol base60 values** across physical p49–51, each representing one original byte 0..255. Its natural left-to-right row-major reading is **256 bytes = 64 unsigned 32-bit words**. SHA-256, publicly standardized before 2014, operates on exactly 64 such expanded message words per block, of which the final **48 are deterministically derived from the initial 16**. Cicada's prior public stages use cryptographic digests, and solved LP2 p56 prints a digest commitment, though neither authentic source explicitly labels this table SHA-256. This fixes a crisp key/code hypothesis: the table might carry a **self-validating SHA-256 block schedule**, from which its first 64 bytes (W0..W15) would be independently recovered and the remaining 192 bytes would be redundant.

The standard recurrence, with all arithmetic unsigned mod 2³², is:

\`W[t] = sigma1(W[t−2]) + W[t−7] + sigma0(W[t−15]) + W[t−16]\`, for t=16..63,

\`sigma0(x)=ROTR7(x) xor ROTR18(x) xor SHR3(x)\`, \`sigma1(x)=ROTR17(x) xor ROTR19(x) xor SHR10(x)\`.

Interpret source bytes in their unchanged physical order, using the standard big-endian 32-bit SHA-256 word convention. Because the source lacks an explicit byte-endian opcode and the investigator operates on common little-endian computers, predeclare **only** the literal little-endian word read as a rival, without swapping word order, changing starts or inserting keys. For each orientation, freeze W0..W15 to the *first 64 original bytes*, compute W16..W63, and compare all 48 untouched original words exactly. A real SHA-256 expanded schedule requires **48/48**, and any single failure falsifies that typed object.

## Results and positive

| Frozen original word serialization | First predicted W16 | Authentic W16 | Exact held-out words |
| --- | ---: | ---: | ---: |
| Big-endian (standard SHA-256) | 3,672,225,632 | 2,063,538,624 | **0 / 48** |
| Little-endian native-machine rival | 2,763,527,312 | 3,222,929,274 | **0 / 48** |

The SFT first verifies all **256** byte values against both independently stored representations in \`resources/liber-primus/base60-grid.json\`, then computes the exact recurrence without any recovered original ciphertext plaintext. An authentic independently recognizable **SHA-256 "abc" one-block padded message** is used as a positive: W0 \`0x61626380\`, W15 \`0x00000018\`, **W16 \`0x61626380\`**, W17 \`0x000f0000\`; the standard recurrence reconstructs all **48/48** planted later words, and the complete synthetic 256-byte block schedule survives byte serialization and exact re-expansion. The positive validates the arithmetic against independent constants and tests the same withheld-word criterion.

**Decision:** the original 256-byte table is **not** a single literal SHA-256 expanded message block in its printed order under either natural endian assignment. This does **not** rule out a digest, hash, compressed object, encrypted payload, raw keystream, or a different cipher over those source bytes; none is licensed merely by the 256-byte count. No "repair" by arbitrary word permutations, fitted phases, extra hash layers or standard-format guessing is warranted absent new first-party evidence. The known signed-release material still lacks a table-to-plaintext consuming instruction.
