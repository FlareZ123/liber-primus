# Page-local printed-word ordinal as an arbitrary shared GP29 pad: blind source attack

**Agent28, 22 November 2026. Result: original-source negative under three specified reuse models, with native-plaintext recovery controls.** No unknown LP2 plaintext, authentic cipher key, decoder, or destination was recovered. The new model is a **word-addressed key clock**, distinct from the previously excluded common **page-local rune-position pad** (see [that report](lp2-reused-pagepad-manytime-original-gate.md)). This is an experimental research constraint, not a first-party-selected cipher operation.

## A concrete original-cipher route to plaintext

The authenticated 2016 message calls the book's *words* a map and their *numbers* a direction. A 2014 solver might plausibly put the same key register at the same *printed word ordinal* on each physical LP2 page, even though page word lengths differ. A repeating key shared by all 55 encrypted pages would be breakable **without first finding the historical key**, because 55 independent plaintext samples contribute to each repeated state. This interpretation is a motivated hypothesis; neither the signed message nor the 2014 original states that such a key is reused.

Let `p` be physical page, `w` its printed-word ordinal starting from zero, and `k` the zero-based rune offset inside that printed page-word fragment. Try three nested or closely related models:

- **M1:** `C[p,w,k] = P[p,w,k] + K[w] (mod29)`. The entire word uses one arbitrary secret GP29 shift; that shift repeats at the same word ordinal across pages.
- **M2:** `C[p,w,k] = P[p,w,k] + K[w,k] (mod29)`. Every word-ordinal/letter-position pair has its own unrestricted secret shift, reused across pages.
- **M3:** `C[p,w,k] = P[p,w,k] + K[w,k] + S[p] (mod29)`. M2 with an **additional completely arbitrary unknown additive salt per physical page**.

All three operate on exactly the original full ciphertext runes; they introduce no invented words or altered rune transcriptions. The different per-page lengths and original printed punctuation, including words carried through line/page breaks, are kept. The page-local clock deliberately restarts at each physical page, so the 32 original cross-page word continuations are treated as **two page-local fragments**. This is a specified model choice and a limitation rather than a corrected transcription.

## Exact source and blinded inverse

The fixed source is [the canonical original GP29 vector](../resources/liber-primus/lp2-corpus.json) and [page/word-boundary transcription](../resources/liber-primus/lp2-transcription.txt). The latter contains no rune-free segment for physical **p50**: original source-segment index50 is physical p51. The parser explicitly accounts for that omission, verifies **every one of the 12,956 original source runes** against its canonical page, and measures **2,928 physical page-word fragments** on **55** rune-bearing pages. This physical-fragment count must not be confused with the previously established **2,896 whole words** across page carries.

For M1 and M2, train **all** free GP29 key shifts independently using four of five page folds: choose the maximum-likelihood GP29 subtraction residue for each observed shared key state, using an unfitted source-native unigram distribution from the [published solved LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt). The reference supplies **2,979** available GP-native rune tokens from **768** words (0.5 count pseudocount per GP symbol). Then decode and score **only held-out physical pages** from the remaining fold, cycling all five folds. A rune never contributes to its own key estimate.

For M3, **eliminate all key values without fitting them**:

```text
C[p,w,k] - C[q,w,k]
  = P[p,w,k] - P[q,w,k] + S[p] - S[q]   (mod 29)
```

Across every shared word-ordinal/offset state in each original page pair, estimate the likelihood of this observed difference under the **fixed GP-native reference difference distribution**. Optimize all **29** salt differences separately for **each pair**. This intentionally favors M3: it does not even enforce that the best salts across 1,485 page pairs are globally consistent, and it permits an arbitrary, **aperiodic** shared key value at every distinct word/rune coordinate. No guessed key length, chosen plaintext target, or phase tuning enters this necessary-condition test.

## Original outputs versus genuine source-shaped positives

The same executable creates a deterministic independent GP-native English **plaintext word of the same length for every original printed page-word fragment**, choosing it from the solved LP1 source. It forward-encrypts all 12,956 positions under fresh random shared keys for M1/M2 and per-page salts for M3. The planted ciphertexts retain the original page lengths and exact printed word boundaries. Known-key inverse recovers the complete planted rune sequence, and the blind language-based recovery is evaluated on those plants by exactly the original procedure.

| Test | Original 2014 ciphertext | Source-shaped positive | Natural comparison |
| --- | ---: | ---: | --- |
| **M1** fivefold held-out decoded mean GP log likelihood | **−4.274866** | **−2.966942** | Blind gain over untreated C: **+0.006153** original versus **+1.279331** plant |
| **M2** fivefold held-out decoded mean GP log likelihood | **−4.311809** | **−3.049464** | Blind gain: **−0.029919** original versus **+1.186657** plant |
| **M3** salt-free pairwise native-difference mean log likelihood | **−3.359524** | **−3.326343** | Independent-pad source-shaped null **−3.359581** |

M1 evaluates **12,951** actually held-out symbols and ~**70.6** training states/fold; M2 evaluates **12,846** held-out symbols and ~**701.2** states/fold. M3 evaluates **218,980 shared original word-position comparisons** across **all 1,485 page pairs**; its approximate uniform baseline is `−ln(29)=−3.367296`. The unchanged source falls essentially on the independent-pad null. The same run's genuine secret page-salt and aperiodic shared-key plant is substantially different. The salt-free original failure cannot be repaired simply by choosing an unknown value of `K[w,k]` or giving each physical page its own secret Caesar salt.

The original-specific counts, fivefold scores, all 29 salt shifts per page pair, seed `0x28c13301`, source-shaped plants, full known-key forward/inverse replay, and explicit assertions are preserved in the [single-file Windows Node22/CommonJS reproducer](../sims/lp2_reused_wordordinal_pagepad_source_sft.cjs). It passed actual original-input [GitHub Actions run 45085936195](https://github.com/FlareZ123/liber-primus/actions/runs/45085936195).

## Research decision and scope

**Retire these precise word-ordinal page-reused additive pad models as explanations for ordinary GP-native English on the original pages.** The signal one would exploit to recover the unknown language and arbitrary shared key is present in genuine source-native plants and missing from the unaltered original. This avoids wasting effort guessing a word-index key, independent page salts, or new offsets for an intrinsically unsupported reuse architecture.

The outcome does **not** reject independently keyed pads per page, an externally sourced high-entropy key, page-dependent word permutations or altered reading clocks, variable-length/constraint-coded plaintext, special transparent runes, or non-English intermediary text. Those alternatives need an original clue choosing the operation and a positive original-cipher plaintext result. The direct objective remains recovering a source-selected, reproducible full-paragraph inverse, not tuning another reuse model to a few favorable numbers.
