# Original LP2 Fibonacci-indexed page differential-spectrum anomaly

**Agent 4, 13 November 2026. Evidence class: two source-shaped, original-input Fibonacci page-step anomalies with bounded direct cipher negatives.** The source-visible p15 Fibonacci spiral and original 2014 physical page numbering motivate the Fibonacci page set. Its actual GP29 ciphertext has elevated nonzero step-spectrum dispersion, alongside a separate, sharper **lag-eight suppression of equal nonzero increments**. The exact chapter-conditional lag-eight tail survives max-statistic adjustment across 64 possible lags. These are **exploratory, post-discovery associations**: no authorial instruction or decipherment has been authenticated, and no original unknown-page plaintext, key or destination has been recovered. Standalone reproducers are [the Fibonacci step spectrum](../sims/lp2_fibonacci_page_delta_spectrum_sft.cjs) and [the lag-eight exact familywise gate](../sims/lp2_fibonacci_page_step_lag8_sft.cjs).

## The original clue and the proposed diagnostic

The original 2014 LP2 service distributed images numbered `0.jpg` through `57.jpg`. Original physical **p15** visibly contains a 4×4 Fibonacci/prime spiral. Under the original 2014 page labels, the Fibonacci indices through p55 are **0, 1, 2, 3, 5, 8, 13, 21, 34, 55**. These select ten of the 55 rune-bearing unknown pages p0–55; p50 is a runeless numeric table.

For each page, convert its original source runes to the canonical Gematria Primus ordinal 0–28 without editing glyphs, headers or punctuation alignment. For its adjacent source-runic positions `i-1,i` compute the difference `D_i=(C_i−C_(i−1)) mod 29`. Remove only `D_i=0` when measuring the conditional **28-bin nonzero step distribution**. Define `chi28` as the Pearson sum against equal frequencies in bins 1–28 **within that page**, allowing every original page to have its own length and doublet count. This diagnostic was selected during investigation of the first-difference channel, so its reported null probabilities must not be treated as discovery-corrected significance.

The corpus contains **12,956 unknown runes**, **12,901 within-page successor positions**, and **86 zero steps**. These source counts agree with existing independent anti-doublet studies. The present analysis introduces a *specific, previously untested Fibonacci page-number relation to the entire nonzero-step spectral dispersion*.

## Full original-page results

| Source physical page, Fibonacci-indexed | Nonzero-step χ², 28 bins |
| :-- | --: |
| p0 | 34.729730 |
| p1 | 20.030303 |
| p2 | 24.577889 |
| p3 | 35.056338 |
| p5 | 31.893130 |
| **p8** | **50.529880** |
| **p13** | **47.745387** |
| **p21** | **46.505535** |
| p34 | 27.249027 |
| p55 | 34.972973 |

The **three highest χ28 values anywhere in the 55-page original manuscript belong to p8, p13 and p21**, three consecutive Fibonacci numbers. The mean per-page χ28 over the ten Fibonacci pages is **35.32901932**, versus **26.32724954** on the 45 remaining rune-bearing pages. The predeclared *for this comparison* contrast is **+9.00176978**.

The phenomenon concerns **ciphertext increments**. The corresponding ten-versus-45-page difference for the **raw 29-rune unigram χ²** is just **+2.81092808**. For additional characterization, the correlation between each page's *first* and *second* within-page nonzero-step histograms is **0.562665** on p8, **0.503354** on p13, and **0.305273** on p21; the mean Fibonacci-minus-other correlation is **+0.15856936**. That half-page statistic depends on the same underlying histograms and is **not independent corroboration** of the full-page dispersion.

## Conditional comparison: exact source chapter allocation

To avoid mistaking a chapter-specific style shift for a Fibonacci effect, hold the visible chapter grouping fixed and exactly enumerate alternative page assignments preserving *how many Fibonacci pages fall within each represented chapter*. Fix p0/p1/p2, then choose:

- two of original p3–7 (ten choices);
- two of p8–14 (21 choices);
- one of p15–22 (eight choices);
- one of p33–39 (seven choices);
- one of p54–55 (two choices).

The product gives exactly **23,520** alternative allocations, each retaining the same ten selected-page count, source-chapter quotas, page lengths and actual ciphertext. The actual Fibonacci allocation sums to **353.2901932** χ² units across ten pages, while the conditional distribution has mean **293.57558598**. Exactly **21 of 23,520** allocations equal or exceed the original: **0.0008928571** one-sided under this finite chapter-conditional test. The actual full-page assignment gives the largest Fibonacci contrast among the 55 circular shifts of the ten-page mask (55 shifts is a descriptive alternative-label control, not an independent probability).

A separate **250,000-trial, fixed-seed, uniform ten-of-55 label randomization** yields **94** selections with equal or larger χ28 contrast, add-one fraction **0.0003799985**. By contrast **28,804/250,000** selections equal or exceed the original raw-rune χ² contrast (add-one fraction **0.11522**); **1,551/250,000** equal or exceed the half-histogram correlation contrast (**0.006208**).

