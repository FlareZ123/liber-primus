# Exact word-length-only source-quotation search on original LP2

**18 November 2026 · Agent 5 · original-source, keyless, bounded negative.** No unknown LP2 plaintext, creator key, decryption operation or final destination is recovered.

## Why this route could have produced plaintext

The entire original LP2 printed-word length sequence is directly visible before a cipher is solved. If its word boundaries and GP-native word lengths were retained from a literal quotation, an unusually long contiguous match with a known contemporaneous text could identify a complete plaintext crib without choosing any cipher key. This attack is independent of the ciphertext rune values, near-uniform letter frequencies, adjacent-doublet suppression and prior source-passages searched using the fixed-rune doublet mask. The rival is newly authored prose, a different unavailable source, or a cipher/reformatting stage that changes word lengths.

The original `resources/lp2-transcription.txt` contains **12,956 GP29 runes in 2,896 complete words** across unknown physical pages p0–55. The parsing joins `/` line wraps and `%` page wraps without terminating words; actual hyphens, periods and other printed punctuation terminate words. The test asserts that the recovered word lengths sum to 12,956 and independently verifies the corpus rune count. Thirty-two printed words straddling physical page boundaries remain complete. This is the authentic unchanged segmentation, not a postselected partition.

For each independently checked-in reference source, split source Latin into alphabetic words, apply the already established native-GP29 spelling projection (`QU→CW`, `V→U`, `K/Q→C`, `Z→S`; longest GP transliteration digraphs; special `ING→NG` and `IO→IA` as the existing source encoder specifies), and count the resulting GP rune positions in each original source word. This preserves **word length** but intentionally discards rune identities. Match every contiguous source-length sequence to every contiguous original unknown-book length sequence, both forward and with source-word order reversed. The exhaustive seven-word seed index extends every hit in both directions to its exact longest matching run. There is no tuned original offset, unknown key, language scorer, cipher family, or fitted letter mapping.

## Exact matches

| Check-in reference file | Source words | Longest forward | Longest reversed |
|---|---:|---:|---:|
| `resources/control/shakespeare_first300k.txt` | 55,407 | 9 | **11** |
| `resources/control/gibran_prophet_58585.txt` | 15,733 | 9 | 9 |
| `resources/control/emerson_essays_2944.txt` | 77,932 | 9 | **11** |
| `resources/external/cicada2012-blake-marriage-gutenberg45315.txt` | 7,778 | 8 | 8 |
| `resources/external/2013-book-of-law-I.txt` | 1,897 | 7 | 8 |
| `resources/external/2013-book-of-law-II.txt` | 1,968 | 8 | 10 |
| `resources/external/2013-book-of-law-III.txt` | 2,002 | 8 | 7 |
| `resources/external/kjv-passion-gospels-2014.txt` | 14,070 | 9 | 9 |
| `resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt` | 1,011 | 8 | 7 |

The total is **177,798 source words**, with every overlapping occurrence searched against all 2,896 original words under both source directions. A forward Shakespeare longest match begins at original word 2,358 / original rune offset 10,558 (source word 12,645), but lasts only nine words. The two reversed length-11 matches are Shakespeare at original word 659 / rune offset 3,015 and Emerson at original word 529 / rune offset 2,432. These are anonymous *length coincidences*, with no letter/rune agreement requirement, and should not be read as decoded text.

The exact method is not a probability test. In particular, source corpora share common English word lengths, Gutenberg boilerplate is retained, match lengths have been selected as maxima across nine corpora, and no discovery-wide null is claimed.

## Positive control and decisive limitation

The source-positive test plants **80 consecutive Shakespeare source GP-word lengths** starting at source word 30,000 between deliberately novel marker lengths. The identical seven-seed/extension matcher recovers the full **80/80 contiguous words** at exact source offset 30,000 and planted target offset 3. The script asserts this and the frozen maxima above, then prints source/target coordinates and all source-word snippets. A real 80-word unchanged quotation from these input texts could therefore be found under this model.

**Decision:** no long, literal, unchanged-word-length plaintext quotation from these nine source objects exists anywhere in the original unknown LP2 word sequence, in either direction. This is conditional on the published GP29 orthography and verbatim source word grouping. It does not exclude quotations with edited words or punctuation, independent word shuffling, hidden word lengths, unavailable 2014 key texts, or independently authored prose. It does not prove that word breaks are artificial or that the book cannot be solved by a different method.

**Reproducer:** [`sims/lp2_wordlength_sourcepassage_crib_sft.cjs`](../sims/lp2_wordlength_sourcepassage_crib_sft.cjs), a self-contained, read-only CommonJS Node 22 SFT using checked-in source texts. **Windows CI:** [manual execution 44279495318](https://github.com/FlareZ123/liber-primus/actions/runs/44279495318) (check run status before promoting the gate). This is a local negative decision, kept in `im-results/` rather than new established plaintext in `results/`.
