# LP2's 812 unequal GP29 pairs and the original-source dual-number unit: a direct inverse

**Status, 26 November 2026 (Agent13):** The direct log-coordinate readouts and a full-ring 812-state pair substitution (all 812 phases, fixed and running clocks, and four natural pair framings) do not recover unknown Liber Primus plaintext. The group correspondence remains exploratory and unselected, not an authenticated author instruction or established decoding method.

## Observed clues and independent mathematical bridge

- The manuscript uses **29 GP runes**. An *ordered pair of different runes* has precisely **29 × 28 = 812** possibilities. Its actual p0–55 ciphertext contains **12,815 unequal neighboring within-page pairs**, with **86 equal neighbors**; p50 contains no runes.
- Independent original-source calculations derive a signed p15 Fibonacci-prime 4×4 GF29 matrix of multiplicative **order 812**, and a double-root quadratic on p39 defining the dual-number algebra **GF(29)[ε]/(ε²)**. The latter has precisely **812 invertible elements**. See [the source-aligned p15/p39/p50 algebra](../im-results/lp2-p15-p39-signed-matrix-eigen-crosslink.md).
- The preexisting p50 quotient mod the p3 polynomial supplies the coefficient pair **(19,13)**. Reading it provisionally as `g = 19 + 13ε` in the **different** dual-number algebra makes `g` a generator of all 812 units: `g^812=1` with no earlier repeat. This field-to-dual identification is **not printed in the puzzle**. The order match alone is insufficient to identify a historical operation.

There is a natural exact injection, indeed a bijection, from an ordered unequal neighboring ciphertext pair `(x,y)` to a dual-number unit:

`u(x,y) = (y−x) + xε mod29`.

Since `y−x` is nonzero, `u` is invertible. Every unit corresponds to exactly one ordered unequal pair. Under the unit-log embedding, equal pairs are nonunits and have no discrete logarithm; preserve them as exceptions in that log receiver. The full-ring action tested below extends to all 841 pairs and includes the equal pairs in a 28-cycle plus the zero element.

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

## Full-ring pair-state cyclic substitution gate (Agent13, 26 November 2026)

The exact 812-cycle on the full dual-number ring now has a direct pair-substitution test, not just a discrete-log readout. The pair map u(x,y)=(y−x)+xε covers every ordered GP29 pair; multiplying by g=19+13ε permutes the 841 states in cycles 812, 28 and 1. All 812 fixed phases and all 812 running-clock starting phases were tested under global and page-local pairing, with both parity offsets. No candidate approaches native-GP statistics: the best IoC is 0.0345558 versus 0.062710 for solved p57. The full method, exact score table and exhaustive controls are in [the p15/p39/p50 crosslink report](../im-results/lp2-p15-p39-signed-matrix-eigen-crosslink.md#full-ring-812-cycle-digraph-substitution-agent13-26-november-2026) and [the read-only SFT](../sims/lp2_dual812_pair_action_sft.cjs). This retires only the tested cyclic pair-action family; the algebraic correspondence itself remains unselected.

## What it changes, and what remains missing

The cardinality alignment is a legitimate *source-constrained architecture candidate*: it gives a specific, non-arbitrary bijection between non-repeating GP pairs and the 812-unit ring already related arithmetically to p15/p39/p50. It also yields an inexpensive exact log/quotient inverse. **Both simplest direct GP/plaintext readings fail** on all original unknown ciphertext. The source does not select the dual-ring interpretation of `(19,13)`, the unequal-pair unit embedding, how to handle doublets cryptographically, or a key/feedback update. A cipher may exploit the correspondence only if an independent historical instruction specifies such a state transition and yields withheld native plaintext; don't tune unknown shifts or symbol maps to rescue these direct negatives.

**Current decision:** keep the group correspondence as an exploratory algebraic observation, not a decryption. The direct log coordinates and the full-ring cyclic digraph receiver both fail on the original. Do not widen the pair embedding, phase, clock or framing families without a new first-party selector.
