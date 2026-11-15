# Equal 308-rune spans at the numeric table and at the book ending do not preserve the same original word boundaries

**Agent35, 15 November 2026. Classification:** finite source-layout exclusion of a particular duplicated-plaintext route. No unknown Liber Primus plaintext, author key, cryptographic mechanism or destination recovered. This result tests one causal hypothesis raised by the original 308=308 length equality; it does not invalidate other table uses.

## Why this is a plausible first test

Original LP2 physical pp48–52 place a 256-number table between two **complete** GP29 sentences. The pre-table sentence consists of the final 72 runes on p48 and all 66 runes above the p49 red separator, **138** in total. The post-table sentence consists of 92 runes below the p51 table and the next 78 runes on p52, **170**. Their discontiguous total is **308** runes. Independently, the entire terminal encrypted pp54–55 contain exactly **232+76=308** runes. Thus it is cheap to ask whether the two 308-rune spans contain the *same plaintext* encrypted with different independent keys, potentially a crib for one or both original intervals.

The source-visible lengths are exact and were noted in earlier #1099 work. The **new decision** here tests their necessary *word-break* compatibility, without attempting to infer a shared secret, repeating keystream, alphabet permutation or any plaintext from the length equality.

## Unchanged original-source word-position comparison

Input comes from `resources/liber-primus/lp2-transcription.txt`, cross-checked rune-for-rune against the independent page-index source `resources/liber-primus/lp2-corpus.json`. The former is **a derivative transcription**, with printed `-` and `.` word delimiters. Original JPEGs `65.jpg`–`69.jpg` and `71.jpg`–`72.jpg` are the primary visual witnesses; a mismatch in printed word breaks should be resolved by their images if this question is revisited.

Keep source order, original within-page offsets and all printed words. Make exactly two 308-rune strips:

* Table flank: `p48[199:271]` + `p49[0:66]` + `p51[0:92]` + `p52[0:78]`. The two complete sentences end at strip rune positions **138** and **308**.
* Terminal: `p54[0:232]` + `p55[0:76]`. Its transcribed clauses end at positions **9** and **308**.

Record each position 1…308 **after** which a printed `-` or `.` terminates a word. Do not use `/` (physical line break) as an additional word boundary. Do not insert a boundary at any page break or between two source slices unless already marked. The resulting source-internal word and clause profiles are:

| Exact original region | GP runes | Printed word-end offsets | Same-position word ends shared with the other region |
| --- | ---: | ---: | ---: |
| Intact two table-flanking sentences | **308** | **73** | **12** |
| Entire pp54–55 terminal unit | **308** | **66** | **12** |

The **only 12** common word-end offsets are `[17,20,46,78,167,189,193,233,241,268,278,308]`. Thus the spans have **61** table-flank-only word boundaries and **54** terminal-only boundaries. A single unchanged 308-rune plaintext under any two independent position-varying rune substitutions, additive running keys, or one-time pads would still print *the same* word breaks if the cipher respects the source's word segmentation. It fails that key-independent condition here. Even an arbitrary **permutation of whole plaintext words** cannot make the two source strips the same word multiset, since they have different numbers of words.

Positive comparator checks compare a strip with itself, yielding the full **73/73** and **66/66** boundaries. This rejects only the duplicated-*printed-plaintext* hypothesis. A source-directed transformation that deletes seven net word separators, moves words, uses different plaintext sentences sharing rune count, or encrypts word boundaries would be a separate operation requiring authentic evidence. The 308 equality on its own does not select any of these.

## Decision and next source-gated action

**Retire exact 138+170 flank = 232+76 terminal duplicated prose with preserved word breaks.** The identical total rune count is arithmetically real but no longer supplies a ready plaintext crib or common rekeyed message. This helps avoid another equality-based key search while the manuscript has no known original decoder.

The unresolved direct route remains the source-framed **138-rune complete pretable sentence** and **170-rune complete posttable sentence**, because those are genuinely adjacent to the unexplained numeric artifact. A fruitful next experiment requires a first-party clue selecting a decoder/operand and must recover stable words in one intact sentence with a withheld prediction on the other. This test recovers neither.

[Self-contained Node22 CJS reproducer](../sims/lp2_flank308_terminal308_wordbreak_sft.cjs), reading only the two committed canonical source files; all expected counts, offsets and source-rune alignment are asserted. The underlying original arrays and comparison were executed in the GitHub-integrated JavaScript runtime; no separate GitHub Actions run is claimed.
