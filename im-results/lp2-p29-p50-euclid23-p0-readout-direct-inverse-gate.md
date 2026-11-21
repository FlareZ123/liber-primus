# P29 ÷ p50 GF29 first quotient: source-derived 23-symbol key fails two p0 READOUT receivers

**Agent38, 21 November 2026. Classification: exact original-input quotient, bounded negative source-key consumer; no recovered unknown-page plaintext.**

## Mechanism candidate and independent source selection

The authenticated 2016 `THE DIRECTION` sequence already selects original p29 through its unique shared repeated GP29 root with the 256-cell p50 table. P39's red triad fixes the independent quadratic factor `15(X−24)^2` over GF29; the canonical original p29 polynomial and table polynomial share that exact factor. The first Euclidean *division* between those two original objects is an inexpensive, reproducible operation not among the prior 21-character surplus-key or Bézout second-stage tests.

Interpret printed p29's **277 rune indices** as high-degree-first coefficients of A(X). Interpret the original p50 table's **256 raw bytes modulo29** as the high-degree-first polynomial B(X). B's original leading byte is **203≡0 mod29**, so the actual degrees are **deg A=276, deg B=254**. Ordinary GF29 long division now produces a **unique 23-rune first quotient** Q and a 254-coefficient remainder:

`A(X) = Q(X)·B(X) + R(X)`, `deg Q=22`, `deg R≤253`.

The nontrivial fact is that the **23-coefficient width is fixed solely by the original source lengths and leading zero**, matching the independently signed 2013 DH prime23 and both p0 exact 23-rune windows previously selected by the p28 READ OUT → p50 address navigation. The match motivates a candidate but is not evidence that the creator intended polynomial division, which the source never names.

The exact source-first quotient in printed high-first order is:

`[27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]`

Romanized GP rune indices: `IALRBTETJHEAETCDEOIHAEXXSLB`. This sequence is not a recognizable GP English instruction. A full GF29 product-plus-remainder reconstruction matches all **277 original p29 coefficients exactly**.

## Complete original-cipher receiver test

Use each independently selected **p0 23-rune receiver** (zero-based offsets80–102 and166–188) as printed. Decode by `P_i = C_i ± Q_i mod29` with exactly two key orientations (printed and reversed), phase0 at each selected receiver's first physical rune, and no fitted shift or phrase. This gives eight fixed computations. A solved-p57 **23-rune native-GP control** scores −2.16888 in the frozen LP1 GP-native trigram model, whereas untouched p0 receiver80 scores −3.46146. The eight inverses are:

| Receiver | Q direction | Sign | GP trigram log likelihood per rune | Result |
| --- | --- | --- | ---: | --- |
| 80–102 | printed | subtract | −3.65175 | `DCIAOENMIALCWHPTJEANGTDAEWAWN` |
| 80–102 | printed | add | −3.67655 | `MTGIAEOYUPNGCSTYEADEOOSAGAEEX` |
| 80–102 | reversed | subtract | −3.58792 | `RCTAEJEOGNGUEONGPOGOLHUDRGWEA` |
| 80–102 | reversed | add | −3.81013 | `NTBAIROEEOAEFTHTIRMPJHYNXEA` |
| 166–188 | printed | subtract | −3.61749 | `EAAENOESCAJFNGIPNTHUAEGRGOEYAEH` |
| 166–188 | printed | add | −3.48615 | `AWBIAEEOIARTMBTMMAETOEAECNGIAWP` |
| 166–188 | reversed | subtract | −3.51307 | `NAEIAAEBIAOEOAEYDPAEYCAIAJRMHAEIA` |
| 166–188 | reversed | add | −3.45878 | `XWEAATMMOLXRTOANGBUEWATWD` |

**None contains a coherent 23-rune English phrase, specified operation, or independently recovered cipher key.** Both signs and orientations exactly reencipher their own original 23 GP29 ciphertext runes; native solved-p57 planted controls recover 23/23. These confirm implementational correctness only. All eight scores are well below the original solved positive and at or below the original ciphertext noise floor. In particular, the strongest score is merely −3.45878, effectively the ciphertext baseline −3.46146 and textually meaningless.

## Research decision

**Retire the natural source-first Euclid-quotient 23-rune repeating/additive-key transfer to the two source-selected p0 READOUT windows.** The mathematical Q is unique given original source and coefficient convention; its existence and size are consequences of lengths, and it does not independently prove a cipher or decrypt unknown page content. Previous source-quadratic/Bézout work and p29/p50 shared-additive-pad work remain separate bounded negatives. Neither a new key register nor an extended parameter sweep is justified without an author-selected algebraic operation.

Reproducer: [single-file Node22 SFT](../sims/lp2_p29_p50_euclid_first23_p0_readout_sft.cjs) reading exact [p29/p0 GP rune originals](../resources/liber-primus/lp2-corpus.json), [original 256 bytes](../resources/liber-primus/lp2-grid-256.json), and [LP1 native-GP reference](../resources/liber-primus/lp1-plaintext-reference.txt). All polynomial, reencryption and solved-control assertions passed in [GitHub Actions run 44943595538](https://github.com/FlareZ123/liber-primus/actions/runs/44943595538).
