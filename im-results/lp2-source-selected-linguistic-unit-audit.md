# Source-selected linguistic-unit audit

**Agent16, 25 November 2026. Issue #2781 closed as a bounded negative for transfer to LP2.** One exact literary exercise supplies a reversible one-unit reading-frame shift. It is a genuine historical operation and merits testing, but the source does not directly instruct its use on LP2 and the frozen transfer fails the independent original-artifact test. No LP2 plaintext or key was recovered.

## Decision standard

A candidate must (1) be fixed by a first-party Cicada instruction or an exact, historically attested literary exercise, (2) specify a deterministic reversible operation, and (3) predict an independent feature on authentic material without tuning its direction, offset, segmentation, or edge handling. A literary source selected somewhere in the 2014 puzzle is a motivated lead, not proof that every operation in that source transfers to LP2.

## Candidate found: GEB's one-unit reading-frame shift

The signed May 2014 book-code coordinate list includes `CBIA:3:7:2`, selecting a coordinate in *Canon by Intervallic Augmentation* (CBIA). The coordinate itself selects a letter in the dialogue, **not** the frame-shift passage; the full dialogue contains the explicit exercise. The pinned OCR says to shift the reading frame by one unit, moving the spaces one unit to the right, and demonstrates:

- `ONE WAR TWO EAR EWE`
- `O NEW ART WOE ARE WE`

This is a fully specified reversible boundary operation on the example. If the original word-boundary positions are (0=b_0<b_1<\cdots<b_{n-1}<b_n=N), the example's edge convention is to shift the whole frame, including its implicit start and end: (b_i\mapsto b_i+1). The new in-range internal boundaries are ({1,b_1+1,\ldots,b_{n-1}+1}); the shifted end (N+1) falls beyond the text. Thus the example produces a leading one-character word and shortens the final word by one. The inverse shifts the internal boundaries back by one. This rule reproduces the example exactly.

**Selector limitation:** the 2014 code selects the CBIA dialogue, but not the specific frame-shift sentence or an LP2 page. Treat this as the strongest historically grounded candidate, not an LP2 instruction.

## Authentic controls

- The source example reproduces exactly, including the leading singleton and shortened final word; the inverse restores the original boundaries.
- The same boundary transform and inverse round-trip exactly on the known solved LP2 p56 and p57 text controls (85 runes/25 groups and 95 runes/20 groups respectively).
- Existing work already tested the frame-shift idea on seven selected long original groups under periodic-key scoring; it did not produce a coherent plaintext. This audit extends that work to the complete p0–55 word-boundary register and an independent visual/layout feature.

## Frozen LP2 test

The source transcription covers all 55 rune-bearing physical pages p0–55; physical p50 is blank and omitted. It contains 12,956 runes, 2,896 printed groups and 2,895 internal boundaries. The canonical delimiter register contains 2,721 hyphens and 174 periods. The original groups have 83 singletons and 32 cross-page carries. The independent visual control has 27 internal boundaries coinciding with 13-dot marks, 31 coinciding with red-span edges, and 22 coinciding with page starts.

Two interpretations were frozen because the transcription distinguishes hyphen spaces from periods:

| Test | Groups | Singletons | Cross-page groups | 13-dot hits | Red-edge hits | Page-start hits |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Original printed boundaries | 2,896 | 83 | 32 | 27 | 31 | 22 |
| Shift every canonical boundary +1 | 2,897 | 84 | 46 | **0** | **0** | 8 |
| Shift explicit hyphen spaces +1; keep periods fixed | 2,890* | 98 | 36 | 27 | 31 | 18 |

*The literal hyphen-only boundary representation has **seven coincident positions** where a shifted space meets a fixed punctuation boundary. The source exercise does not specify how to serialize such collisions in LP2. A glyph-level character model would be required; silently deduplicating or moving punctuation would add an unselected rule.

The broad all-boundary interpretation yields 2,897 groups, which is prime, but that total disappears under the literal hyphen-only interpretation (2,890). A prime near 2,900 has baseline probability about (1/\ln(2897)\approx12.5\%); this is not a discriminating result. The all-boundary +1 shift also destroys every measured 13-dot and red-edge coincidence and increases cross-page groups from 32 to 46. In a fixed 0–28 offset comparison, +1 has zero 13-dot and red-edge hits and is the least aligned offset. The literal-space-only interpretation preserves the existing visual hits but does not improve them and has the seven unresolved collisions.

**Decision:** the operation is real and reversible on its literary example and solved controls, but its LP2 transfer has no independent support. The only apparently attractive numerical feature (2,897 prime groups) depends on treating punctuation boundaries as spaces, contrary to the more literal transcription reading. Do not expand the offset search, invent punctuation-collision rules, or combine the shift with an unconstrained key search.

## Other source candidates considered

- **LP1 first-party instructions:** the opening warning preserves “the words or their numbers”; the p5 rubric makes primes/totients significant; the p6 Koan and p9/p13/p15 directions do not define clitics, syllable packets, phrase bundles, or alternate word boundaries.
- **2016 continuation:** “The words are the map, their meaning is the road, and their numbers are the direction” supports preserving words and numbers; it does not select a larger linguistic unit.
- **Anglo-Saxon Rune Poem:** the Dickins 1915 29-stanza poem is the exact literary source for the 29/29 GP29 alphabet order. Rune-to-stanza correspondence selects alphabet order; it does not instruct that LP2 plaintext be grouped into stanza-sized packets or select a stanza feature. The p56 “AN END” final-letter extraction was already tested under both signs and Old English/English readings, yielding 0/1,132 long dictionary words. See [the pinned source gate](lp2-anglo-saxon-rune-poem-source-gate.md).
- **GEB's “A Mu Offering”:** the dialogue describes a hypothetical phonetic-to-four-geometry-symbol pipeline, triplet folds, reverse reading and terminal-knot negation, but withholds the complete phonetic mapping, fold lookup and manipulation rules. It is not an executable reversible LP2 tokenization.
- **2014 Emerson witness:** the 60-word/first-five-paragraph extraction is researcher-derived; no evidence shows Cicada selected that text or those boundaries for LP2.
- **Crab Canon:** its reversal/speaker exchange is a distinct source operation already tested against the p13–14 original structure; it supplies no new word-boundary rule.

## Reproduction

- [Reproducer](../sims/lp2_geb_space_shift_boundary_audit_sft.cjs)
- [Machine-readable output](lp2-geb-space-shift-boundary-audit-output.json)
- Inputs: `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, and `resources/liber-primus/lp2-ink-annotations.json`; the output records their blob SHAs.
- Historical source context: [2014 GEB book-code and dialogue audit](2014-onion5-geb-onion6-chain.md) and the pinned [GEB OCR](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt#L8215-L8227).

This closes only the source-selected linguistic-unit attempt. It does not establish that printed separators are plaintext word boundaries, nor does it reject H-shuffle, H-decoy, or other source-selected cipher mechanisms.
