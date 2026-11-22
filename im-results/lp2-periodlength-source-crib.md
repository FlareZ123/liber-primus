# LP2 transcription-dot runs as word-boundary-independent plaintext cribs

**Original Agent11 experiment, 14 November 2026; source-frame correction by Agent24, 15 November 2026. No unknown plaintext recovered.**

## Corrected source scope

The original experiment parsed **175 transcription-dot runs** in the historical derivative transcription. The image-corrected transcription changes two mistaken clause marks on physical p8 and p40 to word separators. The rerun uses **173 transcription-dot runs**; its finite no-four-span conclusion is unchanged. These are **not physical small full stops**. The original-JPEG audit in `resources/liber-primus/lp2-punctuation-identity.json` and `sims/lp2_punctuation_source_audit.py` distinguishes 175 visible marks overall: **138 definite four-dot diamond full stops**, one ambiguous single-dot event, one three-dot comma-form event transcribed as a stop, four comma zigzags, and 31 large chapter/section marks. Four p15 numeric-row entries and one absent small event are nonphysical and excluded from that visible-mark count.

The first 13-rune run in the corrected parser ends at a large chapter/section ornament, not a small full stop. The strict confirmed small-full-stop set contains **138** boundaries; the ambiguous event is not silently promoted. That strict set yields 139 fields after the final EOF tail and is tested separately in [the BASE29 byte-field gate](lp2-small-fullstop-base29-byte-transport-gate.md). The length-crib results below apply only to the image-corrected **173-dot-run sequence**. A separate strict 139-field screen against the same 21 historically motivated source/register controls is now complete; see [the strict small-full-stop source-crib gate](lp2-small-fullstop-source-crib.md).

## Fixed source and operation

Take the entire **12,956 original GP29 runes** on physical pp0–55; ignore the exact word/line/page breaks, but retain literal dot tokens in the derivative transcription as complete-span delimiters. The 173 transcription-dot runs have first lengths **[13,141,121,22,53,44,40,97,198,16]**. The first 13-rune span is a red heading terminated in the derivative stream by a large mark; it is not a conventional prose sentence or a confirmed small-full-stop field.

From the checked-in original solved LP1 runes, take complete dot-delimited rune lengths. From Cicada's pre-2014 historical Blake and Crowley sources and three independent literary controls (Shakespeare first 300k, Emerson essays, Gibran Prophet), compute consecutive spans ending with printed '.', '?' or '!'. Try two preselected length registers: plain Latin A–Z letters and GP29 source-native rune transcription with published ING and IO conventions. The 10 plain source files yield **20** pairs of exact source/length-register tests, plus one original solved-LP1 runic-only source. Each original triple is indexed against all source triples, then every hit is extended forward without fitting punctuation, changing length, editing source, reversing order or guessing a key.

## Observed original matches

| Source family | Longest exact consecutive dot-runs |
| --- | ---: |
| Historical 2013 Crowley original Book of the Law I,II,III; archived Liber AL bookcode I,II,III, each Latin and GP | **at most 2** |
| Historical 2012 Blake Marriage of Heaven and Hell, Latin and GP | **at most 2** |
| Original rune-only solved LP1 | **at most 2** |
| Gibran and Emerson, Latin and GP | **at most 2** |
| Shakespeare, Latin | **at most 2** |
| Shakespeare, GP | **3** |

The sole three-span exact match is source LP2 zero-based dot-run103 vs source Shakespeare span3142, with rune lengths **[61,41,71]**, failing the immediately following source span. No four-consecutive-span hit exists across all 21 source/register pairs. “At most 2” means no matching triple is present, without asserting that a matching pair necessarily exists.

**Original-authentic positive control:** source-solved LP2 p57 PARABLE has four derivative dot-run lengths **[7,30,30,28]**. Inserting that fixed four-span vector at unknown-position75 yields exact original-reader recovery of all four spans from the known p57 source. Thus the matcher detects a genuine source of the target type, and the original negatives are substantive within their finite dot-run scope.

## Decision and limits

Retire an **exact four-or-more-span known source quotation from these checked-in historically relevant texts** as a crib for a length-preserving cipher that leaves this derivative transcription-dot sequence/order intact but changes every space/hyphen. This is not the result for the 138-confirmed-stop partition. That separate 139-field source-crib screen now finds no four-consecutive match across the same 21 source/register tests; the longest match is three fields, Shakespeare in the GP register [61,41,71], failing immediately afterward (unknown next field 312 versus source next field 29). Including the one ambiguous stop gives 140 fields and the same three-field maximum. See [the strict small-full-stop source-crib gate](lp2-small-fullstop-source-crib.md). Changing printed punctuation, letter deletions/insertions, actual authored text absent from the source corpus, independent compressed/byte registers or other languages remain viable. There is **no recovered unknown plaintext, original cipher key or destination**.

[Complete dependency-free single runnable Node22 SFT](../sims/lp2_periodlength_source_crib_sft.cjs) reads unchanged canonical corpus plus ten source files and LP1 runes, asserts 173 image-corrected derivative dot-runs/12,956 runes, every source maximum, the Shakespeare triple and the p57 source-authentic four-span plant. The 173-run vector must not be described as 173 physical full stops.
