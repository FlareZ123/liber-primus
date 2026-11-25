# P50 seam: independent witness gate (#2750)

Agent 7, 2026-11-25. **Disposition: missing independent operand; none of the five restricted seam predictions can be selected.** No plaintext or key is claimed.

## Frozen target

The numeric grid occupies p49–51; p50 has no runes. The issue's p52 reference is a coordinate typo: the first rune-bearing page on the right is p51. Using zero-based physical page offsets and global rune offsets in the canonical corpus:

| Pair | Global offsets | Cipher indices |
|---|---|---|
| p49:62 → p51:0 | 12110→12114 | 7→7 |
| p49:63 → p51:1 | 12111→12115 | 11→7 |
| p49:64 → p51:2 | 12112→12116 | 13→13 |
| p49:65 → p51:3 | 12113→12117 | 23→0 |

Session 220's predictions (right plaintext minus left plaintext modulo 29) were frozen before source testing:

| Restricted hypothesis | Four predictions |
|---|---|
| No extra step | 0,25,0,6 |
| p40 +1 | 17,14,12,17 |
| p42 +2 | 18,0,11,2 |
| p46 +2 | 10,18,19,13 |
| p40 +3 | 12,7,17,24 |

All four columns have five distinct entries. A genuine independently obtained difference could distinguish these five *conditional* hypotheses, or reject all five; a guessed difference cannot. The no-jump row still leaves 899 absolute keys in the external model. External sources: [Session 219](https://cicadanotebook.com/sessions/219.html), [Session 220](https://cicadanotebook.com/sessions/220.html). No lag-four or key sweep repeated.

## Independently motivated candidate and rejection

The prior [Liber AL III:47 geometric gate](lp2-liber-al-iii47-p49-grid-overlap-gate.md) motivates one source without reference to the prediction values: the 2013 book code used Liber AL, and the p49 table has the same 10×8 geometry as the III:47 manuscript grid. This is only a source candidate, not proof of quotation. The literal verse actually contains intervening prose between DIVINE and THEN; a search excerpt eliding that prose cannot serve as an aligned witness.

The corrected LP2 transcription around its red ten-dot stop and grid, ignoring line wraps and page marks, gives the last four and first four complete printed group lengths:

    6 5 2 6 | 3 6 5 5

I used the exact [verse III:47](https://nofaithinthehumanrace.com/legis/?chapter=3&verse=47) (also [Hermetic Library transcription](https://hermetic.com/crowley/libers/lib220)). For each word enumerate all segmentations into chart transliterations plus ING, IO, K, Q, V and Z, with QU→CW. This deliberately permits both merged and unmerged digraph readings; it is a necessary length gate, not an assertion that all spellings are authentic. The following are all five internal full-stop cuts in the verse. Lists in parentheses are alternate possible rune lengths. Ampersand is omitted in the last left window; its inclusion as AND cannot repair the failed right window.

| Cut (short cue) | Last four word-length sets | First four word-length sets | Pass |
|---|---|---|---|
| DIVINE / LET | 2,(4/5),5,6 | 3,3,3,4 | no |
| ALL / THEN | 3,2,2,3 | (3/4),(3/4),4,5 | no |
| ALSO / AND | 2,1,3,4 | 3,11 (sentence ends) | no |
| ABRAHADABRA / IT | 3,11 (sentence begins) | 2,5,2,3 | no |
| STRANGELY / LET | 3,5,(3/4),(8/9) | 3,3,3,4 | no |

Thus the direct, word-separator-preserving quotation of this independently suggested verse across the actual LP2 sentence stop fails before any plaintext differences are computed. In particular the source's line-key instruction follows ALL (three runes), not DIVINE (six); this alone breaks the intended immediate alignment. This does not exclude altered prose, transposition, alternate separator semantics, or other verses. Those alternatives cannot supply a *known* difference without an independent alignment rule.

## Remaining missing input

The prior [complete flanking sentence study](lp2-p49-table-complete-flanking-sentences.md) already tested intact word-length matching of four first-party Cicada texts and nine solved passages; no match. The 2014 release announcement and 2013 signed TCP protocol identify no plaintext at these seam offsets. The actual 761/Parable source-to-text witness is anchored at p57, not at this table. No source-independent known rune on both sides of any frozen pair was located. Accordingly report the missing witness and stop, rather than select a row by language plausibility or invent a crib.

To reopen: require an independently authenticated transcription or a source-derived transformation with exact GP spelling and an independently fixed position for both members of at least one pair. Preserve that constraint before testing these predictions. Even then, the selected row is conditional on the restricted model family and is not a recovered absolute key.

Source files: `resources/transcriptions/lp2-image-corrected.txt` blob f7b534a33edeb212d427329798438325307463d7; `resources/liber-primus/lp2-corpus.json`. Group lengths and all alias-length sets above computed in V8 against those repository sources. The original positive geometry and historical book code are inherited evidence, not new independent authentication of the quote.