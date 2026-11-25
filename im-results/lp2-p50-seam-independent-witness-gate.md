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

## Two-sided typed-field source witness (#2772, Agent5, 25 November 2026)

The original 66.jpg and 68.jpg were directly inspected from the maintainer's supplied image archive. The numeric table separates distinct prose groups: p49 ends in a complete six-rune group, p51 starts a three-rune group and then a six-rune group. The four frozen left members are the final four runes of that six-rune group; the right members are the whole first group plus the first rune of the next. A word physically spanning the field is not indicated: the red ten-dot mark follows the complete left group. Neither the shared vine border nor the field itself supplies a known plaintext rune.

Rather than repeating the Liber AL verse search or selecting phrases by the five residues, examine the exact **post-field** prose of the already source-attested analogues from #2578. The earlier gate tested their pre-field clauses; this extension asks whether an independently identified field is a genuine two-sided textual template. The p56 solved hash field is the nearest internal typed-data analogue. The 2012 signed RSA challenge has two distinct, explicit typed fields (ciphertext armor and serialized public key). The two LP1 KNOW THIS tables terminate their native text records and supply no immediate post-field prose witness.

| Source field | First four post-field GP group widths | Original p51 widths [3,6,5,5] compatible? |
|---|---|---|
| Solved p56 hash | 2,2,2,4 (native GP) | No |
| Signed 2012 RSA ciphertext | 4,2,(2/3),6 | No |
| Signed 2012 RSA serialized public key | (2/3),9,7,2 | No |

The Latin source widths grant all single Latin letters and all merged chart digraphs TH, NG, ING, EO, OE, AE, IA, IO, EA, so these necessary failures do not depend on a single greedy tokenization. The RSA field boundaries were read directly from the archived signed-message text (not selected by LP2 differences). The p56 reference is the exact native GP record. The target rune values and group lengths were checked against the original corpus and matching transcription. This new post-field condition is only a scope extension: pre-field literals already failed #2578; it is not an additional independent historical source and it does not exclude hidden plaintext boundaries. No signed difference was computed from these rejected templates.

**Decision:** no first-party source fixes both members of any seam pair. Retire the restricted five-way branch pending an independently obtained exact witness. Do not reinterpret an arbitrary familiar source sentence as a known difference if boundaries are allowed to change: an explicit source-selected alignment is still required. No new key, plaintext, or table operation. The external Session 219/220 pages were inaccessible during this invocation; the frozen predictions are inherited from #2750, not newly verified.

Inputs: `resources/liber-primus/lp2-corpus.json` (054f2a0f780b7d46901acbe3d9bf4f0ac1801165), `resources/liber-primus/lp2-transcription.txt` (43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7), `resources/external/relikd-solved-gp29-native-v1.json` (1b064ef6d85819b7d96adaff31a82d1ec551598f), `resources/external/2012-sq6wmgv2zcsrix6t-unknown.asc` (0e69b063b379a8ccdd8a96815de318bcf65a1247). The post-field width enumeration was executed in the connected JS runtime, no CI. Earlier template scope: [#2578 report](lp2-p49-typed-field-template-original-gate.md).

## Remaining missing input

The prior [complete flanking sentence study](lp2-p49-table-complete-flanking-sentences.md) already tested intact word-length matching of four first-party Cicada texts and nine solved passages; no match. The 2014 release announcement and 2013 signed TCP protocol identify no plaintext at these seam offsets. The actual 761/Parable source-to-text witness is anchored at p57, not at this table. No source-independent known rune on both sides of any frozen pair was located. Accordingly report the missing witness and stop, rather than select a row by language plausibility or invent a crib.

To reopen: require an independently authenticated transcription or a source-derived transformation with exact GP spelling and an independently fixed position for both members of at least one pair. Preserve that constraint before testing these predictions. Even then, the selected row is conditional on the restricted model family and is not a recovered absolute key.

Source files: `resources/transcriptions/lp2-image-corrected.txt` blob f7b534a33edeb212d427329798438325307463d7; `resources/liber-primus/lp2-corpus.json`. Group lengths and all alias-length sets above computed in V8 against those repository sources. The original positive geometry and historical book code are inherited evidence, not new independent authentication of the quote.