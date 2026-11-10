# LP2 joint forward-generator challenge: cross-word coupling is decisive

**Status:** executable structural model comparison, 2026-11-10 (Agent 39). This is **not** a decryption and does not identify Cicada's actual cipher. One fitted repair model reproduces several high-priority ciphertext constraints simultaneously; it leaves selected longer-range echoes unexplained.

## Shared source-side contract

`sims/lp2_forward_model_challenge.cjs` consumes the established `sims/lp2_word_pages.cjs` parser and the physical `resources/liber-primus/lp2-corpus.json` pages. The synthetic output maintains all **2,896 whole-word rune lengths** and original **55 rune-bearing page lengths**, including **32 words split across physical page boundaries**, the numeric-only page 50 with no runes, **12,956 unsolved runes**, and the **nine** section intervals from the master transcription. Every whole word remains intact when a page ends. The parser's exact 63/23/526/86 real statistics are asserted.

For each synthetic replication, independent words are sampled with replacement from original Shakespeare GP-encoded occurrence tokens conditional on **each exact ciphertext word length**, preserving a realistic English-register letter and word-shape source while decoupling lexical order. Five forward transformations are applied to the same synthetic source word array:

- **Plaintext:** leave the matched-length source words unchanged.
- **IID pad:** add independently uniform modulo-29 key symbols, with no repeat repair.
- **Global rewrite:** independent modulo-29 pad; when the generated ciphertext symbol repeats its *immediately preceding ciphertext symbol*, with probability **0.81** replace that symbol uniformly by one of the other 28. The previous-symbol state carries across word and page boundaries.
- **Word-local rewrite:** identical, but reset the previous-symbol state before each word.
- **Global counter-6:** continuous additive modulo-29 counter increasing by 6 per rune, no rewrite.

All 250 trials per family use the fixed xorshift32 random stream seed `0x3901a7d0`. The **0.81** overwrite probability is a model choice motivated by the observed deficit of adjacent duplicates, so agreement with the doublet counts is **partly fitted** and cannot independently validate this hypothesis.

## Joint source and output measurements

| Constraint | Original LP2 | Length-matched English, no cipher | IID mod29 pad | Global .81 rewrite | Per-word .81 rewrite | Global additive step6 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Within-whole-word repeats, 10,060 pairs | **63** | 329.4 | 347.9 | **65.7** | 65.3 | 262.1 |
| Repeated cross-word boundaries within sections, 2,887 pairs | **23** | 118.4 | 99.0 | **18.4** | 100.6 | 80.4 |
| Nonadjacent matching pairs within 1,536 words length 4–9, 14,701 opportunities | **526** | 708.3 | 504.8 | **513.3** | 511.5 | 556.3 |
| Repeated adjacent runes within 55 physical pages, 12,901 pairs | **86** | 446.0 | 445.3 | **83.8** | 165.2 | 341.2 |

All synthetic columns are 250-replication arithmetic means. The main comparison uses the **maximum of four standardized absolute deviations** from the simulation means and standard deviations, calibrated against the same model's 250 synthetic replicates. The global-rewrite model's observed four-statistic maximum is **1.0828**, empirical tail **167/251 = 0.66534**. Plaintext, IID pad, word-local rewrite and step6 each produce maximum standardized departures of **16.61, 16.27, 7.89 and 12.80**, respectively; their observed maxima exceed all 250 corresponding simulated maxima (empirical upper-tail floor **1/251 = 0.003984**). These are conditional model checks, with parameters and model families selected during exploratory research.

The matching model is also compatible with the corpus-wide symbol and cross-page positional summaries (the actual Pearson frequency chi-square is **26.36**, simulated global-rewrite mean **26.19**, and the actual page-position equality rate **0.0345545**, simulated mean **0.0344928**).

## Unresolved independent information

The two previously selected local echoes remain visibly outside the simple source-independent rewrite model:

| Exploratory diagnostic | Actual LP2 | Global rewrite mean (SD) |
| --- | ---: | ---: |
| 6-rune word-local affine relation `C[i]=(24−2 C[i−6]) mod29` | **80** | **44.16 (6.14)** |
| Five-rune separation with GP rune S at both ends | **11** | **2.54 (1.58)** |

These lag families and the affine mapping were previously *selected from real ciphertext*, so the table does not confer a fresh independent statistical significance claim. Nevertheless, the synthetic model does not reproduce those observed counts. A stronger construction should predict at least one of them in a way that is genuinely held out and explain its mechanism. Moreover, this simulation makes ciphertext and plaintext lengths equal; it does not address possible padding, sections with distinctive source registers, unknown nonlinear symbols or decryption keys.

## Architecture consequence

Within the precisely defined independent-pad plus sparse adjacent-rewrite class, a **globally persistent previous-symbol state** simultaneously explains the extreme intra-word and word-boundary repeat suppression. A word-reset variant cannot explain the cross-boundary 23/2887 ratio, even though it matches the within-word 63/10060 ratio. This narrows plausible state reset policies. It is a **forward-compatible null model**, not evidence that Cicada actually uses this specific rewrite rule; any competing mechanism that reduces repeats across boundaries while keeping nonadjacent equality near chance remains possible.

Reproducer: `node sims/lp2_forward_model_challenge.cjs 250`. Successful [CI run 42760430495](https://github.com/FlareZ123/liber-primus/actions/runs/42760430495), on-demand workflow `.github/workflows/lp2-forward-model-challenge.yml`. All detailed 95% simulation ranges, frequency statistics, phase rates and selected-echo counts are preserved in the run artifact. Earlier CI run 42760191176 had an incorrectly inferred section partition and was superseded by the passing run; the workflow now propagates script failures through its output pipe. Do not present historical early-run status as a passing model evaluation.
