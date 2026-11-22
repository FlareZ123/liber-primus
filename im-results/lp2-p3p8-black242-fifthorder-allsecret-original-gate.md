# Original 242-word to 242-rune source transfer: fifth-order all-secret affine gate

**Agent 4, 22 November 2026. Status:** Strict elimination for one bounded 11-secret-parameter model. **No unknown-page plaintext, authenticated key, or author-selected operation has been recovered.**

## Physical clue and candidate receiver

Original LP2 physical p3–p7 together contain 255 complete printed GP29 words, of which **13 are entirely red and 242 are entirely black**. The following p8 contains **12 red and 243 black runes**, but its last black rune is a genuine cross-page continuation into p9, leaving **242 page-contained black runes**. These form a natural *242 black whole words → 242 black rune cells* candidate interface. The final five original p7 red words independently give GP-index products modulo29 **[11,26,8,15,2]**, whose reductions modulo3 seed an order-five primitive ternary recurrence of period242. This motivates, but does not authenticate, an order-five source transfer.

The strongest immediate *linear* candidate we tested without assuming any particular secret five taps is an entirely free fifth-order input/output affine transducer over GF(29):

\[
Y_i = a_0+\sum_{j=0}^{4}a_{j+1}X_{i-j}+
\sum_{j=1}^{5}b_j Y_{i-j}\pmod{29},\quad i=5,\ldots,241.
\]

Here X(i) is a deterministic GP29 number derived from the ith fully black scroll word and Y(i) is the unchanged ith p8 black page-contained rune. **All 11 coefficients** are completely unknown and independently arbitrary. The first five printed p8 runes are accepted as initial state. If even this free-coefficient model fails, specializing the coefficients to the p7 red products cannot repair it.

## Exact original-input experiment

The [Windows-compatible Node22 CommonJS SFT](../sims/lp2_p3p8_black242_fivefilter_allsecret_sft.cjs) reads only the [canonical corpus](../resources/liber-primus/lp2-corpus.json), [original whole-word transcription](../resources/liber-primus/lp2-transcription.txt) and [physical ink classification](../resources/liber-primus/lp2-ink-annotations.json). It checks **12,956 original unknown runes, 2,896 complete words**, all 255 scroll words and their 13/242 ink partition, and all 242 recipient runes.

It constructs the **237 original equations** at i=5…241 for nine fixed input summaries: GP-index sum, prime sum, GP-index product, prime product, whole-word length, first rune, last rune, alternating GP-index sum, and position-weighted GP-index sum. All values are reduced modulo29.

Exact GF29 elimination obtains rank **11** for each model. **All nine original 237-equation systems are inconsistent**. Even the first 30 original equations contradict the same 11-parameter stationary model under every summary. The first 11 equations are full-rank and admit a unique key; predictions using these first-11 fitted coefficients against the remaining 207 untouched equations are:

| Source-word value X | Untouched p8 equations correct / 207 |
| --- | ---: |
| GP29 ordinal sum | 11 |
| GP prime sum | 12 |
| GP ordinal product | 6 |
| GP prime product | 6 |
| Complete-word rune count | 8 |
| First rune | 7 |
| Last rune | 5 |
| Alternating index sum | 15 |
| Position-weighted index sum | 5 |

Under a uniform 29-way null, ~7.14 exact matches in 207 are expected. These individual match counts are illustrative; **the inconsistency proof is exact and makes no language assumption**. The same SFT builds for each word-value source a 242-rune **synthetic** receiver using 11 predeclared secret coefficients. From the first 30 equations it recovers all **11/11 planted secret coefficients** and predicts all **207/207** untouched synthetic runes. The positive control guards against implementation artifacts.

## Interpretation and next decision

The exact physical coincidence of 242 black words and 242 page-contained black runes remains potentially important. The experiment rejects **stationary, linear fifth-order input/output transfer** from these nine ordinary whole-word numeric representations, including every unknown choice of all 11 coefficients. This is stronger than testing only the p7 red products or a single arbitrary set of five taps.

This scope leaves source-derived nonlinear/compression operations, GP29 permutations of the source-word order, a hidden nonstationary state, bit-level carry, a source-selected cryptographic hash, different word-value maps, and historically supplied external keys entirely open. The manuscript still supplies no authenticated instruction mapping a black word to its intended rune-value operand. A useful successor must derive a **creator-selected value-changing opcode or key source** and predict a fresh original p8 rune or a held-out unknown page.

**Disposition:** retire unrestricted tuning of 11-coefficient fifth-order GF29 transfer on these nine canonical source summaries. Preserve the 242-source interface as a candidate for a substantively different, independently selected receiver. This report is not decryption.
