# p50 256-byte table × p56 SHA-512 digest: repeating-XOR gate

**Status:** bounded negative for the direct repeating-XOR-pad interpretation. No plaintext or file structure recovered.

## Source-constrained hypothesis

The solved p56 plaintext supplies a 128-hex-character SHA-512 digest (64 bytes). The p49–p51 numerical table supplies a 256-byte base60 rendering. The 2014 three-onion source program independently demonstrates bytewise XOR on long hexadecimal strings. A human solver could therefore try the simplest exact-length pairing: repeat the 64-byte p56 digest four times and XOR it with the 256-byte table.

This test fixes printed digest byte order, forward repetition, offset zero, and no additional KDF, byte permutation, or fitted phase. The p50 base59 interpretation (the documented alphabet with lowercase f omitted) is checked as the only alternative table radix.

## Inputs

- p50 base60 256-byte table: SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
- p50 base59 alternative: SHA-256 511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79.
- p56 digest: 36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4 (64 bytes; SHA-256 0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e).

## Results

| Table interpretation | Printable bytes | Letters | Zero bytes | Longest printable run | Entropy (bits/byte) | Output SHA-256 | 64-key-permutation null |
|---|---:|---:|---:|---:|---:|---|---|
| Base60 | 82/256 | 45 | 4 | 5 | 7.2318 | f9b6483a74cf82d9b2f5d64046c9fe2fd90edb8626aef35ef57bc5243c8fc25b | median 95, range 79–107, p=0.9538 |
| Base59 drop-f | 80/256 | 43 | 0 | 5 | 7.1271 | d615f362fab0182bf3084dc74f25e341a0486eabe69de3ea0909bb9bd37960e8 | median 94, range 76–109, p=0.9846 |

Neither output begins with a recognized PNG/JPEG/ZIP/PDF/GZIP/ELF/GIF/7z/SQLite signature. Both have fewer printable bytes than the median of 64 deterministic permutations of the same 64 digest bytes. The matched synthetic English control round-trips byte-for-byte under the same operation.

## Decision and scope

The direct 64-byte digest repeated four times is not supported as the p50 table's XOR key. Do not add offsets, reverse orders, or fitted transformations to rescue it without an independent source instruction. This does not exclude a different hash-derived stream generator or a separately selected cipher; it only retires the simplest exact-length XOR pairing.

This is distinct from existing gates for the p50 table as an additive pad under the LP2 rune stream, p56 digest as an AES IV, and the table's folded XOR/commitment relation. The three onion RSA-hex blobs' pairwise XOR and XOR against the canonical 256-byte table were already reported negative in the independent 2026 corpus manifest; that test was not repeated.

## Reproduction

Run from the repository root:

    python im-results/lp2_p50_p56_digest_repeating_xor_pad_gate.py

The script reconstructs both byte encodings from the original grid JSON, extracts the digest from the solved p56 reference, asserts a positive control, and uses 64 seeded permutations of the digest-byte multiset for each radix.
