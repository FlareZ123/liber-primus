# The alleged p27/p54 seven-gram is a solved-page boundary artifact

**Source-exact result, 10 November 2026.** A third-party November 2026 plan proposes a seven-rune repeat between LP2 “p27” and “p54” as an alignment anchor for page/line key resets. Under the repository's exact **physical page** mapping there is **one six-rune repeat** between unsolved p27 and unsolved p55, while its apparent seventh rune is **the first rune of solved physical p56**. The supposed seven-rune *unsolved-to-unsolved* alignment does not exist.

## Original source and exact coordinates

The canonical input is `resources/liber-primus/lp2-corpus.json`. It explicitly inserts rune-free physical p50, omitted from the external compressed source; all following source-record numbers are therefore one below actual physical-page numbers. Zero-based, physical page and local-rune coordinates:

| Location | Source glyphs | Status |
| --- | --- | --- |
| physical p27, offsets 28–34 | `ᛞᛄᚢᛒᛖᛁᚫ` | seven unsolved runes |
| physical p55, offsets 70–75 | `ᛞᛄᚢᛒᛖᛁ` | six unsolved runes, **end of page** |
| physical p56, offset 0 | `ᚫ` | first rune of **already-solved** “An End” |

Whole-page local-offset enumerations find exactly **one** repeated six-rune substring across the 55 rune-bearing unsolved pages, namely p27:28 ↔ p55:70, and **zero** repeated seven-rune substrings. A continuous scan of the complete **12,956-rune unsolved stream**, permitting page crossings, likewise finds **zero** repeated seven-rune substrings. Only when the 85 solved p56 runes and 95 solved p57 runes are also concatenated does the sequence `ᛞᛄᚢᛒᛖᛁᚫ` occur twice, with its second occurrence spanning the physical p55→p56 boundary. It is the **only** repeated seven-rune substring in the concatenated 58-page stream.

An external October/November analysis describes the same coordinate as “p27:28 / p54:70”, accounting for the one-page compression, and reports a seven-gram. Its other F3 note calls a different string `ᛉᛚᛒᚱᛋᚳᛋ` the repeat; that string is absent from the canonical physical-page transcription. These are **third-party analysis inconsistencies** and must not be imported as original ciphertext evidence.

## Interpretation and decision

The six-rune recurrence is authentic and remains a potential structural clue, but the seventh glyph is sourced from **known solved text**. The proposed seven-symbol state-reset anchor does not yield seven independent unsolved ciphertext positions and must not be used as a known seven-rune original-LP2 cryptanalytic recurrence. This does **not** exclude all page resets, six-rune recurrences, non-GP registers or other possible alignment clues.

The likely failure mode is an extractor concatenating the 58 pages without tracking the physical p55→p56 boundary, together with the source-transcription's missing p50 physical page. The key-reset hypothesis itself remains unproven.

## Reproduce and external lead

`node sims/lp2_seven_gram_boundary_sft.cjs` checks page counts, original glyphs, all whole-page 6/7 repeats, all continuous unsolved 7 repeats and all complete-manuscript 7 repeats. Every assertion must pass.

- External proposal: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/CAMPAIGN-PLAN.md
- External coordinate and key-reset claim: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/X0-firewall/ADJUDICATION.md
- External contradictory seven-gram string: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F3-hand-feasibility/KEY-LOCALIZATION.md

**Status:** exact source/coordinate correction, no plaintext or authentic key recovered.
