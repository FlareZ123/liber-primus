# Sefer Yetzirah / 32 Paths as an LP2 book key: source-locked test

**13 November 2026, Agent 36. Classification:** independently selected literary-source hypothesis, exact original LP2 inversion and 729-rune original-source-language positive plant. **No unknown plaintext, author-selected key, cipher or historical destination recovered.**

## Original-source lead and its weakest premise

The historical 2013 Cicada OS preserved identical high-entropy files named \`wisdom\` and \`folly\`. The 2014 original LP1 Wisdom square contains \`CABAL\`. LP2 pp49–51 prints precisely **32 rows of eight two-character numerals**, and the 2016 signed clue calls manuscript words a map whose numbers give direction. In the English Westcott *Sepher Yetzirah* (Book of Formation), chapter IV describes the **seven double letters**, enumerating the **Wisdom and Folly** opposition. The supplement is titled **The 32 Paths of Wisdom**, and chapter I starts with the thirty-two paths of wisdom defined as **ten numbers and twenty-two letters**.

This is a coherent *source-discovery hypothesis*: a contemporary player interested in Cicada's numerology, Wisdom/CABAL and 32 numerical rows might identify this historical text and use its actual words as plaintext cribs or a running Vigenère key. The strongest objection is decisive: **no contemporary signed Cicada message or original manuscript page names Sefer Yetzirah or selects its English translation, source offset, or additive cipher**. Numeric/semantic resemblance alone has not authenticated this source.

Original material is preserved independently of results: [14-page Westcott translation excerpt](../resources/external/sefer-yetzirah-westcott-archive.json) from the public-domain edition, mirrored as an OCR-bearing source file originally held by [mahapo/ark-data](https://github.com/mahapo/ark-data), Git blob SHA-1 \`f7da0ed7e9497e668749fd0b8f10ca512331bd15\`. It contains nine pages of main Westcott text and a four-page *32 Paths* supplement. OCR slips and added editorial material may affect exact key-stream values, which is why this is only a finite negative against that explicit published register.

## Actual source-to-cipher experiment

Map the original text into standard Gematria Primus GP29 word units, retaining the published multigraphs TH/NG/EO/OE/AE/IA/EA, with the ordinary QU→KW, K/Q→C, Z→S and V→U conventions. Source segments:
- Main Sefer chapters (source pages 2–10): **13,214 GP29 symbols**;
- Thirty-two Paths appendix (source pages 11–14): **7,524 GP29 symbols**.

The original 56 unsolved LP2 physical pages provide **12,956 intact GP29 runes**, arranged in **2,896 complete printed words**. The nine *original-image visual chapters* have rune lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. They are scored independently so that a literal chapter-wise reset remains detectable.

**Exact printed-word-length crib search:** Use unaltered manuscript whole-word lengths, and compare every matching five-word seed with every consecutive Westcott source word sequence, extending equal lengths until the first disagreement. The longest candidate match is **8 words** in the main text, **7 words** in the appendix, and **zero matches of ten or more consecutive word lengths** in either. This does not rule out paraphrase, homophony, or a different text edition.

**Complete original chapter running-key inversion:** For each source range and nine chapter targets, enumerate **all source offsets where the entire target chapter fits**, both additive signs \`P=(C±K) mod29\`. On the first 350 runes of each original chapter (all 308 for the short terminal chapter), rank offsets by index of coincidence scaled by 29, where a uniform rune distribution expects score1.0. Lock the best five offsets *before* computing each complete chapter's full-range score and exact forward reconstruction. This tests **hundreds of thousands of explicit source offsets**, including first-chapter and final-chapter direct uses. No phase adjustments or plaintext crib fitting occur.

| Source text | Largest 350-rune normalized IoC among nine chapters | Highest fully locked chapter score |
| --- | ---: | ---: |
| Main Sefer Yetzirah | **1.13104** (p40–53, first 350) | **1.12496** (p54–55, complete 308) |
| 32 Paths appendix | **1.13199** (p8–14, first 350) | **1.12374** (p54–55, complete 308) |

All **18 original chapter/part inverse families** remain in the near-uniform cipher register (the raw chapter scores are 0.981–1.004). The first-350 maxima over many offsets are expected to be higher than a uniform baseline because they are selected maxima. None reveals a meaningful plaintext phrase and no full-chapter score approaches natural GP-language concentration.

**Independent positive:** Take an actual 729-GP-rune excerpt of the main Sefer Yetzirah prose as *known plaintext*, and encrypt it under a separately selected 729-rune appendix passage beginning at key offset **1,234**. Searching *every complete-fitting appendix key offset* with the same first-350 test identifies the planted 1,234 key offset and subtractive direction first, then recovers **all 729/729 native-source plaintext runes** and round-trips the original synthetic cipher. The same inverse also perfectly reencrypts every original LP2 top candidate. This ensures the negative result is from the source/cipher hypothesis rather than an inoperative scoring or indexing implementation.

## Cryptanalytic decision

The “32 Paths / Wisdom / Folly / CABAL” source hypothesis has **no authentic provenance as a key** and its economical complete-running-key implementation demonstrably fails on all nine image-derived chapter originals. The word-length crib also does not identify an exact quoted passage from this OCR register. The historical text remains a possible thematic inspiration; do not promote it to the authoritative solution record. Retire broad Westcott Vigenère source-offset searches unless a new authentic clue picks a different target or consumer. **No original LP2 words were deciphered.**

[Single-file offline CommonJS reproducer](../sims/lp2_sefer_yetzirah_bookkey_crib_sft.cjs) reads only the preserved canonical original LP2 source and archived historical text, asserts every page/rune boundary, performs the entire search, and tests planted recovery. [Successful manual Node.js 22 CI run 43349310221](https://github.com/FlareZ123/liber-primus/actions/runs/43349310221) checks syntax and executes the original-input and positive controls.
