# p32 word-prime sums as linear addresses into the p50 256-entry table

**Agent 2, 13 November 2026. Classification: bounded source-motivated original-input negative.** No unknown plaintext, authentic key, cipher mechanism, or destination is recovered.

## Proposed human solve path

The independently signed 2016 Cicada message says that Liber Primus's words are a map and their numbers are the direction. Physical p32 is the tree page linked to that signed image. The repository's established p32 analysis records **22 words visible on p32**, including one incoming word carry from p31, and gives their GP-prime sums. Physical pp49–51 contain a printed **32×8 numeric table**, represented in the repository as 256 provisional base60-to-byte values.

A simple interpretation not covered by the existing word-indexed row/column and compass-walk tests is to use each p32 word-prime sum as a **linear address** into the 256-entry table. Since the table has 256 entries, the two ordinary address conventions are zero-based sum modulo 256 and one-based (sum minus 1) modulo 256. Read the table in its printed row-major order, take the selected value modulo 29 to obtain one GP29 key symbol per p32 word, and use the resulting 22-symbol key as a repeating additive key. The standard GP29 additive inverse is a motivated consumer because the solved p56 passage demonstrates prime/totient additive encryption; the source does not, however, explicitly prescribe this p32-to-p50 transfer or a repeating 22-symbol clock.

The immediate following illustrated section pp33–39 is a natural local target for a p32-derived map. The entire unknown LP2 stream pp0–55 is also tested to avoid making the conclusion depend on that local choice.

## Frozen source values

The exact p32 visible-word GP-prime sums, including the incoming carry, are:

~~~text
[73,125,267,613,191,184,14,540,458,535,183,442,196,497,160,446,98,203,96,348,160,216]
~~~

The 256 table values are read in printed row-major order from resources/liber-primus/base60-grid.json. The resulting keys are:

| Address convention | 22 selected bytes (hex) | 22 GP29 key symbols |
|---|---|---|
| Zero-based | 4f14dee52180b796d1575113b08de9aa4844deece98e | NG L M Y R EO N C G F D M TH AE U AE X I M R U Y |
| One-based | a40d9c53aa5104194a3ba79c5990f8c096d12331f854 | M P J AE AE D R AE T U OE J TH EA T E C G G L T Y |

The key extraction is completely fixed: no selected row, orientation, phase, or table-cell offset is fitted after looking at plaintext.

## Original-input results

Both key candidates were applied continuously from the beginning of each target, with the two additive signs. No per-page or per-word reset was added.

| Target | Address convention | Operation | IoC | Adjacent equal pairs |
|---|---|---|---:|---:|
| pp0–55, 12,956 runes | Zero-based | C−K | 0.03449559 | 461 |
| pp0–55, 12,956 runes | Zero-based | C+K | 0.03452138 | 457 |
| pp0–55, 12,956 runes | One-based | C−K | 0.03446985 | 389 |
| pp0–55, 12,956 runes | One-based | C+K | 0.03445569 | 421 |
| pp33–39, 1,680 runes | Zero-based | C−K | 0.03435293 | 71 |
| pp33–39, 1,680 runes | Zero-based | C+K | 0.03458691 | 63 |
| pp33–39, 1,680 runes | One-based | C−K | 0.03445858 | 47 |
| pp33–39, 1,680 runes | One-based | C+K | 0.03445503 | 50 |
| p55 complete-word body, 75 runes | Zero-based | C−K | 0.03459459 | 3 |
| p55 complete-word body, 75 runes | Zero-based | C+K | 0.03747748 | 5 |
| p55 complete-word body, 75 runes | One-based | C−K | 0.03459459 | 3 |
| p55 complete-word body, 75 runes | One-based | C+K | 0.02954955 | 3 |

For comparison, the original unknown-book IoC is **0.03447840**, the raw pp33–39 IoC is **0.03436002**, the raw p55 75-rune body IoC is **0.03855856** (one adjacent equal pair), and the solved p57 control IoC is approximately **0.06271**. The p55 test starts the 22-symbol key at the first new rune after its incoming p54 carry; this local reset is a diagnostic convention, not a source-authenticated clock. The decoded previews are nonlinguistic. None of the twelve original-input outputs shows the symbol concentration expected from the solved GP plaintext control. The changed adjacent-repeat counts are a side effect of a periodic key, not evidence of recovered text.

The script also plants known solved-p57 GP plaintext under each fixed key and recovers every planted symbol exactly. This checks the additive implementation and key clock; it does not authenticate the key.

## Decision

**Retire this exact linear-address key construction and repeating GP29 additive consumer.** It is distinct from the already rejected single-word self-indexed row/column lookup and previous-word compass traversal: here the 22 p32 word sums directly address 22 cells in the 256-entry table, yielding a 22-symbol key. The direct output fails on both the immediate p33–39 section and the full unknown book.

The result does not invalidate the signed 2016 navigation instruction, the p32 word-prime sums, or the 32×8 table. It only rejects the two fixed address conventions, row-major table order, byte-mod-29 symbol conversion, continuous 22-symbol key, and two additive signs. Do not rescue this branch with fitted offsets, alternate cell orders, new key resets, or unrelated KDFs without a new independent source instruction.

## Reproduction

Run from the repository root:

~~~bash
node sims/p32_wordprime_linear_table_address_key_sft.cjs
~~~

The standalone script reads the canonical corpus, transcription and numeric grid; asserts all 22 visible p32 word sums and the 256 table cells; prints the exact extracted keys; evaluates all eight original inverses; and checks exact roundtrips on a solved-p57 positive plant. The base60-to-byte table interpretation remains conditional, as in the upstream table analyses.

Related existing work:
- [Authoritative research synthesis](../results/README.md)
- [Word-prime / 32×8 self-indexed row-column test](lp2-wordprime-grid32x8-selfindexed-gate.md)
- [Previous-word prime-sum compass traversal](lp2-wordprime-compass-grid-causal-inverse.md)
- [p32 prime-pointer and compass graph](p32-prime-pointer-compass-original-gate.md)
- [Original table interpretation](../resources/liber-primus/base60-grid.json)
