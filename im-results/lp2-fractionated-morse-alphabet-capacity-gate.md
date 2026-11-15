# Three-trit fractionated Morse: original-alphabet capacity gate

**Agent5, 15 November 2026, Director Issue #1041.** A direct, fixed-key, one-rune-per-three-trit fractionated Morse mapping cannot be the standalone LP2 cipher on 54 of 55 rune-bearing unknown physical pages. No original 2012–2016 Cicada instruction identified so far selects a replacement codebook, rune grouping, or LP2 recipient, and **no unknown plaintext or key is recovered**. This is a bounded mathematical exclusion, not a ban on Morse-related constructions.

## Why this form is incompatible with the authentic source

Standard fractionated Morse first converts plaintext to a dot, dash and separator stream. It maps triplets of these three symbols through a fixed alphabet. A length-three ternary block has `3^3 = 27` possibilities; the conventional forbidden separator-only triplet reduces the usable alphabet to **26**. A keyed permutation cannot add new triplets. Even a nonstandard version admitting the otherwise forbidden triple has only **27** distinct ciphertext codes.

The canonical original-page GP29 rune-index corpus, `resources/liber-primus/lp2-corpus.json`, records **12,956 runes** on **55** unknown rune-bearing pages (p50 is numeric only). The complete book uses every one of 29 rune types; the independently fixed **per-page inventory** is:

| Distinct original rune types on one physical page | Page count | Physical pages |
| ---: | ---: | --- |
| 29 | 53 | p0–p48, p51–p54 |
| 28 | 1 | p49 |
| 25 | 1 | p55 |

Thus **54** individual unknown rune-bearing pages contain **more than 27 distinct ciphertext runes**. None could have been emitted by a deterministic fixed three-trit-to-rune substitution that assigns one cipher rune per code and preserves distinctions. A standard 26-code scheme is excluded on the same 54 pages, regardless of keyword alphabet. The shorter terminal p55, which contains 25 rune types, is **not** excluded independently by cardinality.

This result requires no English model, state search, fitted key, period or visual guess. [Single-file original-corpus reproducer](../sims/lp2_fractionated_morse_capacity_sft.cjs) checks the exact source and triplet counts.

## Historical selector and boundary of the exclusion

The archived 2013 signed file often named `2013-01-rune-table-morse.asc` is a misleadingly named historical **whitespace binary ASCII** carrier. Its actual four space/tab-only data lines contain 552 bits, interpreted as 69 ASCII bytes; the recovered message names `emiwp4muu2ktwknf.onion`. The already reproducible [historical source audit](lp2-punctuation-2013-original-binary-selector-gate.md) establishes that event and explains that its signed message does not cryptographically authenticate trailing whitespace. It does not select Morse trits for LP2.

LP2's 138 small four-dot marks, five three-dot marks and larger red ten/thirteen-dot marks are image-visible punctuation categories, with no first-party instruction to read them as Morse dots/dashes/separators or to place triplet boundaries. Their shape or count does not supply a historical Morse key.

**Outside the bound:** A homophonic 29-rune output alphabet sharing triplet codes, explicit escape symbols, position-dependent codebooks, length-four ternary grouping, genuine 5-bit Baconian codes, variable-length Morse fields or an intermediate non-rune alphabet could avoid this cardinality argument. Each needs independent instruction defining its code assignment and page/word clock. Do not rescue the excluded direct scheme with fitted exceptional symbols, or promote an arbitrary such extension without an original-source selector.

**Research decision:** Retire direct standard three-trit fractionated Morse as a whole-page LP2 inverse; preserve p55 as mathematically eligible but **not selected**. Future fractionation work should require an authenticated original clue specifying a codebook or reversible transformation before testing unknown ciphertext. No additional sweep is indicated by this exact gate.
