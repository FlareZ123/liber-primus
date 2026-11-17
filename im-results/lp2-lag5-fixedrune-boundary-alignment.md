# Fixed-ciphertext word-boundary alignment of LP2 lag-five echoes

**Agent43, 14 November 2026; exact conditional extension by Agent3, 17 November 2026.** The original p0–55 five-rune echoes survive complementary conditioned nulls: the existing fixed-rune-tape / shuffled-word-boundary tests and an exact per-word inventory test that also fixes every immediate-repeat position. These are cryptanalytic architecture constraints. **No unknown plaintext, historical key or selected decoder has been established.**

## Exact original observation

The unknown LP2 pages 0–55 hold **12,956 GP29 runes** in **2,896 complete semantic words**, reconstructed with all 32 page-spanning carries. The full original rune stream has **479 five-apart equal-rune positions among 12,951**. The real printed words enclose **104/2,105**, leaving **375/10,846** comparisons that cross one or more word breaks (4.9406% vs 3.4575%). **Nine** within-word adjacent pairs of five-apart equalities occur. The raw rates overlap and are not independent Bernoulli trials.

Previous conditional results randomize runes within each source word while freezing word boundaries. Here *all 12,956 actual source rune identities and absolute positions are frozen* in every null book. Only printed word-length order is shuffled. This tests whether actual source **word boundaries align unusually with already-existing five-apart ciphertext echoes**.

## Exact conditional source test: lag-five echoes after preserving every adjacent-repeat position (Agent3, 17 November 2026)

**New decision:** Suppressing immediately adjacent repeats cannot, by itself, explain the original within-word lag-five excess under a maximally source-preserving permutation model. The original has **104 distance-five rune equalities among 2,105 eligible within-word comparisons**, alongside only **63 within-word adjacent rune equalities**. Previous fixed-ciphertext tests shuffled word lengths without touching the rune tape. This stronger complementary test holds the **entire GP29 rune multiset separately within each of the 2,896 original words** and keeps **the exact original within-word adjacent-equality positions**. It therefore controls directly for the anti-repeat anomaly that made earlier five-lag nulls potentially too permissive.

For each real word of length `n≤14`, enumerate all possible disjoint position subsets for its rune identities occurring at least twice, preserving each identity's original multiplicity. Reject configurations unless their entire adjacent-equality bitmask is identical to the real word's bitmask. Every accepted assignment has exactly `(n − sum of repeated-type multiplicities)!` completions by the original uniquely occurring runes, so the accepted placements are **equally weighted** conditional on the original rune inventory and adjacency locations. Count every occurrence of `C[i]=C[i−d]` at each distance `d=2,…,13` within every accepted arrangement; obtain the exact book-wide probability distribution by convolving the full per-word finite histograms. No key tuning, simulated samples, source-language model, or approximate normal tail is used.

| Distance inside printed word | Original exact copies | Conditional expected copies | Exact upper-tail P(X≥original) |
| ---: | ---: | ---: | ---: |
| 2 | 252 | 276.884924 | 0.983797 |
| 3 | 181 | 177.089159 | 0.380398 |
| 4 | 131 | 118.353838 | 0.108380 |
| **5** | **104** | **76.359154** | **0.0005975781** |
| 6 | 32 | 45.592341 | 0.989859 |
| 7 | 30 | 26.545087 | 0.266999 |
| 8–13 | [10,5,2,1,0,0] | [14.412,7.621,3.318,1.379,0.349,0.097] | each ≥0.758 |

The **exact lag-five null SD is 8.050397**, with an upper-tail of **0.0005975781007454017**; a conservative twelve-distance Bonferroni upper bound is **0.0071709372**. The other tested distances do not show a comparable positive excess. Under the strict original inventory and immediate-repeat constraints, an independent five-position structural effect remains. This observation **reuses** the previously discovered source lag-five signal; these conditional probabilities are alternative sensitivity tests, not independent confirmations or a discovery-wide significance estimate over historical cipher hypotheses.

The nine manuscript text chapters, in original order, contribute observed lag-five matches `[7,5,18,18,8,9,13,23,3]` against exact chapter-specific conditional means `[3.849,7.164,10.828,10.673,6.087,8.130,10.036,17.901,1.692]`. Original pp8–14 and pp15–22 contribute the largest individually unexpected counts (upper tails 0.018925 and 0.014995), so the full-book signal does not reside solely in the pp40–53 illustrated region. None is separately an authenticated cipher clue.

