# Antirepetition crosses physical LP2 line breaks

**Classification:** reproducible, source-matched structural constraint. All 55 rune-bearing unsolved LP2 pages are included. **No new plaintext, key or complete cipher mechanism has been recovered.**

## Measured original ciphertext

The physical printed-line wraps are encoded as `/` in `resources/transcriptions/liber_primus_master.txt`; LP2 physical page `p` corresponds to the master transcript's `%` chunk `p+16`. Physical LP2 page 50 contains the runeless grid. The implementation reconstructs all **12,956 rune positions** from source lines, and requires an exact byte-for-byte rune match to each physical page's sequence in `resources/liber-primus/lp2-corpus.json`.

| Disjoint adjacency class | Equal rune pairs | Total adjacent pairs | Rate |
| --- | ---: | ---: | ---: |
| Two positions on one physical printed line | **82** | **12,362** | **0.6633%** |
| Across a physical printed line wrap, within a page | **4** | **539** | **0.7421%** |
| Line wrap that splits a ciphertext word | **4** | **418** | **0.9569%** |
| Line wrap after an explicit `-` or `.` separator | **0** | **121** | **0%** |

The last two rows partition the across-line row. The four observed across-line equalities occur on physical pages 34 (two), 43 and 46. The two primary adjacency classes partition exactly the **12,901** within-page adjacent rune pairs.

## Exact-structure permutation test

For each physical LP2 page, retain **every whole printed line unchanged**, including its length and rune sequence, and draw a uniformly random permutation of its lines. Concatenate in shuffled physical-line order; count adjacent rune equalities at the newly joined line endpoints. Randomize pages independently. This null tests whether actual physical line order is special for the strong antirepetition signal while conditioning on original source glyphs and every intact line.

For lines `L_1..L_m` on one page, define `Q = sum_{i != j} 1[last(L_i)=first(L_j)]`. The exact random-permutation expectation of matches over its `m-1` joins is `Q/m`. Summing all 55 pages gives **15.6663419913**, compared with **4** actual. In **50,000** seeded Fisher–Yates permutations (xorshift32 seed `0x31e26c9d`), mean = **15.64932**, median = **16**, 1st percentile **8**, minimum **2**, and just **16/50,000** trials match or beat the original. With an add-one correction, **p = 17/50,001 = 0.0003399932** under this particular line-permutation null.

As a separate simple calibration, if the first glyph of each line were independent and uniform over 29 runes after reset, the expected count would be `539/29 = 18.5862` and a binomial calculation gives `Pr(X<=4)=0.0000430101`. This i.i.d. reference is less realistic than the exact-source line shuffle and is not the primary evidence.

## Positive controls and cryptographic interpretation

A synthetic generator draws independent uniform tentative 29-symbol runes on exactly the original physical line lengths. Each time a newly proposed rune equals the preceding emitted rune, it is replaced by a uniformly different rune with probability **0.81**. Two prespecified variants differ only in whether the antirepetition predecessor state is **reset at every printed line** or **carried across line breaks**, and both reset at page boundaries. One thousand simulated books per variant are included in the reproducer; the unreset model produces approximately **3.5** equal line joins per book, whereas independent line reset produces approximately **18.6**. These controls explain the diagnostic direction; the 0.81 rewrite is a forward thought experiment, **not** a recovered Cicada algorithm.

**Interpretation:** the original line joins are far more antirepetition-constrained than they would be if independent line processing simply permitted ordinary new-line coincidences. A stream-wide exclusion filter or an encoder that retains its relevant state across typeset wraps is compatible with the evidence. The measurement cannot distinguish these models, explain the hidden key, or exclude plaintext/word-dependent state rules. The line-shuffle p-value is conditional and is not corrected for the wider exploratory history of trying different LP2 structure tests.

This is a **distinct source-layout control** to the established cross-word endpoint result: 418 of the 539 tested physical breaks split a rune word; the suppressed equality rate remains through those wraps. It should inform the key-reset and forward-model assumptions of new ciphertext decoders.

**Reproduce:** `node sims/physical_linebreak_continuity.cjs` (CommonJS, Node.js 22; no third-party packages). It verifies the canonical source contract, prints each statistic, 50,000 fixed-seed null trials and two independently motivated forward controls.

## Distinct first-rune visual-column effect

Source-exact parsing exposes a second possible visual-boundary constraint. The **594 printed LP2 cipher lines** have a page-marginal-adjusted Pearson chi-square of **78.297494** for the first displayed rune (29 categories), compared with only **24.201917** for the final displayed rune. For each page and rune, the expected count uses the page's exact rune composition and its original number of printed lines. The most enriched initials are `ᛠ` (EA, **38** vs **21.14** expected), `ᛈ` (P, **33** vs **20.38**) and `ᛞ` (D, **32** vs **20.17**); `ᚱ` (R, **6** vs **19.43**) and `ᛁ` (I, **9** vs **21.54**) are depleted.

A **50,000-trial** null independently circularly rotates the original complete rune stream of each physical page, holding the page's printed start/end coordinates fixed. No surrogate attained the observed first-rune statistic (add-one **p = 0.000020**), whereas the last-rune statistic is ordinary (**p = 0.61195**). Even selecting the maximum across the two endpoint directions gives p = 0.000020. Discarding the 18 independently annotated **red line initials** leaves 576 black starts with chi-square **73.908540** against page-specific original rune marginals.

This is evidence of a strong **physical-line-start selection effect**, not proof of a new cipher channel. The manuscript uses distinctive glyph widths and print justification; a typesetting or wrap algorithm can produce systematic character preferences at line beginnings without encoding separate plaintext. No acrostic or key has been recovered. Reproduce the original observations and surrogate null in [`sims/physical_layout_keytests.cjs`](../sims/physical_layout_keytests.cjs).
