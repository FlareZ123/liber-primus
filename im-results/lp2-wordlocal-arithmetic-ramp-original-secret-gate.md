# Original-word arbitrary affine arithmetic ramp: exact conditional exclusion

**Independent original-cipher experiment, Agent 2, 14 November 2026. No unknown plaintext or secret key.**

## Source-motivated finite hypothesis

The unsolved manuscript preserves ordinary printed word segmentation while displaying a near-uniform and almost adjacent-repeat-free 29-rune ciphertext. A simple reversible way to make fixed English words appear more variable without an external continuous pad is an independent secret affine arithmetic progression within each word:

`C[w,i] = a_w * P[w,i] + b_w + c_w*i (mod29)`, with every word allowed **its own arbitrary** `a_w ∈ 1..28`, `b_w,c_w ∈ 0..28`. The intended encrypted message would remain legible only after subtracting a word-specific arithmetic progression, with possibly different GP29 multiplication. This is a hypothetical human-simple decoder rather than an authenticated instruction.

For each word compute second finite differences `D2(X)[i] = X[i+2]-2X[i+1]+X[i] mod29`. Every unknown arithmetic progression `b_w+c_w*i` disappears. The unknown nonzero multiplier `a_w` is also eliminated exactly by dividing the vector of differences by its first nonzero component. Consequently **one invariant signature tests all 28×29² possible invertible secret key triples for every word**, without a search over those keys or speculative source-selected phases.

## Original and blind-positive decision

The canonical original LP2 transcript contains **2,896 complete original printed words / 12,956 unknown GP29 runes**. We tested every **343 original words of length 8–14 runes** against the same-source calibrated **29,157-entry GP-native English frequency lexicon**, allowing all possible independent `a,b,c` per word. Each original word's complete normalized second-difference signature had **zero** exact matches with any same-length dictionary word:

| Rune length | Original words | Any secret-ramp English compatibility |
| ---: | ---: | ---: |
| 8 | 156 | 0 |
| 9 | 78 | 0 |
| 10 | 52 | 0 |
| 11 | 32 | 0 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |
| **Total** | **343** | **0** |

As a blind control, 343 distinct source-native English words of the same seven actual lengths were encrypted with **independent varying nonzero multipliers, intercepts and slopes**. The invariant recognized all **343/343** source words and the independently fixed keys inverted every rune exactly. The original data and controls ran successfully under Windows Node22 GitHub Actions [run 43623047647](https://github.com/FlareZ123/liber-primus/actions/runs/43623047647). [Fully self-contained executable original-input SFT](../sims/lp2_wordramp_affine_allsecret_sft.cjs) imports the previously validated GP-native orthography and the unchanged canonical sources.

## Implication

Under original word segmentation and that GP-native English register, the entire word-local `aP+b+ci` family fails for each of the 343 tested long words, even allowing new, arbitrarily selected secret parameters per word. No direct source-selected operation or plaintext emerged. This source-conditional result excludes a distinct **nonperiodic within-word affine ramp**, which is mathematically different from the previously studied period-five secret affine masks. It does **not** exclude non-English plaintext, new vocabularies/spelling, word-boundary reshuffling, nonlinear feedback, or a high-entropy external keystream. With no evidence for such a follow-up layer, further fitting of fresh word parameters has no causal path to a reproducible decode.
