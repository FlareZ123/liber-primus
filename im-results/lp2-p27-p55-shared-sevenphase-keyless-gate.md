# The p27/p55 full-word collision does not support a shared seven-phase stationary substitution

**Classification:** new finite, key-independent exclusion for a specific source-motivated cipher architecture, 12 November 2026 (Agent43). There is **no recovered unknown-page plaintext, authentic key or historical decoder**. The duplicated original words remain genuine source facts, independently investigated under [Director #562](https://github.com/FlareZ123/liber-primus/issues/562).

## Why a solver might try seven

The original physical **p27** contains the complete two-word sequence **DJU BEI** at local rune offset **28**, and the final unsolved **p55** closes with exactly the same six runes at offset **70**. Both words are three runes long, both instances preserve the same printed boundary, and the word pair is unique among source-printed repeats of combined length at least six. The offsets satisfy `28 mod 7 = 70 mod 7 = 0`. An original 2014 Cicada stage used a seven-column operation, so a *shared page-reset seven-position schedule* is worth a finite test. The 42-position offset difference also has other divisors. No original LP2 clue independently selects shared period-seven substitution, physical-page reset, or the pair's plaintext.

## Exact keyless test and limits

Grant **seven arbitrary and completely secret, independent bijections of all 29 GP glyph identities**. At each physical page's local zero-based position `i`, apply the identical secret bijection indexed by `i mod 7` to unknown native-GP plaintext, using the same seven bijections on both p27 and p55. An arbitrary fixed seven-letter additive key is a restricted member of this family. No amount of key search, alphabet relabeling or unconstrained choice among the `29!` bijections can alter which ciphertext symbols are equal at the **same phase**. Consequently the sum of equal-symbol ordered pairs within each phase is identical in plaintext and ciphertext.

On authentic original page lengths **p27=234 and p55=76**, group both pages' glyphs by `i mod 7` and count ordered equal pairs / all ordered pairs among the seven groups. There are exactly **458/13,422 = 0.034123081507971983** original equal pairs. This directly checks the source input without fitting a key.

For native English calibration, map the three independently pinned plain-English reference corpora into the established GP29 code using the same longest-match transliteration and canonical `QU→CW, V→U, K→C, Z→S, ING→NG` rules. At increments of **155 encoded runes**, split each consecutive **310-rune** source window into the same 234/76 physical positions, and measure the identical seven-phase collision fraction. Reference windows may overlap and do not enforce matching word lengths; the negative is scoped to this finite native-GP reference panel.

| Source | Reference windows | Lowest seven-phase equal-pair fraction | Median | Windows at or below original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 1,403 | 0.04693786320965579 | 0.06049769035911191 | 0 |
| Gibran | 403 | 0.05036507226940844 | 0.06183877216510207 | 0 |
| Emerson | 2,083 | 0.049918045000745044 | 0.06303084488153778 | 0 |
| **Original** | **1** | **0.034123081507971983** | **not applicable** | **not applicable** |

All **3,889** pinned source windows exceed the original, with a substantial gap. The [runnable CJS original-cipher gate](../sims/lp2_p27_p55_sevenphase_sharedkey_invariant_sft.cjs) asserts the original phrase offsets and exact runes, input lengths, pair numerator/denominator and reference-window counts. It constructs a genuine 310-rune English plant encrypted with seven independent affine invertible GP29 substitutions, checks exact same-phase equality preservation and recovers all **310/310** source runes with the true inverse. This validates the necessary-condition test, not the historical cipher.

## Decision and what survives

The original's severe symbol-collision depletion **strongly disfavors any one fixed page-reset period-seven GP29 substitution key shared across p27 and p55**, even if the key is seven unknown full alphabet permutations, when the plaintext should resemble ordinary native-GP English. A simple repeated seven-letter Vigenère key across these pages is included in the negative. This decision is independent of guessing whether `DJU BEI` means any particular six-rune phrase.

**Do not extend this coincidence into arbitrary seven-key fitting.** It does not refute a seven-column *transposition*, changing hidden-state or per-page keys, irregular key clocks, an alternate plaintext alphabet, additional encryption layers, or a context-sensitive word code. The actual two-word duplication remains a stronger source clue than its optional arithmetic phase alignment; Director #562 is the appropriate route for authentic common-state analysis.
