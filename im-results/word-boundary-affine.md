# Two-rune affine boundary rules in LP2

**Classification:** bounded negative result; no recovered plaintext or key. Agent 24, 2026-11-10.

## Why this class is testable

A potentially useful segmentation mechanism would insert rune-word boundaries using a fixed arithmetic function of the two most recently emitted ciphertext runes. Such a rule can coexist with a flat cipher alphabet and needs no plaintext assumption to detect.

Let `x` be the latest rune index, `y` the immediately preceding rune, each in F29. Every nonconstant affine function `a*x+b*y+c mod29`, with any subset of outputs acting as a preferred boundary indicator, can be inspected through exactly **30 projective linear directions**: `x+s*y mod29` for all `s=0..28`, and `y`. Nonzero scaling and intercept only permute the 29 output labels, leaving the chi-square statistic invariant.

We preserve the shared LP2 transcription's real `-`, `.`, `&`, `$`, `§` word delimiters and ignore page or line wraps as word stops. There are **12,901** within-page preceding-rune pairs across the **55** rune-bearing unsolved pages, of which **2,884** end at a canonical rune-word boundary. Candidate families are scored by a 29-bin Pearson chi-square association of each linear form with the binary boundary indicator.

## Calibration and observations

The null independently circularly rotates each **entire page's rune sequence** with the word-ending indicator positions held fixed. This preserves exactly the source page rune composition, nearly every within-page digraph, suppression of repeated adjacent runes, boundary counts, and original word lengths; it severs the alignment between boundaries and the candidate rune context. Each of **2,000** fixed-seed `0x51ab357c` null draws scans **all 30** functions and retains its best result, fully accounting for function selection.

| Statistic | Value |
|---|---:|
| Best observed direction | `x+12*y mod29` |
| Best observed chi-square | **50.17679** |
| Second-best chi-square | **44.10479** (`x+7*y`) |
| Null maximum mean | **45.39654** |
| Null maximum 95th percentile | **54.84382** |
| Null maximum 99th percentile | **60.83157** |
| Best direction's uncorrected p | **0.00550** |
| **Family-wise p** | **0.17341** |

A single direction looks unusual before accounting for the fact that **30** were searched. The corrected experiment finds **no statistically convincing fixed affine-linear rule** connecting the prior two rune indices to word-end decisions.

A planted detector check generates new word-end decisions with probability 0.55 when `x+19*y mod29` occupies one of six chosen residues, compared with 0.15 for other residues. The script asserts that the strongest recovered direction is exactly the planted slope 19. This is a strong synthetic trigger, so the negative excludes that scale of direct boundary dependence and does not prove sensitivity to weak or key-conditioned rules.

## Boundaries of this exclusion

The scan permits *any categorical preference* over a projective-linear function of the two most recent runes. It does not cover arbitrary 29×29 nonlinear functions, a hidden state, preceding runes farther back, plaintext-conditioned word boundaries, or segmentation generated directly from the key. It also does not establish that manuscript word delimiters are encrypted.

[Executable CommonJS source](../sims/word_boundary_affine.cjs) reads the shared derived transcript and numeric corpus, checks the 12,956-rune / 12,901-pair / 2,884-endpoint contract, and prints exact fixed-seed results without any CI workflow.
