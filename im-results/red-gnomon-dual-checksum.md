# Dual GP29 closure of the source-red channel and its 15² + 31 gnomon

**Classification (10 November 2026):** exact original-annotation arithmetic and exploratory source-selected key-geometry candidate, with a finite original-input exclusion. **No unknown LP2 plaintext, key, algorithm, or destination has been recovered.**

## Source-bound calculation

The original-image ink annotations in `resources/liber-primus/lp2-ink-annotations.json` give **225 red runes** across all physical LP2 pages, including the **5-red-rune AN END** title on solved page 56 and **7-red-rune PARABLE** title on solved page 57. Separately, **31 thirteen-dot stencils** exist, one printed in black. The selected 225+31 event set excludes four ten-dot marks, a 23-dot mark, and five red Arabic numbered headings. These are real additional ink classes, not secretly included in the 256-event inventory.

Use the source's Gematria Primus rune indices 0..28 and the **29 assigned prime values**, summed over **all 225 red runes in physical page/position order**:

| Source selection | Number of runes | Sum of GP indices | Sum of GP prime values |
| --- | ---: | ---: | ---: |
| **All red ink glyphs** | **225** | **3,103 = 29 × 107** | **11,252 = 29 × 388** |
| **Physical p40 red title**, GP indices `[0,9,19,26,6,23,25,8]` | **8** | **116 = 29 × 4** | **435 = 29 × 15** |
| Red runes on unsolved pp0–55 | 213 | 2,906 | 10,518 |
| Two solved red titles pp56–57 | 12 | 197 | 734 |

Both the **whole red stream** and the source-distinguished **eight-rune red heading on p40** have total index **and** total prime value congruent to zero modulo 29. In particular, the two solved-page title totals precisely close the unsolved red total to zero in both registers: `(2906+197,10518+734) ≡ (0,0) mod29`. These equalities are reproducible integer observations; neither is a check cryptogram with known plaintext.

The previously noticed source p40 **prime-sum quotient 15** now has an independent matching dimension: **225 = 15² red runes**. The 31 thirteen-dot events exactly supply a square gnomon, **31 = 16² − 15²**, and 225+31 = **256 = 16²**, the same size as the **32×8 printed numeric table**. This suggests one *possible* human clue sequence: p40 title prime quotient 15 → 15×15 red symbol square → 31 stencils as the 16th border → reshaping the independently printed 256-entry grid to 16×16. No original illustration actually draws that square, identifies the reading orientation, or states that the stencil glyphs contain 31 separate numerical checks. The numbers were compared during exploratory research, and the relation is **hypothesis generating**.

## Frozen original-source tests

The p40 eight-runic red title occurs at page-local offsets 0–7. Circularly shift that fixed eight-position red mask through **all 231 possible phases** on the original p40 rune string; **only shift zero** has both the GP-index sum and prime-value sum divisible by 29. Across the 231 phases, **14** have index sum zero and **8** have prime sum zero. This is an exact phase-conditional fact, **not a selection-adjusted p-value** for the whole project.

A fixed-seed 60,000-trial descriptive null independently circularly shifts the complete red-position mask within each of the manuscript's original red-bearing physical pages, preserving each page's runes and its red count. **69/60,000** yield global dual-zero sums, **236/60,000** have p40 dual-zero, and **1/60,000** meets both. The first figure agrees with a generic probability near 1/29² and demonstrates that global dual-zero closure alone is entirely plausible by chance. The null does not model the author's deliberate placement of heading ink or correct for noticing these properties retrospectively.

**Concrete 16×16 border-key inversion:** keep the 225 red runes as row-major 15×15 GP indices `R[r,c]`; reshape the printed 32×8 **base-60 byte** table into row-major 16×16 `G`. The 31 cells of G's last column and last row correspond to the hypothetical gnomon border. The simplest additive row/column border-key mechanism must satisfy

`G[r,c] ≡ R[r,c] + G[r,15] + G[15,c] − G[15,15] (mod 29)`.

On the exact original source, only **8/225** interior cells obey it, practically the **225/29 = 7.7586** accidental-match baseline. A source-native synthetic grid using the declared border rule matches **225/225**, and changing one synthetic interior symbol reduces this to **224/225**. The original grid is therefore **not** a direct GP29 row/column additive rendering of the chronological red 15×15 square under this particular, independently fixed orientation.

A second source-fixed comparison applies Cicada's historical prime-rank eight-column transposition rule to the **eight red p40 runes**. Their primes `[2,29,71,103,17,89,101,23]` prescribe order **[0,4,7,1,2,5,6,3]**. Aligning the chronological 256-event stream to the 32×8 table under this order gives **8/256** exact grid-low-five-bit matches (at-least-as-high rank **20,089/40,320**), or **10/256** mod-29 matches (rank **17,487/40,320**). This is unremarkable among the complete 8! comparison orders and does not recover a hidden message.

## Research consequence

The new, potentially useful part is **the double-register zero closure**, especially on the independently singled-out eight-rune p40 title, and the coherent but *unproved* gnomon geometry linking 15, 225, 31 and 256. It supplies no uniquely selected outer-border reading rule or evolving cipher state. Follow-up work should require a visual or historical clue that *fixes* a traversal or nonlinear operation **before** testing original ciphertext and demands readable held-out plaintext. Existing `im-results/red-225-source-square-heldout.md` and `im-results/red-225-hill-feedback-inverse.md` already reject direct 225-red periodic pads and 15×15 Hill/feedback models; those experiments should not be repeated.

**Read-only reproduction:** `sims/red_gnomon_dual_checksum.cjs`; original `lp2-corpus.json`, `lp2-ink-annotations.json` and `base60-grid.json`. Core sums, the exhaustive p40 phase test, exact column-order comparison and 60,000-trial rotation null were executed independently against those same connected source JSON files. The committed standalone CommonJS script has not yet received a GitHub Actions execution record, so no runner success is claimed.