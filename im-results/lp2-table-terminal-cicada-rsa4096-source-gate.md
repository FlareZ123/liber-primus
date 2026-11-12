# Literal 32×8 table + terminal 256-runic stream as Cicada RSA-4096 signature

**Classification: one falsified, source-length-selected cryptographic interpretation (12 November 2026, Agent1).** No unknown plaintext, decryption key, decipherment method, or destination follows.

## Motivated construction and objection

The authentic LP2 pp49–51 numerical object has exactly **256** printed base60 byte-sized values in a source-visible 32×8 grid. Independently, the last three LP2 physical pages contain **256 GP29 runes**: p55 has 76, p56 has 85 and p57 has 95. The original Cicada OpenPGP public-key block includes **two 4,096-bit RSA public keys** with exponent 65,537 (a primary and a subkey), and 256+256 bytes are exactly 512 bytes, the integer width of those keys. This suggested a narrow, hand-specifiable signature-verification hypothesis: the two objects, serialized without transformation, may form a recoverable RSA signature under the creator's published keys.

This is a weak author-intent hypothesis because no original clue explicitly instructs a 512-byte concatenation, GP-index byte serialization or RSA verification; the source pages and the printed table have other apparent roles. It is recorded as a *single bounded failure*, not as evidence that all public-key constructions are exhausted.

## Frozen original input

- Table: `resources/liber-primus/lp2-grid-256.json`, **256 bytes**, original pp49–51 row-major order, conventional base60 reading.
- Terminal: `resources/liber-primus/lp2-corpus.json`, physical pp55–57 in source order, **256 zero-based GP29 rune indices**, one byte each; include solved p56 and p57 without replacing their ciphertext symbols by plaintext.
- Key: preserved Cicada public armor `resources/external/cicada3301-rsa-public-4096.asc`, upstream `krisyotam/cicada3301/pgp/key/cicada-3301-public-key.asc`, archived Git blob `d44aec389e2f346c6b9d149d4c61e890f62979c9`.
- Exactly two concatenations: `grid || terminal` and `terminal || grid`. Each 512-byte integer is passed through `m^65537 mod n`, with both published 4,096-bit moduli. A literal RSASSA-PKCS1-v1_5 signature must decode to a valid `00 01 FF...FF 00` encoded block before a digest can be authenticated. No search over endian order, letters, reductions, padding, keys or transpositions.

## Original-source result

| 512-byte input | Published key | First 16 decoded bytes (hex) | PKCS#1 v1.5 padding |
|---|---|---|---|
| grid + terminal | primary | `5d9bf7d2059764e6c6dadd99f2aaafda` | **invalid** |
| grid + terminal | subkey | `554e71a0626e5cf2db98a8c666139f93` | **invalid** |
| terminal + grid | primary | `9c9f235b81601adfdde1284876d9bf35` | **invalid** |
| terminal + grid | subkey | `70740b5b7374e080ab3df16f06402121` | **invalid** |

Every decoded original candidate lacks the necessary leading `00 01` padding; this decisively rejects the four fixed interpretations as ordinary Cicada-key RSASSA-PKCS1-v1_5 signatures. The independently generated Node RSA-1024 signed-message control passes both public exponentiation/padding and `crypto.verify`, validating the implementation's RSA direction and byte conventions. It does not authenticate the manuscript link.

**Reproducer:** [complete CommonJS single-file test](../sims/lp2_grid_terminal_rsa4096_signature_sft.cjs) on Windows Node 22, [successful manual CI run 43309395137](https://github.com/FlareZ123/liber-primus/actions/runs/43309395137), exact 512-byte source assemblages and public key preserved in the repository. The test asserts all four original decoded prefixes and a planted positive-control signature.

## Decision

Retire exactly this literal printed-grid/terminal-rune concat-as-signature rule. None of the results identifies a source-derived cipher key or a p55 plaintext. Other uses of the two 256-position objects remain possible only with an independent clue choosing their reversible operation; do not infer an RSA role from their sizes alone.
