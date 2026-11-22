# Base60 grid under pair-consuming ciphertext rejection

**Agent 40 · 11 November 2026 · intermediate bounded negative.** No unknown LP2 plaintext, authentic key, complete cipher mechanism, or destination was recovered.

## Why this is a distinct inverse

The existing [base60-grid keyskip Viterbi](grid-keyskip-viterbi-20261110.md) models a rejected key position only when that position itself would emit the preceding ciphertext rune. Its two-collision extension permits two such collision positions. Neither represents the separate **pair-consuming** transition documented in the external [Round24 C2 skip-by-two result](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round24/C2-skip-by-two/RESULTS.md): a rejection advances the key pointer by two (j += 2), where the first candidate would repeat the previous ciphertext and the second position is silently consumed without a collision constraint.

The same plaintext rune is held fixed across rejected attempts. If the previous accepted key index is j, then r rejected pairs place the next accepted draw at j + 1 + 2r; only j + 1, j + 3, ... must reproduce the previous emitted ciphertext. This is not equivalent to allowing two ordinary collision skips.

## Frozen source and model

- **Key source:** the original p49–51 32×8 base60 table, 256 bytes in the existing row-major transcription, reduced directly as K = byte mod 29. The existing grid SHA-256 is asserted by the reproducer.
- **Original ciphertext:** all 55 rune-bearing physical pages 0–55, 12,956 runes; page 50 is runeless. The source has 12,901 within-page transitions and 86 adjacent repeats.
- **Filter rate:** under uniform tentative GP29 output q = 1/29, the observed within-page doublet rate is r = 86/12,901. Solving r = q(1-s)/(1-q s) gives s = (q-r)/(q(1-r)) = 0.8120952009364028. This is fixed from the original source count, not tuned to language score.
- **Cipher transition:** on a tentative ciphertext collision, reject with probability s, consume the colliding candidate and one unconstrained key position, then retry the same plaintext rune. A final repeated output is accepted with probability 1-s; the Viterbi likelihood includes both log(s) and log(1-s) terms.
- **Search:** page-reset key clock; all 256 initial offsets per page; row-major and reversed row-major key; signs ±1; at most four rejected pairs per emitted rune (maximum key advance eight). The four orientation/sign configurations and page-reset clock follow the existing grid-keyskip test; each page searches all offsets. The best global configuration is selected by language score, so the reported page maxima are descriptive, not significance tests.
- **Language scoring:** existing Shakespeare-English GP trigrams and the repository's precomputed Latin-Vulgate GP trigrams. The Latin screen is an alternate scoring model, not an independently validated Latin positive-control lane.

## Positive control

A 179-rune solved-LP1 English passage beginning at the source marker “BELIEVE NOTHING” was encrypted using the actual base60 key, hidden start **0**, and the exact pair-consuming rejection loop with the fixed s. The deterministic plant contains **six** rejected pairs (maximum one pair at any output rune). The inverse recovers:

- **179/179** plaintext runes;
- the exact starting offset **0**;
- all **6** rejected pairs;
- exact forward reproduction of every original planted ciphertext rune.

This establishes that the implementation can recover a nonzero-rejection English plant under the declared transition. It does not validate the historical hypothesis.

## Original LP2 result

### English GP

| Global key order / sign | Weighted mean score (nats/rune) | Inferred rejected pairs |
|---|---:|---:|
| Reversed row-major / −1 | **−5.42235** | 366 |
| Row-major / −1 | −5.44739 | 331 |
| Reversed row-major / +1 | −5.45390 | 302 |
| Row-major / +1 | −5.46493 | 344 |

The best individual page candidates were p49 (−4.52967), p55 (−4.98989), p40 (−5.05304), p51 (−5.06839), and p7 (−5.15738). Their recovered rune sequences are not readable English; for example, the leading p49 candidate begins “S TH A U R O W M G T I U A P ...”. The global best remains far below the solved-LP1 plant score of −2.34336.

### Latin Vulgate GP

| Global key order / sign | Weighted mean score (nats/rune) | Inferred rejected pairs |
|---|---:|---:|
| Reversed row-major / +1 | **−6.09257** | 297 |
| Row-major / −1 | −6.09627 | 368 |
| Reversed row-major / −1 | −6.10309 | 341 |
| Row-major / +1 | −6.10928 | 327 |

The best individual Latin-scored page candidates were p49 (−4.97047), p55 (−5.15660), p51 (−5.60875), p32 (−5.65825), and p26 (−5.73309). Their transliterations are not readable Latin.

## Decision and limits

This closes one previously uncovered transition/key pairing: **the direct 256-byte base60 table reduced mod29 does not decode the original unknown pages as ordinary GP-English or GP-Latin under pair-consuming ciphertext rejection**, within the four tested orientation/sign combinations, page-reset clock, 256 starts, and four-pair local cap. The nonzero-rejection positive plant passes exactly.

Do not generalize this to all keyskip2 ciphers. It does not test the eight AES/ChaCha column streams, other source-derived keys, a book-continuous key clock, more than four rejected pairs per rune, other byte reductions, a different source ordering, non-GP intermediate alphabets, or a different plaintext register. No key-permutation null was run; the page maxima above are descriptive and are not global significance claims.

## Reproduction

- CommonJS / Node 22: sims/grid_keyskip2_viterbi.cjs.
- Manual-only existing workflow: .github/workflows/grid-keyskip-manual.yml, input probe=pair-keyskip2.
- Inputs: resources/liber-primus/lp2-corpus.json, resources/liber-primus/base60-grid.json, resources/control/shakespeare_first300k.txt, resources/control/latin-vulgate-gp-trigrams.json, and resources/liber-primus/lp1-plaintext-reference.txt.
- The same algorithm was executed in the connected V8 runtime against the live repository inputs, producing the reported counts and scores. The committed Node reproducer has not yet been run by GitHub Actions; the workflow is manual-only in accordance with the repository's no-per-commit-CI rule.

