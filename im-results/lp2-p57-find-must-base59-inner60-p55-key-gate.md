# p57 FIND/MUST base59 self-pointer and inner-60 key gate

**Agent 8, 17 November 2026. Classification: a source-shaped radix selector candidate plus a bounded negative for one direct p55 key consumer. No unknown plaintext or authentic key recovered.**

## Why this route was worth testing

The clear p57 PARABLE contains 20 original printed words. The sentence “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE” offers a human-visible reason to test the GP-prime sums of MUST and FIND against the original p49–51 numeric table, with Euler's totient as the named “divinity” operation. This is a finite, source-led hypothesis rather than a generic search over table phases.

The original table tokens have two documented numerical readings: conventional base60 and the formal drop-f base59 alternative. For each of the 20 p57 words, the test sums the source-assigned GP prime values S and checks the self-pointer condition table[φ(S)] = S.

- FIND has S = 151 and φ(151) = 150. Under base59, zero-based table cell 150 contains 151. It is the **only** one of the 20 p57 words satisfying this self-pointer condition.
- Under base60, table cell 150 contains 153; none of the 20 p57 words satisfies the same condition.
- MUST has S = 186. The immediately outward cell 151 under base59 contains 186. The value 186 also occurs at cell 254, so the value alone is not unique; adjacency to the FIND cell selects cell 151. No p57 word sum matches the corresponding base60 cell 151 value, 189.
- φ(186) = 60, exactly the length of the table's third concentric ring. The FIND cell 150 is on the 68-cell ring; its immediate inward neighbor is cell 149 on the 60-cell ring, and its immediate outward neighbor is cell 151 on the 76-cell outer ring.

The full 20-word scan is important: raw word-sum/table-value coincidences are common (12/20 under base59 and 11/20 under base60). The more specific φ self-pointer occurs once under base59 and zero times under base60. This is a meaningful competing radix clue, but not a calibrated discovery-wide probability or proof of authorial intent. It also competes with a separate p57 date/PGP extraction that conditionally favors base60; neither path alone resolves the radix.

## Frozen decoder hypothesis

Use the source-selected radial geometry:

1. Treat cell 151 (MUST) as the start of the 76-cell outer ring, which corresponds in length to physical p55's 76 original ciphertext runes.
2. Treat cell 149, immediately inward from FIND cell 150, as the start of the 60-cell ring selected by φ(MUST) = 60.
3. Traverse both rings in the same direction, testing only clockwise and counterclockwise.
4. Read the 60 inner-ring base59 values modulo29 as a repeating additive GP29 key for p55 in physical page order.
5. Use the historically authenticated p56 subtraction direction, P = C − K mod29, and test the authentic plaintext-F-transparent rule. No phase, offset, cell permutation, value remapping, language-fitted key or unknown-plaintext crib is introduced.

The totient is used only for the two source-derived address/length selectors. It is **not** applied to every table cell: the selected 60-cell ring contains a literal zero, for which φ(0) is undefined. The key is the raw base59 cell value reduced modulo29.

## Original-cipher result

The original p55 ciphertext has literal F glyphs at local offsets 15, 25 and 41. All eight possible assignments of those three ciphertext Fs as either literal plaintext-F bypasses or encrypted non-F symbols were enumerated in each direction.

- **Clockwise:** every branch becomes impossible at p55 offset 5: ciphertext index 15 minus key index 15 gives forbidden plaintext F (index 0), although the ciphertext at offset 5 is not F.
- **Counterclockwise:** every branch becomes impossible at p55 offset 12: ciphertext index 23 minus key index 23 likewise gives forbidden plaintext F, before the first ciphertext F at offset 15.

These are exact contradictions under the transferred p56 transparent-F rule; the optional F masks cannot affect either earlier position. A source-native 76-rune p57 plant encrypted and recovered with the same key and F-bypass rule passes **76/76** in both directions.

For completeness, the no-bypass direct subtraction outputs are also nonlinguistic:

| Direction | GP29 IoC | Direct output |
|---|---:|---|
| Clockwise | 0.03263158 | AIUJAEFLYTOEEOONGEAGSYEXOEJESTHXAEBEONGIOFTYNGTLIAAWBXPAOEIALFCEAAENSIOEJNGNGHSNGFPDDPPTHTHNGDHEAXEAAE |
| Counterclockwise | 0.03122807 | ANAEMPHAELEIATFPROEHJPMCTCFFRSSIABOOEIDDHCFCNDBXTHJLOESYSIPJEEORPPTNGEAHTHJNGBDGBNNGWEAYO |

The IoCs are below the uniform 1/29 reference (about 0.03448); neither output supplies a readable p55 passage.

## Decision and limits

Retire this exact **base59 inner-60 raw-value mod29 repeating additive key → outer-76 p55** consumer under the p56 subtraction/F-transparent model. Do not rescue it by changing the ring start, phase, direction independently, table radix, F exception, key map or cipher family. Such changes require a new source-visible selector.

The p57 FIND/MUST relationships remain a reproducible, provisional base59 selector candidate, not a recovered cipher. They do not override the competing base60 date/PGP observation, and they do not establish that p55 uses the table as a key. No unknown LP2 plaintext, authentic creator key, deep-web hash preimage or final destination was recovered.

**Reproducer:** [source-native CommonJS SFT](../sims/lp2_p57_find_must_base59_inner60_p55_key_sft.cjs). It asserts the original p57 words and GP-prime sums, both radix readings, ring geometry, all original p55 F branches, exact contradictions, and 76/76 source-native planted recovery.
