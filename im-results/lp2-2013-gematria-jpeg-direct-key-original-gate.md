# 2013 Gematria JPEG direct-key inverse on original LP2

**Agent 43, 22 November 2026. Decision:** No authentic unknown-page plaintext, key or binary payload emerged from 40 complete and reversible original-LP2 inverses using the exact recovered 2013 Gematria JPEG. This is a narrow negative for literal historical source bytes, with an intact positive control.

## Intended solve-path premise

In the 2013 Cicada puzzle, a player recovered the Gematria Primus JPEG by XORing original audio bytes and offset-addressed Twitter bytes. The recovered image is the first-party rune/prime table, and XOR is a demonstrated 2013 step. Those facts motivate asking whether the known source JPEG can also supply a 2014 keystream. No 2014/2016 signed instruction is known to select the bytes of that JPEG as an LP2 key, so these are exploratory original-source tests.

The exact 64,167-byte image comes from the [archived 2013 recovery](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/003-twitter). Its Git blob is **65ded13617196f0fd5d210855a75452ff2e7a340**, asserted by the SFT and preserved unchanged as [base64 historical reference](../resources/historical/cicada2013-gematria-jpeg.b64). The canonical unknown LP2 corpus contains 12,956 GP29 runes on 55 rune-bearing physical pages. Authentic solved p57 supplies 95 original clear runes for a separate positive plant.

## Exact tested operations

**32 direct GP29 readers:** Map source JPEG bytes to GP29 by either byte modulo29 or floor(29 times byte divided by256). For each, add or subtract the mapped key modulo29. Start at one of four source-named offsets, **0, 761, 1033, 3301**, and either advance across the entire printed book or restart at physical page boundaries. All 32 original-cipher transforms and 32 separate authentic-p57 encrypted controls invert exactly.

**8 binary XOR readers:** Interpret each complete original page as a fixed-length big-endian base29 integer with no loss of its rune count, pack those integers into exactly **7,893 bytes**, and XOR those bytes one-to-one with the original JPEG at the same four source-named offsets. Run with global or page-reset clocks. XOR has a real 2013 author precedent; this particular GP29-to-byte transport has no authenticated 2014 instruction. All eight original transforms invert exactly and recover separately encrypted genuine p57 controls.

## Original observed results

| Statistic | Exact original result |
|---|---:|
| Source JPEG bytes | 64,167 |
| Unknown printed GP29 runes | 12,956 |
| Unmodified original GP29 coincidence index | 0.0344783978645 |
| Best IoC among 32 direct byte-key outputs | **0.0345293973046** |
| Genuine clear p57 GP29 IoC | 0.0627099664054 |
| Direct modes with substantial native-language collision excess (IoC at least0.04) | **0 / 32** |
| Packed original unknown ciphertext bytes | 7,893 |
| XOR modes with recognizable ZIP, gzip, PDF, PNG, JPEG, GIF, ELF or RAR header at byte zero | **0 / 8** |
| XOR printable ASCII fractions | 0.36057 to 0.37578 |
| Exact native-p57 encrypted/decrypted controls | 40 / 40 |
| Complete original-cipher inverse round-trips | 40 / 40 |
| Whole-JPEG SHA512 equals solved p56's terminal hash | No |

The strongest direct GP29 reader is the continuous offset-zero, floor(29b/256), subtract mode. Its output remains near uniform and the original first-page text is incoherent. No binary receiver yielded recognizable plaintext. The absence of printable ASCII or common file signatures at offset zero cannot disprove a second encrypted binary layer; that is outside this finite test.

**Execution:** [Successful Node22 GitHub Actions run 45055616784](https://github.com/FlareZ123/liber-primus/actions/runs/45055616784). The standalone [read-only test](../sims/lp2_2013_gematria_jpeg_direct_key_original_sft.cjs) checks the exact original image blob, rune counts, the finite whole-book sweep, all positive controls, and each byte inverse. Its [manual CI workflow](../.github/workflows/agent43-2013-gematria-jpeg-directkey-manual.yml) has no scheduled runs.

## Cryptanalytic consequence

The original 2013 image is a genuine potential key *source* and the exact use of XOR is historically demonstrated. Reusing those bytes directly against LP2 does not yield the author's text. Subsequent work should require a specific 2014/2016 clue to a different image readout, an external archived secret, or a different receiver before adding key offsets or KDFs. No changes to the authoritative plaintext synthesis are justified by this result.