**Inference limitation:** these p-values condition on a particular GP29 step-spectrum statistic and a particular original source-compatible Fibonacci index interpretation, chosen after exploring various LP2 structures. They do **not** correct for the large number of other structures and cipher families previously examined by the research population. A narrow conditional tail can still arise by selection across an extensive research program. No pre-existing Cicada instruction currently states that Fibonacci-indexed physical pages carry a different differential encoding. The visible p15 spiral is the independent motivation; the spectral statistic and consumer are research hypotheses.

## Stronger eight-position source-clock clue: original nonzero-step equalities

The original p49–51 printed table has exactly **eight columns**, an independent reason to examine an eight-position recurrence. For every *unedited original physical page*, form the same GP29 predecessor differences `D_i`. A collision at lag eight means **`D_i=D_(i−8) ≠ 0`**; count only pairs where both differences are nonzero. This equality property is invariant under every stationary secret bijection of the 28 nonzero step labels. It therefore constrains keyless, repeating nonzero-step mechanisms without assuming how symbols are named.

| Physical pages | Equal nonzero step pairs at lag 8 | Eligible pairs | Empirical rate |
| :-- | --: | --: | --: |
| Ten Fibonacci-indexed pages p0,1,2,3,5,8,13,21,34,55 | **45** | **2,226** | **2.02156%** |
| Other 45 rune-bearing pages | **372** | **10,068** | **3.69487%** |

The original ten-page **unweighted mean of pagewise rates is 0.02013216**, versus **0.03530074** on the other 45 pages. Source F pages p8, p13, p21 have respectively **2/240, 5/263, 3/262** such collisions. Earlier-neighbor **lag seven** and next-neighbor **lag nine** do not share this directional deficit: against the fixed original chapter-conditional alternative assignments, their deficit z values are **−1.24082** and **−1.08917**. The eight-position register is unusually selective.

Apply the **same exact 23,520 chapter-stratified Fibonacci label alternatives** described above. Only **5 of 23,520** have an equal or lower sum of pagewise lag-eight collision rates, giving the finite one-sided **0.0002125850** tail conditional on that lag and the selected page mask. To account directly for choosing a lag after looking at the ciphertext, calculate the rate for **every lag 1 through 64** on each original page. Standardize every chapter-conditional ten-page rate sum using its exact alternative-allocation mean and SD; use the **largest deficit across all 64 lags** as the familywise statistic for every alternative. The original winner is **lag eight, z=3.10889196**, and **249 of 23,520** alternatives produce a 64-lag maximum at least as extreme: **familywise one-sided 0.01058673**. This is a material reduction from the unadjusted significance and is the proper bounded claim for this 64-lag family.

This result is **distinct from and related to** the broader nonzero-step spectrum: a single chosen histogram dispersion does not mathematically force an eight-separated equality deficit. Nevertheless, both were discovered while exploring the same source and are correlated through its finite symbol stream; neither supplies independent proof of an intended cipher. A random-looking pad conditioned to avoid repeated eight-separated increments could produce such data, but it would still need a reversible transmission rule and source-authenticated state material. A trivial rejection/rewrite can be many-to-one. No key or plaintext follows from the deficit itself.

The exact independently reproducible output, 64-lag familywise enumeration, 55 original page lengths, counts and per-page data are preserved in [`sims/lp2_fibonacci_page_step_lag8_sft.cjs`](../sims/lp2_fibonacci_page_step_lag8_sft.cjs). This test arose after surveying a small number of lag candidates and does **not** correct across the project's wider library of hypotheses, page masks and cipher architectures.

## Two bounded, source-shaped reversible inverses attempted

The original 256-cell numerical table spans physical pp49–51 in **32 rows and eight columns**, with a conventional conditional base60 interpretation yielding 256 bytes. The **eight Fibonacci pages ≥2** are exactly p2,p3,p5,p8,p13,p21,p34,p55, in natural page order, suggesting one table column per selected page. The manuscript's independent red-number/field material yields **15**, a multiplicative generator of order **28** in GF29, supplying a canonical inverse for nonzero GP29 ciphertext differences.

One fixed consumer was tested, without fitting a column order, key phase, page offset or seed: for Fibonacci page `F_j`, map the 32 byte values of *table column j* to a period-32 key `K_i=byte[i mod32] mod28`; at original page successor positions decode **`P_i=(log_15 D_i−K_i) mod28`** for `D_i≠0`, and **`P_i=28` (GP EA)** when `D_i=0`. The first cipher rune of each page is left outside this particular decoder because it lacks a within-page predecessor. The inverse is mathematically exact: `D_i=15^((P_i+K_i) mod28) mod29` for non-EA, or zero for EA.

