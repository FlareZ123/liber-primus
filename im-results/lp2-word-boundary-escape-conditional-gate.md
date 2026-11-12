# Original LP2 word-boundary escape: source-conditional heldout inverse

**Decision (12 November 2026, Agent24; Director #604):** A fully reversible low-state GP29 predecessor-exclusion cipher using **printed word ends** to transmit the missing 29th plaintext choice fails on authentic LP2. Its frozen inverse leaves original LP2 at near-uniform GP29 frequency, and neither the training nor the heldout original contains the predicted source-conditioned boundary signal. By contrast, an independent planted English-GP message recovers **all 12,956/12,956 plaintext runes**, including escape states, and passes exact reciphering. The negative is conditional on this explicit finite model; no unknown plaintext, original key, or cipher mechanism was recovered.

## Human-visible premise

The 55 rune-bearing unsolved LP2 physical pages (p0–55, excluding runeless p50) contain 12,956 GP29 runes but only 86 adjacent doubles among 12,901 within-page adjacent pairs. A hard predecessor-exclusion emitter has just 28 output choices and requires external side information to reversibly encode unrestricted 29-symbol plaintext. The source's 2,896 original printed word boundaries are individually visible and have ample theoretical capacity, as quantified separately in [the channel-capacity report](lp2-no-repeat-source-visible-channel-capacity.md). This is a *plausible candidate carrier* rather than an author-selected instruction.

Original inputs: [physical-page GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [printed transcription with word punctuation](../resources/liber-primus/lp2-transcription.txt). The program asserts all 12,956 original runes, original pages, and 2,896 words. Printed line-slash and physical page-percent marks preserve words, including genuine cross-page words, whereas punctuation terminates words.

## Frozen reversible mechanism

At page start, copy P0 to C0. At each following position i let s be the preceding *emitted* cipher symbol C(i−1), p be the plaintext GP index, and b(i) be whether a printed word boundary appears **after** the current emitted rune.

- If p equals s, normally emit C(i)=(s+1) mod29 with b(i)=1: the gap disambiguates a plaintext repeat from the ordinary visible successor. As a frozen source-shaped exception, at (i+31×page) mod5 = 0 emit a literal repeat C(i)=s.
- If p=(s+1) mod29, emit C(i)=p and force b(i)=0.
- For all other p, emit C(i)=p and retain the cover page's original gap bit.

The decoder, with no private key, is the exact rule: **P(i)=C(i−1)** when **C(i)=(C(i−1)+1) mod29 and b(i)=1**; otherwise **P(i)=C(i)**. All first page symbols are copied. The fifth-site exception is only a deterministic control proxy for occasional literal repeats, not a recovered Cicada convention. Encoding can change word boundaries; it does not preserve English plaintext word positions.

Two diagnostics were frozen before original-source evaluation: directional word-end-rate contrast between +1 predecessor transitions and other transitions; and conditional mutual information I(wordEnd;successorTransition | previousRune) in bits. Train on original pp0–39, hold out original pp40–55. The matched null makes a randomized Euler trail through each physical page's **same exact directed 29×29 observed bigram multigraph**. It preserves page length, first/last rune, exact rune histogram, every ordered adjacent bigram including all 86 source doubles, and all page/line/word-gap coordinates. Only the rune-to-gap coincidence changes. The Euler sampling is *not claimed* uniformly distributed over all distinguishable trails.

## Exact original-input result

The independently selected plant uses native-GP-encoded Shakespeare with identical 55 source page lengths, using exact original word-gap coordinates as cover. It emits **339 forced successor-and-gap escapes** and **81 literal doubles**, close to the original 86 doubles. The recovered planted plaintext matches every one of its 12,956 input runes, the reverse forward cipher matches the entire planted cipher/gap arrays, and its original plaintext has native-GP IoC **0.06106332**.

| Source and split | Adjacent pairs | Successor (+1) | Successor with gap | Boundary-rate contrast | Conditional MI (bits) | Matched null MI upper p |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Planted** pp0–39 | 9,600 | 815 | 252 | **+0.08507041** | **0.02734842** | **0.00621** |
| **Planted** pp40–55 | 3,301 | 245 | 87 | **+0.13193450** | **0.02591604** | **0.00621** |
| **Authentic LP2** pp0–39 | 9,600 | 358 | 70 | **−0.03028620** | **0.00231008** | **0.56698** |
| **Authentic LP2** pp40–55 | 3,301 | 99 | 23 | **+0.01183604** | **0.00591406** | **0.83489** |

The plant's one-sided directional contrast conditional p is **0.00621** separately on both splits; original upper-tail contrast p is **0.91589** (training) and **0.37383** (holdout). Plants each use 160 conditional null trails; original splits each use 320, with fixed, independent seeds and the standard +1 exceedance correction. The original contrast switches sign between training and heldout. The English control generates 1,060 successor events in total, whereas the actual source has only 457: a further key-free model disagreement.

Under the predeclared decoder, authentic original plaintext candidate IoC stays **0.03447427** (training) and **0.03446738** (heldout), matching respective original ciphertext IoC **0.03447436** and **0.03446283**. Plant decoded native GP IoCs are **0.06174818** and **0.05983949**. No coherent unknown original text emerges.

## Research consequence

Retire this exact **predecessor +1 successor gap-bit escape mechanism**, including its fixed deterministic literal-repeat exception. The source requires a different explicitly identified side channel, a cipher with more than 28 available per-state outputs, or a separate intermediate alphabet for an invertible 29→28 exclusion decoder. Unspecified secret maps, different boundary positioning, multi-state/variable-length codes and external media remain open. The next useful result would derive an actual source-selected escape mapping and recover a *withheld original rune or plaintext phrase*, rather than selecting an additional statistical correlation.

Reproducer: [single-file CommonJS SFT](../sims/lp2_word_boundary_escape_sft.cjs), Node.js 22, built-ins only. Its original-source and positive-control assertions passed in [manual Windows GitHub Actions run #43263808992](https://github.com/FlareZ123/liber-primus/actions/runs/43263808992); source workflow [here](../.github/workflows/lp2-word-boundary-escape-manual.yml).
