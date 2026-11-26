# p49–51 256-byte panel versus the p56 512-bit target: 4×64 hash gate

**Status: bounded negative.** This closes the natural four-block hash relationship; it does not explain or decrypt the p49–51 panel.

## Question and source motivation

The canonical base60 reading of the p49–51 numeric panel is a 256-byte stream. A 2026 external analysis of the panel explicitly left the structural possibility that 256 bytes might be four 64-byte digests related to the p56 512-bit target untested ([Dukotah, Campaign VII findings](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md)). The p56 source-semantics gate retains SHA-512 and Whirlpool as the two motivated 512-bit digest candidates.

This test freezes the obvious row-major partition into four consecutive 64-byte blocks. It does not search arbitrary offsets, permutations, padding, or digest families.

## Exact inputs

- p49–51: `resources/liber-primus/base60-grid.json`. Decode each two-character token as `60 × alphabet_index(first) + alphabet_index(second)`. The 256 decoded values exactly equal the stored `byte_rows`; every value is in 0–255.
- p50 stream length: 256 bytes.
- p50 stream SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- p56 target (64 bytes): `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.
- Original images: all 75 JPEGs in `resources/liber-primus/`.

## Frozen tests

1. Compare each of the four 64-byte blocks directly with the p56 target.
2. Hash each block as a candidate preimage with SHA-512 and Whirlpool; compare with the p56 target.
3. Hash the complete 256-byte stream, its byte-reversal, and its lowercase hex-ASCII serialization with SHA-512 and Whirlpool; compare with the p56 target.
4. Hash every original JPEG with SHA-512 and Whirlpool. Compare those 150 digests both with the p56 target and with each of the four 64-byte blocks. This tests whether the target hashes a local LP image and whether any block is the digest of a local LP image.

## Result

No match in any tested class:

- 0/4 direct block equalities.
- 0/8 block-preimage hash checks.
- 0/6 whole-stream serialization hash checks.
- 0/150 original-image digest comparisons against the p56 target.
- 0/600 original-image digest comparisons against the four p50 blocks.

The p50 stream itself hashes to:

- SHA-512: `bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20`
- Whirlpool: `3e0e1becc4aa7a0801c36ce0e528a621d6dd8a5c3d225adc3760a6516da40abd13293283af7c024c67b501092666bcd0ecca02ae36ef5e5a7a2f5b62bd4b4af3`

## Interpretation and boundary

The simple hypothesis that the p49–51 byte stream is four concatenated 512-bit digests, that one of its four blocks is the p56 target, that a block or the whole stream is a SHA-512/Whirlpool preimage for that target, or that the blocks are hashes of one of the 75 local LP JPEGs is unsupported and rejected under this frozen representation.

This does **not** rule out an external web-page preimage, a textual or otherwise transformed serialization, a different source-selected digest, or the p49–51 payload being encrypted data requiring an independently identified key. The 256-byte panel remains unexplained; no plaintext, key, or consumer has been recovered.

## Reproduction

Run:

```bash
python sims/lp2_p50_p56_4x64_hash_gate.py
```

The script checks the token-to-byte reconstruction against `byte_rows`, prints the input fingerprints and block digests, and performs the image comparisons. Whirlpool requires OpenSSL with the legacy provider enabled.
