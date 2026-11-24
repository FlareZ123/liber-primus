# p55 shell32 as a direct AES-256 key for the p50 256-byte object

**Classification: one source-typed, fixed-receiver negative. No plaintext, authentic key, or destination recovered.**

## Why this exact test was worth one attempt

The solved p57 instruction “SHED OUR OWN CIRCUMFERENCES” motivates a word-boundary extraction on p55. After excluding the one-rune carry from p54, p55 has 16 complete words and 32 boundary runes (first rune, last rune, repeated in original word order). The p50 numerical panel is a 32×8 object containing 256 bytes. A solver could notice the compact type/length fit: 32 bytes is the AES-256 key length, and 256 bytes is exactly 16 AES blocks.

This is only a candidate, not a first-party instruction. The strongest rival is that “shed” means discard the boundary runes, not use them as a key. No authenticated Cicada stage in the repository's historical technique index selects AES; the public [technique catalog](https://github.com/Dukotah/cicada3301/blob/master/ciphers/README.md) lists OutGuess, book/running-key ciphers, Caesar/Vigenère/Atbash, Gematria Primus, primes/totient, PGP, Tor/QR and audio, but not AES. That catalog is not exhaustive, so its omission is caution rather than proof.

## Frozen source inputs

- P55: physical image `resources/liber-primus/72.jpg`; 17 rune groups including the incoming one-rune carry, leaving 16 complete words.
- Shell order: for each complete word, take its first rune then its last rune; concatenate in original word order. This gives exactly 32 runes.
- Key mapping: the historical GP0 ordinal of each shell rune, stored as one byte (values 0–28). The resulting key is:

  `19070f110e130f1900010704110c130011050c121c0f120f0216050e1701110a`

  This is a 32-byte AES-256 key container but carries at most 160 bits of rune-choice entropy.
- P50: the current canonical base60 decoding of the original 32×8 table, 256 bytes in row-major order. SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The p50 radix is not uniquely settled by the printed tokens, and the p55 shell's key role is not independently selected. Both are explicit conditions on this test.

## Fixed receiver

Decrypt the entire 256-byte p50 stream from byte zero using **AES-256-ECB**, raw 32-byte GP0 shell key, and no padding. ECB is the only ordinary AES mode that requires no missing IV/nonce; this is a deliberately narrow test, not a claim that Cicada specified ECB. No KDF, hash, key reversal, alternate rune mapping, IV, offset, or mode search was performed.

## Result

- First 16 plaintext bytes: `aed7c3083074a770936d233c89eff0af`.
- Full plaintext SHA-256: `b2dffb03fa2f45fc68e78958e46dd72322eb8f5804439b5f33a3747f588f2d21`.
- Printable ASCII: **85/256 (33.20%)**.
- Byte Shannon entropy: **7.205378 bits/byte**.
- No recognizable file header or coherent text appears; the output is ciphertext-like.

The reproducer passes the NIST AES-256 ECB known-answer vector and a 256-byte 0..255 encrypt/decrypt positive control under the same implementation. It asserts the original p55 shell, exact key bytes, p50 source digest, full plaintext digest, printable count and entropy.

## Decision

**Reject only the direct contract**: interleaved p55 shell → GP0 byte values → raw AES-256-ECB key → canonical p50 base60 bytes. The exact receiver produces no plaintext. Do not extend this into CBC/CTR with invented IVs, hashes/KDFs, alternate shell orderings, or key sweeps without an independent source instruction selecting those choices.

This is distinct from the earlier p55-field DH/ECDH → AES-256-CTR tests, which used a different derived key; see `im-results/lp2-p50-bitcoin-p55-finitefield-dh-source-gate.md` and `im-results/lp2-p50-meanpng-p55-shedfield-ecdh-typed-gate.md`. It is also distinct from the 43-byte p50 BASE29-channel → p55-interior test in `im-results/p50-43byte-base29-p55-interior-key-gate.md`. None of these tests establishes the intended page roles.
