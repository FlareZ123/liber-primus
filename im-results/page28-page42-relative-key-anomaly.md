# LP2 pages 28 and 42: an aligned, symmetric residue-difference anomaly

**Classification:** reproducible exploratory structural lead with calibrated family-wise significance for a defined statistic. **No recovered plaintext or key.** First identified by Agent 11 on 2026-11-10. This page consolidates the evidence, its limitations, and the strongest next cryptanalytic test.

## Why this pair is interesting

When two pages use the **same additive keystream modulo 29** at corresponding rune positions, the unknown key cancels:
```
C_A[i] = P_A[i] + K[i] (mod 29)
C_B[i] = P_B[i] + K[i] (mod 29)
D[i] = C_A[i] - C_B[i] = P_A[i] - P_B[i] (mod 29).
```
For two independent plaintext strings with a **common rune marginal** q, the residue difference histogram has a **symmetric circular autocorrelation** `Pr(D=d)=sum_x q[x]*q[x-d]`, hence `Pr(D=d)=Pr(D=-d)`. This is a testable *necessary pattern* under this key-reuse model, not a sufficient condition proving it.

Across the canonical 55 rune-bearing unsolved LP2 pages (12,956 runes and 2,896 rune words), there are **1,485 unordered page pairs**. At the same within-page rune offset, pages **28 and 42** (archive JPEG scans 45 and 59) show the strongest deviation of the **symmetrized 29-bin residue-difference histogram** from uniform. The pages contain 269 and 272 runes respectively, giving 269 aligned comparisons. Both original JPEGs have been visually inspected: they are distinct manuscript pages, with different artwork and rune layout.

Observed residues `D=C_28-C_42 (mod29)` for the 269 aligned runes, counts for residues 0 through 28:

```
[21,6,15,16,5,17,14,9,6,7,8,9,12,5,5,4,5,4,7,12,4,5,9,18,12,3,15,10,6]
```

There are 21 exact rune coincidences (vs `269/29=9.28` expected under independently uniform symbols), but raw coincidence counts **do not** survive family-wise calibration. The defining feature is the **roughly even frequency of positive/negative residue pairs** combined with nonuniformity.

Define `H_d` as the difference counts and `E=n/29`:

```
S_sym = (H_0-E)^2/E + sum_{d=1}^{14} (H_d+H_{29-d}-2E)^2/(2E).
```

This is the 14-degree-of-freedom symmetric component of the ordinary 28-degree-of-freedom Pearson chi-square. Also define two supporting statistics: ordinary `chi = sum_d (H_d-E)^2/E`; and cross-half profile agreement `cov = sum_d (H_first[d]-n_first/29)*(H_second[d]-n_second/29)`. These are overlapping statistics on the **same data**, not independent confirmations.

| Statistic | Observed pair 28/42 | Family-wise p over 1,485 pairs |
|---|---:|---:|
| Symmetric difference chi-square | **65.200743** | **2/1001 = 0.001998** |
| Ordinary difference chi-square | 74.148699 | 26/1001 = 0.025974 |
| Cross-half histogram covariance | 116.206897 | 8/1001 = 0.007992 |

**Null:** for each of 1,000 trials (fixed PRNG seed 404), independently circularly rotate each of the 55 page rune streams, then rescan **all** 1,485 page pairs and record the *maximum* for each statistic. This retains every page's exact rune multiset and internal adjacency cycle while scrambling physical alignment across pages. The symmetric maximum-null median is about 39, the 95th percentile **46.92424**, and 99th percentile **53.62405**. Only one of 1,000 surrogate maxima reaches the observed 65.200743. Exact full run and positive control: [GitHub Actions 42743234601](https://github.com/FlareZ123/liber-primus/actions/runs/42743234601).

These are *family-wise permutation p-values for fixed statistics*. The symmetric statistic was chosen **after noticing** the initial ordinary chi-square anomaly; the tests do not correct for the broader human/model selection of statistics. The two supporting p-values describe related, partially dependent consequences of the same unusual histogram. An independent, precommitted prediction or plaintext recovery is needed before an identified cryptographic mechanism can be claimed.

## Conditional two-time-pad decoders: bigram lead, stronger trigram negative

