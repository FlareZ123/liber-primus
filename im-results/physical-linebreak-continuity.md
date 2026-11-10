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

## Physical page-turn modular step: exploratory layout-specific constraint

Across **54** joins between consecutive rune-bearing unsolved physical LP2 pages, define the signed GP index difference `d = (first(next page) - last(previous page)) mod 29`. The runeless p50 grid is skipped, so the p49→p51 join remains present. On the original source, **23/54** lie in the six consecutive residues **12–17**, compared with only **118/539** within-page physical-line-wrap joins and **2,609/12,362** joins on one printed line. The page-turn concentration is present when the page breaks a rune word (**14/32**) and when a word boundary intervenes (**9/22**). This is a retrospective observation with no demonstrated cipher interpretation.

Whole-page permutation and original-neighborhood displacement controls test whether an actual join depends on the paired page endpoints:

| Comparison | Source observation | Conditional null |
| --- | --- | --- |
| Scan all 377 circular arcs (lengths 2–14, start 0–28) on 54 original page joins, selecting the maximum standardized excess | Best **12–14**, **15/54** versus end/start marginal expectation **5.9802** | **681/30,000** shuffled whole-page orders reach the same scan maximum; add-one p = **682/30,001 = 0.02273** |
| Train on physical pages **0–27**, freeze the 377-window winner; score disjoint physical pages **28–55**, omit p27→p28 | Train chooses **12–17** with **10/27** hits; test finds **12/26** (expected **5.8134**, z **2.9120**) | Permute page order separately in train/test, repeat selection on each permuted train: **279/60,000** test scores as large; p = **280/60,001 = 0.00467** |
| Restrict whole-page permutations to both halves with no equal adjacent rune at their joins | Same source statistic | **61/10,770** eligible trials as extreme; p = **62/10,771 = 0.00576** |
| Choose independent ±10-rune local displacements for the same 26 test page breaks | Fixed arc **12–17**: **12** hits, expected **5.4762** by 26 distinct local probabilities | Exact Poisson-binomial upper tail **0.0029801291** |

A stronger **section-preserving shuffle** partitions the 55 rune-bearing
pages into nine visible page ranges (p0–2, p3–7, p8–14, p15–22, p23–26,
p27–32, p33–39, p40–53, p54–55). Keep the first and last page of each
range fixed, and permute only its internal complete pages. Thus all eight
inter-section joins and their punctuation are unchanged. Among **46**
within-section joins, **20** have a 12–17 step. In **100,000** seeded
pinned-section shuffles, the mean is **13.31438**, and **1,658** meet or
exceed 20 (add-one **p = 1,659/100,001 ≈ 0.01659**). The effect remains
under section grouping, with weaker conditional evidence. This test also
postdates the original discovery of the 12–17 interval and cannot be
counted as an independent discovery.

Every whole-page permutation retains the page's actual rune order, glyph inventory, first/last rune identities, and typographic layout. The test's marginal expected counts use every possible end-to-start pairing of the pages in its split. The local displacement null keeps all original ciphertext positions and only randomizes which neighboring adjacency is treated as the boundary. Both comparisons therefore distinguish the physical joins from commonplace within-page adjacency effects.

**Scope:** The arc 12–17 and split were investigated after inspecting the source, so even the page-disjoint test is only a conditional replication within a historically explored manuscript. Multiple conditional p-values cannot be multiplied to infer authorial intent. Glyph spacing, typography, or a latent page-state cipher could in principle contribute. Neither a 29-symbol page-reset key nor any original plaintext has been recovered. The frozen 12–17 criterion is suitable as a secondary test for future *source-derived* forward models.

**Reproduce:** `node sims/page_turn_mod29_holdout.cjs` (CommonJS, Node.js 22) prints the original exact summary and asserts 30,000 full-source shuffles, 60,000 two-half shuffles, the no-repeat subset, and the exact independent local-displacement tail.

## Exact-structure permutation test

