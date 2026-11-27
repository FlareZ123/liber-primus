# Physical rune-row circumference: literal one-shell gate

Director issue #2841. Agent 11, 2026-11-25.

## Fixed operation

Use the corrected physical line map `resources/transcriptions/lp2-image-corrected.txt` (blob f7b534a33edeb212d427329798438325307463d7) and canonical corpus (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165). Insert empty physical p50 at its actual position. Each nonempty page: read top row left-to-right, right endpoint of each intervening row top-to-bottom, bottom row right-to-left, then left endpoint of intervening rows bottom-to-top. Deduplicate corners and singleton rows. The complementary interior remains in original reading order. No alternate widths, rotations, translations or fitted parameters.

Exact page-local rune offsets and physical row lengths are in the raw tape; their cumulative row lengths identify each original row and column uniquely. The unchanged original transcription is the punctuation/line-break sidecar. This operation resets geometry per physical page, not linguistic words: p31→p32 and p54→p55 carries are not split into new words. All original rune positions reconstruct exactly from perimeter offsets and the interior complement. No pixel-coordinate or automatic OCR claim is made.

## Original results

- 55 rune-bearing unknown pages, plus empty p50; 594 original rune rows, 12,956 runes.
- Perimeter 3,294 runes (IoC 0.0346196261); interior 9,662 runes (IoC 0.0344948569).
- No independently recognizable direct instruction in the ordered perimeter, or typed receiver for the complementary interior. Six exact source-phrase checks (the three p57 clauses, p56 deep-web phrase, two signed 2016 phrases) found no occurrence within either part of any unknown page or either concatenated tape.
- The count 3,294 is the result of the fixed definition, not 3,301; no compensating symbols or alternative shell definitions introduced.

## Known controls

| Page / register | Exterior | Interior | Exterior IoC | Interior IoC |
|---|---:|---:|---:|---:|
| p56 original ciphertext | 44 | 41 | 0.034884 | 0.035366 |
| p56 authenticated plaintext | 44 | 41 | 0.071882 | 0.060976 |
| p57 clear original | 49 | 46 | 0.069728 | 0.058937 |

p56 plaintext is authenticated in the script by exact forward encryption with the known prime-minus-one schedule and F bypass. p57 is the original clear page. The same geometric operation preserves recognizable fragments of known plaintext but interrupts complete clauses; the six-phrase screen therefore is a limited check, not an all-language impossibility proof. This distinguishes a literal extraction from a cryptographic decipherment.

## Decision

Retire this **specific** direct page-outline interpretation as an operational clue. The source does not select a key or interior decoder; no arbitrary second-stage inverse attempted. Related earlier work: `lp2-p57-literal-word-circumference.md` (#343, word shells), which is a different geometry. No new plaintext or key.

Reproduction: `node sims/lp2_physical_row_circumference_sft.cjs` (the same function was executed on the exact repository input in connected V8; no CI claim). Machine-readable source-coordinate tape: `im-results/lp2-physical-row-circumference-output.json`.

## Distinct follow-up: recursive shell as prime-clock traversal (Agent39, 27 November 2026)

The preceding literal extraction does not test whether the order of shedding perimeters is the *key clock*, with plaintext still read in ordinary physical order. This follow-up freezes p55 only: start at top-left, clockwise perimeter, remove those positions, then repeat on the residual ragged rows. Every rune is retained, including the incoming carry. Its four original row lengths are 24/22/22/8, yielding rings of 36 and 40. Phase zero starts at p55, and the authentic p56 prime-minus-one additive shift is consumed in this traversal. Test the exact native plaintext-F hold law and, separately, the ordinary consuming law. No alternate starting point, phase, source geometry or key is optimized. The p57 closing parable motivates the shell traversal, but does not authenticate it or the p55 reset.

The standalone inverse enumerates all legal holds (a zero ciphertext can be a literal plaintext F or a consuming shifted nonzero symbol); a consuming zero plaintext is forbidden in the hold model. Each complete path exactly re-encrypts. The source parser checks every rune against the canonical physical corpus. Authentic p56 in its actual row-major order re-encrypts 85/85. Two native controls take the first 76 runes of authentic p56 plaintext and clear p57 respectively, encrypt on the p55 shell route, and hide plaintext from the decoder. The fixed smoothed trigram model is trained on 3,024 GP runes from the editor-normalized LP1 reference only (neither p56 nor p57). Both truth paths rank first, among 4 and 15 legal paths; scores -2.693948 and -2.735179. This calibrates path ranking on two examples, not general language coverage.

**Original p55 native-F inverse:** no complete path; all states die after 49 legal traversal positions, at zero-based traversal offset 49, physical rune offset 38, ciphertext GP index 23, predecessor clock/shift [{"clock":48,"shift":23}]. Peak simultaneous path count is 2. **Ordinary consuming inverse:** exactly one path, score -3.440118, nonprose; the exact candidate and source order are preserved in the output. No unknown plaintext or authentic key. The page-local receiver fails; the chapter-origin rival below tests the independently visible red rubric rather than choosing a new phase from ciphertext. Do not reinterpret the failure as all possible spiral orders, reset rules, or prime clocks being impossible. This is a distinct clock test, not a repetition of the preceding direct extraction. No CI was run; the reproducer executed in connected V8 on the original repository inputs.

Reproduce: `node sims/lp2_p55_recursive_shell_primeclock_sft.cjs`. [Machine output](lp2-p55-recursive-shell-primeclock-output.json).

### Independent chapter-origin rival (same exact shell operation)

The p54→p55 physical carry makes a p55 reset questionable. A visible p54 red nine-rune chapter rubric supplies a distinct candidate origin without searching phase offsets. Exclude the nine heading runes; freeze the remaining p54 row lengths 10/21/17/23/22/22/21/23/21/22/21 (223 runes), the same page-local clockwise recursive traversal, and one continuous prime clock through p55's 76 runes. This retains the full cross-page carry and does not restart the clock at p55. The p54 body shells contain 49/53/40/40/29/12 runes. This is a conditional chapter-reset hypothesis, not an established historical reset rule.

A 299-rune synthetic control formed by concatenating authentic p56 plaintext and clear p57 twice and taking its prefix is correctly recovered at rank 1 among 90 paths (score −2.728867); its repeated source material is not an additional independent literary sample. On untouched original p54–p55, the native-F inverse dies after **18 legal traversal positions**, at zero-based body offset201 (physical p54 offset210), ciphertext index8, sole remaining clock18/shift8. The ordinary consuming inverse has one path with whole-chapter score −3.500197 and p55 continuation −3.477884, nonprose. Exact replay and full candidate are retained in the same machine output. This closes the two source-motivated reset choices for the specific shell-clock transfer, not arbitrary traversals or clocks. Neither result changes the authoritative plaintext status.
