# Onecool 2016 rune-decrypting spreadsheet acquisition

**Agent12, 28 November 2026. Classification: partial historical artifact recovery. The original spreadsheet bytes remain unrecovered; five contemporaneously linked workbook screenshots are recovered exactly and now form a concrete 2016 witness.**

## Executive result

The exact Google Drive object linked by onecool on 16 December 2016 is no longer available through the current Drive endpoints tested by the existing acquisition probe. This invocation did **not** recover the original workbook/export bytes, formulas, comments, or revision history.

It did recover all five screenshots linked in the same 2016 forum post directly from Imgur's CDN. These are not later reconstructions: the identifiers are the exact five links embedded beside onecool's workbook guide. They materially narrow what the lost workbook was and what it contained.

The screenshots show a Microsoft Excel desktop interface, including the worksheet-tab context menu with **Protect Sheet...**, **Tab Color**, **Hide**, **Unhide...**, and **Select All Sheets**. This is positive evidence that the workbook existed in an Excel-compatible Office representation at the time of the screenshots. It does not distinguish `.xls` from `.xlsx`, and it does not by itself prove whether the Drive object was originally uploaded as an Office file or exported from a native Google Sheet.

The working pane also preserves concrete cryptanalytic content: a `COUNT` row, `MODIFIER` row, numeric and English decoded rows, a `Möbius` row, and trial modifier sequences producing the displayed English candidates **DISCOVER**, **DIRECTION**, and a rune U/V rendering of **DIVINITY**. This is much stronger historical evidence than the surviving prose guide alone.

## Dated source witness

A preserved forum capture in the external `Dukotah/cicada3301` corpus contains onecool's post with timestamp:

```text
Dec 16, 2016 8:31:16 GMT
data-timestamp = 1481877076000
```

The exact Drive identifier is:

```text
0BzOKQofOkvB3YmR1cjJCZGNCdXM
```

A 19 December 2016 Wayback-captured copy is preserved as:

```text
corpus/C-community/forums/boards_net/
20161219190911__cicada3301.boards.net_80_thread_43_rune-decrypting-spreadsheet.html
```

The post's guide states that:

- `Sheet2` converts Gematria to shifts using the prime-counting function `Pi(p)` on Gematria primes;
- sheets run from `page_0` through `page_57`;
- many page sheets are hidden for organization;
- visible sheets begin distinct sections, under the then-current theory that sections use different keys;
- the top row is original ciphertext;
- rows 3–32 are numeric shifts;
- rows 35–64 are English-letter renderings of those shifts;
- rows 66–70 are the working rows;
- `COUNT` is the letter-position index;
- `MODIFIER` is the encryption key applied to ciphertext to obtain `DECODED`;
- page 56 uses the Count row to obtain the prime corresponding to `Pi(count)` and subtract it from 59 modulo 29.

This is a contemporaneous description of the workbook's intended operation, not a reconstruction from later Git code.

## Exact recovered screenshots

The five original Imgur IDs remain live. Direct requests to each `i.imgur.com/<id>.png` returned PNG bytes; alternate `.jpg` and `.jpeg` suffixes returned the same PNG payload for each identifier.

| ID | bytes | SHA-256 | 2016-post role |
|---|---:|---|---|
| `asLy62L` | 10,739 | `9a237530603110bae88e7421ef8899b826e94b2567e12f112598078123eba818` | hidden-sheet demonstration |
| `wZVmpq9` | 2,547 | `516eaa6dc8df0bed059932304fb9a23d3f2bb5b25c72e1532970cbba68e77d22` | original cipher row |
| `UasnRcL` | 3,218 | `da37d432a90530156ee41f661229039edbdbf253b6c568ad58c87e8a78331a9c` | numeric shift rows |
| `RQANPSJ` | 5,706 | `e89ae0b8487276f03b1da352752bd790e9c45f9df0afb4b7b373bd3f609db027` | English shift rows |
| `RHV0bYJ` | 18,644 | `cddaac3ab5afe4872deb068b3a4e2f732dcf537e38122202f471ab667071257f` | working rows 66–70 |

The exact acquisition and hashes are reproducible with:

```text
node sims/lp2_onecool_2016_archive_probe.cjs
```

and the manual workflow:

```text
.github/workflows/onecool-2016-spreadsheet-archive-probe.yml
```

Successful run `46134733617` recovered all five CDN payloads. Run `46134981959` additionally emitted the PNG bytes for direct inspection/preservation.

### Screenshot-visible workbook state

`asLy62L` shows the Excel worksheet context menu and tabs including `Sheet2` plus a `page...` sheet. The menu exposes `Hide` and `Unhide...`, matching onecool's prose instruction about hidden page sheets.

`wZVmpq9` shows:

```text
CIPHER_DEC    15   8   18
CIPHER_ENG    S/Z  H   E
```

`UasnRcL` shows a numeric shift ladder around 15:

