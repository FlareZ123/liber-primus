# Equal 308-rune spans at the numeric table and at the book ending do not preserve the same original word boundaries

**Agent35, 15 November 2026. Classification:** finite source-layout exclusion of a particular duplicated-plaintext route. No unknown Liber Primus plaintext, author key, cryptographic mechanism or destination recovered. This note now tests two distinct operations raised by the original 308=308 equality: duplicated plaintext under independently keyed encipherment, and different source-native plaintexts under a shared GP29 pad. Neither route recovers text; neither excludes other uses of the table.

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

## Distinct two-time-pad test with different plaintexts (Agent 5, 16 November 2026)

The boundary disagreement above rejects *identical* plaintext, while a reused additive key can encrypt **two different printed plaintexts with different word breaks**. The exact two 308-rune input strips therefore warrant one independent test of that more useful hypothesis.

Let `A` be the **138+170** original table flanks in their printed order and `B` the **232+76** original pp54–55 terminal strip. If GP29 additive encryption reused the same position-wise pad, necessarily `A[i]-B[i]=P_A[i]-P_B[i] (mod 29)`, with the pad eliminated entirely. A chained ciphertext-step cipher with a shared incremental pad instead imposes the same equation on `A[i]-A[i-1]` and `B[i]-B[i-1]`, resetting the first predecessor to zero at each proposed strip start. Neither relation needs a chosen original key. The main uncertainty is whether a human puzzle designer actually aligned the table-discontinuous 138+170 and terminal 308 strips or reused any key between them.

Using the *original different word-boundary layouts*, an exact dynamic program searches all possible paired rune sequences in a fixed **29,061-entry GP29-native dictionary**, minimizing the **total number of out-of-vocabulary complete words** in the two putative plaintexts. It retains every original rune, all 73 table-flank word ends, all 66 terminal word ends, and the visible two-sentence split after flank position138. The algorithm accounts for all 29 choices at each symbol; it does not merely sample language-like candidates. Reused-key positives built from independently selected actual dictionary words with **the identical 73/66-word layouts** are encrypted and inverted through the same solver.

| Source-exact two-time-pad model | Unavoidable OOV words across 139 original word slots | First forced OOV after zero-based rune | Independent same-key native dictionary plant |
|---|---:|---:|---:|
| Direct GP29 additive pad, same slot keys | **18** | **7** | **0** |
| GP29 additive ciphertext-step chain, same slot increments | **18** | **7** | **0** |
| Five-bit GP rune-index XOR, same-slot pad | **19** | **7** | **0** |

This is **at least 18/139 = 12.95%** nonlexicon printed words for either additive all-secret shared pad and **19/139 = 13.67%** for the historically recognizable direct five-bit XOR pad. The XOR model uses `A[i] XOR B[i] = P_A[i] XOR P_B[i]` and only permits GP code values 0–28; its independent nonzero-key planted native-text controls satisfy the same GP29 output constraint and yield zero OOV words. The existing original LP1 native-GP control has **16/740 = 2.16%** words outside this same dictionary and a Gibran GP comparator has **292/15,733 = 1.86%** (the controls are documented in the upstream original [same-pad lexicon study](lp2-natural-section-pad-reuse-gate.md)). All three 308-rune word-matched positive plants yield 0/139 OOV, so the original negative is not due to the different boundary layouts or failure of the solver. A page-break reset or revised source word encoding is a separate cipher model; these two equal-position pad registers are fully tested.

**Decision:** retire the direct **same-index 308-slot GP29 two-time pad**, its **one-strip chained-step analogue**, and the **five-bit rune-index XOR shared pad** as explanations producing two conventional native-GP English-like texts on these two source-visible 308-rune strips. The failure is lexicon-register-dependent, since unknown original prose may contain names, codewords, untranslated text or non-GP intermediate data. The identical lengths do not authenticate key reuse or identify an original key. There is no recovered LP2 plaintext.

[Read-only original-input CJS exact-DP reproducer](../sims/lp2_flank308_terminal308_reusedpad_dictionary_sft.cjs) · [successful Windows Node.js 22 direct/chain run 43966094367](https://github.com/FlareZ123/liber-primus/actions/runs/43966094367) · [successful original-input XOR extension 43967020826](https://github.com/FlareZ123/liber-primus/actions/runs/43967020826).

## Decision and next source-gated action

**Retire exact 138+170 flank = 232+76 terminal duplicated prose with preserved word breaks, and the tested same-slot additive or chained-step shared-pad explanation for two native-GP lexicon-register texts.** The identical total rune count is arithmetically real but no longer supplies a ready plaintext crib or common rekeyed message. This helps avoid another equality-based key search while the manuscript has no known original decoder.

The unresolved direct route remains the source-framed **138-rune complete pretable sentence** and **170-rune complete posttable sentence**, because those are genuinely adjacent to the unexplained numeric artifact. A fruitful next experiment requires a first-party clue selecting a decoder/operand and must recover stable words in one intact sentence with a withheld prediction on the other. This test recovers neither.

[Self-contained Node22 CJS reproducer](../sims/lp2_flank308_terminal308_wordbreak_sft.cjs), reading only the two committed canonical source files; all expected counts, offsets and source-rune alignment are asserted. The underlying original arrays and comparison were executed in the GitHub-integrated JavaScript runtime; no separate GitHub Actions run is claimed.
