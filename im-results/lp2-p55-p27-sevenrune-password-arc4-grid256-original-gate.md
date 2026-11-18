# Original terminal seven-rune bridge password: one standard ARC4 test on the printed 256-byte table

**Agent 8, 18 November 2026. Bounded source-derived original-cipher negative.** No LP2 unknown plaintext, authenticated key or continuation destination recovered.

## Human-visible proposed route and source boundaries

Physical p55 ends with six GP29 glyphs D-J-U-B-E-I. They exactly match p27 local rune offsets 28–33. The independently solved p56 first glyph AE matches p27 next offset34. Thus the seven complete source glyphs translate to the **eight-character ASCII candidate key DJUBEIAE**, without guessing a plaintext word. Earlier native OpenPuff image-carrier and OutGuess tests on this exact cross-page echo were already negative; this investigation uses a **different, complete original recipient**, the 32×8 numerical table printed on pp49–51.

The printed table's original row-major base60 reading supplies exactly **256 bytes**, SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Historical OutGuess employed ARC4 internally, providing a period-plausible cipher primitive. The original manuscript never instructs the reader to select ARC4, the cross-page phrase as a password, or the table as ciphertext. These are explicit speculative links, so one direct receiver was tested without fitting any cipher values to unknown text.

## Frozen original-input receiver and result

**Only candidate:** Standard ARC4 KSA with ASCII password **DJUBEIAE** and zero initial keystream discard, followed by bytewise XOR against the **entire 256-byte printed table** in row-major order. No nonce, KDF, offset search, ciphertext rotation, key variants, page reset, added layers or guessed cribs. Output is assessed as a self-contained binary file or directly readable ASCII.

| Diagnostic | Original-source output |
| --- | --- |
| Decrypted 256-byte SHA-256 | **eb898b2a22bb11e7bae4087f2005d06fb128d77957332e0dce5d8664e8a262f0** |
| First 32 bytes, hex | **de44a48ab9cf15bf4364ce196786f37dda94e5e3a99f2edb9538af1aabb44efc** |
| Last 16 bytes, hex | **ec20c9de4a9f134747d18d6329a77a34** |
| Printable ASCII bytes | **101/256** |
| Longest consecutive printable span | **4 bytes** |
| Recognized source-start ZIP/GZIP/BZIP2/PNG/JPEG/PGP/PDF magic | **none** |

The output has no direct English/plain-ASCII message or known source-start file type. The implementation asserts standard ARC4 Key vector **eb9f7781b734ca72a719**, recovers all **256/256** source-native planted ASCII bytes under the identical encryption/decryption routine, and round-trips all **256/256** original numerical bytes. The functional inverse is established; a genuine unknown-page decipherment is absent.

**Exact read-only Node22 CommonJS reproduction:** [SFT](../sims/lp2_bridge_seven_rune_rc4_grid_original_sft.cjs), [successful Windows source workflow run 44336521436](https://github.com/FlareZ123/liber-primus/actions/runs/44336521436), source commit [71a3c02b](https://github.com/FlareZ123/liber-primus/commit/71a3c02bdddbfd86f28087c17569476f3fa08a78).

## Cryptanalytic decision

The single **source-echo candidate password → standard ARC4 → original whole 256-byte table → recognizable file/plaintext** interpretation fails. This rules out that bounded chain only. The source echo remains a fact; neither its use as an ARC4 secret nor the table-ciphertext role is authenticated by the creator. No unmotivated new KDF/phase/menu should be commissioned from this negative. A true successor route needs independent original instruction and a test recovering contiguous unknown LP2 plaintext with exact forward reconstruction.
