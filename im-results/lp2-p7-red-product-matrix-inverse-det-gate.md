# P7 red five-word products form a GF29 matrix with an exact inverse-determinant check

**Agent45, 21 November 2026. Provisional new algebraic packaging, direct source-selected decryption negative.** This is an additional test of an existing p6/p7 *DH-inverse packet*, which Agent20/others had already found. It recovers **no unknown Liber Primus plaintext**, key identified as historically intended, cipher operation or endpoint.

## Why an actual human could try the matrix

The original p7 page has one *complete* **14-rune red inscription containing five separated GP29 words** at local offsets194–207. Its previously recovered wordwise GP-index **products modulo29** are precisely:

`[11, 26, 8, 15, 2]`.

The existing [DH inverse-packet report](lp2-p6-p7-reversed-red-boundary-gate.md) interprets these as `[A^-1,B^-1,A,K^-1,K]` for authenticated 2013 DH23 example `A=8,B=19,K=2`. That is prior work. A new interpretation of the **same fixed five source values in printed order** is the simplest matrix key / inverse-determinant serialization commonly used by a 2×2 Hill cipher:

```text
M  = [ 11  26 ]     det(M) = 11*15 - 26*8 = -43 ≡ 15 mod29
     [  8  15 ]

fifth red word = 2          15*2 = 30 ≡ 1 mod29

M^-1 = 2 * [ 15 -26 ] ≡ [  1   6 ] mod29
           [ -8  11 ]   [ 13  22 ]
```

Thus the **fifth printed word exactly equals the inverse determinant** of the first four words when treated as a row-major GF29 matrix. No plaintext scoring is used to choose or fit these values. This is a mathematically valid, invertible *candidate* operation, not proof the author intended the packet as a Hill key. The already-known inverse-pair pattern [11,8] and [15,2] makes this new relation a correlated observation; the optional resemblance of decoder entries 6 and13 to existing DH/dot counts is post hoc and is **not** used as evidence.

**Small source control.** Among source annotation red spans, only p7 (five complete red words) and p53 (twelve) can contain an intact consecutive five-word product packet. The eight p53 five-word windows all fail the same exact inverse-determinant identity. This is 1 hit among 9 already selected windows, without any discovery-wide calibration; it is insufficient to distinguish intended design from a coincidence.

## Frozen original-text decision

The original p6 and p7 red 13-dot punctuation places an especially inexpensive test receiver between marker-bracketed red passages. Exactly **114 physical p6 runes after its red closure** and **194 p7 runes before its red opening** give an even **308-rune** continuous interval, containing 71 complete page-local word slots. The same published source positions underlie the earlier six-rune difference-pad test; the Hill test changes the cryptographic *operator*, using the five printed p7 values for the complete 2×2 key.

Invert consecutive original GP29 ciphertext pairs with `M^-1` (four deterministic traversal conventions: original/reversed and matrix/transposed), treating the p6-only, p7-only and joined 308-rune intervals as independent, source-visible receivers. These outputs all remain near uniform, with IoC **0.03232–0.03560** compared with **0.03435** for the unchanged joined ciphertext. One standard original-reading, untransposed direct inverse starts:

`THSRSTELIAIAGIYHUBNGWACFOAEOEEOEORYY...`

The 308-rune inverse yields no readable source-native text. Reversing physical rune order or transposing the matrix does not alter the negative result.

The signed 2016 phrase about the book's **word numbers** suggests one alternative *typed* receiver: apply the same matrix to consecutive source word GP0 sums or GP-prime sums, modulo29, at phase0 or phase1. The 71 original marked-body words produce 70-runic readouts with IoC **0.03147–0.03851**, again well below the original solved-runic native control (about **0.06139**). This is an explicit bounded negative for the direct word-number consumer, with no language-fitted offset.

## Source-packet matrix as a true recurrence key (exact F-transparent obstruction)

A distinct, highly constrained reversible candidate uses `M` or `M^-1` as a **two-element GF29 state-transition matrix**, initialized with the independently recovered DH public pair `[A,B]=[8,19]`. The state is visible in the same red products: `A=p7[3]=8`, `B=(p7[2])^-1=26^-1=19` in one-based natural language (zero-based indices 2 and1). Flatten each successive two-element state into an additive GP29 pad. The matrix has characteristic roots `16` and `10` in GF29 of multiplicative orders7 and28, respectively; its **exact order is28**, so the two-coordinate stream is periodic with length **56 runes**. This rules out an unmodified long nonperiodic stream; no hidden seeds are fitted.

Apply this exact source-selected state to the same **308 original ciphertext runes**, both original GP29 additive signs, with the solved-p56 *literal plaintext F is emitted as F and consumes no key slot* convention. The inverse is an exhaustive 56-phase reachability calculation; when ciphertext F is encountered it deliberately preserves **both** the bypass and any legal consuming non-F branch. If no phases survive, the model is impossible even without English scoring.

| State transition | Sign in `P=C±K` | First original rune offset within the 308-rune receiver with no legal inverse |
| --- | ---: | ---: |
| `M` | − | **50** |
| `M` | + | **17** |
| `M^-1` | − | **4** |
| `M^-1` | + | **9** |

All contradictions occur **inside the 114-rune p6 section**, so they do not depend on how p7 restarts the key. A **308-rune solved-p57 planted plaintext** was encrypted with each source matrix orbit and the exact plaintext-F non-consuming rule; the identical exhaustive inverse retains a legal path through every planted rune for all four variants. This is a structural rejection, stronger than the flat-IoC direct Hill negative, of the **two specific source-derived initial states and matrix transitions under the demonstrated F bypass**. It cannot reject a different, independently instructed seed, nonadditive input mixing, reset, or transition function.

## What the result changes

The p7 red DH packet can now be stated as a **five-value matrix plus checked inverse determinant**, a potentially useful finite source-selected key format. The most direct p6/p7 308-rune Hill decoder is rejected as an ordinary GP-native prose recovery. A model that supplies a new ciphertext receiver or a different word/numeric encoding still needs independent instruction; the five-value checksum alone cannot select one. Do not expand this candidate into unspecified block lengths, arbitrary transpositions, guessed p50 clocks, or freely tuned field encodings.

**Single-run original-input test:** [Node22 CommonJS SFT](../sims/lp2_p7_red_fiveword_hill_checksum_sft.cjs), [Windows GitHub Actions PASS #44937673566](https://github.com/FlareZ123/liber-primus/actions/runs/44937673566). It reads the original canonical rune corpus, original transcript and red-ink annotations, validates all 9 source-native five-red-word windows, derives the exact inverse matrix without fitting, decrypts all stated receivers, and generates a **308-rune actual solved-p57 GP29 planted positive** encrypted and recovered exactly in both matrix orientations.