Assume the same additive key was used at corresponding positions. Then the observed difference `D[i]` eliminates the key, constraining 29 possible plaintext-rune pairs at each position. Both models optimize two simultaneous GP-rune plaintexts by Viterbi dynamic programming, using the real page-specific rune-word boundaries. English language models are trained on the first **240,000 characters** of `resources/control/shakespeare_first300k.txt`; the held-out remaining 60,000 characters supply independent Shakespeare passages masked by the **same random additive key** as a positive control. For each model, test all cyclic shifts of page 42's runes while preserving the original word-boundary mask.

| Decoder | Genuine held-out shared-key control | Real LP2 pages 28 and 42 |
|---|---|---|
| Smoothed character bigrams | True shift ranks **1/269**, first plaintext recovery **36.06%** of GP runes | Original shift ranks **1/272**; optimized score -1349.496, second-best -1354.196; output gibberish |
| Smoothed character trigrams | True shift ranks **1/269**, first plaintext recovery **68.77%** of GP runes | Original shift ranks **47/272**; optimized score -1268.526, best shifted score -1252.156; output gibberish |
| Trigrams, authentic Cicada LP1 prose re-masked with a shared additive key | True shift ranks **1/264**, recovering **131/251 = 52.19%** of both original GP-rune streams | Same LP2 original shift ranks **47/272**; Shakespeare-trained model and real target unchanged |

The order-3 model recovers substantially more information than the bigram decoder on Shakespeare and **does not support the original alignment** on the real target. An additional, register-specific challenge uses **actual decoded Cicada LP1 pages 03–04** (251 and 264 runes), with an artificial common mod-29 key, their original spelling and observed word-boundary masks. The same Shakespeare-trained decoder ranks the true alignment **first of 264** and recovers **52.19%** of each original GP-rune stream. Its true-shift advantage over the median rotation is 0.4065 log units per compared rune, versus 0.0395 for the real LP2 pair; the passages differ in length, so these are diagnostic effect sizes rather than a controlled test of equal distributions. This authentic-register positive control is harder than Shakespeare for rune recovery, yet still clearly identifies genuine shared-pad alignment. The initially encouraging real-LP2 bigram rank therefore does not survive stronger modelling and a historical-register adversarial control. The particular *same additive key masking ordinary Cicada-like prose* hypothesis is weakened. Other encodings or shared transformations remain possible.

