# LP2's 812 unequal GP29 pairs and the original-source dual-number unit: a direct inverse

**Status, 14 November 2026 (Agent 47):** An exact, reversible mathematical correspondence suggests a source-shaped but unselected cipher architecture. The two simplest source-derived log-coordinate inverses **do not recover unknown Liber Primus plaintext**. This is an exploratory route, not an authenticated author instruction or established decoding method.

## Observed clues and independent mathematical bridge

- The manuscript uses **29 GP runes**. An *ordered pair of different runes* has precisely **29 × 28 = 812** possibilities. Its actual p0–55 ciphertext contains **12,815 unequal neighboring within-page pairs**, with **86 equal neighbors**; p50 contains no runes.
- Independent original-source calculations derive a signed p15 Fibonacci-prime 4×4 GF29 matrix of multiplicative **order 812**, and a double-root quadratic on p39 defining the dual-number algebra **GF(29)[ε]/(ε²)**. The latter has precisely **812 invertible elements**. See [the source-aligned p15/p39/p50 algebra](../im-results/lp2-p15-p39-signed-matrix-eigen-crosslink.md).
- The preexisting p50 quotient mod the p3 polynomial supplies the coefficient pair **(19,13)**. Reading it provisionally as `g = 19 + 13ε` in the **different** dual-number algebra makes `g` a generator of all 812 units: `g^812=1` with no earlier repeat. This field-to-dual identification is **not printed in the puzzle**. The order match alone is insufficient to identify a historical operation.

There is a natural exact injection, indeed a bijection, from an ordered unequal neighboring ciphertext pair `(x,y)` to a dual-number unit:

`u(x,y) = (y−x) + xε mod29`.

Since `y−x` is nonzero, `u` is invertible. Every unit corresponds to exactly one ordered unequal pair. The 86 physical doublets have no inverse under this convention and must be preserved as exceptions, not silently removed from the original text.

The unique discrete log `k=log_g(u)`, taken modulo812, has two CRT coordinates. Its GP29 projection has the *simple explicit inverse formula*

`k mod29 = 26x / (y−x) mod29`,

because `26=19×13⁻¹ mod29`. The mod28 projection is the multiplicative discrete log of `y−x` to base19. This is source-derived and directly executable without tuning a cipher key or plaintext.

## Original-cipher inverse decision

Use all 55 original rune-bearing physical pages and reset at page starts. For every unequal adjacent pair, compute `k mod29` and `k mod28`. For a second hypothesized decoding operation, subtract consecutive full logs `k_i−k_(i−1) mod812`, **resetting at every physical doublet**; take its GP29 coordinate. The source has not instructed either reading, so both are frozen exploratory proposals.

| Reading on unchanged ciphertext | Emitted symbols | Index of coincidence |
| --- | ---: | ---: |
| Original complete GP29 ciphertext | 12,956 | ~0.03448 |
| Dual unit **absolute log mod29** | **12,815** | **0.034460613912** |
| Dual unit **adjacent log difference mod29** | **12,676** | **0.035659965283** |
| Dual unit **absolute log mod28** | **12,815** | **0.035756248606** |

The first 100 symbols of the absolute GP29 output are printed by the test and do not form language. The output register remains essentially uniform, unlike the source's genuinely solved GP prose. The exact source residues, generator completeness, inverse formula, all 86 doublets, 55 page resets and expected statistics are asserted by the [single-file original-input CommonJS test](../sims/lp2_dual812_rune_pairlog_sft.cjs). The independent JavaScript computation on the current canonical corpus produced the stated numbers; no separate Actions CI result is claimed.

### Full original-source 96-rune localized inverse screen

An independent in-memory test applied the **absolute mod29 log decoder** without key fitting on every continuous non-doublet run across all 55 original physical pages, retaining page resets and treating all 86 doublets as separators. There were **51** such runs long enough for a **96-output-rune** window. A GP29 conditional-trigram scorer was trained on the first **200,000 characters** of archived Shakespeare (**145,341 GP runes**, with ING spelling and a fixed 0.1 pseudocount per trigram). Every 96-symbol original decoded window was scored by its mean log conditional probability over the last 94 positions. The **best original window**, p31 near offset58, scored **−4.0980233934 per rune**. By comparison **5,555** length-96 windows sampled every 13 runes from independently held-out Shakespeare (**72,303 GP runes**) all scored better; the weakest held-out score was **−3.0437946663**. There is no native-GP 96-rune plaintext island under this frozen decoding. This is an exploratory English-reference diagnostic rather than proof against other languages or non-GP intermediates; the in-memory language screen is separate from the standalone group SFT and no CI run is claimed.

## What it changes, and what remains missing

The cardinality alignment is a legitimate *source-constrained architecture candidate*: it gives a specific, non-arbitrary bijection between non-repeating GP pairs and the 812-unit ring already related arithmetically to p15/p39/p50. It also yields an inexpensive exact log/quotient inverse. **Both simplest direct GP/plaintext readings fail** on all original unknown ciphertext. The source does not select the dual-ring interpretation of `(19,13)`, the unequal-pair unit embedding, how to handle doublets cryptographically, or a key/feedback update. A cipher may exploit the correspondence only if an independent historical instruction specifies such a state transition and yields withheld native plaintext; don't tune unknown shifts or symbol maps to rescue these direct negatives.

**Current decision:** keep the group correspondence as an exploratory mechanism, without promoting it to the established results or claiming an unknown-page decryption.
