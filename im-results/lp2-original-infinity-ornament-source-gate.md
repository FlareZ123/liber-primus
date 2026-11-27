# Original LP2 infinity ornament p0–2 and p15: repeated stencil, enlarged same-handed symbol

**Direct original-image result, Agent 28, 12 November 2026, Director Issue #437.** This identifies the visible shape and its repetition more precisely. It does not recover unknown LP2 plaintext, a key, a Möbius traversal or a source-selected decipherment operation.

## Human-visible clue and the stronger competing explanation

Original LP2 pp0–2 (archive JPEG17–19) display a thin figure-eight/infinity ornament both above and below the rune text. Physical p15 (archive JPEG32) has one substantially enlarged black version located directly between the **16-number Fibonacci-indexed-prime table** and its red/black rune passage. The page-15 symbol has the **same unreflected figure-eight outline**. A viewer might call it a Möbius/infinity mark, but it is drawn as a **single flat crossed stroke**, with no two separate band edges or indicated one-sided surface. The smallest directly identifiable conventional referent is the familiar mathematical infinity sign, `∞`; no underlying Mobius-strip geometry is visually forced.

The ordinary infinity notation has an independently dated historical source, John Wallis's *De sectionibus conicis* (1655), as catalogued in [MacTutor's notation history](https://mathshistory.st-andrews.ac.uk/Miller/mathsym/calculus/). Bernoulli's 1694 lemniscate curve is another mathematical figure-eight precedent ([MacTutor curve history](https://mathshistory.st-andrews.ac.uk/Curves/Lemniscate/)). These two pre-2014 sources establish that a human could reasonably name the **symbol class**, not that the particular LP2 penstroke was copied from Wallis or Bernoulli. The participant [Uncovering Cicada image inventory](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) also labels the LP2 page 1–3 and 16 marks as infinity signs, but the wiki is a later source annotation, not an original Cicada command.

## Complete original scan geometry and replication

Original images all use **2400×3600** pixels. Each box below is original-pixel `(x,y,width,height)`; the crops are compared on grayscale from unchanged image bytes, threshold at 110. The original p0 image includes red rune ink and may have different JPEG grayscale tones.

| Physical page / JPEG | Top ornament crop | Bottom ornament crop |
| --- | --- | --- |
| p0 / 17.jpg | `(1132,620,114,38)` | `(1132,2943,115,41)` |
| p1 / 18.jpg | `(1132,618,115,41)` | `(1132,2943,115,41)` |
| p2 / 19.jpg | `(1132,618,115,41)` | `(1132,2943,115,41)` |
| p15 / 32.jpg | `(875,1510,551,187)` after table | none |

The **top motifs on p1 and p2 are grayscale-pixel identical**. The **three bottom motifs on p0, p1 and p2 are grayscale-pixel identical**. Their distinct original-grayscale SHA-256 fingerprints are:

- p1/p2 top 115×41: `2e967b35cfcceb19a4bcb8db9e203c509ae32906a14c2f6dc2caae3188139679`.
- all three bottom 115×41: `979b7c8d06fe14ea8cde689931cf70ba5fb472035fc89de61b6d733be156c5bb`.
- p15 enlarged 551×187: `7850ec78ec24b57fa187709a0ed21cdd67ac87ccaff5f6ac533a7f4af662fab7`.

The small p1 top versus bottom ink binary masks have **intersection/union = 0.9837310**; the source's top/bottom minute differences do not yield distinct visibly countable branch or loop states.

A source-wide center-ROI connected-component census of **all 58 original LP2 JPEGs** finds exactly **six** small forms with the same broad 110–130 by 34–50-pixel aspect, 650–1200 dark pixels and >0.4 resized-mask overlap: both marks on p0, p1 and p2. The detector is deliberately aspect/position constrained and does **not** assert that no unseen larger or redesigned infinity-like flourish exists elsewhere. The p15 large crop is handled independently.

**Large mark comparison:** transform the source p15 551×187 black mask to p1's 115×41 reference, allowing only scale width109–122, height37–45 and translations ±7 x / ±6 y, all fixed independent of plaintext. Under that limited registration, the best same-handed original comparison is **IoU 0.764432** (115×39, offset0,+1). Re-running the *same permitted registrations* on p15's reflected masks gives only **0.200000** (horizontal), **0.137160** (vertical) and **0.174323** (both), respectively. Thus the enlarged p15 drawing shares handed outline with the p0–2 infinity emblem. The marks are **not byte-identical** at different sizes, and this does not attribute either to a particular historical printing plate. The wrong-handed controls reject the interpretation that source art intentionally alternates mirrored side choices.

## Implication for decipherment

The repeat locations follow a recognizable **typesetting role**: paired delimiters framing original p0–2 rune blocks, and a single section separator under p15's numeric diagram before a new runic paragraph. The original source supplies **no arrow, start/end, cell order, direction, crossing priority, topological surface rule, key or plaintext target** connecting the infinity shape to the p15 Fibonacci-prime spiral's sixteen numbers. Using a Möbius strip would require a source-selected twist/side/seam coordinate and stopping convention that are absent.

A full-pixel repeated ornament is especially weak as an independent page-varying ciphertext key. Previous #172 explorations of p0–2 seams/27×27 paths and algebraic Möbius transforms remain separate bounded negatives; do not rerun them because the artwork is a scaled figure eight.

**Decision for #437:** a generic historic `∞` symbol is attributable at the *class* level, and the original LP2 page positions/pixel repetitions establish likely section punctuation. No exact pre-May-2014 manuscript stencil attribution, cipher consumer or held-out GP prediction emerged. Retire the figure as a standalone **Möbius-strip traversal instruction**. Reopen only on a dated identical source image plus an explicit source-selected reversible operation on an untouched manuscript interval.

**Reproduce:** [single runnable original-image SFT](../sims/lp2_infinity_motif_source_sft.py) on OpenCV, NumPy and Pillow. It scans all 58 source images, asserts the original exact-crop matches, re-optimizes identical and wrong-handed masks under one fixed scale window, emits source grayscale hashes, and reports every matching location. Original LP2 JPEGs are stored under `resources/liber-primus/`; the SFT also accepts the maintainer's original archive ZIP as its sole optional argument.

## Agent 8: six-frame shared-pad prediction of enlarged p15 ornament (27 November 2026)

**Decision: reject the specific distance-from-ornament shared additive GP29 pad with ordinary native-language emissions.** This is a conditional empirical negative independent of printed word boundaries, not a rejection of other infinity-symbol interpretations.

The visual observation above fixes a new cross-section registration: for each of p0, p1 and p2 take the first 100 runes forward and last 100 runes reversed, i.e. read away from each of the six small ornaments into its framed text. The maximum nonoverlapping symmetric length is 100 because p2 has 201 runes. Hold out p15 runes [9,109), forward from below the enlarged ornament (nine preceding rubric runes omitted). No sliding, phase search, plaintext donor, word boundaries, or arbitrary per-frame shifts. Hypothesize a common independent uniform 29-valued pad at each rune distance, C[r,i]=P[r,i]+K[i] mod 29. Decoration remains the competing explanation; the source does not prescribe the cipher.

### Exact decoder and predictive statistic

Learn separate forward/reversed native-style rune Markov models from the three repository Book of Law files, and for the strengthened trigram model additionally the Blake Marriage and Kybalion texts. Roman-letter mapping greedily uses GP transliteration tokens and explicit V→U, K/Q→C, Z→S, ING→NG aliases. Model smoothing is specified in code. For each key digit (bigram) or pair of key digits (trigram), the six plaintext symbols are determined by the ciphertext. Forward summation marginalizes **all** 29^100 possible pads by dynamic programming; Viterbi produces the MAP pad from the six small frames only. If Z_R is the sum over pad choices of the product of R row-language probabilities, then log BF_R = log Z_R +(R−1)100 log 29 against independent uniform pads. Held-row log BF is log Z_7−log Z_6+100 log 29, the conditional predictive likelihood ratio; the seventh row does not fit the frozen MAP key. These are exact for the specified Markov models, not universal language probabilities.

Each planted trial draws seven distinct nonoverlapping 100-rune windows from the nine authentic solved sections, with the specified directions; sampling across trials reuses the finite reference corpus, so trials are not independent samples of all possible prose. Shared-pad positives, wrong seventh-pad controls and fully independent pads use the same underlying sampled plaintext windows. The reference sections are excluded from language model training. Calibration is required before the original is scored.

| Variant | Calibration | Decision |
|---|---|---|
| Bigram, 24 trials | Held BF +35.39 to +73.27 shared; −92.77 to −61.92 wrong seventh; recovered 80–94/100 digits. | Failed minimum 22/24 trials at ≥90 correct digits; original deliberately not scored. |
| Trigram, 12 fresh seeded trials | 12/12 ≥97/100 digits; 1192/1200 total; shared held BF +77.39 to +120.14; wrong seventh −369.42 to −246.79. | Passed the equivalent ≥11/12 trials at ≥90 correct digits and complete score separation. |
| Trigram original | Fit log BF −360.80; held p15 log BF −126.05. | Both inside independent-pad calibration ranges (fit −390.02 to −312.23; held −186.16 to −113.39), far below shared ranges (fit +207.61 to +301.17). |

The held-row predictive test marginalizes over uncertainty in the six-frame key, rather than merely scoring a convenient candidate plaintext. The original MAP pad and resulting p15 candidate are in the raw JSON for reproducibility, not asserted keys or plaintext. No authentic new rune was decoded. No further offsets or model tweaks are warranted under this registration. This test does not exclude an unrelated cipher, different clocks, F-transparent consumption, or nonlinguistic plaintext.

Reproduce from repository root with `node sims/lp2_infinity_six_frame_pad_holdout_sft.cjs` and `node sims/lp2_infinity_six_frame_trigram_holdout_sft.cjs`. Both algorithm cores executed in the connector JavaScript runtime; the committed standalone Node wrappers were not separately executed. [Bigram calibration](lp2-infinity-six-frame-pad-holdout.json), [trigram calibration and original](lp2-infinity-six-frame-trigram-holdout.json). Commits c893847f9fd4033a0c33b8c8078da417b59eddbf, 5ddba27f6b1562ee38a266e2373cfebc75796302, 7fce3d71fed4206a31b006effacd22d4e2e15cc4, 6d80a5f8de69ea4f363a13a521d8910a3aab00c4.

### Historically authentic plaintext-F bypass: independent-clock prediction

The ordinary-clock negative does not cover the native LP1 plaintext-F bypass. On the same fixed seven-frame registration, let plaintext F emit literal ciphertext F (index0) without consuming the shared pad; all non-F emissions consume one GP29 shift. Each of the seven rows has its own consumption cursor. The six training frames retain 100 physical runes each. Hold out the first 90 physical runes after the enlarged p15 ornament, p15[9,99), to avoid depending on unconstrained tail key digits. No offsets, direction changes or word boundaries are fitted.

A fixed-width state-merging beam searches the six-row joint inverse, with state consisting of six physical positions and each row's two preceding plaintext symbols, and branches at every possible F hold. The beam's partial length-normalization term +2.4 per emitted rune cancels at completion. The ordinary single-MAP-pad pilot (width128, four trials) recovered 89–90 of 90 planted key digits but one held row had no legal decode because of a single key error. This motivates marginalizing key uncertainty, rather than modifying the original cipher model.

The final receiver freezes the six masks inferred by the beam, factors the exact six-row likelihood over consecutive triples of key symbols, then computes the predictive likelihood of the seventh ciphertext by a second sum-product DP over the last two key symbols, seventh physical cursor, and preceding-hold flag. The latter enumerates all seventh-row F masks and all possible shared pads **conditional on the six inferred masks**. The conditional key marginal is exact up to floating-point arithmetic; the fitted masks are approximate, not an exhaustive six-row mask marginal. Viterbi backtrace returns the held-row candidate under the same frozen predictive model. An independent-pad null also integrates every legal hold/emission, so the null is not uniform raw ciphertext. Known-key posterior likelihood and traceback were independently cross-checked against the earlier fixed-key exact DP. The inferred-mask factorization replays the six-row beam score.

The 4-trial posterior pilot corrected the failed seventh-row decode and recovered every fitted hold mask. Fresh calibration: width256, seed 0x4a239e07, 12 planted trials, 90 withheld runes each. The full tool invocation timed out; a deterministic batch switch preserved exactly the same trial sequence, and the six batch files were committed and the aggregate gate frozen before scoring original p15. The native reference windows are disjoint within each trial, but can be reused across trials.

| Quantity | Frozen controls / original |
|---|---|
| MAP first 90 key digits, six rows only | 1069/1080 correct |
| F-mask classification, six training rows | 7198/7200 correct |
| Seventh plaintext recovery | 1077/1080 correct; 12/12 trials met ≥81/90 for both key and plaintext |
| Shared seventh predictive log BF | +64.10 to +96.46 |
| Wrong seventh pad | −326.33 to −216.90 |
| All independent pads: seventh predictive log BF | −196.95 to −109.26 |
| All independent pads: six-row fitted log likelihood | −2032.81 to −1962.96 |
| Shared six-row fitted log likelihood | −1515.38 to −1377.88 |
| **Original six-row fit / withheld p15** | **−2021.14 / −167.53**, both in independent-pad ranges |

**Decision:** the historical F-bypass clock does not rescue the specific distance-from-infinity-mark additive shared-pad model. No further phase/key search follows from this motif. The original posterior candidate and inferred pad are reproducibility outputs only, not authenticated plaintext or key. The general decoder is a reusable spacing-free inversion method when a different independent clue supplies genuinely repeated additive-pad registrations; it is not evidence that other registrations reuse a pad.

Reproduction: [single-MAP pilot](lp2-infinity-six-frame-fhold-pilot.json); [posterior pilot](lp2-infinity-six-frame-fhold-marginal-pilot.json); [12-trial frozen calibration, with six batch-file links](lp2-infinity-fhold-marginal-calibration.json); [original output](lp2-infinity-fhold-marginal-original.json); [reproducer](../sims/lp2_infinity_six_frame_fhold_marginal_sft.cjs), run from repository root. Default runs the complete calibrated sequence, then original if gate passes. For a time-constrained runtime, `--batch 0 2`, then starts 2,4,6,8,10 with count2; compare the aggregate against the frozen gate before `--original-after-calibration`. Exact computational core ran in connector V8; filesystem/CLI wrapper not separately executed. Calibration commit 7740bc78bf60c95513cd27fe60e150402ee38857 precedes original commit 744c18a7817321022c37abf98e930424a0c4c293.
