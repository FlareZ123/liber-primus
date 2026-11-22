# LP2 p41–p48 original floral-stencil line-column key gate

**Outcome (22 November 2026):** The complete original eight-page, twelve-line receiver is inconsistent with a shared stationary *line-column* additive pad or fixed 29-symbol substitution producing ordinary GP29 English plaintext. **No unknown plaintext, key, or authenticated LP2 operator was recovered.** The check is key-independent for the stated family, and deliberately does not disqualify line-varying state, encrypted preprocessing, layout-dependent text reordering, or an external key.

## Upstream source clue and decisive alternative

Original physical p41–p48, scans `58.jpg`–`65.jpg`, share virtually the same floral border artwork and each contains **exactly 12 printed rune lines**. Printed rune counts by page are **273, 272, 274, 273, 270, 270, 274, 271**, with every line at least 20 runes long. Those properties suggest a different human-readable receiver from the previously tested page-offset stationary key: align *printed line number* and *rune column number*, then reset a shared key at the beginning of every line.

A line-column model with secret alphabet `S_c` and column key `K_c` acts on every page and printed line at position `c`. It may be `C=S_c(P)` for an arbitrary secret per-column permutation, or `C=P+K_c (mod29)`. Both preserve within-column GP symbol equality and index of coincidence. The same holds for a different secret bijection at each fixed printed `[line,column]` coordinate across all eight pages, if comparisons are confined to the same coordinate. Thus we can reject such families **without learning, guessing, or fitting any key**.

The strongest rival is ordinary compositor reuse: the repeated border is decorative and the original ciphertext is nearly uniform regardless of printed column.

## Frozen original-input result

The original `resources/liber-primus/lp2-transcription.txt` physical p41–p48 pages were parsed at their printed line breaks. Their rune tapes match the exact `resources/liber-primus/lp2-corpus.json` page indices **without a single mismatch**. Both source registers are derived from the same community archive, so this is a consistency check rather than independent photographic adjudication.

| Fixed test | Original measurement | Implication |
| --- | ---: | --- |
| First 20 physical rune columns, pooled over eight pages × twelve lines | Each column has **96** original ciphertext symbols | No alignment/key phase selected from ciphertext |
| Sum of all 20 within-column ordered equality counts | **6,406 / 182,400 = 0.0351206140** | Almost flat-GP29, far below native-language collision concentration |
| Every corresponding `[line,column]` slot across the 28 unordered page pairs | **291 / 7,343 = 0.0396295792** matching symbols | Also well below ordinary GP prose under any shared-position secret bijection |
| Authenticated clear GP text on original p57 | **IoC = 0.0627099664** across 95 runes | Small positive native-language reference; not itself a complete language distribution |
| Most matching individual page pair | p41/p44 **22 / 264 = 0.0833333** | Matches scattered across 11 of 12 lines, without a sustained repeated phrase; selected from 28 pairs |

The page-pair maximum is **not** a cryptographic hit: every other pair must be considered, no original clue privileges p41/p44, and a single high collision count does not supply a key or readable plaintext. The other 27 aligned pairs supply no reusable native-GP pattern; a two-message additive keystream cancellation also lacks enough independent repeated ciphertext to identify source-selected plaintext.

The first twenty common rune columns are an objective complete rectangle, as every original line is at least 20 runes; no word-boundary, line-length, or ciphertext-contingent coordinates were tuned. Compare with #656's *whole-page first-270-rune* stationary pad gate, whose test receiver is materially different. These experiments jointly reduce the plausibility that merely seeing the repeated floral stencil supplies a stationary key reset.

## Reproducer and next decision

Run `node sims/lp2_floral_stencil_line_column_key_sft.cjs` with Node.js 22 from repository root (Windows 11 supported). The program uses only built-in libraries, asserts source agreement, prints exact column and page-pair counts, and checks the p57 cleartext control. It reads original derived corpus files without modifying them.

Do not expand to arbitrary per-page, per-line, or per-word key phases on this decorative premise alone. The next worthwhile attack would require an **independently visible first-party instruction** choosing a changing cipher state or an actual plaintext/key at a specific original receiver. This report belongs in supporting negative evidence rather than the established decryption synthesis.
