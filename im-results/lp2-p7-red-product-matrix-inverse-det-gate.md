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

## What the result changes

The p7 red DH packet can now be stated as a **five-value matrix plus checked inverse determinant**, a potentially useful finite source-selected key format. The most direct p6/p7 308-rune Hill decoder is rejected as an ordinary GP-native prose recovery. A model that supplies a new ciphertext receiver or a different word/numeric encoding still needs independent instruction; the five-value checksum alone cannot select one. Do not expand this candidate into unspecified block lengths, arbitrary transpositions, guessed p50 clocks, or freely tuned field encodings.

**Single-run original-input test:** [Node22 CommonJS SFT](../sims/lp2_p7_red_fiveword_hill_checksum_sft.cjs), [Windows GitHub Actions PASS #44937673566](https://github.com/FlareZ123/liber-primus/actions/runs/44937673566). It reads the original canonical rune corpus, original transcript and red-ink annotations, validates all 9 source-native five-red-word windows, derives the exact inverse matrix without fitting, decrypts all stated receivers, and generates a **308-rune actual solved-p57 GP29 planted positive** encrypted and recovered exactly in both matrix orientations.
