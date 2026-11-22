# Source-conditional p50 binary Merkle root versus the solved p56 deep-web digest

**Agent 2, 14 November 2026. Finite, original-source negative. No unknown-page plaintext or key.** Reproducer: [Windows-portable Node.js SFT](../sims/lp2_p50_merkle_sha512_source_gate_sft.cjs). Independently run locally with the canonical 256-byte data and checked against standard four-leaf SHA-512 test vectors.

## Why this exact question was worth asking

Three separate original LP2 observations converge geographically at the ending: printed pp49–51 contain **256** two-character number-table cells; p55 contains a pale **tree** illustration; p56 immediately prints a 128-hex-character **deep-web hash target**, consistent in length with a 512-bit digest. A binary Merkle root is one ordinary, recognizable way for a tree to connect 256 leaf values to a single digest. This gives a narrow original-byte prediction without fitting any unknown ciphertext.

**Strongest objection:** none of the authenticated Cicada text calls the p55 image a Merkle tree, assigns the p50 cells as leaves, selects SHA-512, or says the p56 digest should authenticate a local table. In fact the solved p56 wording describes a *deep-web page*, so a locally computed tree root is a rival hypothesis, not an intended-path claim. The two-character base60-to-byte reading itself remains participant-derived, not creator-authenticated.

## Frozen original inputs and inverse-independent experiment

Read only `resources/liber-primus/lp2-grid-256.json` in its source-preserved 32×8 row order, using its published base60 0–255 byte mapping. No transposition, sorting, offsets, salts, secret pad, reversed leaves, or plaintext scoring. The exact 256-byte SHA-256 checksum is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The authenticated solved-p56 target is:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

Test direct SHA-512 of the 256-byte stream and three natural leaf types: byte itself; SHA-512(byte); SHA-512(0x00||byte), with either parent SHA-512(left||right) or parent SHA-512(0x01||left||right), as in a tagged Merkle tree. All leaves pair contiguously in source order for exactly eight levels. The SFT pins two independently calculated four-leaf root vectors and the original 256-byte digest before testing.

## Original-input results

| Leaves | Parent hash input | 512-bit root (leading hex, full digest in SFT output) | Equals p56? |
| --- | --- | --- | --- |
| Bytes | L||R | `9c27f11f1fcdf09e` | No |
| Bytes | 01||L||R | `fd90b305671c054d` | No |
| SHA512(byte) | L||R | `662d746b69f31369` | No |
| SHA512(byte) | 01||L||R | `c16259dba526ca79` | No |
| SHA512(00||byte) | L||R | `5a3593a8d64528b6` | No |
| SHA512(00||byte) | 01||L||R | `e6d6c9d05bb1f56` | No |

The direct stream SHA-512 is `bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20`, also distinct from p56.

**Decision:** the source-order base60 table does **not** directly yield the p56 printed digest under these six commonplace SHA-512 binary Merkle constructions, or direct SHA-512 of the same bytes. It also supplies no candidate hidden web page, key material, or LP2 rune plaintext. This does not test an unselected hash algorithm, unknown external page bytes, keyed tree, changed leaf representation, or another cipher use of the table. Those variants would require an independently visible authorial selector; no variant search follows from this negative.

Original-image pixel adjudication of eleven previously disputed tokens is recorded in [the grid census](lp2-grid-11-original-glyph-adjudication.md); the other cells follow the canonical derived transcription. The source uncertainty and missing Merkle instruction are material limits, not excuses to fit the root post hoc.
