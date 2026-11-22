# Red-prime-mark 256-event tape: GF29 root intersection and direct RC4 result

**Agent 11, 16 November 2026. Intermediate original-source finding.** An alternative original-source 256-event tape, defined by red runes plus red prime-count punctuation marks, shares one exact GF29 polynomial root with the original p49–51 numeric table under a zero-marker convention. The previously tested all-thirteen-dot tape does not share this root. The relationship is limited, and three direct RC4 consumers do not produce a readable or typed 256-byte payload. No original LP2 plaintext, authenticated key, cipher or destination is recovered.

## Original-class selector and clue

The original LP2 scans have **225 red runes**, **30 red thirteen-dot marks**, **one black thirteen-dot mark** (p7) and **one red twenty-three-dot mark** after clear p57. The derivative original-scan dataset is [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json). [Director #1278](https://github.com/FlareZ123/liber-primus/issues/1278) and [#1282](https://github.com/FlareZ123/liber-primus/issues/1282) independently recognized two natural 256-event selections:

- **A:** all 225 red rune positions plus all **31 thirteen-dot** marks, including black p7 and excluding the final red23.
- **B:** all 225 red rune positions plus all **31 red prime-count** marks, selecting 30 red13 and final red23, excluding black p7.

Both are ordered by physical page then original source rune offset, placing a dot mark before a rune at the same offset. Independently, the original pp49–51 table has **32 × 8 = 256** two-character numeral cells. The canonical base60 byte interpretation has SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

A plausible but unprovided mathematical reading encodes the red glyphs as canonical GP29 indices and the punctuation events as **field zero**, then treats their 256 values as descending polynomial coefficients over GF29. The p39 original red triad defines the earlier established factor **G(X)=15(X+5)²**, and the original printed table has that same factor. Thus **x=24** is a source-selected evaluation point; the convention of representing punctuation by zero is still a hypothesis.

## Exact original-input readout

| 256-coefficient object | Value at 24 | Derivative at 24 | All GF29 linear roots |
|---|---:|---:|---|
| Original printed **base60 table** | **0** | **0** | 24 |
| A tape, GP indices + zero marks | 27 | 5 | 0, 1 |
| **B tape, GP indices + zero marks** | **0** | **7** | **0, 1, 24** |
| A tape, GP indices + literal dot counts | 28 | 11 | 22, 26 |
| B tape, GP indices + literal dot counts | 18 | 13 | none |

B with zero marks shares the **single** linear factor **X+5** with the table. Because its derivative at24 is **7**, it does **not** share the double-root factor G(X) as a whole. A separate earlier [A-tape GF29 all-marker study](../sims/lp2_red256_table_gf29_sharedfactor_sft.cjs) found four isolated linear collisions for A with freely chosen, nonliteral marker values. This B result is distinct because the independently visible event membership is changed. Under a uniform, independently frozen tape model, an isolated root agreement would occur roughly once in29 trials. The accumulated research search makes that nominal frequency an **inadequate significance claim**. Neither original artwork nor an authenticated instruction uniquely selects B, a zero-valued mark, or polynomial division as a decoder.

## Direct complete receiver test

Historical Cicada OutGuess used ARC4-type randomization, providing a reason to test one source-contained, full-length receiver. Use all **256 B events** as an unmodified raw RC4 key, and XOR the generated first256 keystream bytes with all256 original numeric-table bytes. Three predeclared event serializations give these actual complete-run outputs:

| Literal source B key | Output first24 bytes, hexadecimal | Printable ASCII plus whitespace / 256 |
|---|---|---:|
| GP rune index and zero marks | 9433448a26b4a364bbc7183fc84638fe2e9fa9851e8089d2 | **93** |
| GP rune prime weight and zero marks | 5e1353c6a4ce55b57a0cf4e7904e0cc5f044deb3a7558697 | **97** |
| GP rune prime weight and literal mark count | 9f5734ea064560358161d65cdfde308336a653f633dbaaa0 | **114** |

All three 256-byte outputs appear unstructured and have no intact armored PGP delimiter or readable Liber Primus phrase. These tests do not exclude every possible binary file format. Each source-driven key exactly reencrypts the original table and decodes a separately planted clear-byte control. Such round trips show the implementation is sound, without authenticating a guessed key.

## Decision and next action

The **B/zero root24 match** is an exact, narrow, source-reproducible additional observation, rather than a decipherment. It is weaker than a complete shared polynomial factor or a typed plaintext recovery. The direct RC4 consumers fail. A future step would require a *first-party instruction* selecting the B tape, zero-mark representation and a specific reversible operation that recovers a whole original unknown page or independently identified payload. Do not turn the collision into arbitrary dot-value or cipher-phase searches.

**Read-only Windows Node22 CommonJS SFT:** [sims/lp2_redprime256_root_rc4_sft.cjs](../sims/lp2_redprime256_root_rc4_sft.cjs). It asserts the original rune/jpg annotations, counts, complete GF29 linear-root arrays, printed-byte SHA, all RC4 head bytes and printable counts, exact inverse replay and independent planted controls.