**Cryptanalytic consequence:** Any claimed direct word-local five-step decoder must account for original lag-five equality positions, immediate-repeat positions and rune inventories *simultaneously*; static five-phase substitution alphabets have already failed the independent source-English collision-capacity gate below. A reversible changing-state mechanism remains an open candidate, but the five-lag anomaly alone provides neither its state rule nor genuine plaintext. A candidate must produce a source-selected key/operation and a held-out unknown-page plaintext passage before promotion to an established result.

**Exact reproducible full-source SFT:** [`sims/lp2_wordlag5_exact_antiadjacency_sft.cjs`](../sims/lp2_wordlag5_exact_antiadjacency_sft.cjs), Node.js 22 CommonJS, read-only. It reconstructs all 2,896 words / 12,956 runes, exact per-word histograms, all twelve complete probability distributions, and the nine chapter distributions; two countable toy-word oracles and exact normalization assertions are included.

## Original-preserving nulls

**A. Chapter-inventory shuffle:** permute whole-word length order independently in each of the nine visually delimited LP2 chapters, preserving each chapter's exact ciphertext runes and word-length multiset. Chapter word counts are **158,255,383,437,224,326,378,669,66**. This may reposition page carries.

**B. Physical-page/carry-preserving shuffle:** hold fixed the **55 rune-bearing physical page lengths**, the **22 breaks exactly at page turns**, **32 original words carried across page turns**, and the exact leading/trailing fragment lengths of those carried words. Shuffle only complete interior word fragments within their original physical page. The overall 2,896-word length inventory and all page-turn geometry are unchanged. This tighter null also preserves the original rune stream.

For each lag L the algorithm precomputes absolute-rune-position prefix counts of equal symbols L positions apart, and of two adjacent such comparisons. Each permuted word contributes prefix-sum differences over its new interval, without changing the ciphertext. **2,000 training draws** freeze mean/SD; **5,000 independent heldout draws** supply upper-tail and family maximum p values. Xorshift32 seeds are **0x436a5501** (A) and **0x43ca7711** (B). The single family is maximum absolute standardized signal over L=2..10; the adjacent-pair family is maximum positive standardized signal over L=2..7.

| Original-source null | 104 L5 singles against null mean ± SD | Fixed L5 p | Family L2–10 p | 9 L5 adjacent pairs against null mean ± SD | Fixed L5 p | Family L2–7 p |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| A: nine chapter inventories | **77.605 ± 7.943** | 0.000600 | **0.012398** | **2.891 ± 1.590** | 0.001000 | **0.008198** |
| B: exact physical pages and carried word fragments | **80.201 ± 7.672** | 0.002799 | **0.021796** | **4.0465 ± 1.620** | 0.009198 | **0.043791** |

Observed lag5 single z is **3.32** under A and **3.10** under B; adjacent-pair z is **3.84** and **3.06**. A positive artificially planted five-back copy at indices 5–7 of all **343** original-format words of length at least eight produces **699** detected adjacent lag-five pairs, validating the detector. The main result modifies **no original rune**.

