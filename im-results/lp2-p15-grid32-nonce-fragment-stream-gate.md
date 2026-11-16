# Two historical 256-bit stream ciphers joining the p15 key, p50 table and 13-dot fragment clock

**Agent8, 16 November 2026.** The authentic artifact gives an unusually compact *three-input receiver hypothesis*: sixteen printed p15 Fibonacci-prime-square numbers can be serialized as a **32-byte** candidate key; the **32×8** table printed on pp49–51 supplies exactly **32 eight-byte nonces**; and **31 thirteen-dot markers** divide the complete 58-page rune tape into **32 ordered fragments**. This three-way dimensional fit is exact. It supplies an executable original-source construction, but **no first-party sentence binds these objects into a stream-cipher instruction**. The result is a bounded original-source negative for two 2014-era stream ciphers and three rune receiver formats, with no unknown plaintext.

The experiment avoids fitting keys or nonces to ciphertext. Four source-root key serializations are locked: the p15 sixteen original square integers in printed row-major or clockwise spiral order, each encoded as unsigned 16-bit big or little endian. Every byte comes directly from the original p15 numerical source. Each row of the original corrected p49–51 sexagesimal table is the complete fixed eight-byte nonce for the correspondingly numbered interval. The two simultaneous p7 thirteen-dot markers and the empty p15 leading interval produce **two zero-rune fragments at indices 8 and 11**, retained in nonce numbering. The first **28** intervals contain exactly the original **12,956 unknown ciphertext runes**; the final four contain the solved tail. The original unknown-byte-index SHA-256 is `73473a68c3fc4296f16009716d7fee18c9c102173e6e70d090c9494cc5bd9252`.

The two chosen unframed standard streams each use a 256-bit key and eight-byte nonce at a zero-based stream counter: original **ChaCha20** with 64-bit counter and nonce, and **Salsa20/20**. Salsa20/20 is tested against the published 64-byte all-zero key/nonce reference vector `9a97f65b9b4c721b960a672145fca8d4...`; the standalone CJS tests the entire 64-byte vector. Neither stream was synthesized by fitting original ciphertext. Each cipher has **4 fixed key serializations × 3 proposed GP rune transports × 2 cipher signs = 24** full programs, or **48 original candidates** in total. The three rune transports are (i) mod29 additive pad, (ii) cyclic predecessor-exclusion mod28 and (iii) ordered predecessor-exclusion mod28. The latter two conditionally interpret an equal ciphertext predecessor as the EA rune, carry the first ciphertext glyph unchanged as an interval IV, and skip a key byte on each repeat. That rank28 exception is an inference from original scarcity of adjacent duplicates, not an authenticated encoding instruction.

## Exact source-original outcomes

Both implementations use the unaltered canonical original LP2 rune sequence, 31 actual thirteen-dot boundary offsets and original 256 corrected table bytes. The independent GP29 trigram reference is trained only on preserved Shakespeare, with no unknown-LP2 data used for likelihood fitting. The last ~13k distinct Shakespeare GP runes are held out for positive encryption/recovery. Scores are mean natural log-probability per rune, higher being more English-like.

| Input or finite original decision | GP29 trigram score |
| --- | ---: |
| Raw original p0–p2, 729 runes | −4.46440 |
| Genuine known-clear p57 PARABLE | **−2.47953** |
| Held-out GP-English 12,956-rune positive text | **−2.31253** |
| Best of 24 **ChaCha20** programs on original p0–p2 | **−4.35102** |
| Same winning ChaCha20 candidate, untouched pp8–14 | −4.45289 |
| Same winning ChaCha20 candidate, untouched pp40–53 | −4.42270 |
| Best of 24 **Salsa20/20** programs on original p0–p2 | **−4.34918** |
| Same winning Salsa20/20 candidate, untouched pp8–14 | −4.42767 |
| Same winning Salsa20/20 candidate, untouched pp40–53 | −4.39470 |

None of the **48** exact source-derived programs produces recognizable English on the original opening or either untouched visual chapter. The winning Salsa20 original p0 output begins `S P L U P X A AE X Y W N U` in source GP labels and worsens in independent material. The highest training ChaCha20 selection also deteriorates on both independent original chapters. The source maps are deliberately constrained to additive and predecessor-exclusion transports: these results do not cover other original-selected byte→rune maps.

Each of the **six** cipher×transport positive-control configurations exactly encrypts and recovers **12,956/12,956 GP-English runes** under the independently selected row-major big-endian p15 key, authentic 32 row nonces and real 28 intervals. The original inputs also pass byte-exact re-encryption across all 48 tested programs. Correct roundtrips are implementation checks rather than evidence of a real LP2 key.

## Reproducers and next decision

- [ChaCha20 complete single-file CJS](../sims/lp2_p15_grid32_fragment_chacha20_sft.cjs), successful **Windows Node22** [run 43837995856](https://github.com/FlareZ123/liber-primus/actions/runs/43837995856). The initial run displayed `first13` incorrectly because typed-array `map` coerced strings to numeric zero; a subsequent source commit fixed the **display only**. Its numerical results, entire stream and planted full-length inverses remain correct.
- [Salsa20/20 complete single-file CJS](../sims/lp2_p15_grid32_fragment_salsa20_sft.cjs), successful **Windows Node22** [run 43839306130](https://github.com/FlareZ123/liber-primus/actions/runs/43839306130), with source-independent 64-byte reference-vector assertion and correct original GP label display.

**Decision:** The three physical dimensions genuinely match a compact historical key/nonce/fragment architecture, which is more directly motivated than a random key sweep. Under all 48 exactly specified programs tested, this proposed direct consumer fails to decrypt original text. A future test should require an authored instruction selecting a stream, nonce row order or GP codec, or a distinct original-source artifact supplying such a selector. Arbitrary additional key hashes, nonlinear maps and counter offsets can generate limitless explainable ciphertext fits with no progress toward authentic plaintext. None is justified by the size match alone.
