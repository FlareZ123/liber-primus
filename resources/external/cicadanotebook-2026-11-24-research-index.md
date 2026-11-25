# Cicada Notebook: independent research snapshot, 24 November 2026

## Source status and limitations

- Public notebook: https://cicadanotebook.com/
- Research guide: https://cicadanotebook.com/guide.html
- Journal: https://cicadanotebook.com/journal.html
- Latest public status: 224 sessions, synchronized 24 November 2026.
- The notebook describes itself as independent and not affiliated with the puzzle authors. Its author reports working with ChatGPT. These are secondary research reports, not first-party Cicada evidence and not independently reproduced by this repository unless separately stated.
- The notebook reports **zero new verified Liber Primus plaintext** as of Session 224. Historical reports preserve earlier states; later sessions may correct or supersede them.

This index records only findings that materially constrain likely duplicate work or improve reconstruction of historical solve paths. It is not a chronological activity log.

## Positive historical result: the 2014 GEB book code

**Session 125 — https://cicadanotebook.com/sessions/125.html**

The report says an archived PDF linked in the 2014 solver chat reproduces all 14 extracted letters and the documented address `ut3qtzbrvs7dtvzp.onion`. The decisive convention is to count only speaker labels that begin a printed line, rather than every change of speaker. This resolves three disputed coordinates; the report also corrects `AMO` to *A Mu Offering* (ordinary page 231), not the introduction *A Musico-Logical Offering*.

The report distinguishes the signed 2014 clue from the later recovered PDF: the signed message verifies and has a January 2014 timestamp; the PDF is linked in the solver chat and has an April 2016 archive capture, but no separate 2014 digest proves the recovered PDF was byte-identical at that time. The result reproduces a known 2014 step, not LP2 plaintext.

**Research implication:** Cicada's earlier book-code path used source-specific printed layout. This is a useful historical design precedent, but the report explicitly gives no instruction to apply GEB or its coordinate rule to LP2.

## LP2 layout: tree-page line endings are not a supported cipher lead

**Sessions 126–131**
- Session 126: https://cicadanotebook.com/sessions/126.html
- Session 128: https://cicadanotebook.com/sessions/128.html
- Session 129: https://cicadanotebook.com/sessions/129.html
- Session 130: https://cicadanotebook.com/sessions/130.html
- Session 131: https://cicadanotebook.com/sessions/131.html

The study measured ordinary line breaks on LP2 pages 27–32 (the tree illustration is page 32 / archive image 49). The first pass found no clear early break among 56 cases. Later width and whole-line models explain 53/56 as ordinary wraps; three remain borderline, including page 32 line 5. Controls did not justify subpixel certainty, and the authors explicitly set line endings aside as a cipher lead absent new source evidence.

**Research implication:** Do not repeat generic early-line-wrap, margin, or glyph-width sweeps on pages 27–32. Reopen only if an independent source clue specifies a different layout operation or a materially better measurement model.

## Repeating-key and page-50 grid constraints

**Sessions 124 and 214–224**
- Session 124: https://cicadanotebook.com/sessions/124.html
- Session 214: https://cicadanotebook.com/sessions/214.html
- Session 215: https://cicadanotebook.com/sessions/215.html
- Session 216: https://cicadanotebook.com/sessions/216.html
- Session 217: https://cicadanotebook.com/sessions/217.html
- Session 218: https://cicadanotebook.com/sessions/218.html
- Session 219: https://cicadanotebook.com/sessions/219.html
- Session 220: https://cicadanotebook.com/sessions/220.html
- Session 221: https://cicadanotebook.com/sessions/221.html
- Session 222: https://cicadanotebook.com/sessions/222.html
- Session 223: https://cicadanotebook.com/sessions/223.html
- Session 224: https://cicadanotebook.com/sessions/224.html

Key constraints and caveats:

1. **Repeated phrase / page-30 continuation.** Session 124 carried 99 eight- or nine-slot candidates from the page-27/page-55 repeated phrase onto page 30. Four finished, but seven of 19 matched shuffled groups scored higher; the four survivors gave incompatible readings. The phrase equality does not identify a key or plaintext.
2. **Period-four frequency ceiling.** Session 218 proves that a continuous four-position additive key can produce at most 156 occurrences of any one plaintext rune in section 8 (3,316 runes, 4.70%). The pooled solved LP1 frequency benchmark would require 414 occurrences (12.48%). Even a best phase choice at the page-50 grid, or one unrelated key after the grid, remains far below that benchmark. This is conditional on section 8 having a plaintext frequency profile comparable to the pooled solved passages.
3. **Longer continuous periods.** Session 224 extends the same capacity calculation across periods 1–128: under that same frequency premise, only periods 116, 120, 125 and 127 can reach the pooled benchmark. This does not establish that a long key is used or that the premise applies to section 8.
4. **Lag-four differences are not a key identifier.** A period-four additive key cancels exactly in ordered differences at distance four, but Session 215's trained difference profile recognized only two of seven known controls. Sessions 216 and 222 found too many near-four rotating-clock / period-eight false passes; the unknown section scored below the uniform baseline and the calibrated detector abstained. Do not interpret a positive lag contrast as evidence of period four.
5. **Page-50 crossing geometry.** Session 219 finds only four distance-four comparisons cross the page-50 grid (page 49 offsets 62–65 to page 51 offsets 0–3); the other 3,308 do not see the grid. Session 220 shows that one independently known signed plaintext difference at any of those four positions would distinguish five restricted repeat/jump predictions. No such independent plaintext difference is supplied.
6. **Exact difference reconstruction.** Session 223 notes that four starting runes plus the ordered distance-four differences determine the entire proposed period-four plaintext. The ordered difference tape is therefore a strong exact check once a source-derived starting word exists, but its histogram cannot choose among the 29^4 starting strings.
7. **Word guesses.** Session 224 reports two long-word guesses that match six runes but fail at the seventh. These are rejected guesses, not partial plaintext.

**Research implication:** Do not repeat short continuous additive-key searches, generic lag-four scoring, or page-50 phase tuning. A viable continuation needs an independently sourced starting plaintext/difference, a source-authenticated key or reset, or a materially different cipher architecture.

## Other relevant constraints

- **Session 104 — https://cicadanotebook.com/sessions/104.html:** the 2014 magic squares had a documented submission role; their dimensions, entries and magic totals do not determine a unique arrangement or LP2 keystream.
- **Session 136 — https://cicadanotebook.com/sessions/136.html:** a two-neighbor model did not recover hidden word boundaries on 32 unsolved pages better than the base break rate. This does not rule out longer contexts or section-dependent rules.
- **Session 192 — https://cicadanotebook.com/sessions/192.html:** a proposed 27→28 joined word passed a local score but failed downstream checks.
- **Session 197 — https://cicadanotebook.com/sessions/197.html:** many one-slot-wrong keys can make two repeated words agree; equality of repeated ciphertext/plaintext candidates is not sufficient without independent validation.
- **Session 208 — https://cicadanotebook.com/sessions/208.html:** exact punctuation can preserve or disqualify candidate repeated phrases; this is a sensitivity result, not a decryption.

## Practical use in this repository

Treat this notebook as an external exclusion and historical-source index, not authority. Before opening a similar branch, compare its exact assumptions, ciphertext scope, reset rules, controls and stopping criteria with the linked sessions. Preserve disagreements if the input or model differs. The strongest actionable gap in the page-50 branch is still an independently grounded plaintext difference across one of the four grid-crossing pairs; the GEB result is a historical solve-path precedent, not a transferable key.