| Cipher page → numeric table column | Original delta GP29 IoC | Decoded GP29 IoC |
| :-- | --: | --: |
| p2 → column 0 | 0.034925 | 0.037940 |
| p3 → column 1 | 0.036176 | 0.034927 |
| p5 → column 2 | 0.036384 | 0.035155 |
| p8 → column 3 | 0.038250 | 0.036227 |
| p13 → column 4 | 0.038458 | 0.034905 |
| p21 → column 5 | 0.038013 | 0.035924 |
| p34 → column 6 | 0.035016 | 0.034452 |
| p55 → column 7 | 0.038559 | 0.033874 |

None yields a sustained readable GP-native sentence; decoded symbol distributions remain near uniform. Reapplying the specified forward transform reconstructs **every original first difference on all eight pages** exactly. The identical encoder/decoder restores an entire authentic **95-rune solved p57** planted control. These checks prove implementation reversibility and ability to recover readable GP text when genuine plaintext is encoded with the *hypothesized* rule; they do not validate the rule as Cicada's. The global source-language marker model `D_i=0 ⇔ P_i=EA` independently conflicts with the original word-position split under native English/Latin comparisons ([prior marker gate](field-unit-zero-marker-positions.md)). This is a further objection to the candidate, rather than a reason to tune its key.

### Alternative: full printed eight-column row-major tape

Lag eight is naturally the stride of **successive rows** of the printed 32×8 numeral grid. This suggests a distinct fixed key clock, consuming its **entire row-major 256-byte sequence** rather than just one column per selected page. For each of all ten Fibonacci-indexed original pages, reset at the page's first successor rune and set `K_i=table[i mod256] mod28`; decode `D_i=0` as EA and `D_i≠0` as `(log_15(D_i)−K_i) mod28`. This consumer has **one source-fixed layout and phase, no fitted key**.

It does **whiten the lag-eight collision deficit**: across the ten pages the original **45** lag-eight equal nonzero steps become **83**, using the exact same **2,226 eligible pairs**. The ordinary 28-way i.i.d. coincidence benchmark for those pairs would be about 79.5. It also lowers raw nonzero-step symbol IoC on the three most anomalous pages: p8 **0.0382497 → 0.0346706**, p13 **0.0384584 → 0.0367364**, and p21 **0.0380128 → 0.0347840**. The recovered GP rune strings **do not form readable prose**; the new decoded registers remain near uniform. The restored generic collision rate cannot validate the key because an independent, arbitrary position-dependent additive pad can similarly disperse repeating symbols. This is a **specific failed original-inversion model**, not evidence that table bytes were historically used.

For each original page, exact reapplication of the declared forward step transform recovers the unaltered ciphertext predecessor differences. An authentic solved p57 95-rune source-native planted control also roundtrips exactly. Both checks and the **45→83** counts are asserted in [the full original-source Fibonacci inverse SFT](../sims/lp2_fibonacci_page_delta_spectrum_sft.cjs). The source base60 table interpretation remains conditional.

## Next source-specific decision

The leading remaining question is whether a **creator-visible clue before p15 or on Fibonacci-indexed pages** explicitly selects differential/first-order reading and an **eight-position memory or exclusion operation** that is reversible. A source-selected eight-lag state transition, together with a way to recover overwritten information, would explain the unexpectedly low exact eight-lag step-collision rate and permit a real inverse. Any proposed operation must predict **held-out original rune intervals** and produce original plaintext, rather than merely reproduce a lag statistic. That would transform a statistical selection into a human-followable cryptanalytic route. A different explanation is deliberately variable page-level alphabet or step distribution with no Fibonacci selector, or a chance association amplified by the project's large hypothesis space. The current table-column and root-log direct consumer can be retired. Do not respond by searching arbitrary cyclic page masks, new byte-to-28 reductions, column permutations, Fibonacci variants or fitted cipher phases.

**Executed CI positive:** [full updated Agent4 source-gates run 43383835102](https://github.com/FlareZ123/liber-primus/actions/runs/43383835102) validates both Fibonacci SFTs and the later row-major complete-table candidate. The earlier [Agent4 original-source-gates manual run 43381653624](https://github.com/FlareZ123/liber-primus/actions/runs/43381653624) completed successfully on Node.js 22; its standalone Fibonacci-spectrum gate and four earlier Agent4 original-source gates all passed. This pins the executable result to a remotely verified commit rather than an unexecuted algorithm description.

**Reproduce:** run the dependency-free Node.js 20+ CommonJS SFT at [`sims/lp2_fibonacci_page_delta_spectrum_sft.cjs`](../sims/lp2_fibonacci_page_delta_spectrum_sft.cjs). It loads only the canonical corpus and canonical base60 table; asserts exact source lengths, 86 doublets, table SHA-256, the three top pages, the complete exact chapter-null upper count, seeded label controls, every full-original-step reencryption, and an authentic p57 GP29 plant. It emits all page rankings and frozen decoder prefixes. The table's base60 interpretation remains conditional, as documented in the canonical resources.