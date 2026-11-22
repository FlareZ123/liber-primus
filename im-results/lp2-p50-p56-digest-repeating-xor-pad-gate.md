# p50 256-byte table × p56 digest: local replication of the R43/F6 negative

**Status:** negative; not a novel discovery. The direct operation was already tested in the independent 2026 R43/F6 campaign. This local reproduction confirms the null result and records a detector caveat.

## Source-constrained hypothesis

The solved p56 plaintext prints a 128-hex-character hash target (64 bytes when hex-decoded). The original page does not specify its hash algorithm; this test uses only the printed bytes. The p49–p51 numerical table supplies a 256-byte base60 rendering. The historical 2014 three-onion source program demonstrates bytewise XOR on long hexadecimal strings, so the simplest pairing is to repeat the 64-byte p56 digest four times and XOR it with the 256-byte table.

This test fixes printed digest byte order, forward repetition, offset zero, and no additional KDF, byte permutation, or fitted phase. The p50 base59 interpretation (the documented alphabet with lowercase f omitted) is also checked.

## Inputs

- p50 base60 256-byte table: SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
- p50 base59 alternative: SHA-256 511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79.
- p56 digest: 36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4 (64 bytes; SHA-256 0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e).

## Local reproduction

| Table interpretation | Printable bytes | Letters | Zero bytes | Longest printable run | Entropy (bits/byte) | Output SHA-256 | 64-key-permutation null |
|---|---:|---:|---:|---:|---:|---|---|
| Base60 | 82/256 | 45 | 4 | 5 | 7.2318 | f9b6483a74cf82d9b2f5d64046c9fe2fd90edb8626aef35ef57bc5243c8fc25b | median 95, range 79–107, p=0.9538 |
| Base59 drop-f | 80/256 | 43 | 0 | 5 | 7.1271 | d615f362fab0182bf3084dc74f25e341a0486eabe69de3ea0909bb9bd37960e8 | median 94, range 76–109, p=0.9846 |

The matched synthetic English control round-trips byte-for-byte.

## Independent R43/F6 result and PGP-detector caveat

The independent R43/F6 campaign ran this exact forward hash ×4 XOR against both canon_256 and canon_256_decpref on 3 November 2026. Its results record two PGP-tag D4 detections among four outputs, but its own post-hoc calibration finds that detector fires on **32.77% of 100,000 random 256-byte strings**. The R43/F6 RESULTS therefore adjudicates both detections as chance-level false positives; all other structural and mod-29 criteria remain null.

The implementation explains the false-positive mechanism. The preregistration names a restricted set of PGP tag bytes, but run_f6.py's pgp_ok accepts any high-bit new-format packet tag and checks only that the claimed length is at least 64; it does not check that the claimed packet fits in the 256-byte buffer. This local base60 output begins FD D1 D0: tag 61, claimed packet length 4,752, only 253 bytes available after its three-byte header. It is not a valid packet. The base59 output begins FE D5 D3 and similarly claims a length far beyond the remaining buffer.

The same R43/F6 campaign also tested the p56 digest as both 64 bytes and 128 hex nibbles modulo 29 over all 55 unsolved pages, with sign ±1, Atbash, and offsets 0–63: 28,160 decodes, **0/55 pages crossing** their standing bars; global best pmax 4.596 against a page bar of 11.27. This is a broader independent negative for that specified hash-keystream family.

Sources:
- [R43/F6 preregistration](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F6-objects/PREREG.md)
- [R43/F6 results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F6-objects/RESULTS.md)
- [R43/F6 result data](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F6-objects/f6_results.json)
- [R43/F6 detector implementation](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F6-objects/run_f6.py)

## Decision and scope

The direct 64-byte digest repeated four times is not supported as the p50 table's XOR key. This local run is a reproducibility check of an already-published independent negative, not new cryptanalytic progress. Do not add offsets, reverse orders, or fitted transformations to rescue it. The external 0/55 result also retires the stated p56-hash GP29 keystream grid; neither result excludes every conceivable hash-derived construction, but further variants require a new source selector.

The three onion RSA-hex blobs' pairwise XOR and XOR against the canonical 256-byte table were also already reported negative in the independent R43/F6 results; that test was not repeated.

## Reproduction

Run from the repository root:

    python im-results/lp2_p50_p56_digest_repeating_xor_pad_gate.py

The script reconstructs both byte encodings from the original grid JSON, extracts the digest from the solved p56 reference, asserts a positive control, checks whether a PGP-like header's claimed packet length actually fits, and uses 64 seeded permutations of the digest-byte multiset for each radix.