[Reproducible original-input Node22 CommonJS SFT](../sims/lp2_lag5_boundary_alignment_sft.cjs) · [Successful Windows Node22 Actions run 43588587564](https://github.com/FlareZ123/liber-primus/actions/runs/43588587564).

## Complete five-phase secret-alphabet gate

**Agent28, 14 November 2026. Source-exact source-native-English-and-Latin-conditional exclusion, no recovered unknown LP2 plaintext.** The five-dot stencil independently occurs on pp7, 23 and 56, and original intact words contain 104/2,105 lag-five rune equalities. This suggests a source-recognizable but unproved hypothesis: within every printed word, one of five secret **bijective GP29 substitution alphabets** encodes the rune at phase `i mod 5`. Even if each of the 55 rune-bearing physical pages has its **own completely arbitrary set of five 29! secret alphabets**, this model has a key-independent invariant: the count of equal symbols at positions in the same page×phase class must be unchanged by every possible alphabet choice. The word's phase resets at each original word beginning, including 32 joined cross-page words.

The untouched original 2,896 semantic words contain **12,956 GP29 runes**. Across the global five phase classes, their symbol collision rates are **653,650/19,001,504 = 0.0343999**, with every individual phase's IoC **0.0343258–0.0344987**. Allowing **275 page-specific phases**, original exact equal-symbol pairs are **12,399/358,333 = 0.0346019**. A fixed permutation of each class's 29 rune symbols cannot alter any of these counts.

**Independent matched-positive English and Latin controls:** freeze all 2,896 original word lengths and original page-index assignments, then replace every word with a source-native, GP-encoded word *of exactly the same rune length*, independently sampled from three archived English texts and an independently sourced eight-book Latin Vulgate register, using 250 seeded complete-book draws per corpus. Their **per-page five-phase** collision rates remain strictly above the observed original:

| Source-native independent text | Seeded matched books | Lowest collision rate | Median collision rate | Books at or below original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 250 | **0.0704484** | 0.0729712 | 0 |
| Gibran | 250 | **0.0697089** | 0.0722680 | 0 |
| Emerson | 250 | **0.0684922** | 0.0704791 | 0 |
| Latin Vulgate | 250 | **0.0779415** | 0.0798084 | 0 |

The complete **1,000/1,000** source-native English and Latin length-matched controls are more than twice the original equal-pair rate. The exact same source-printed length/page layout is used in every case; this diagnostic depends on natural source-language GP rune frequencies and is *not* an unconditional theorem over every possible plaintext language. To positively test the very large secret-key family, the reproducer encrypts one complete native GP-English 12,956-rune book under **275 different random 29-symbol alphabet permutations**, then independently reverses every glyph using its correct page and phase. All **12,956/12,956 runes** are recovered; the exactly preserved equal-pair count is **26,908 before and after encryption**. This ensures that the real-cipher negative is caused by a source-register incompatibility rather than inability to implement this family.

**Decision:** retire **a direct page-reused five-phase secret-alphabet substitution** as the explanation of LP2's lag-five echoes under the tested GP-native English and Vulgate Latin plaintext registers with original word boundaries. The model permits an arbitrary secret 29! permutation per original page×phase; no choice of those keys can change the observed phase-conditioned collision sparsity. This goes beyond the earlier all-secret five-phase **per-word affine** test, yet does **not** exclude a fresh alphabet at every word, changes to page/word segmentation, differential encodings whose *output* is uniform, an evolving cipher state, or a non-English/non-GP intermediate. There is no solved unknown-page key. A distinct page-reused five-phase ciphertext-feedback family also fails a key-independent, source-native-English test on observable GP29 ciphertext differences, even with 275 unrestricted phase-alphabet keys. See [the complete feedback-gate report](lp2-wordfive-cipherfeedback-secret-alphabet-gate.md). The anomalous observed lag-five *within-word* alignment remains independently established above; the source has yet to identify a reversible state/key operator.

**Reproduction:** [standalone CommonJS exact-input 275-key SFT](../sims/lp2_wordlocal_fivephase_secret_alphabet_source_sft.cjs); [successful expanded Node22 CI run 43619012160](https://github.com/FlareZ123/liber-primus/actions/runs/43619012160). Both original full-rune source corpora agree at 12,956 positions, **1,000** heldout source-native English/Latin controls pass, and every planted key and output is inverted.

## Two predeclared five-back delimiter prediction rules, trained p0–2 and tested on independent chapters (Agent14, 14 November 2026)

The source-conditioned enrichment above is a statistically interesting **relationship to printed word breaks**, but a solver would still need to recover the *locations of those breaks* from the ciphertext if they were supposed to carry a state clock. Issue #917 therefore tests **two local deterministic, paper-executable rules** on untouched GP29 source runes, with no fitted key, glyph substitution, phase or per-chapter parameter. They were frozen on the first physical chapter **p0–2** and evaluated unchanged on **p3–7** and the nonadjacent floral **p40–53**.

Let a gap be between source glyphs C[g−1] and C[g] in a printed visual chapter. Let E[k] be the predicate C[k]=C[k−5] using only runes within the chapter. The two rules are:

1. **A, no-cut through an echo:** a gap may be a word break only if none of E[g], E[g+1], …, E[g+4] is true. Candidate breaks are all permitted gaps; source-visible five-back copies never cross a permitted break. This is a proposed *necessary* constraint, rather than an independent bit telling a reader which permissible gap to cut.
2. **B, break after the echo run:** mark a break at g precisely when E[g−1] is true and E[g] is false. This is the simplest termination reading of a five-back copied run and yields a unique, albeit sparse, boundary tape.

The complete source parser joins all **32 page-crossing words**, asserts **2,896 words / 12,956 original runes**, and preserves the exact true word-length inventories. For controls, each chapter's original **entire rune tape remains unchanged** while its authentic word-length inventory is independently shuffled **3,000 times** at frozen xorshift32 seed 0x0140f917. Nulls are used strictly for assessment, **never to generate the predictions**. The randomization preserves chapter rune count, number of real word breaks, word-length multiset and every local five-step source event.

| Original source chapter | Real internal breaks | A predicted gaps / true hits | A fixed-length-shuffle mean; upper tail | B predicted gaps / true hits | B fixed-length-shuffle mean; upper tail |
| --- | ---: | ---: | --- | ---: | --- |
| p0–2 (training) | 157 | **612 / 136** | 131.90; **0.118** | **23 / 5** | 5.02; **0.584** |
| p3–7 (held out) | 254 | **993 / 217** | 220.45; **0.874** | **30 / 9** | 6.68; **0.205** |
| p40–53 (held out) | 668 | **2,506 / 567** | 556.50; **0.049** | **104 / 31** | 23.03; **0.034** |

These tails are **exploratory, uncorrected for two rules and two held-out chapters**. A predicts 82–87% of all gaps as potential breaks, so precision is only **21.85% on p3–7** against a 22.20% true-break baseline, and **22.63% on p40–53** against 22.22% baseline. This leaves hundreds of ambiguous potential break sites and cannot restore unique word delimiters. B's precision rises to 30.00% and 29.81% on the two heldouts, against 22.20% / 22.22% baseline, but B captures only **9/254** and **31/668** true breaks, with recalls 3.54% and 4.64%; 95% of needed delimiter state remains unspecified. The nominal B floral-region signal is a small localized observation, **not** an independent successful delimiter predictor across chapters.

As a **source-native known-text comparison**, the original solved p57's 95 printed GP runes include its heading as a twentieth word, yielding 19 actual internal breaks. A allows 79 gaps and captures 17 of them; B predicts only two gaps, with **zero** genuine breaks. A synthetic seven-rune double-echo plant confirms the program detects two five-back returns without changing source indexing. The original p57 test shows that the proposed boundary rules are not generally dictated by GP-native English punctuation.

**Decision:** Neither rule specifies the full original printed word breaks as an exact recoverable ciphertext-only channel. Rule A has extensive nonuniqueness, and B leaves almost all actual breaks unrecoverable. The apparent local B enrichment in the floral chapter remains below a complete source-selected cipher instruction. Retire **these two rules** without treating the earlier independently established five-back interior enrichment as falsified. A future attempt requires a *new original instruction selecting a deterministic boundary event and a lossless alphabet/key-state action*, plus independent heldout plaintext.

**Reproducer:** [source-exact Windows Node22 CommonJS test](../sims/lp2_lag5_delimiter_prediction_sft.cjs), retaining complete original-rune and delimiter counts and fixed-seed source-shuffle controls. The matching 3,000-shuffle original-source computation was executed in the connected GitHub JS environment; the standalone Node command and a CI run are not separately claimed here.

## Next cryptanalytic decision and limits

Under two length-inventory-constrained nulls, the **original printed word boundaries are unusually aligned** with the already observed five-apart ciphertext echoes. It is therefore premature to dismiss all printed separators as independently randomized decorative segmentation. A candidate decoder should predict where its five-step output coincidences fall relative to original word boundaries, along with the 86 source adjacent doublets and near-flat GP29 marginals. This could direct a source-selected word-local feedback, copying, or conditional delimiter scheme; **none is currently specified by an authentic Cicada operation**.

These p values correct only the declared short-lag families, not every cipher considered historically. Nulls A and B use the same underlying ciphertext and are **not independent**, so their p values cannot be multiplied. The observation is compatible with content-dependent placement of delimiters and rare chance alignments, as well as with a word-local cipher. It is **not** a decryption, key, recovered sentence or source-authenticated operation.
