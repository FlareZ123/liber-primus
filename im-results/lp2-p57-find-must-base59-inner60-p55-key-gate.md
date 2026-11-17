# p57 FIND/MUST base59 self-pointer and inner-60 key gate

**Agent 8, 17 November 2026. Classification: a source-shaped radix selector candidate plus bounded negatives for two direct p55 key consumers. No unknown plaintext or authentic key recovered.**

## Why this route was worth testing

The clear p57 PARABLE contains 20 original printed words. The sentence “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE” offers a human-visible reason to test the GP-prime sums of MUST and FIND against the original p49–51 numeric table, with Euler's totient as the named “divinity” operation. This is a finite, source-led hypothesis rather than a generic search over table phases.

The original table tokens have two documented numerical readings: conventional base60 and the formal drop-f base59 alternative. For each of the 20 p57 words, the test sums the source-assigned GP prime values S and checks the self-pointer condition table[φ(S)] = S.

- FIND has S = 151 and φ(151) = 150. Under base59, zero-based table cell 150 contains 151. It is the **only** one of the 20 p57 words satisfying this self-pointer condition.
- Under base60, table cell 150 contains 153; none of the 20 p57 words satisfies the same condition.
- MUST has S = 186. The immediately outward cell 151 under base59 contains 186. The value 186 also occurs at cell 254, so the value alone is not unique; adjacency to the FIND cell selects cell 151. No p57 word sum matches the corresponding base60 cell 151 value, 189.
- φ(186) = 60, exactly the length of the table's third concentric ring. The FIND cell 150 is on the 68-cell ring; its immediate inward neighbor is cell 149 on the 60-cell ring, and its immediate outward neighbor is cell 151 on the 76-cell outer ring.

The full 20-word scan is important: raw word-sum/table-value coincidences are common (12/20 under base59 and 11/20 under base60). The more specific φ self-pointer occurs once under base59 and zero times under base60. This is a meaningful competing radix clue, but not a calibrated discovery-wide probability or proof of authorial intent. It also competes with a separate p57 date/PGP extraction that conditionally favors base60; neither path alone resolves the radix.

## Frozen geometry and candidate key maps

The source-shaped radial alignment is fixed, without a fitted phase:

1. Cell 151 (MUST) starts the 76-cell outer ring, which corresponds in length to physical p55's 76 original ciphertext runes.
2. Cell 149, immediately inward from FIND cell 150, starts the 60-cell ring selected by φ(MUST) = 60.
3. Traverse both rings in the same direction, testing only clockwise and counterclockwise.
4. Assign p55's original page-order runes to the outer ring from cell 151; read the inner ring as the key.

Two source-motivated key maps were tested:

- **Raw table key:** each inner-ring base59 value reduced modulo29 (60 key symbols).
- **Divinity key:** apply φ to each inner-ring base59 value and reduce modulo29. The ring contains one zero, at cell229; φ(0) is undefined, so omit that one cell, leaving 59 defined key symbols. No arbitrary replacement for φ(0) is used.

Both use the historically authenticated p56 subtraction direction, P = C − K mod29, and the authentic plaintext-F-transparent rule. All eight assignments of p55's three ciphertext Fs (offsets 15, 25 and 41) as literal plaintext-F bypasses or encrypted non-F symbols are enumerated in each direction. No extra phase, offset, cell permutation, value remapping, language-fitted key or unknown-plaintext crib is introduced.

## Original-cipher results

| Key map | Direction | First F-rule contradiction | No-bypass IoC | Native plant |
|---|---|---|---:|---:|
| Raw value mod29 | Clockwise | offset 5: 15 − 15 = 0 | 0.03263158 | 76/76 |
| Raw value mod29 | Counterclockwise | offset 12: 23 − 23 = 0 | 0.03122807 | 76/76 |
| φ(value) mod29, omit zero | Clockwise | offset 0: 21 − 21 = 0 | 0.03403509 | 76/76 |
| φ(value) mod29, omit zero | Counterclockwise | offset 0: 21 − 21 = 0 | 0.03438596 | 76/76 |

Every one of the 8 F-mask branches fails for each of the four cases. The raw-key contradictions occur before p55's first ciphertext F at offset15; the divinity-key contradictions occur at offset0. In every case, a non-F ciphertext rune would have to decrypt to plaintext F, which is forbidden by the authentic transparent-F forward rule. The 76-rune p57 native plants encrypted and recovered with each corresponding key and F-bypass rule pass **76/76**, confirming the receiver implementation.

For completeness, the no-bypass direct subtraction outputs are:

| Key map | Direction | Direct output |
|---|---|---|
| Raw value mod29 | Clockwise | AIUJAEFLYTOEEOONGEAGSYEXOEJESTHXAEBEONGIOFTYNGTLIAAWBXPAOEIALFCEAAENSIOEJNGNGHSNGFPDDPPTHTHNGDHEAXEAAE |
| Raw value mod29 | Counterclockwise | ANAEMPHAELEIATFPROEHJPMCTCFFRSSIABOOEIDDHCFCNDBXTHJLOESYSIPJEEORPPTNGEAHTHJNGBDGBNNGWEAYO |
| φ(value) mod29, omit zero | Clockwise | FEOPNLDNGOCEOAENGXPUSAENGTPDEOJXRHRIFOERGHFOEYOXNGCNGDOEXOEEAIDIADMTHNEAWMWICNUGPOEACTHIANTHEOOERH |
| φ(value) mod29, omit zero | Counterclockwise | FUYTHBNPMWOBBREOCIPPYYAIANGANNUHIERRTHSAIAPDIIAETHGIAIDNXTHWNGOIDTHXGEIDOEDOEAASWOEMCNGJYEAAE |

The four IoCs are near the uniform 1/29 reference (about 0.03448); none supplies a readable p55 passage.

## Decision and limits

Retire these two exact **base59 inner-60 → outer-76 p55 repeating additive GP29 key consumers** under the p56 subtraction/transparent-F model: raw table values modulo29, and φ(table value) modulo29 with the undefined zero omitted. Do not rescue them by changing ring start, phase, direction independently, zero convention, table radix, F exception or key map. Such changes require a new source-visible selector.

The p57 FIND/MUST relationships remain a reproducible, provisional base59 selector candidate, not a recovered cipher. They do not override the competing base60 date/PGP observation, and they do not establish that p55 uses the table as a key. No unknown LP2 plaintext, authentic creator key, deep-web hash preimage or final destination was recovered.

**Reproducer:** [source-native CommonJS SFT](../sims/lp2_p57_find_must_base59_inner60_p55_key_sft.cjs). It asserts the original p57 words and GP-prime sums, both radix readings, the unique 20-word self-pointer, ring geometry, both source-motivated key maps, all original p55 F branches, exact contradictions, and 76/76 source-native planted recovery.
