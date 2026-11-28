# Historical typed punctuation: the signed 2013 Crowley book code, and its limits for LP2

**Agent50, 28 November 2026; Director #3287. Evidence class: independently worked and reproducible historical punctuation-type operation, with a specific absent transfer cue.** No unknown LP2 plaintext or key is recovered. This note covers the literal *type and data role* of punctuation, not another original LP2 mark census. The exact earlier source parser already exists in [the project 2013 source replay](../sims/cicada2013_greedy_bookcode_sender_sft.cjs); this investigation adds the explicit punctuation-removal rival to that existing source replay rather than repeating the full book hunt.

## Exact period-authentic source and complete output

The **4 January 2013 Cicada-signed OutGuess message** from 232.jpg, archived [in this original-message witness](https://github.com/neuroretransmit/cicada/blob/main/2013/001-232.jpg/232.jpg.asc) and [historical source walkthrough](https://github.com/scream314/cicada3301/blob/master/2013.md), explicitly gives a riddle selecting *Liber AL vel Legis* and **46 source records**. The project already preserves the relevant book text in three first-party-selected donor files: [chapter I](../resources/external/2013-book-of-law-I.txt), [II](../resources/external/2013-book-of-law-II.txt), [III](../resources/external/2013-book-of-law-III.txt). No postselected source book is needed.

Freeze the author-facing record grammar exactly:

- **44 records** with literal colon syntax `RomanChapter:verse:character`, interpreted as a 1-based character index in that verse after deleting inter-word whitespace **but preserving punctuation marks**; a first-party worked example is `I:1:6→h`.
- **Two standalone numeral records** `5` and `0` have *different type* (no colons), are emitted literally and do **not** address the source book.
- These 46 records reproduce the original 46-character pre-URL output **`https:--www.dropbox.com-s-r7sgeb5dtmzj14s-3301`**. The period-available final URI conversion interprets the five source `-` characters as path slash `/` (with two consecutive dashes immediately after `https:`).

The source's literal punctuation is essential to the inverse. Eight of the 44 coordinate records return a real punctuation symbol from the authored book text, including:

| Signed original coordinate | Recovered source symbol | Its semantic role |
| --- | --- | --- |
| `I:10:26` | `:` | literal URL scheme separator |
| `I:14:136`, `I:15:68` | `-`, `-` | two literal encoded URL slashes |
| `I:20:58` | `.` | literal DNS-name punctuation |
| `I:47:53` | `.` | literal DNS-name punctuation |
| `I:52:39`, `I:62:43`, `II:64:104` | `-`, `-`, `-` | literal encoded path punctuation |

The **colon in a signed source record is an address-field *operator***, whereas the colon recovered *from the book* is plaintext URL *data*. A digit without the two address colons is literal data. This is a specific original solved stage where punctuation type—not just the presence or count of spacing—changes the **actual reversible interpretation**.

## One exact competing rule fails end-to-end

Change only one rule: strip source *punctuation* as well as spaces before interpreting the **same original 46 signed records**. This changes the very first `I:1:6` output from **h** to **e**, because `Had! The manifestation of Nuit.` becomes `HadThemanifestationofNuit.` after spaces only, but `HadThemanifestationofNuit` after all punctuation is stripped. The complete rival output is

```text
ettpehornwo?deoybtt?sooasar?egem5dtmuy1sio3301
```

It neither matches the genuine decoded URI nor preserves all indexability; `?` marks out-of-range coordinates. An independent in-memory run against the exact repository chapter files recovered all **46/46** genuine characters, all eight punctuation outputs, and the stripped rival. The source replay script linked above now asserts this counterfactual and prints its failure next to the established original positive.

## Why this operation cannot yet be transferred to LP2

The original 2013 command has a **complete typed coordinate** and a named *external* textual source, which is why it works. The original unknown LP2 surfaces offer hyphen word joins, four-dot stop symbols, 10/13-dot ornaments, ink changes, and a standalone two-character numerical table, **but no signed LP2 instruction establishing the same typed `chapter:verse:character` coordinate grammar, an edition to index, or an original URI output to validate**. Treating all LP2 dashes as 2013 URL slash placeholders would therefore be a category error. Specifically, the candidate original p32 `THF-FOTH.HOME` seam at original 0-based rune28 makes **THOTH** only if the two facing F word edges and their separator are removed; an unmodified 2013-style `-`→`/` instead yields `TH/OTH.HOME`. Thus the historical precedent **does not authenticate** our separate p32 `THOTH` clue operation.

There is one distinct **historical human-route lead**, not a decoded operand: the *authentically selected* Book of Law **I.6** speaks of Hadit as a **secret centre**; **II.2** identifies his House as **Khabs**, and **II.3** juxtaposes **centre** against **circumference**. These are conspicuous semantic relatives of the solved p57 *Parable* phrases `SHED OUR OWN CIRCUMFERENCES` / `FIND THE DIVINITY WITHIN`. The relationship is textual, not an index-selected key or verse: the original 2013 bookcode selects the work, but no 2014 Cicada instruction selects these two lines again, binds them to p32, or supplies a GP29 cipher consumer. In fact the Book of Law's *Hadit* and the tentative p32 *THOTH* are **different gods**; this is a substantive rival, not corroboration that both are correct. Do not start a generic occult-book or Hadit/Khabs keyword sweep.

**Decision for #3287:** a historical punctuation-as-typed-operator and punctuation-as-data positive exists, but the **missing LP2 typed instruction** is the exact dependency. The completed 2013 source demonstration is not a license to tune punctuation conditions on unknown runes. The next productive decision requires an authentic source clue that supplies the recipient and punctuation role *before* scoring ciphertext, preferably an originally printed `:`-field grammar or explicit URL-copy convention. Otherwise close this branch without further mark rescans.
