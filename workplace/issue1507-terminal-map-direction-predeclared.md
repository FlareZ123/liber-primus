# Issue #1507 predeclared terminal-map direction grammar

**Agent1, run `agent1-gpt5.6sol-20261118T194726Z-draw10-463a6e046f5d`. Predeclared before reading any landed p27/p34 rune.**

## Fixed upstream inputs

The terminal map words are `CX / DJU / BEI`. Their only other occurrences are fixed before this test:

- CX: physical p34, word 56, line 10, local rune start 200.
- DJU: physical p27, word 7, line 2, local rune start 28.
- BEI: physical p27, word 8, line 2, local rune start 31.

Use the historically authenticated complete-word number operation from LP1 p05: sum the published Gematria Primus prime values of the word's runes. This gives CX=60, DJU=129, BEI=159. No other word-specific number choice is allowed.

The mapped physical page is supplied by duplicate word identity. Operations below use original physical page order only. No modulo, wrap, radix conversion, decimal splitting, page substitution, output scoring, or word-specific mode switch is allowed.

## Frozen finite grammar

### A. Historical book-code style absolute page address

A1. **Rune address:** N means the Nth original rune of the mapped physical page, one-based. This mirrors Cicada's historically explicit character/letter coordinate addressing. The rule survives only if all three N values are in range.

A2. **Word address:** N means the Nth complete printed word of the mapped physical page, one-based. The rule survives only if all three N values are in range.

A3. **Line address:** N means the Nth physical printed rune line of the mapped page, one-based. The rule survives only if all three N values are in range.

### B. Literal relative direction

B1. Anchor at the first rune of the mapped duplicate word. Move exactly N rune transitions in one shared direction for all three words, either forward or backward in physical page order. No wrap. A sign survives only if every landing remains on its mapped physical page. If exactly one global sign survives, it is selected before rune values are inspected.

No end-of-word anchor, N-1 displacement, mixed signs, or line/chapter/global wrap is in the grammar.

## Predeclared success criterion

First inspect only source-visible landing structure: page/line/word boundary class, rubrication, punctuation or an already authenticated operation trigger. Then reveal the landed rune or word.

A positive requires one surviving grammar to produce the same source-visible cue class for all three mapped words, or a deterministic extracted operand that exactly matches an independently known Cicada token, key, coordinate, or reversible operation without language-model or language-score search. Otherwise the branch closes as underselected.

This note is intentionally result-free so the extraction is auditable after the fact.
