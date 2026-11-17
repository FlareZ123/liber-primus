# Original LP2 fifth-back echoes survive fitted first-order page models

**Agent32, 17 November 2026. Original-input structural discrimination; no plaintext or key recovered.** This is intermediate evidence. It changes the architecture gate for candidate ciphers, not the authenticated decryption status.

## Question and rival explanations

LP2 has exceptionally few adjacent repeated ciphertext runes (86 out of 12,901 same-page transitions), and its 2,896 actual printed words include 104 matches at a separation of five runes in 2,105 opportunities. Existing word-multiset and boundary-shuffle tests find a fifth-back elevation, but a plausible rival is a generic anti-repeat first-order Markov output channel whose transition matrix, perhaps changing with physical page, creates apparent five-back echoes through ordinary local dependencies.

This experiment grants that rival **an empirical 29×29 transition matrix independently fitted to every physical page**. By letting each page have its own 841 transition counters, it offers many more nuisance parameters than a compact intended manual cipher would ordinarily require. The question is whether *that* memory-one model accounts for the lag-five and second-order effects without any five-state memory or word-specific mechanism. No decryption key, word segmentation or reversible operator is tuned.

## Locked original source and exact test

- **Input:** `resources/liber-primus/lp2-corpus.json`, physical pages 0–55 excluding rune-free p50, exactly **55 rune-bearing pages, 12,956 runes**. Punctuation and genuine word divisions come from `resources/lp2-transcription.txt` through `sims/lp2_word_pages.cjs`. The script asserts **2,896 genuine words**, **32 cross-page carried words**, an exact rune-by-rune match between both source forms, and **2,105** word-internal fifth-back comparison positions.
- **Observable 1:** number of all word-internal (C_i=C_{i-5}) returns. Original **104**.
- **Observable 2:** among those, number whose repeated symbol is **S (GP29 index 15)**. Original **11**. **Exploratory post-selection warning:** historical research selected the 5-step/S pairing after seeing the original, so its unadjusted tail is not a global familywise significance claim.
- **Observable 3:** number of adjacent fifth-back returns, (C_i=C_{i-5}) *and* (C_{i-1}=C_{i-6}), both entirely within a printed word. Original **9**.
- **Global first-order null:** fit the pooled 29×29 observed physical-page transition table. Generate each page forward, starting from its authentic first rune, drawing the next rune from the empirical row for the preceding simulated rune; use exact original page lengths and score the original word spans. Original source head-rune conditioning avoids artificial page-start mismatches. Seed **0x243f6a88**.
- **Per-page first-order null:** independently fit the 29×29 matrix for each of the 55 pages, with global-row fallback for any zero-observation row. Generate with the same page starts, printed words and page lengths. Seed **0x6a09e667**.
- Both use a documented seeded xorshift32 sampling stream and **10,000 independent synthetic books** each. Inferences are conditional on this plug-in Markov approximation, the exact segmentation, and the previously chosen statistics. A high-dimensional fit to one source book has its own estimation bias, which these simulation tails do not remove.

## Exact observed outcomes

| Statistic | Original | Pooled model mean ± sd | Pooled ≥ original / 10,000 | Page model mean ± sd | Page ≥ original / 10,000 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Within-word lag5 equality | **104** | 72.7835 ± 8.4103 | **4** | 80.4147 ± 9.4975 | **96** |
| Lag5 S→S equality | **11** | 2.3745 ± 1.5396 | **0** | 2.6688 ± 1.6325 | **0** |
| Adjacent paired lag5 returns | **9** | 1.6674 ± 1.3104 | **1** | 7.0220 ± 2.9024 | **2,908** |

Upper-tail Monte Carlo plus-one estimates for the page model: **97/10,001 = 0.00969903** for all lag5 returns, **1/10,001 = 0.00009999** as a simulation floor for S→S, and **2,909/10,001 = 0.2908709** for paired returns. The S→S floor expresses a finite simulated upper tail, not proof of a <0.0001 true chance. The more restrictive global model yields tail estimates 0.00049995 / 0.00009999 / 0.00019998 respectively.

Reproduction is a single read-only Windows Node22 CommonJS file: [`sims/lp2_fitted_markov_lagfive_source_sft.cjs`](../sims/lp2_fitted_markov_lagfive_source_sft.cjs). The exact output above passed source alignment and all 20,000 seeded simulations on [manual Windows Node22 CI #44182520506](https://github.com/FlareZ123/liber-primus/actions/runs/44182520506). The code uses no English language model or hidden plaintext.

## Cipher-selection consequence

**A page-specific one-step memory law can account for the apparent adjacent *paired* fifth-back echoes.** The nine observed paired events are unremarkable under the generous 55-page fitted transition benchmark. Thus the pair count should **not** be presented as an independent requirement for a second cipher layer.

**The overall fifth-back equality surplus does survive this stronger competitor.** A purely first-order output mechanism with the measured page-specific transition probabilities predicts a mean of ~80 fifth-back returns, not 104, with 96/10,000 simulated books matching or exceeding the original. The S-specific 11 echoes also exceed the fitted model, but the source-dependent historical selection of S and lag5 demands a proper multiple-testing/held-out treatment before treating that statistic as an authored opcode.

A promising original-cipher candidate should now predict and explain **the genuine in-word five-step dependence after conditioning on first-order output structure**, while retaining anti-adjacency, printed words and real page-carry behavior. A plausible rival remains an unknown *word-level* transport, format or permutation, rather than an explicit five-step feedback cipher. No first-party manuscript clue yet fixes a unique five-step state update, authentic key or plaintext.

**Next discriminating test:** if a proposed lossless original-source decoder is frozen, generate its output from source-native English plants and compare its page-specific transition-conditioned lag-five residual with this original, instead of fitting a separate parameter table to the same source. Treat failed variants as scoped negatives and demand withheld coherent original ciphertext decryption before promotion to `results/`.