**Exact reproducibility:**
- Bigram source `sims/relative_key_english_probe.cjs`; [successful run 42743752448](https://github.com/FlareZ123/liber-primus/actions/runs/42743752448).
- Trigram source `sims/relative_key_trigram_probe.cjs`; [successful run 42744414946](https://github.com/FlareZ123/liber-primus/actions/runs/42744414946).
- Authentic Cicada-register control `sims/relative_key_cicada_register_control.cjs`, using recovered historical plaintext from `sims/authentic_lp1_p03_p04_vigenere_recovery.cjs`; [successful run 42747342969](https://github.com/FlareZ123/liber-primus/actions/runs/42747342969).

Neither run's real-page optimized strings are readable and neither is a cryptographic recovery. The rank tests remain secondary exploratory diagnostics, not independent family-wise evidence across 1,485 pairs.

### Additional mechanistic constraints

The solved-LP1-English-to-GP-rune marginal predicts elevated difference probabilities near residues 0, ±14 and ±8, whereas the actual pair's distribution emphasizes 0, ±3, ±5 and ±6. The empirical English-difference log likelihood ratio against uniform on the real pair is approximately **-0.24 natural log units**. The model-predicted symmetric chi-square at n=269 is approximately 31 (versus observed 65). The unexpected symmetry thus does **not** match the specific difference pattern expected from independently sampled ordinary English texts.

The page-number separation happens to be 14, but the 41 pairs separated by exactly 14 pages average symmetric chi-square only about 14.38, and only page 28/42 among them exceeds 26. No general period-14 key-reuse cluster has been demonstrated. The aligned word-delimiter overlap in the pair is **12**, essentially the independence expectation **12.29**.

## A further cross-validated affine scale: factor four

A plain-English additive-key model would give `D_i=P28_i-P42_i`, but the actual difference histogram overrepresents 0, ±2, ±3, ±5, ±6 and is a poor fit to the unscaled English-GP difference distribution. This suggests the more general, explicitly falsifiable model

```
D_i = m*(P28_i-P42_i) + delta (mod 29),     m in 1..28.
```

Fit **812** scale/offset templates, obtained from the English-GP rune marginals of the 240,000-character Shakespeare training sample, using **only the first 134 positions** of the page pair. The fitted maximum is `m=4,delta=0` (the symmetry of the underlying iid difference model makes `m=25,delta=0` an equivalent template). The fitted model's log-likelihood improvement against independent-uniform runes is **+6.63251 nats** in the training half and **+6.28655 nats** in the untouched second 135 positions. The same model is the top scorer on both halves independently.

**Independent reference-register check:** repeating the 812-model fit with the [Wulfic canonical solved-LP1 English translation](https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/f038274969449660fff5450b229bb96b510ec079/data/canonical/liber_primus_translation.txt), encoded into GP runes under the same digraph convention (**2,939 reference runes**), also selects **m=4,delta=0** from the first half (+7.36926 nats) and again independently in the second half (+7.52431 nats). The full 269-position histogram's Pearson residual against this fitted distribution is **40.11 for 28 nominal degrees of freedom**, indicating imperfect but plausible marginal fit. This is replication of the *template fit* across two plaintext references, not independent reproduction of ciphertext evidence, because both checks use the same selected LP2 page pair and similar English symbol distributions.

For a proper control that includes the initial page-pair selection, **1,000** independent per-page cyclic rotations (PRNG seed 2026) repeat this *entire* pipeline: select the maximum-symmetry pair from all **1,485 pairs**, fit all 812 models on the selected pair's first half, score its second half. Only **7/1,000** surrogate selected pairs have heldout score at least 6.28655: add-one `p=8/1001=0.007992`. Requiring *both* the observed symmetry 65.200743 and heldout fit exceeds the target occurs in **1/1,000**: `p=2/1001=0.001998`. The null 99th percentile of heldout score is **5.87235**. This is a materially tighter hypothesis than arbitrary symmetric histogram shape, albeit motivated *after* inspecting this pair. The p-values do not account for exploratory selection of the factor-family itself.

Source `sims/relative_key_scale_validation.cjs`; [successful GitHub Actions run 42745361435](https://github.com/FlareZ123/liber-primus/actions/runs/42745361435). An algebraic planted control checks all 269 inversions of `D=4(P-Q) mod29`, with inverse 4 equal to 22 modulo29.

The stronger trigram Viterbi decoder was rerun with `D'_i=22D_i mod29` (source `sims/relative_key_trigram_probe.cjs`; [successful run 42744935164](https://github.com/FlareZ123/liber-primus/actions/runs/42744935164)). The scaled real pair improved from **rank 47/272** to **rank 13/272** cyclic alignments; the optimized strings remain mostly gibberish. The positive synthetic shared-key control for the unscaled model still scores rank1/269 at 68.77% accuracy. **This is evidence for a candidate marginal relationship, not for recovered passages or a proved factor-four cipher.**

## Exact forward-summed trigram check of the scale-four model

**Agent 40, 2026-11-10; additional adversarial evidence, not a recovered key.** A follow-up integrates over *all* 29-state GP plaintext possibilities rather than maximizing a single candidate string. Under the fixed model \`D'_i=22(C28_i-C42_i) mod29=P28_i-P42_i\`, the exact forward algorithm sums the joint probability of two independent Shakespeare-trained, physical-word-boundary-conditioned **trigram** plaintext streams. Each path's trigram and end-of-word likelihoods are evaluated using the same pre-existing 240,000-character training split as the prior Viterbi probe. The log-likelihood is accumulated with per-position normalization. A three-rune brute-force sum of all 29³ plaintext assignments supplies an exact arithmetic regression.

Across **all 272** cyclic offsets of page 42, the original physical alignment (offset 0) has log-likelihood **−1200.976093**, ranking **20/272**. Offset **113** scores **−1191.235575**, better by **9.740517** natural-log units; the median offset scores **−1216.451237**. Original offset 0 is better than most rotations, but materially below the best under this exact trigram score. By contrast, the exact bigram marginal ranks original offset first of all 272. The manuscript page pair and factor four were selected beforehand, so neither within-pair rank is an independently calibrated global p-value.

A planted held-out positive control takes two separate post-training Shakespeare passages (269 runes each) and independently forms \`C_A=4P_A+K\` and \`C_B=4P_B+K\` using **one identical seeded 269-rune random key**. Over **all 269 cyclic offsets**, the original zero offset is **rank 1/269**, scoring **−1136.237523**; second-best offset 70 scores **−1209.802267**, a **73.564745**-nat advantage for the true alignment. This within-model sensitivity check uses one language pair, so it cannot calibrate a real-cipher p-value. It demonstrates that the exact marginal method sharply favors the correct alignment for a genuine shared-key plant, whereas LP2 does not have a similarly isolated optimum.

**Interpretation:** the scale-four histogram fit and the exact **bigram** marginal result (original offset rank 1 of all 272 rotations, −1182.709666 versus second −1184.620015) remain worth investigating as anomalies. Yet a stronger **trigram** marginal test ranks the original alignment 20th among all 272 possible offsets under a model that ranks the genuine planted alignment first among all 269. This raises the possibility that the symmetric profile is a statistical or structural effect unrelated to two ordinary-English GP texts sharing a scale-four additive pad. Model misspecification, sparse training, unusual text register, and other masking remain possible. No actual LP2 plaintext has been recovered.

**Reproducer:** [sims/relative_key_exact_marginal.cjs](../sims/relative_key_exact_marginal.cjs) (Node 22, one runnable test file, JSON output, exact three-rune cross-check, deterministic controls). [Successful exhaustive CI run 42747699436](https://github.com/FlareZ123/liber-primus/actions/runs/42747699436).

## Word-level exact inversion test: factor-four shared key fails ordinary English dictionary support

The same proposed model has a stronger, plaintext-producing **necessary-condition
test** at positions where a word on page 28 overlaps a word on page 42:
if \`C28=4P28+K\` and \`C42=4P42+K\`, then
\`P28[i]-P42[i]=22*(C28[i]-C42[i]) (mod29)\`.
Each known word boundary fixes a length and an offset for the unknown English GP
word. Enumerate all candidates of exactly that rune length from the
**5,002 distinct** GP-encoded Shakespeare training words (first 240,000
characters) and search for a pair matching the observed difference at **every
overlapping position**. No guessed keys or optimized language scores enter this
check; existence of at least one word-pair is the statistic.

On the exact original transcription of LP2 pages 28 and 42, there are
**24 aligned overlaps of at least four runes**, and **only 2** admit a pair of
words in that lexicon. Detailed breakdown:

| Overlap width (runes) | Number of crossings | Compatible crossings |
|---:|---:|---:|
| 4 | 11 | 2 |
| 5 | 8 | 0 |
| 6 | 5 | 0 |
| **Total** | **24** | **2** |

This is a severe lexical constraint on the proposed transformed
English shared-key model: 22 locally constrained intervals cannot be made into
two simultaneous length-correct dictionary words.

**Powered, independently sourced controls:** 400 seeded planted true-key pairs
reuse the exact original page word-length templates, sample every plaintext word
by rune length from the last **60,000 Shakespeare characters** (held out of
lexicon construction), generate one common random mod-29 keystream, encrypt with
the exact factor-four model, and suppress each immediate ciphertext doublet with
probability 0.81 by selecting a different rune. That suppression rule is an
illustrative nuisance model and is **not known to be Cicada's actual rule**.

The real-data support is 2/24. On held-out true-key plants, mean support is
**14.0875/24** (minimum **5**, median **14**, maximum **21**); zero of 400
supported as few as two overlaps. The add-one simulation-tail fraction
\`1/401 = 0.002494\` is conditional on this particular word-generation and
repair model, **not** a familywise probability establishing an actual cipher.
A mean **13.33 held-out plaintext word tokens** per planted pair are absent from
the training lexicon, while the simulated doublet filter modifies a mean
**14.5175 rune positions**, so the controls do not simply leak the training
vocabulary or assume an error-free pad.

**Evidence strength and limits:** this is stronger negative evidence against
**ordinary English words, preserved physical word boundaries, and a single
factor-four additive key shared at equal rune offsets** than the earlier
trigram-rank diagnostic. It does not exclude a much larger or different word
lexicon, GP multiword coding, different segmentation, cipher variants,
state-dependent symbol transforms, per-page key differences, or a relation
unconnected to plaintext. The original page-pair and factor-four family were
selected exploratorily from these same two pages.

**Reproduce:** [sims/relative_key_word_overlap.cjs](../sims/relative_key_word_overlap.cjs)
(Node.js CommonJS; fixed seed 7831001; 400 trials; direct corpus consistency
assertions and exact per-word enumeration).

### Larger-vocabulary exact inversion and exceptional-symbol budget (Agent 7)

A complementary exhaustive product-automaton search uses **121,592 distinct GP-encoded English word strings** from TextBlob's Norvig-derived spelling counts and CMUdict, rather than 5,002 Shakespeare words. It preserves both pages' physical punctuation boundaries, treats leading page fragments as censored, and has neither beam pruning nor an OOV escape. At the original zero-shift alignment, the scale-four model has **no fully dictionary-supported pair after the first 15 rune positions** (zero-based offset 15); scale one fails at offset 13, scale seven at offset 69, and scale 22 at offset 25. Five synthetic dictionary-word plaintext pairs with exactly the observed 269-rune word masks, masked under a single factor-four additive key, all survive the full 269-rune check. This removes small-dictionary coverage and beam pruning as explanations for the strict scale-four failure in this bounded English model. [Exact source](../sims/relative_key_hard_lexicon.py) · [CI with five complete plants](https://github.com/FlareZ123/liber-primus/actions/runs/42748346317).

To allow the possibility of sparse unexplained ciphertext corrections without fitting a flexible independent language model, an **exact forest min-plus decoder** assigns a word from that full lexicon to each physical word interval. Every overlapping pair of word intervals contributes the number of rune positions violating `22*(C28-C42)=P28-P42 mod29`. The union of the two linear word partitions is a forest, allowing exact dynamic programming. Each edge message minimizes Hamming distance over **all** dictionary word pairs by enumerating the subsets of matching overlap positions, including reconstruction witnesses; no heuristic beam is used. For the same 269 positions, the lowest possible exceptional-symbol counts are **11** at scale one, **12** at scale four, **10** at scale seven, and **9** at scale 22. A local exhaustive sweep over all 28 invertible scales gave scale-four **12**, with a minimum of **9** at scales 17, 22 and 25; none of the other 27 scales requires more than 14 corrections. Among 16 exploratory cyclic offsets of page42, the original scale-four offset (12 corrections) was tied or beaten by many mismatched offsets (range 11–14). This demonstrates that allowing a sparse arbitrary per-position exception channel largely destroys the scale-four alignment's ability to distinguish a plausible shared key under this broad lexicon. It is **not** evidence that the real manuscript contains 9–14 corrected runes; no actual repair rule or plaintext was identified. [Exact inversion source](../sims/relative_key_word_tree.py) · [on-demand CI](https://github.com/FlareZ123/liber-primus/actions/runs/42750446754).

## Exact marginalized language probability and source-matched controls

An additional, **non-Viterbi** test sums the probabilities of *all* compatible
plaintext rune sequences under the pre-specified scale-four shared-key
equation, rather than optimizing one favorable decoded string. For every
alignment, the dynamic program tracks 29 possible latent page-28 plaintext
runes, infers the corresponding page-42 runes through the observed
difference, and evaluates English GP bigram transition probabilities.
The process explicitly uses each page's independent rune-word start/end
flags and divides by the exact language-model likelihood of each physical
word-boundary mask. It therefore yields a normalized log-likelihood ratio
against 29-way uniform differences.

The model is trained on the first **240,000 Shakespeare characters**
(**44,370** GP word tokens). A separate position-conditioned IID model
uses training rune frequencies classified by word start, interior,
word end, or single-rune word. This distinguishes frequency and delimiter
effects from genuinely sequential language information.

| Model for the original zero-shift alignment of pages 28/42 | Log likelihood ratio or incremental log ratio | Rank against all 272 page-42 cyclic rune shifts |
|---|---:|---:|
| Exact marginalized bigram language likelihood against uniform differences, scale 4 | **−1.643180 nats** | **1/272** |
| Word-position-conditioned IID GP difference likelihood against uniform differences, scale 4 | **+8.375961 nats** | **1/272** |
| Extra information from bigram dependence, bigram minus slot-IID | **−10.019141 nats** | **252/272** |
| Exact bigram likelihood using unscaled difference, scale 1 | +0.758591 nats | 2/272 |

The apparently winning alignment under scale four **comes from the
single-rune/word-position marginal, not from normal English rune-order
dependence**. Adding natural bigram structure to the hypothesis sharply
reduces the original alignment's likelihood and moves its *incremental*
rank near the bottom. These ranks are descriptive within the previously
selected pair and scale, not independent family-wise p-values.

**Matched positive and negative controls:** Using only the final **60,000
held-out Shakespeare characters**, 250 true-key plaintext pairs were
sampled with **exactly the same GP rune-word lengths and boundary flags**
as the original 269-rune page-28 and 272-rune page-42 streams. Each was
encrypted with an independently generated common random mod-29 keystream
under `C=4P+K`. An additional 250 matched pairs received independent
keys on each page. The true-key samples preserve the physical masks
precisely, including the incomplete trailing word on page 42, and
hold their lexical sample source out of language training.

| Statistic | LP2 actual | True shared-key English controls, 250 samples | Independent-key controls, 250 samples |
|---|---:|---:|---:|
| Bigram-forward LLR | −1.64318 | Median +11.06392; 3/250 <= real (add-one lower-tail p 0.01594) | Median −16.78222 |
| Slot-IID LLR | +8.37596 | Median +8.03688; 134/250 <= real (p 0.53785) | Median −12.56614 |
| Bigram minus IID | **−10.01914** | Median +2.96115; 0/250 <= real (p **0.003984**) | Median −4.14074; 17/250 <= real |

The controls show **selective compatibility with GP word-position
frequency structure and selective incompatibility with ordinary
English-like sequential structure** under the specific common-key
factor-four generator. The result is consistent with the separate exact
word-overlap contradiction above. It does not identify an alternative
encryption scheme. The actual cipher's repeat-suppression process may
differ from the true-key controls, and different plaintext registers,
permutations, stateful processing, or word-boundary semantics remain open.

Reproduce with [the fully specified 29-state forward solver and matched
control generator](../sims/relative_key_forward_likelihood.cjs) and
[successful manual GitHub Actions run 42747490883](https://github.com/FlareZ123/liber-primus/actions/runs/42747490883).
The first exploratory execution was
[42747097513](https://github.com/FlareZ123/liber-primus/actions/runs/42747097513).
Both records contain actual numeric evidence; neither recovers LP2 text
or key material.

## Exact T6-repair marginal check: the page-pair IID signal survives, but remains source-inadequate

**Agent 39, 2026-11-10, model-specific follow-up.** The earlier word-position IID result already ranked original zero alignment first out of 272 cyclic rotations under the independently selected page28/page42 factor-four relation. Its missing source dependency was an explicitly **invertible conditional emission** for the previously proposed word-local T6 collision-rewrite channel. The [new CommonJS marginal test](../sims/relative_key_T6_pair_marginal.cjs) enumerates every legal tentative-rune pair `X28,X42` consistent with each observed glyph under that T6 rule, and all 29 hypothetical source GP-rune pairs satisfying `P28-P42=22(X28-X42) mod29`. It sums the exact q=.81 emission weights rather than replacing whole words or pretending the correction is an arbitrary source error.

Using the GP-English unigram source distribution trained on the first 200,000 Shakespeare characters, the original zero offset remains **rank 1/272**, with log marginal **−879.544565** versus the next-best phase86 **−890.363572**. The zero offset also ranks **first independently in the initial 134 compared rune positions** (−438.753905) and in the later 135 (−440.790660). Training instead on **515 authentic solved Cicada LP1 GP plaintext runes**, with 100 pseudocount runes drawn from Shakespeare to stabilize rare glyphs, again ranks the original zero phase **first in both halves** and over the full stream (overall −878.621224). These are cross-source-model repeats of the *same selected original pair*, not independent replication of ciphertext evidence.

Crucially, **omitting the T6 repair entirely** also places original zero first (log −892.756726 versus runner-up −904.717566). The T6 hypothesis therefore **does not create or uniquely explain** the page pair's unusual unary residue statistics. Uniform GP-rune source gives only rank **4/272**, confirming that source-frequency weighting, not general anti-repeat repair, favors the original alignment. In a matched source-disjoint **true shared-key planted control**, both streams were encoded as `C=4P+K` and subjected to the specified T6 channel (6 and 9 real rewrites); its true zero offset ranked **1/272 overall**, **94/272 in the first half** and **1/272 in the second half**. The same experiment's independent-pad negative ranked **49/272 overall**. This illustrates the variability and limited power of individual unigram alignment ranks.

[Successful run 42772266410](https://github.com/FlareZ123/liber-primus/actions/runs/42772266410) and its uploaded JSON artifact preserve all 272 alignment scores summarized by rank and the exact control seeds, pages and model. The **earlier exact bigram/trigram marginal penalties and severe full-word dictionary incompatibility remain decisive obstacles** to interpreting the pair as shared-key **ordinary GP-English plaintext**. No key, plaintext or original encryption rule is recovered, and the post-selected pair/factor-scale should not receive a new discovery p-value from these within-pair ranks.

## Current interpretation and next genuinely discriminating tests

The **same-offset symmetric cross-page difference anomaly** remains
reproducible, and the **factor-four template** remains the strongest
preselected affine histogram fit. Under a hypothesis of two ordinary
GP-English plaintexts with physical word boundaries and the same
factor-four additive stream, however, multiple distinct decoding tests
now reject the proposed *plaintext structure*:

- The trigram Viterbi decoder cannot produce readable words and ranks the
  original scale-four alignment only 13/272 under its optimized-path score.
- An exact 24-overlap dictionary compatibility test finds only two
  compatible word crossings, versus mean 14.0875 on 400 matched
  noise-repaired true-key samples.
- The fully marginalized bigram language likelihood scores worse
  than expected from matching word-position rune marginals:
  incremental log likelihood **−10.01914 nats**, below all 250
  matched true-key English plants.

These different tests reuse the same ciphertext and assumptions, so their
reported tail probabilities should **not** be multiplied as independent
significance tests. They do give convergent, explicit evidence that the
factor-four histogram relation is **insufficient to infer a shared
English-plaintext encryption mechanism**.

A different plaintext register, coding, transformation before key reuse,
stateful cipher, or a rare selected-pair null-tail event may account for
the observed residue distribution. The separation of 14 pages does not
generalize to other page pairs, and the observed word-delimiter overlap
is essentially the independence expectation.

**Most informative next research:** derive a transformation that predicts
new ciphertext positions, produces decryptable words, or reconstructs
keystream material independently of the already-selected histogram.
Test a different motivated plaintext alphabet or operation before
expanding general language-model search. Additional tests must preserve
the possibility of an unknown anti-doublet step, since the matched
true-key controls are model-specific. No LP2 plaintext or key has been
recovered.

## Source-printed coordinate key schedule: discriminating negative

The previously selected pair **LP2 p28/p42** has a striking change under a *source-visual* alignment choice. When corresponding glyphs are compared by their **printed line number and rune column within that line**, only **259 pairs** align and the same symmetrized residue statistic is **6.7027027** (nine identical glyphs), ranking **1,402nd of 1,485** page pairs under this orientation. By contrast, the original **continuous rune-offset** alignment uses 269 positions and yields **65.200743**, as documented above. The suspicious residue histogram depends on unbroken-stream position, not on direct printed row/column coincidence.

A mechanism-specific positive control is a mod-29 additive **same-visual-coordinate shared keystream** applied to independently generated GP-English-like plaintext rune labels. The label distribution is derived from 3,528 GP tokens in the published solved-LP1 Latin reference via a fixed greedy GP transliteration (K/Q→C, V→U, Z→S). Across 5,000 exact printed-line-shape controls, the same-visual-coordinate difference chi-square averages **26.290**; only **12/5,000** are as low as the real 6.7027 (add-one p **0.00260**). If each page separately applies an 81%-probability **continuous anti-doublet repair**, the planted mean is **25.344**, with only **9/5,000** at or below the real observation (add-one p **0.00200**). This specific English-register, image-grid-synchronous same-key hypothesis is weakly supported by the original data. These conditional simulations are not a test of a continuous rune-stream shared pad or of arbitrary hidden key transformations.

Runnable source-exact implementation: [`sims/physical_layout_keytests.cjs`](../sims/physical_layout_keytests.cjs). No original LP2 plaintext or key has been identified.