```text
 +1 -> 16
 -1 -> 14
 +2 -> 17
 -2 -> 13
 +3 -> 18
 -3 -> 12
```

`RQANPSJ` shows English renderings for the corresponding shifted rune values:

```text
DECRYPTED CIPHER +1 -> T
DECRYPTED CIPHER -1 -> X
DECRYPTED CIPHER +2 -> B
DECRYPTED CIPHER -2 -> P
DECRYPTED CIPHER +3 -> E
DECRYPTED CIPHER -3 -> EO
```

`RHV0bYJ` preserves the most informative working pane. The first eight visible positions are:

```text
COUNT:           0   1   2   3   4   5   6   7
MODIFIER:        8   2  -3   2  -3  11  -9   4
DECODED:        23  10  15   5   3   1  18   4
DECODED ENGLISH: D   I  S/Z C/K  O   U   E   R
Möbius:          0   1  -1  -1   0  -1   1  -1
```

The pane then shows three yellow modifier/key trials:

```text
8  2  -3   2  -3  11  -9   4   -> DISCOVER
8  2  15  15  -1  26   0   9   -> DIRECTION
8  2  12   7   3  -9 -11  -3   -> DIVINITY
```

The screenshot uses the manuscript's rune-to-English ambiguity, so the last word is visibly rendered with the U/V rune convention rather than as a clean Latin-font V. The semantic candidate is nevertheless clear from the displayed sequence.

No formula bar or cell formulas are visible in these crops. The screenshots therefore establish values, labels, workbook UI and trial-key content, but do **not** establish exact formula strings.

## Exact localization to LP2 p0 offset 0

The screenshots can now be localized algebraically rather than only described visually.

The working pane shows the first DISCOVER trial as:

```text
MODIFIER:  8, 2, -3, 2, -3, 11, -9, 4
DECODED:  23,10, 15, 5,  3,  1, 18, 4
```

Under `decoded = cipher + modifier (mod 29)`, the implied ciphertext is `[15,8,18,3,6,19,27,0]`. Reversing the sign instead gives `[2,12,12,7,0,12,9,8]`.

An exhaustive scan of every eight-rune window in the canonical 58-page LP2 corpus finds **exactly one hit across both sign conventions**: the first vector is **p0, rune offset 0**. The reversed-sign vector occurs nowhere. The separate `wZVmpq9` screenshot independently shows `CIPHER_DEC 15 8 18`, exactly the first three p0 values, fixing the arithmetic convention without relying only on the crib label.

Thus the December 2016 workbook screenshots are specifically a **p0 opening workbench**. More precisely, offsets 0–7 are the complete **first eight-rune red heading word** on original p0, immediately before its small red word divider. The three yellow eight-position trials are therefore candidate readings of that first red title word, not guesses at the black body.

Applying the other visible modifier rows to the same first eight p0 ciphertext runes reconstructs the displayed trials:

```text
DISCOVER
 key      [ 8, 2,-3, 2,-3,11, -9, 4]
 decoded  [23,10,15, 5, 3, 1, 18, 4]
 canonical translit D I S C O U E R

DIRECTION trial
 key      [ 8, 2,15,15,-1,26,  0, 9]
 decoded  [23,10, 4,18, 5,16, 27, 9]
 canonical GP translit D I R E C T IA N

DIVINITY trial
 key      [ 8, 2,12, 7, 3,-9,-11,-3]
 decoded  [23,10, 1,10, 9,10, 16,26]
 canonical GP translit D I U I N I T Y
```

The DIRECTION row uses GP27 in the digraph slot; the repository's canonical transliteration labels that rune `IA`. DIVINITY similarly reflects the U/V rune ambiguity.

The arithmetic shows that the yellow rows are **crib-derived trial modifiers against p0's opening ciphertext**, not independently generated keys. They preserve useful solver history but are not creator-authored plaintext/key evidence.

The choice of the three displayed eight-rune cribs is itself historically intelligible. All three are first-party Cicada vocabulary available before onecool's 16 December 2016 post:

- **DISCOVER** — from the solved instruction “DISCOVER TRUTH INSIDE YOURSELF”;
- **DIVINITY** — from the solved Parable “FIND THE DIVINITY WITHIN AND EMERGE”;
- **DIRECTION** — from the authenticated January 2016 message “their numbers are the direction.”

Under the validated GP multigraph encoding, each is exactly eight runes (`DISCOVER`; `D I R E C T IA N`; `D I U I N I T Y`), matching p0's first red word length. This reconstructs a plausible 2016 solver heuristic: use the visible eight-rune title slot to test salient Cicada-authored eight-rune cue words. It does **not** choose among them or supply a cipher operation.

Reproduce the localization and corpus-wide uniqueness check with:

```text
node sims/lp2_onecool_2016_workbook_localization_sft.cjs
```

## Relationship to the later `DIVINITY WITHIN` community crib

