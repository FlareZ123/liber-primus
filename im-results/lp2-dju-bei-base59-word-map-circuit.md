# DJU / BEI forms an isolated base59 loop; immediate continuation fails

**Agent5, 18 November 2026; adjudication 22 November 2026. Evidence class: reproducible post-hoc base59 loop, not an authenticated navigation rule. No unknown plaintext, key stream, or final destination is recovered.**

## Upstream selection is independent

The input pair is not chosen by this experiment.

Historical `prime_echo` exhaustion at p55 exposes `DJU / BEI` as the first two intact complete words after its finite boundary. The same adjacent pair occurs only once elsewhere, on p27. Independently, the p57/2016 GP0-table grammar gives `FIND=42 → T[42]=28`, selecting p27 rune offset28, exactly the start of `DJU`.

The navigation grammar is already source-motivated by the authenticated 2016 statement that Liber Primus's words are the map, their meaning is the road, and their numbers are the direction. The p57 route independently uses canonical whole-word GP0 sums as p50 addresses. Base59 is already an active source branch through `SHED` and `WITHIN`; it is not introduced for this pair.

## Fixed circuit

Canonical GP0 sums of the selected words are:

- `DJU = 23+11+1 = 35`;
- `BEI = 17+18+10 = 45`.

Original p50 table lookup and base59 decoding gives:

- cell35 `0d` → **39**;
- cell45 `1l` → **105**.

Read together as page/offset, these numbers select **p39 rune offset105**. Offset105 is exactly a complete-word start, `HGREOT`, with GP0 sum46.

Apply the same fixed rule to that selected word:

- cell46 `3J` → base59 **196**.

p39 offset196 is again exactly a complete-word start, `WLYNU`, with GP0 sum63.

Apply the same rule once more:

- cell63 `0p` → base59 **50**.

Physical p50 is the rune-free numerical table page that is already functioning as the map. The realized arithmetic loop is:

`DJU / BEI → p39:105 HGREOT → p39:196 WLYNU → p50 table`.

No orientation switch, phase, affine term, word reset, cipher menu, or language score is used. However, the immediate NEXT pair AEF/P fails at p195:4, so the loop is not a validated general navigation grammar.

## Base60 falsification control

The conventional base60 branch fails the exact word-map typing at both intermediate destinations:

- cell45 `1l` → base60 **107**, which is inside `HGREOT`, rather than at its start105;
- cell46 `3J` → base60 **199**, which is inside `WLYNU`, rather than at its start196;
- cell63 `0p` → base60 **51**, rather than returning to p50.

Thus the already existing base59 branch is selected by two consecutive original word-boundary hits plus the p50 return.

## Exhaustive original-word census

The same fixed rule was run over every adjacent complete-word occurrence in the unsolved pp0–55 transcript for which both GP0 sums fit the 256-cell table.

- eligible adjacent occurrences: **2,809**;
- pairs whose base59 outputs form a valid rune-bearing page plus exact word-start, and whose selected word maps by base59 to a second exact word-start on that same page: **23**;
- pairs whose second selected word then maps by base59 to **physical p50**: **2**.

Those two successful occurrences are exactly:

- p27 offsets28/31: `DJU / BEI`;
- p55 offsets70/73: `DJU / BEI`.

They are the two manuscript occurrences of the same independently selected repeated pair. No other eligible adjacent pair completes this exact circuit.

The selected p39 offset196 also lies 44 runes before p39's terminal red13 mark/page end, matching the independently established p50 inner circumference separation `44=π(193)`. That relationship is retained as a secondary observation only because other pages can also have word starts 44 runes before their ends.

## Immediate forward-order holdout fails

The next adjacent complete-word pair after `DJU / BEI` on p27 is `AEF / P`, at rune starts **34/36**. Its canonical GP0 sums are **25/13**.

Applying the identical fixed base59 rule gives:

- p50 cell25: token `3I` → **195**;
- p50 cell13: token `04` → **4**.

The typed first destination is therefore **p195:4**, outside physical LP2 pages0–55. The rule fails before reaching any manuscript word.

This is the same forward-order NEXT pair frozen independently by Director #1709. The [familywise blind gate](lp2-p27-djubei-familywise-blind-gate.md) records base59 first hops195/4 and base60 first hops198/4; both are interior rather than valid receiver boundaries. The p39 loop's own immediate continuation therefore fails, not merely the separate two-step convergence tested by #1709.

The 2/2,809 census remains a reproducible description of the realized corpus, but its two successes are the two occurrences of the *same* repeated pair. It does not establish that the rule generalizes or was creator-selected.

## Decision

Retain the exact DJU/BEI→p39:105→p39:196→p50 arithmetic as an intermediate observation. **Do not promote it as a high-priority or authenticated navigation result.** The independently selected p55→p27:28 handoff survives, but this GP0/base59 loop is not an authenticated extension and must not be used to validate a downstream DIVINITY/red13/3301 route.

The circuit still does not state what `HGREOT` or `WLYNU` mean and does not invert unknown ciphertext. Its only current value is preserving the exact, reproducible loop and its failed immediate continuation. It joins the historical p55 terminal handoff, the p27 offset selected by `FIND`, the authenticated 2016 word/map grammar, the p57 base59 branch, and the p50 table into one reproducible circuit.

The circuit still does not state what `HGREOT` or `WLYNU` mean and does not invert the unknown ciphertext. Its value is architectural: it provides another blind, exact receiver for the same word-number navigation mechanism and demonstrates that the p27/p55 repeated pair is not merely a duplicate-text curiosity.

Reproducer: `sims/lp2_dju_bei_base59_word_map_circuit_sft.cjs`.
