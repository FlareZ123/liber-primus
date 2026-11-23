# H×G quotient as a historical three-share byte-XOR receiver

**Agent43, 23 November 2026. Status: source-constrained direct receiver negative.** The original p50 field and two independently visible arithmetic operands yield exactly 252 GF29 quotient digits. Their natural unsigned BASE29 serialization contains **153 bytes**, permitting three contiguous **51-byte** shares. Applying the *actual three-byte-stream XOR operation used in earlier Cicada rounds* produces **51 binary bytes, of which 17 are printable ASCII**, without a readable direct instruction. Five fixed SHA-512 preimage candidates fail against the original p56 terminal digest. **No unknown LP2 plaintext, key, cipher or destination was recovered.**

## Premise and independent original inputs

1. LP2 original pp49–51 print 256 base60-looking tokens. The image-adjudicated numeric dataset is `resources/liber-primus/lp2-grid-256.json`; the source page files are `66.jpg`, `67.jpg`, `68.jpg`. The conventional sixty-digit reading is a *hypothesis* about the original numerals, though the printed glyphs are independently adjudicated.
2. A signed 2013 Cicada BASE29 worked example gives `3301→3QO`, yielding GP29 indices `[3,26,24]`. Original p39's red triad gives `[27,5,15]`. Under the already documented descending-coefficient GF29 reading, their quadratic polynomials multiply to `H·G=23+21X+11X²+17X³+12X⁴`. The complete 256-cell field polynomial divides by this factor with **four zero remainder coordinates**. This exact relation is established arithmetic; its significance as creator-authored code remains uncertain. See [the independent original factor](2013-base29-gf29-grid-factor.md).
3. Source-authored earlier Cicada puzzles actually used bytewise XOR of three recovered payloads; the 2013 protocol establishes literal BASE29 integer conversion. This makes a three-share byte receiver a motivated *trial*. No first-party LP2 source authorizes splitting the quotient, using three equal shares or expecting a plaintext result.

The previously recorded [complete BASE29 byte transport](lp2-p50-q252-2013-base29-byte-transport-gate.md) and [GP29 quotient Shamir/byte XOR trials](lp2-p50-hg-three-share-p56-original-gate.md) do **not** test the **full 153-byte serialization divided into three 51-byte chunks**. The distinction matters: those prior XOR cases used either source table byte cells or the 252 individual GF29 symbols; this test first packs all 252 GP29 digits as **one** integer.

## Frozen receiver and observed original result

Original table byte SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

- Let `Q[0..251]` be the descending-coefficient GP29 quotient of the unchanged 256 cells by `H·G`. Its leading digits are `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]`.
- Interpret those digits as a single **big-endian unsigned base29 integer**. Its shortest big-endian binary serialization is **153 bytes**, beginning `04598e588f3e70d4100f40d7489f9855`.
- Split this fixed byte string into contiguous 51-byte `A`, `B`, `C`, and compute **`A XOR B XOR C`**, byte by byte.

The complete output is:

```text
bff060162efa7d58ef5847e9c291f117f2cc14cfb00a17d8f75f979c9e6cb8466cf41028b3cd301a344100f686a0599d489a70
```

Only **17/51 bytes** lie within printable ASCII `0x20..0x7e`, and the result is no recognizable direct textual instruction. For the independent p56 128-hex printed value, **assuming SHA-512**, neither the full 153-byte Q serialization, its three individual 51-byte shares, nor the 51-byte XOR result hashes to the target (**0/5** direct checks). The two most relevant measured digests are:

- `SHA512(Q153)=01f29ef0b60fa77a99fdc2f8d013a05eae7c33b914f97f92857896a1c22cd5f1a7493e1d6fbb2367a9e169c54a43939cb160d76c43f5e6524b5a050d30213f2d`.
- `SHA512(A XOR B XOR C)=4b3aac5068751c43caa95df8beb379a57287f24c62b94ea72f33f4fee19a0a529c010cb93b950d9e9354e5a8e7acf754bdea438b6120f61d2241f82a5bd2e8e7`.

No endian flip, offset, phase, key, digest algorithm or secondary cipher was fitted to recover a desired message.

## Reproduction and decision

The read-only [original-source CommonJS SFT](../sims/lp2_p50_hg_q252_base29_threebyte_xor_sft.cjs) asserts the original 256-byte SHA-256, exact four-zero polynomial remainder, 252-digit quotient prefix, 153-byte serialization, complete XOR result and direct SHA-512 failures. A three-way inverse identity independently checks every output byte. The exact [Windows Node.js 22 workflow run 45158181772](https://github.com/FlareZ123/liber-primus/actions/runs/45158181772) passed, with the complete original output in the workflow log.

**Decision:** retire this *single, fixed, source-motivated three-51-byte direct XOR receiver* as a route to immediately readable text or the exact p56 SHA-512 preimage. The 51-byte result might represent binary data, so this is not a cryptographic proof against every external payload or key-dependent consumer. In the absence of a source instruction selecting its role, do not vary share boundaries, reading directions, hash wrappers or additional ciphers to rescue it. The underlying H/G relation remains a conditional source-motivated mathematical clue.
