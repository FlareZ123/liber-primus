# P50 low-60 original-source selector gate

## Decision

The 60-cell p50 low-value / literal-leading-zero class remains a real source-visible feature, but the original pp49–51 artifact and surviving authenticated 2014 delivery material do **not** specify that class as a cipher operand or give it a finite receiver.

The table prints every cell as a fixed-width two-character token, so the rule `first character = 0` is directly visible without consulting ciphertext repeats. That visibility is the full source support presently available. The immediate text, punctuation, illustration, and delivery wrapper do not say to select those cells, consume their second characters, use their locations, hold or advance state, or apply another value-changing operation.

This negative selector audit does not weaken the independent #1500/#1508/#1512 statistical association.

## Table-native checks

The canonical grid has 256 two-character tokens. First-character counts are `0:60, 1:58, 2:65, 3:56, 4:17`. The 60 leading-zero cells split **15 / 26 / 19** across pp49 / 50 / 51.

The count 60 is not an independent authored-count surprise under the byte-like base60 reading. A uniform 0..255 byte has `P(value<60)=60/256`, so 256 cells have expected low-cell count exactly **60**. The binomial probability of exactly 60 is **0.0587732801395719**.

The cheapest literal receiver is to strip each visible leading zero and read the remaining characters in printed row-major order:

`4FXxPds5SGlxpPkwSnuZYWVEWsZgsDKADkXEqIsIeJcX0lLv6xwqpq0WgMua`

Those 60 characters contain only **36 distinct** values of the 60-character alphabet, leaving 24 alphabet values absent. The selected cells therefore do not form a hidden base60 permutation or one-copy alphabet ordering. No alternative receiver was introduced after this failure.

## Immediate source context

Original pp49–51 show the numeric field in ordinary black proportional text. The leading-zero cells have no separate color, box, underline, size, or label. The floral frame is reused across the surrounding p40–55 visual chapter, so it is not a low-cell selector.

The p49 red ten-dot mark fixes the start of the typed numeric field after the intact pretable sentence. The same mark type is independently known on solved p56 before its 128-character hex field, where it marks a typed-field boundary and does not select an internal subset. This supports a field boundary, not a low60 opcode.

The already-audited flanking sentences remain encrypted: 138 runes / 33 words before the table and 170 runes / 40 words after it. This task did not free-key decrypt them.

## Surviving 2014 delivery material

The preserved Stage11 index contains `<title>133</title>`, `<div id="331">`, and exactly sequential image references `0.jpg` through `57.jpg`. It contains no links, scripts, forms, comments, or table-specific instruction. The signed delivery message supplies the onion destination plus greeting/closing language and no numeral-selection rule. Earlier source work established that later sexagesimal conversion files in participant repositories were solver artifacts rather than first-party delivery files.

Thus the surviving 2014 wrapper provides no independent instruction such as “zero”, “low”, “first digit”, a radix command, or a receiver tied to these 60 cells.

## Reproduction

`sims/lp2_p50_low60_source_selector_sft.cjs` checks the canonical table width/counts, page split, literal strip-zero extraction, distinct-value count, exact-count baseline, and preserved Stage11 index inventory.

Passing shared CI: https://github.com/FlareZ123/liber-primus/actions/runs/44392703439

## Missing selector

The missing evidence is precise: a first-party instruction or decrypted local sentence must identify the low/leading-zero class **and** specify what operation consumes it. Until then, the 60-cell mask is an empirically transferable clock/state correlate rather than an authenticated operand.

Reopen this source lane only if a new original artifact or independently recovered plaintext supplies that selector. Do not substitute more table-derived receiver menus for the missing instruction.
