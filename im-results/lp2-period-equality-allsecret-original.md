# Whole-book, section-clock, and cross-page secret-bijection equality gates

**Agents 15 and 43, 12 November 2026.** Key-independent original-input restrictions on repeating-phase substitutions and cross-page reused keys. **No authentic LP2 plaintext or key is recovered.** The result makes source-less short repeating-key hunts lower priority in favor of a source-specified stateful/nonperiodic operation or a changed plaintext register.

## The reversible family and unavoidable equality invariant

Take original unsolved LP2 p0–55 as a continuous GP29 sequence of **12,956 runes**, or preserve one of two visible reset contracts (nine original manuscript sections; 56 physical pages, one without rune content). For an arbitrary unknown period `T`, assume an exact same-length plaintext of native GP29 symbols and let every phase `r = i mod T` have its **own completely arbitrary secret 29-symbol bijection** `sigma_r`. It may be any keyed substitution, not necessarily additive, and can reset at a section or physical page.

When two positions lie in the same reset segment at distance exactly `T`, they use the **identical secret bijection**. Therefore the original ciphertext must preserve their equality regardless of `T × 29!` potential secret tables:

`C[i] == C[i-T]  iff  P[i] == P[i-T]`.

This yields an original-input test before finding keys, cracking word boundaries, or choosing a score-optimizing alphabet. An unknown fixed outer rune permutation does not change the equality invariant. The proof does **not** cover within-period key drift, position-dependent rejection or insertion, nonbijective mappings, a secret state that changes between phase visits, or an intermediate binary/non-native register.

## Original source, native comparison, outcome

The [single-file Node22 SFT](../sims/lp2_period_equality_allsecret_original_sft.cjs) uses the exact original `resources/liber-primus/lp2-corpus.json`, fixed nine-section global rune cuts `[0,729,1874,3603,5506,6527,7960,9640,12648,12956]`, and all 56 physical page lengths including runeless p50. The controls tokenize *actual* source text into the standard GP29 alphabet with historical digraphs, from [Shakespeare](../resources/control/shakespeare_first300k.txt) and [Gibran](../resources/control/gibran_prophet_58585.txt). For each source, five fixed **12,956-rune** intervals are compared at every equal phase-period against the original. The starts are Shakespeare `[20000,56000,92000,128000,164000]` and Gibran `[1000,11000,21000,31000,41000]`. Controls are genuine source-native text, without fitted or arbitrary scrambled plaintext.

| Original clock | Every tested period T | Original-vs-native same-lag comparisons | Cases with source rate ≤ original | Smallest source-minus-original proportion |
|---|---:|---:|---:|---:|
| Book-continuous | 1–6,000 | **60,000** | **0** | **+0.00123514** (T=2) |
| Nine source sections, phase resets | 1–1,000 | **10,000** | **0** | **+0.00131396** (T=2) |
| Original physical pages, phase resets | 1–250 | **2,500** | **0** | **+0.00116768** (T=2) |
| **Combined** | | **72,500** | **0** | |

The largest original whole-book same-lag equality is **298/7,106 = 0.0419364**, at lag **5,850**, while the smallest originally recorded native-control margin at the *same matched lag* remains positive. The minimum difference is small at lag2, so **these are finite control comparisons rather than a deterministic impossibility for every conceivable authored English passage**. The distinction matters: source-control runs give an empirical register condition, and neither a source-text prior nor a prefix-length bound is part of the mathematical equality theorem.

The planted control assigns independent pseudo-random 29! bijections at **every phase**, separately for book period464, section period128 and page period37. In all three, the implementation encrypts native source text, recovers **12,956/12,956 exact plaintext runes** using the inverse tables, and preserves the full-period equality count exactly. This proves the measurement has power against a genuine phase-periodic substitution without assuming the key or its form.

## Distinct cross-page shared-phase test: no periodicity required

A different page-key-reuse model, motivated by the **55 physical rune-bearing page starts**, had not been covered by the lag-\(T\) comparisons above. Suppose the creator restarts a key-clock at every physical page and at rune offset \(t\) uses **one arbitrary secret GP29 permutation \(\sigma_t\) shared across all pages**. Every offset gets a wholly unrelated secret alphabet; \(\sigma_t\) need never repeat within a page. Equivalently, an unknown pad can be arbitrary-length provided it restarts from the **same beginning on every page**, and the output mapping is a bijection. This is an all-secret key-reuse hypothesis, not an author-authenticated operation.

