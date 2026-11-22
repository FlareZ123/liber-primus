# The original 32×8 numeric rectangle as eight AES-256 chapter keys: direct inverse

**16 November 2026, Agent41. Status:** source-motivated, narrowly specified negative cryptanalytic experiment. The direct, standard AES-256-CTR byte-pad reading does not recover unknown LP2 plaintext; it does not exclude unrelated consumers of the 256 original numeral cells.

## A reversible route from one original artifact to eight manuscript sections

Physical LP2 pp49–51 (scans 66–68.jpg) print a **32-row × 8-column** table of 256 two-character base-60 numbers. Under the canonical original-source reading in `resources/liber-primus/lp2-grid-256.json`, each cell is a byte between 0 and255. Each **printed column** contains precisely **32 bytes, the key size of AES-256**. Separately, the original typed manuscript transcription delineates **eight unknown-content `$` sections** with exact rune lengths:

```text
729, 1145, 1738, 1894, 1021, 1433, 1680, 3316
```

The source also has *nine* illustrated chapter openings, a rival division. Neither a textual instruction to use AES nor an IV or byte-to-GP29 mapping is supplied. Still, eight 32-byte columns to eight original `$` sections is a direct human-observable pairing that can be tested before constructing an elaborate key search.

For section `j`, construct `key_j = bytes[8*r+j]` for rows `r=0..31`. The alternative natural reading uses eight sequential contiguous blocks `bytes[32*j..32*j+31]`. Generate one AES-256-CTR keystream byte per original GP29 ciphertext rune and interpret its GP pad symbol as `byte mod29`. The explicit native-rune inverse is

```text
P[i] = C[i] ± (AES256CTR(key_j, IV)[i] mod 29) mod 29
```

Test an all-zero 128-bit IV or integer 3301 written as either a big- or little-endian counter. Maintain all original word/punctuation/page boundaries as inert annotations; reset the independent key at each original `$` section.

This is **two key layouts × three IVs × two signs = 12** fully instantiated original-section inverses, with eight independently keyed source sections in each. No hidden key phase or secret plaintext is optimized.

## Direct original-cipher result

| Quantity | Result |
| --- | ---: |
| Original unknown GP29 runes | **12,956** |
| Original sections, exactly matched to transcription | **8** |
| Original table bytes, used unchanged | **256** |
| AES-256-CTR configurations | **12** |
| Original full unknown-corpus IoC | **0.03447840** |
| Best of 12 inverse outputs, full-corpus IoC | **0.03449603** |
| Greatest individual-section IoC among all 96 sections decoded | **0.03532995** |
| Independent solved p57 plain GP29 IoC (95 runes) | **0.06270997** |

All twelve direct inverses remain essentially flat at GP29-uniform coincidence. The numerically greatest full-book rate belongs to contiguous 32-byte keys, all-zero IV and subtraction, with initial deciphered romanization `WWOGLWNDEOBIAGOERCXEFRNGPOEBB...`; it contains no readable English. The highest *individual* section rate, 0.03532995, occurs in the little-endian-3301 / contiguous-block / addition interpretation, and is equally unpromising. Neither printed-column ordering nor contiguous-block ordering unlocks even the first source section.

For each source configuration, the reproducer enciphers a complete original-length synthetic plaintext made from **independently clear source p57 GP29 runes**, then recovers every planted rune exactly under the same key layout, IV and sign. This verifies the AES primitive, byte-to-GP composition, signs and section length. The separate source script also checks every one of the eight original `$` section boundaries and the full unchanged 256-byte table.

**CI:** existing shared Node22 workflow [run 43983731169](https://github.com/FlareZ123/liber-primus/actions/runs/43983731169), successful. [Complete read-only single-file CommonJS test](../sims/lp2_p50_eightcolumn_aes256_native_gp_original_sft.cjs).

## Cryptanalytic decision

**Retire only this exact eight-AES-256-key, CTR-to-additive-GP29 implementation.** The original byte columns are a useful finite operand, but the manuscript supplies no AES/CTR/IV/mod29 instruction; there is no basis for successively fitting dozens of IVs, word clocks, compression layers or secret KDFs to rescue a nonlinguistic first result. This result does not rule out table-as-message, authenticated digital encoding, a different key derivation, ciphertext octet packaging or a nine-illustrated-chapter layout. The next useful step must be an independent author-visible selector of the **consumer** of these bytes, or recovery of an external missing key. None is presently established.
