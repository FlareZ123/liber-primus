# Onecool 2017 LP2 transcription lineage: shared ancestry established

## Decision

Director issue #3381 asks whether the August 2017
`onecool/3301-public` LP2 JSON is an independently made scan transcription
or descends from an earlier public/community transcription lineage.

**Decision: it is not an independent rune witness.** Four exact rare onecool
errors are already present in the dated January 2015 Titanpad-derived
`resvolver/c1cada/transcriptions.rne` branch, while the corrected canonical
branch in the same repository lacks them. A separately dated August 2016
`henkman/liberprimus` witness preserves three of the same four coordinates.
That is direct error-fingerprint evidence of shared ancestry.

This result does **not** identify a unique parent. The exact onecool.us
May-2014 `runes_by_page.txt` and `unstructured_runes.txt` remain
unrecovered (#931), so onecool could have supplied an ancestor to the 2015
branch, copied that branch later, or shared another community ancestor. The
scientifically justified classification is therefore **non-independent /
shared ancestry; direction unresolved**.

## Frozen onecool fingerprint

The complete original-scan adjudication in
`im-results/lp2-onecool-2017-scan-adjudication.md` resolves all 30 onecool
edits relative to the image-corrected corpus:

- 18 historical substitutions;
- 6 historical omissions of visibly printed runes;
- 6 historical-only rune insertions, all actually Arabic section numerals
  1,2,3,4,5,7 absorbed as GP U,TH,O,R,C,W.

For lineage comparison, the relevant rune-reading error set has **24 sites**
(18 substitutions + 6 omissions). The six numeral/rune category errors are
kept as a separate formatting fingerprint.

## Exact shared rare errors

The repository's dated 2015 reconstruction of Titanpad
`hJ8pVQ5S43` is
`resvolver/c1cada/transcriptions.rne`, corrected on 2015-01-23. Its
13,072-rune stream has 70 edit operations against the original-image
canonical text. Four of those are exact onecool errors:

| LP2 page | page-local offset | canonical | January-2015 branch | onecool 2017 | match |
|---:|---:|---|---|---|---|
| p33 | 100 | B `ᛒ` | W `ᚹ` | W `ᚹ` | exact substitution |
| p33 | 117 | B `ᛒ` | W `ᚹ` | W `ᚹ` | exact substitution |
| p36 | 0 | Y `ᚣ` | E `ᛖ` | E `ᛖ` | exact substitution |
| p39 | 36 | N `ᚾ` | omitted | omitted | exact omission |

These are not generic A/O or A/AE near-neighbour slips. The duplicated p33
B→W error occurs twice at fixed page offsets; the p36 initial Y→E and the
p39 interior N omission add two different error types at two different
pages.

The same old transcription family has an independently dated public
descendant: `henkman/liberprimus` added its 13,072-rune
`liberprimus.txt` on 2016-08-14. That file preserves the p33 B→W pair and
the p39 N omission. Its remaining divergences differ somewhat from the
January-2015 file, so it is a near-neighbour/descendant witness rather than
a byte-identical copy.

## Chronology rules out the canonical branch as the source of those errors

The same `resvolver/c1cada` repository contains both competing streams,
with checkable Git chronology:

| date | file / branch | rune count | relevant reading |
|---|---|---:|---|
| 2015-01-16 | `transcriptions.rne` initial | 13,053 | older/lossy family |
| 2015-01-21 | `perl/page.*.txt` after correction | **13,136** | exact canonical stream |
| 2015-01-23 | `transcriptions.rne` | 13,072 | older/lossy family; includes the four onecool errors |
| 2015-01-23 | `translation/liber_primus.rne` | **13,136** | exact canonical stream |
| 2016-08-14 | `henkman/liberprimus.txt` | 13,072 | lossy-family descendant |
| 2017-03-01 | `rtkd/iddqd` first master | whole-book | all 57 LP2 canonical segments present |
| 2017-08-01 | onecool JSON commit | 13,136 | four old-family errors survive plus newer errors |

The canonical 13,136 stream therefore existed alongside the lossy branch
more than two years before onecool's recovered JSON. Direct extraction of
current `rtkd/iddqd` shows the entire current 13,136-rune LP2 stream as a
contiguous exact substring; the repository's preserved
`resources/liber-primus/lp2-transcription.txt` is likewise rune-identical
to the image-corrected stream. Those mainstream/corrected lines do not
explain the four old-family errors in onecool.

## Quantified residual and null check

Of onecool's 24 actual rune-reading errors, **4/24 = 16.67%** exactly match
the January-2015 70-edit branch; **20/24** are not shared with that branch.
Including the six numeral contaminations, **26/30** onecool edit operations
are outside the four exact shared sites. Conversely, 66/70 old-branch edits
are not retained by onecool. This is what a corrected/modified descendant
or common-ancestor mixture looks like; it is not a byte-for-byte copy.

As a supplementary scale check only, if 24 onecool error coordinates and
70 old-branch error coordinates were independent uniform draws among
13,136 rune positions, the expected overlap would be **0.1279** positions.
The exact hypergeometric probability of observing at least four positional
overlaps is **7.25×10^-6**. Real transcription errors are not uniform or
independent, so this is not used as a p-value proof; the decisive evidence
is the same fixed coordinates **and same erroneous states/types** plus the
dated source chronology.

## Why direction remains unresolved

Issue #931 establishes two exact onecool.us participant files in May 2014
IRC records:

- `http://onecool.us/runes_by_page.txt`
- `http://onecool.us/unstructured_runes.txt`

Their bytes have not been recovered from the checked independent mirrors or
archives. Onecool also has a documented December-2016 LP spreadsheet trail,
but its Drive bytes are gone.

Therefore the currently recoverable evidence cannot distinguish among:

1. onecool's missing 2014 text being an ancestor of the 2015 lossy branch;
2. onecool later importing from that branch or a descendant;
3. both inheriting from another 2014 community transcription.

All three imply the same evidential consequence: the 2017 JSON is **not an
independent scan-derived vote** on disputed runes.

## Consequence for LP2 research

1. Do not count the 2017 onecool JSON as independent corroboration of a rune
   reading, page segmentation, or downstream cryptanalytic result.
2. Its source value is historical provenance and error-lineage evidence.
3. The four exact shared errors provide a stable fingerprint for future
   recovery of the missing May-2014 onecool files or other period copies.
4. #3380 already resolved all 30 onecool disagreements directly from the
   original scans, so this lineage result changes evidence weighting, not
   canonical ciphertext bytes.
