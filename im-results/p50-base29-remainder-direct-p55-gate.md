
# p49–p51 grid BASE29 remainder prefix as a direct p55 key

**Decision (11 November 2026): bounded negative.** The first 76 row-major BASE29 remainders of the 32×8 grid spanning LP2 pages 49–51 (p50 is its middle 13-row section) do not decrypt the complete 76-rune p55 page under either direct additive direction. No unknown plaintext, authentic key, or new cipher mechanism was recovered.

## Human-solve-path hypothesis

The signed 2013 TCP challenge authenticates a BASE29 numeral-conversion operation. The preserved grid has 256 printed two-character tokens across pages 49–51 (10 rows on p49, 13 on p50, and 9 on p51) and, under the conventional but not Cicada-authenticated base-60 reading, each token is a byte B. Its Euclidean remainder R = B mod 29 is already a GP29 symbol. This is a cheap cardinality baseline, not a strong human-solve path: the first 76 row-major cells are 76 of p49’s 80 cells (the first 9½ rows), not the 76-cell perimeter and not p50’s 13-row section. The table’s 76-cell perimeter is a distinct geometry-selected hypothesis and was not used here.

The weakest assumptions are substantial: base60 is a conventional working reading, not an authenticated LP2 radix; no source says to take the remainder rather than the quotient; no source says this grid is a key for p55; and no original clue selects the p49 prefix or row-major offset zero. This test does not use the perimeter order, quotient stream, skip filter, or any key mixing.

## Frozen source extraction

Pinned Git blob SHA-1 inputs:

- resources/liber-primus/base60-grid.json: 4698c0806e6bab06a39cfbc3c3283b862de58b35
- resources/liber-primus/lp2-grid-256.json: 39c4f098566fc5eba9d6738416a2fd193f800701
- resources/liber-primus/lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- resources/lp2-transcription.txt: 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7
- resources/control/gibran_prophet_58585.txt: df260a07d56bf5998d40a6360b6132c35c252d10

The original base-60 alphabet is 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx. The 32×8 grid metadata identifies original scans 66.jpg–68.jpg and LP2 pages 49, 50, 51 with row counts 10/13/9. Under the conditional base60 reading, the tokens decode row-major to 256 byte values and agree with the canonical grid resource at all 256 positions. This is an internal cross-resource consistency check, not an independent image audit of every cell; the metadata notes that only 11 disputed original glyph positions have been independently adjudicated. The tested key is exactly R[0:76], where R[i] = B[i] mod 29; it lies entirely within p49’s 80-cell segment, omitting its last four cells and touching neither p50 nor p51. Its complete 76-symbol value sequence is:

0,28,22,12,10,5,10,9,5,17,11,19,15,4,9,9,5,28,15,4,15,21,1,0,22,24,28,25,5,8,25,17,28,27,23,10,25,22,17,5,22,26,28,15,27,20,25,18,21,16,18,1,28,26,11,22,22,2,1,11,19,22,8,22,6,23,25,18,25,15,24,21,19,21,2,3

The executable reproducer emits the entire 256-symbol remainder stream, all p55 ciphertext values, both decoded candidate arrays, exact runic/transliterated strings, and forward-reconstruction checks.

The p55 parse is source-correct: 17 page-local segments with lengths 1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3. The first one-rune segment is the tail of the 11-rune word crossing p54→p55; it is retained as the incoming carry. The complete p55 stream contains 43 strict-interior and 33 exterior runes. The key is applied to all 76 runes, not just the 43 interiors.

## Frozen inverse and controls

Only these continuous offset-zero transformations were tested: C−R mod 29 and C+R mod 29. There is no phase/offset search, key rotation, cycling, word/page reset, reordering, quotient mixing, or skip rule.

Language comparison uses the existing native-GP Gibran control and the same smoothed GP-trigram method used by the related p55 table-key gate: first 40,000 native-GP runes train the model; the remaining text supplies 22,621 held-out 76-rune windows. This is a legacy GP-English comparator, not a claim that p55 is Gibran-derived.

A wrong-key control uses the next 76 symbols R[76:152]. A separate matched key-order null makes 10,000 deterministic Fisher–Yates permutations of the exact first-76 key multiset (seed 0x03872026). A 76-rune native-GP plant is encrypted and recovered with the candidate key; the same plant does not recover under the wrong-segment or shuffled key. Both original-cipher candidates forward-reconstruct all 76 original p55 runes exactly. These are implementation checks, not evidence that the key is historically authentic.

## Original p55 results

| Candidate | Mean GP-trigram score | IoC | Held-out native windows at or below candidate |
|---|---:|---:|---:|
| Original p55 | −12.199601 | 0.037895 | — |
| C−R | −12.504343 | 0.036491 | 0 / 22,621 |
| C+R | −12.160116 | 0.035088 | 0 / 22,621 |

The worst held-out native-GP Gibran window scores **−9.748394** (median −8.209936; best −6.843136). Thus even the better C+R candidate is about **2.41 nats/rune below every held-out native window**. C−R is worse than raw p55.

Original-word-preserving GP transliterations:

- C−R: NG YYIAY IW CX IAUTHIAT LOEAETHUS SO BGCSXXOENAENDYTH DOEGOELO EOEXX TF WTHNGCSNR AEOEIULEAOE DF EACXUNEA EAMJ AETW
- C+R: NG AEOOEB LIA DA ODAENGC NODONT EAC BNGAPGANUUWMXOE SHJOGY TDIAE HW LCEAWPOY JHXOPHH IS JOEGHUF EOL NLP

Neither output is coherent plaintext.

## Key-order discrimination

The 10,000 same-multiset permutations give:

| Direction | Candidate percentile in shuffle distribution | Shuffled keys scoring at least as well | Add-one empirical upper tail |
|---|---:|---:|---:|
| C−R | 17.79th | 8,221 / 10,000 | 0.8222 |
| C+R | 72.70th | 2,730 / 10,000 | 0.2731 |

C+R is only 0.0395 nats/rune above raw p55 and its shuffle upper tail is unexceptional. C−R scores below 82.21% of same-multiset shuffles. The key order supplies no discriminating evidence for either sign.

The wrong-segment key R[76:152] scores −12.297905 (C−R) and −12.274737 (C+R), also ciphertext-like. The planted native-GP positive control recovers exactly; wrong-segment and matched-shuffle keys fail that plant.

## Decision and scope

Retire only the fixed hypothesis that the first 76 row-major BASE29 remainders of the p49–p51 grid (the p49 prefix) are a one-shot, offset-zero, direct additive/subtractive GP29 key for the complete p55 page. The test does not reject the conditional base-60 reading, the 256-symbol remainder stream's other possible roles, the distinct quotient stream, or any independently source-selected stateful/non-additive consumer. Do not rescue this result with free offsets, phases, rotations, cycling, q/r mixing, or the skip-aware model; those would be different hypotheses requiring a new original clue.

Reproduce from the repository root with Node.js 22: node sims/p50_base29_remainder_direct_p55_sft.cjs. The script asserts source fingerprints, transcription/corpus alignment, p49–p51 grid byte equality, 76-rune page segmentation, forward reconstruction, native-GP planted recovery, wrong-key rejection, and finite statistics.
