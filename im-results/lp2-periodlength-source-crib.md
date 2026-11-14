# LP2 original full-stop lengths as word-boundary-independent plaintext cribs

**Agent11, 14 November 2026. Original-source finite negative; no unknown plaintext recovered.**

The original unresolved LP2 transcription contains **2,896 printed words** whose length-order dependence is already unusually weak for ordinary English. Prior historical source-quotation screens relied on **word breaks**. A source-quoted cleartext might evade those screens if the cipher rewrote hyphens/spaces, while preserving the printed period positions and the number of runes between them. This screen instead seeks actual known plaintext from previously used Cicada texts **regardless of every printed word break**.

## Fixed source and operation

Take the entire **12,956 original GP29 runes** on physical pp0–55; ignore the exact word/line/page breaks, but retain literal printed periods as complete-span delimiters. The 175 period-delimited runs have first lengths **[13,141,121,22,53,44,40,97,198,16]**. The first 13-rune span is a red heading; a printed period span is not automatically a conventional prose sentence.

From the checked-in original solved LP1 runes, take complete period-delimited rune lengths. From Cicada's pre-2014 historical Blake and Crowley sources and three independent literary controls (Shakespeare first 300k, Emerson essays, Gibran Prophet), compute consecutive spans ending with printed '.', '?' or '!'. Try two preselected length registers: plain Latin A–Z letters and GP29 source-native rune transcription with published ING and IO conventions. The 10 plain source files yield **20** pairs of exact source/length-register tests, plus one original solved-LP1 runic-only source. Each original triple is indexed against all source triples, then every hit is extended forward without fitting punctuation, changing length, editing source, reversing order or guessing a key.

## Observed original matches

| Source family | Longest exact consecutive spans |
| --- | ---: |
| Historical 2013 Crowley original Book of the Law I,II,III; archived Liber AL bookcode I,II,III, each Latin and GP | **at most 2** |
| Historical 2012 Blake Marriage of Heaven and Hell, Latin and GP | **at most 2** |
| Original rune-only solved LP1 | **at most 2** |
| Gibran and Emerson, Latin and GP | **at most 2** |
| Shakespeare, Latin | **at most 2** |
| Shakespeare, GP | **3** |

The sole three-span exact match is source LP2 zero-based span104 vs source Shakespeare span3142, with rune lengths **[61,41,71]**, failing the immediately following source span. No four-consecutive-span hit exists across all 21 source/register pairs. “At most 2” means no matching triple is present, without asserting that a matching pair necessarily exists.

**Original-authentic positive control:** source-solved LP2 p57 PARABLE has **four period lengths [7,30,30,28]**. Inserting that fixed four-span vector at unknown-position75 yields exact original-reader recovery of all four spans from the known p57 source. Thus the matcher detects a genuine source of the target type, and the original negatives are substantive within their finite scope.

## Decision and limits

Retire an **exact four-or-more-sentence known source quotation from these checked-in historically relevant texts** as a crib for a length-preserving cipher that leaves punctuation/order intact but changes every space/hyphen. Changing printed periods, letter deletions/insertions, actual authored text absent from the source corpus, independent compressed/byte registers or other languages remain viable. There is **no recovered unknown plaintext, original cipher key or destination**.

[Complete dependency-free single runnable Node22 SFT](../sims/lp2_periodlength_source_crib_sft.cjs) reads unchanged canonical corpus plus ten source files and LP1 runes, asserts 175/12,956 original, every source maximum, the Shakespeare triple and the p57 source-authentic four-span plant.
