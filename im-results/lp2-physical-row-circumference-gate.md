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