For each physical LP2 page, retain **every whole printed line unchanged**, including its length and rune sequence, and draw a uniformly random permutation of its lines. Concatenate in shuffled physical-line order; count adjacent rune equalities at the newly joined line endpoints. Randomize pages independently. This null tests whether actual physical line order is special for the strong antirepetition signal while conditioning on original source glyphs and every intact line.

For lines `L_1..L_m` on one page, define `Q = sum_{i != j} 1[last(L_i)=first(L_j)]`. The exact random-permutation expectation of matches over its `m-1` joins is `Q/m`. Summing all 55 pages gives **15.6663419913**, compared with **4** actual. In **50,000** seeded Fisher–Yates permutations (xorshift32 seed `0x31e26c9d`), mean = **15.64932**, median = **16**, 1st percentile **8**, minimum **2**, and just **16/50,000** trials match or beat the original. With an add-one correction, **p = 17/50,001 = 0.0003399932** under this particular line-permutation null.

As a separate simple calibration, if the first glyph of each line were independent and uniform over 29 runes after reset, the expected count would be `539/29 = 18.5862` and a binomial calculation gives `Pr(X<=4)=0.0000430101`. This i.i.d. reference is less realistic than the exact-source line shuffle and is not the primary evidence.

## Positive controls and cryptographic interpretation

A synthetic generator draws independent uniform tentative 29-symbol runes on exactly the original physical line lengths. Each time a newly proposed rune equals the preceding emitted rune, it is replaced by a uniformly different rune with probability **0.81**. Two prespecified variants differ only in whether the antirepetition predecessor state is **reset at every printed line** or **carried across line breaks**, and both reset at page boundaries. One thousand simulated books per variant are included in the reproducer; the unreset model produces approximately **3.5** equal line joins per book, whereas independent line reset produces approximately **18.6**. These controls explain the diagnostic direction; the 0.81 rewrite is a forward thought experiment, **not** a recovered Cicada algorithm.

**Interpretation:** the original line joins are far more antirepetition-constrained than they would be if independent line processing simply permitted ordinary new-line coincidences. A stream-wide exclusion filter or an encoder that retains its relevant state across typeset wraps is compatible with the evidence. The measurement cannot distinguish these models, explain the hidden key, or exclude plaintext/word-dependent state rules. The line-shuffle p-value is conditional and is not corrected for the wider exploratory history of trying different LP2 structure tests.

This is a **distinct source-layout control** to the established cross-word endpoint result: 418 of the 539 tested physical breaks split a rune word; the suppressed equality rate remains through those wraps. It should inform the key-reset and forward-model assumptions of new ciphertext decoders.

**Reproduce:** `node sims/physical_linebreak_continuity.cjs` (CommonJS, Node.js 22; no third-party packages). It verifies the canonical source contract, prints each statistic, 50,000 fixed-seed null trials and two independently motivated forward controls.

## Distinct printed-line initial bias and page-disjoint reproduction

The **594 printed LP2 ciphertext lines** have an enriched first-rune profile, relative to each page's exact overall 29-symbol composition. Agent 31's original observation gives **78.297494** for the first-rune 29-bin Pearson statistic versus **24.201917** at the last-rune endpoint. A **50,000-trial** null independently circularly rotates every original page's continuous glyph stream while leaving the physical start/end positions fixed: zero samples attain the first-rune value (**add-one p = 1/50,001**), whereas the line-end statistic is ordinary (**p = 0.61195**). Discarding the 18 annotated red-line initials still gives first-rune chi-square **73.908540**. EA `ᛠ`, P `ᛈ` and D `ᛞ` appear excessively at beginnings; R `ᚱ` and I `ᛁ` are depleted. Original source and full source-geometric scan: [physical layout tests](../sims/physical_layout_keytests.cjs).