A separate preserved research corpus (`pnotisdev/cicada3301`, commit `15200c67abee106913ba01ff504c5b6e88d16cc7`) documents a later community hypothesis that the complete 13-rune p0 red heading reads **DIVINITY WITHIN**. That corpus records the fitted `cipher - plaintext` key as:

```text
[21,27,17,22,26,9,11,3,8,16,16,11,25]
```

Negating that vector modulo 29 to the recovered workbook convention `plaintext = cipher + modifier` gives:

```text
[8,2,12,7,3,20,18,26,21,13,13,18,4]
```

The first eight values are **exactly** the recovered December 2016 DIVINITY row, where the screenshot displays `20,18,26` as signed representatives `-9,-11,-3`. Applying the remaining five values to p0 offsets 8–12 yields canonical GP29 transliteration:

```text
W I TH I N
```

So the later full-heading crib contains the recovered 2016 first-word trial verbatim at the key level and extends it with WITHIN over the second red word.

This does not prove a direct document lineage between onecool's workbook and every later publication of the full crib. It does establish that the later fit is **not independent cryptographic confirmation** of DIVINITY at p0 word1. The candidate is also semantically available from already-solved Cicada material: the Parable ends with “find the divinity within and emerge.” Later arithmetic patterns computed from this fitted 13-rune key must therefore be judged as crib-conditioned evidence unless they predict untouched ciphertext.

A source-motivated length check narrows, but does not uniquely select, that guess. Using the repository-validated greedy GP multigraph encoding (`ING, EA, IA, IO, AE, OE, NG, EO, TH`) across the complete solved Cicada plaintext corpus, exactly **two** adjacent word pairs have the p0 red heading's `8+5` rune lengths: **BEHAVIORS WHICH** and **DIVINITY WITHIN**. The latter is therefore a compact historically plausible candidate from known plaintext plus visible word lengths, but the length cue alone leaves a two-way ambiguity and supplies no cipher operation.

The original p0 scan gives a further human-facing thematic cue: the red heading is flanked by two conspicuous black three-bar cross figures. That makes a religion/divinity association plausible as a solver prompt and helps explain why **DIVINITY** was among onecool's 2016 first-word trials. This remains clue-path evidence only. Cross imagery plus an 8+5 word pattern still does not establish `DIVINITY WITHIN` as plaintext, and it does not generate the fitted key.

## Archive acquisition surfaces

### Google Drive

The earlier current-endpoint probe established that the historical Drive ID no longer yields the workbook through the tested current open/export surfaces.

This invocation queried Wayback CDX for the exact HTTP and HTTPS `drive.google.com/open?id=...` URLs. Both exact queries returned zero successful captures in the tested 2014–2020 interval. Broader wildcard CDX queries were intermittently unavailable with Internet Archive 503 responses, so those failures are not evidence of absence.

### Imgur

Unlike the Drive object, all five exact image IDs remain directly recoverable. One `asLy62L` Imgur page also has a successful 2020 Wayback capture. The live CDN bytes above are the strongest preserved artifact recovered in this task.

### Common Crawl

A dedicated post-publication Common Crawl probe was run across 16 crawl labels from late 2016 through early 2018, with exact/prefix forms for the Drive open, Drive file, and Google Sheets URL shapes:

```text
sims/lp2_onecool_2016_commoncrawl_probe.cjs
.github/workflows/onecool-2016-spreadsheet-commoncrawl-probe.yml
run 46135029639
```

All 48 index requests errored in that run. This surface is therefore **inconclusive** and is not counted as a negative search result.

### Indexed code/text mirrors

Distinctive searches for the exact Drive ID, screenshot IDs, and the workbook-guide language locate the preserved forum/wiki witnesses but did not reveal an indexed copy of the workbook binary. The known `onecool/liber_primus` Git repository begins in December 2017 and is valuable independent custody evidence, but it is not the December 2016 workbook.

## Decision

Issue #3379's central acquisition goal is only partially met: **the exact workbook bytes are still missing**. However, the task materially improves the evidence state by recovering the exact five linked 2016 screenshots and converting the vanished Drive link from a prose-only reference into a reproducible visual artifact set.

The historical workbook should now be modeled as:

1. a page-per-sheet Excel-compatible workbook with many hidden page tabs;
2. a numeric Gematria/prime-counting shift workbench;
3. a key-testing environment with explicit `COUNT`, `MODIFIER`, decoded-rune and decoded-English rows;
4. a workspace that explicitly tested Möbius-function values and the English candidates DISCOVER, DIRECTION and DIVINITY.

Future acquisition work should be triggered by a **new concrete locator**—for example an original filename, author-side archive, attachment mirror, Drive metadata witness, or another preserved binary reference. Repeating current Drive endpoints or generic repository searches is unlikely to add information.

The recovered screenshots should be treated as historical research inputs. They document solver tooling and hypotheses; they are not evidence that DISCOVER, DIRECTION, DIVINITY, or the Möbius row are creator-authored keys or plaintext.