Because \(\sigma_t\) is one-to-one, the exact **cross-page coincidence invariant** is
\[
\sum_t\sum_{r=0}^{28}\binom{\#\{p:C_{p,t}=r\}}{2}
=
\sum_t\sum_{r=0}^{28}\binom{\#\{p:P_{p,t}=r\}}{2}.
\]
Include page \(p\) at offset \(t\) only if the physical page contains that many runes; the completely runeless p50 is omitted. A second independently motivated model grants a *different* \(\sigma_{chapter,t}\) for each of the nine original red-heading chapters; only pairs of physical pages in the same chapter are counted. Both hypotheses preserve original page boundaries without inferring key phases from ciphertext.

| Same-secret scope | Original equal pairs / eligible pairs | Original rate | Exact null from independently shuffling each physical page's own rune inventory |
| --- | ---: | ---: | ---: |
| Across **all 55 pages** at the same rune offset | **10,751 / 311,132** | **0.034554466** | 0.034487191 |
| Same rune offset **within each of nine visual chapters** | **1,392 / 38,178** | **0.036460789** | 0.034516566 |

These are complete **12,956-rune** original-source statistics. In each null, page lengths, original symbol inventories and chapter membership are fixed; only the within-page order is uniform. The chapter-only observed rate exceeds this particular null modestly, but remains far below tested native GP29 prose and cannot itself select a decoder.

For a stronger positive-language reference, concatenate *unaltered* original text from each of three pinned English controls, normalize with the repository's GP29 rune rules (including TH, NG/ING, EO, OE, AE, IA and EA), and cut exactly at the **55 original physical rune lengths**. A seeded sampler selects 300 complete 12,956-GP-rune intervals per source, 900 in total. Each interval inherits the same source page and chapter mapping, with no change to its actual GP symbols.

| GP29 original prose source (300 samples each) | All-page rate: minimum / median | Within-chapter rate: minimum / median | Controls at or below original |
| --- | ---: | ---: | ---: |
| Shakespeare | 0.056689765 / 0.060013113 | 0.056315155 / 0.060532244 | **0 / 300** for both |
| Gibran | 0.058865690 / 0.060405230 | 0.056812824 / 0.060872754 | **0 / 300** for both |
| Emerson | 0.060768420 / 0.062504018 | 0.057991513 / 0.062706271 | **0 / 300** for both |
| **All 900** | Native minimum **0.056689765** | Native minimum **0.056315155** | **0 / 900** for both |

The full input GP lengths are Shakespeare **217,644**, Gibran **62,696**, and Emerson **323,083**. A genuinely reversible planted cipher samples an actual 12,956-rune native Shakespeare control, applies **independent hidden random 29! alphabet permutations at every page-local offset**, then recovers all **12,956 original plaintext values** with the corresponding inverse alphabets. Both equality statistics are unchanged by the encryption. This directly proves that the test can recognize the specified arbitrarily keyed source-language model; perfect round-tripping alone is only an implementation check.

**Decision.** No tested native English window resembles the source equality rate under a fully shared page-reset positional bijection, even if every position has an independently unknown alphabet. Reusing the page-aligned pad across *all* pages or across the *originally marked chapter* pages is therefore unsupported in this exact register. This is distinct from the earlier page-**internal** periodic equality gates; those compare lags within each physical page and do not test key reuse *between* separate pages. Key schedules that evolve on each page, changed/transposed plaintext, page-dependent secret offsets, nonbijective output, or other languages remain outside this gate. No recovered unknown LP2 plaintext or historical selector.

[Independent CommonJS original-input SFT](../sims/lp2_crosspage_shared_phase_allsecret_sft.cjs) computes the two exact source counts, the analytic independent-page permutation expectation, all **900** source-native controls with deterministic seed 0x7c198501, and the original-layout **12,956/12,956** secret-substitution positive plant.

## Cryptanalytic decision

For **ordinary source-native GP29 prose** with unchanged segmentation, none of the original whole-book periods 1–6,000, section-reset periods 1–1,000, or physical-page-reset periods 1–250 is supported by the native controls. A distinct cross-page page-reset model allowing any secret permutation at each local offset, with either book-global or original-chapter sharing, also fails against all 900 newly tested native GP control windows. A single period with an arbitrary secret substitution at *every phase* cannot conceal its equality frequency, so introducing more phase-key candidates or affine multipliers does not rescue this exact stationary-phase class. The near-complete lack of original rune equality relative to native prose persists even when every position in the repeating period has its own unrelated 29! table.

Research should seek a **source-identified nonperiodic/evolving state**, an insertion/deletion/rejection transport, an external long pad, or independently motivated non-native plaintext framing. Genuine recovered original plaintext would supersede these empirical source controls; none is currently recovered.