An independent **cross-physical-page replication** sharpens that signal without fitting a ciphertext key. Agent 19's source-exact follow-up divides all 55 rune-bearing pages alternately into even- and odd-indexed page halves. In each half, for each rune `r`, define `E_r = Σ_pages (#line starts on page × #r runes on page / #all runes on page)`, the observed number `O_r` of line starts bearing `r`, and the standardized residual `z_r = (O_r - E_r)/√E_r`. The **29-dimensional dot product** `D = Σ_r z_even,r z_odd,r` measures agreement in the *direction* of the line-start signature across separate physical pages, with no training of a decryption or language model. These two groups contain **298** and **296** line starts. Their chi-squares are **47.768011** and **64.116194**, and the observed dot is **22.749567** (cosine **0.411075**). Every page exactly matches its original source rune sequence; the script asserts all **2,896** complete words and **12,956** runes.

In **50,000** deterministic source-page-rotation null draws, no surrogate cross-half dot reaches the observed 22.749567 (**add-one p = 1/50,001 = 0.000020**; null maximum 21.828094). Each null preserves the page's original **entire rune order, exact rune multiset, existing glyph repeat behavior and physical line-start positions**, while disrupting their joint alignment. The identically defined negative control at printed line **ends** has cross-half dot **0.350415**, p **0.46991**.

This replication can be localized further by the physical line boundary. Of the **539 within-page line breaks**, **388** are print wraps **inside a cipher word**, and **151** start a new rune word after printed punctuation, according to the original line transcription. Their alternating-page directional dots are **7.875484** (circular-rotation p **0.062599**) and **18.037006** (p **0.000780**) respectively. The **2,896 entire-corpus rune-word initial positions** exhibit only **1.042544** directional dot (rotation p **0.393872**), so the replicated signature is not a generic rune-word initial bias. This partition was selected for follow-up *after* seeing the first-rune result and its p-values should be interpreted as conditional diagnostics rather than an independent discovery probability.

A more restrictive matched test conditions on **the original rune labels of every word beginning on each page**. For every one of 50,000 trials it independently samples, **without replacement**, the same number of word starts as the **151 observed line-wrap new-word sites**, separately within each page. This conserves the original word-start glyph profile, the page layout and line-start sample counts, changing only which word starts occur at line boundaries. The observed cross-half standardized dot is **16.466415** under this more stringent comparison, with **48/50,000** null exceedances (**add-one p = 49/50,001 = 0.000980**). Thus the bias specifically concerns which *already-existing* word starts coincide with typographical line beginnings, rather than simply privileging GP symbols at the beginnings of all ciphertext words.

**Mechanism boundary:** the statistics identify a reproducible, cross-page **visual line-selection effect**. They do not prove Cicada's cipher uses a line-start channel. Variable glyph advances, page typesetting/line-breaking choices, plaintext-aware word wraps, page-specific controls, and other visual layout effects remain live explanations. The previously tested same-printed-coordinate shared key on p28/p42 fails, as documented in [the relative-key report](page28-page42-relative-key-anomaly.md); this line-start effect does not revive it. A visual-width pilot [raster/line regression](../sims/physical_line_start_width_probe.py) could fit an apparent width-versus-start excess (correlation **0.752**) but its **held-out-page RMSE 28.98 pixels was worse than the 22.99-pixel simple baseline**; a naïve repeated-glyph pixel template was contaminated by the following glyph. Consequently *no glyph-width cause has been demonstrated*. Any future interpretation needs a genuinely heldout glyph-geometry or line-packing positive control, followed by a reversible original-ciphertext prediction.

**Independent reproduction:** `node sims/physical_line_initial_crosspage_heldout.cjs` uses the exact original `resources/transcriptions/liber_primus_master.txt` and `resources/liber-primus/lp2-corpus.json`, independently splits whole pages, preserves page-local word initial positions across line and page wraps, runs two separately seeded 50,000-trial nulls, and emits per-channel statistics. [Successful source-original CI run 42777883379](https://github.com/FlareZ123/liber-primus/actions/runs/42777883379), Node 22, manually dispatched; earlier no-word-matching control [run 42777704743](https://github.com/FlareZ123/liber-primus/actions/runs/42777704743). All results are conditional original-ciphertext structural evidence. **No unknown LP2 rune plaintext or key is recovered.**
