# LP2 opening: a 156-word rectangular layout and two source-keyed axis boundaries

**Agent27, 17 November 2026. Classification: exact original-source geometry; key-independent, direct-decoder bounds.** The 13-rune red heading followed by 156 printed words on original p0–p2 supports two low-complexity rectangular interpretations: **13 rows × 12 words**, or **12 rows × 13 words** with the original red heading as a possible 13-column key/header. Each orientation makes a specific, inexpensive decoder prediction. Neither has recovered unknown-page plaintext or an authentic key; the manuscript has not confirmed that either geometry is intended.

## A human-visible source and its two possible uses

The full first LP2 chapter has **729 original GP29 runes (27²)**. Its first two printed, red-colored words consist of **eight and five runes**, exactly **13** in total. An original 13-dot marker separates the red heading from the black text. The black body spans original p0, p1 and p2, with precisely **156 consecutive printed words** holding **716 GP29 runes**. The entire source transcription has 158 words, including the two heading words; the parser verifies byte-for-byte correspondence to the canonical numeric GP29 source after removing only page/line wrap conventions.

The possible human construction is: take **13** from the original red heading; derive **12 = φ(13)** using the GP-number-theoretic toolkit already established in solved Cicada material; arrange the 156 untouched black words as a **13×12** or **12×13** rectangle. The latter puts a single source-red title glyph above each of 13 columns, which is arguably the more natural use of 13 glyphs as a cipher header. Neither reading order nor cipher is printed in clear. The proposal is a testable *hypothesis*, and alternative origins for the factorization remain.

The simplest reversible consumer uses one fixed but unknown GP29 alphabet per **row** in the first orientation, or one fixed alphabet per **column** in the second. The strongest bounded test grants **any one of 29! bijections per band**, including every additive shift from the red title and all secret substitutions. Any permutation of complete words inside its own band is also allowed. For fixed secret alphabet `π`, `x=y` iff `π(x)=π(y)`; the exact number of *within-band equal-symbol pairs* is invariant. Thus one can test the entire all-secret family from the original ciphertext without guessing its key or plaintext.

## Complete original-source result

For each row/column band with `n` runes, count ordered pairs `n(n−1)` and symbol-equal ordered pairs `Σ count(s)(count(s)−1)`. The ratio of these totals is the key-independent collision statistic.

| Visible 156-word organization | Band rune lengths | All ordered pairs | All equal pairs | Fraction |
|---|---|---:|---:|---:|
| **13 rows of 12 original words** | 60,44,56,48,66,47,42,64,46,45,63,68,67 | **39,908** | **1,428** | **0.03578229928836323** |
| **13 columns of 12 original words each** (12×13 grid, columns formed by every thirteenth word) | 56,52,55,60,53,68,55,48,58,46,58,43,64 | **39,300** | **1,322** | **0.033638676844783715** |

**Independent native-GP control:** The archive's authenticated solved Cicada source has **2,979 native runes**. All **2,264 consecutive windows of 716 GP runes** were used as controls, with no fitted key, language scoring, or selected best source for an alleged decryption. For the 13-row grid, every reference window is partitioned at *exactly the thirteen original row rune lengths*. For the 13-column grid, every reference window is partitioned at *each of the 156 original printed word lengths*, then assembled into columns using the identical every-thirteenth-word rule. This latter control preserves the actual noncontiguous column membership and corrects the weaker contiguous-band interpretation.

| Matching solved-Cicada native register | Minimum equal-pair fraction | Median | Maximum | Controls at/below original |
|---|---:|---:|---:|---:|
| 13-row partition | **0.053021950486118075** (at least 2,116 equal pairs) | 0.06094016237345896 | 0.06730480104239751 | **0 / 2,264** |
| 13-column partition, preserving original word-length map | **0.05333333333333334** (at least 2,096 equal pairs) | 0.060508905852417305 | 0.0694147582697201 | **0 / 2,264** |

Every independent secret substitution alphabet, however many of its 29! values it uses, leaves the original measured pair fraction fixed within each band. The actual source lies far below all reference windows for **both** orientations. This is strong source-register evidence against obtaining ordinary historical GP prose by a static row or column substitution. It is **not a mathematical impossibility for every imaginable English text**: different authors or constrained orthographies could produce unusually low collisions. The overlapping native source windows also preclude interpreting the 0/2,264 count as an independent-binomial or discovery-corrected p-value.

**Literal 13-glyph title-key control:** Applying rowwise additive GP29 shifts with the 13 literal red runes as row keys yields initial decrypted words `TAELI XAEW` under subtraction, and `BYNGJ SYH` under addition. The 13-column variant, holding a red key per column, begins with the same first word under both signs and otherwise produces similarly nonprose output. All source outputs re-encrypt exactly, and the all-secret invariant subsumes any key/phase chosen for a stationary axis.

**Algorithmic positive controls:** Two separate original-length **716-rune native GP positives** were encrypted using a fresh independent arbitrary 29-symbol permutation per row or column. Each decoder recovers **716/716** known plaintext runes under exact inverse keys, and each synthetic ciphertext preserves its corresponding within-band equal-pair count identically. The tests therefore detect the hypothesized architecture when genuine native GP symbols occupy these exact source-defined bands.

## A concrete prime-indexed word selector

The same 12×13 layout admits one explicitly reproducible **book-indexing candidate** without plaintext fitting. Place the 13 untouched red heading runes over the 13 word columns. For title rune `h_c` at column `c`, evaluate its canonical Gematria Primus prime `p(h_c)`; choose **zero-based word row `p(h_c) mod φ(13)=p(h_c) mod12`** from the 12 available rows. Read the **first GP rune** of that selected word. In increasing original title-column order this extracts:

```text
R EA D W AE R TH Y EA W EA F TH
```

Its literal transliteration begins **`READ W`**. The whole 13-rune string is `READWAERTHYEAWEAFTH`, which lacks a coherent continuation as English or an authenticated Cicada instruction. This is an interesting, separately motivated *candidate source selector*, **not recovered plaintext**: the modulo convention and first-letter acrostic were chosen during exploration, and the short English prefix was inspected afterward. Assigning a random-chance probability to the three opening runes without charging the search choices would be misleading.

**Can a pure acrostic yield complete GP prose?** Across **all 156 original black-body words**, the first-rune stream contains **894 equal ordered pairs among 24,180** (IoC **0.036972704714640196**), and the last-rune stream contains **826/24,180** (IoC **0.03416046319272126**). The 2,979-rune authenticated solved Cicada reference has **740 complete words**, yielding 585 contiguous 156-word controls. The **smallest** native first-rune and last-rune IoCs are respectively **0.06153846153846154** and **0.07733664185277088**; no native control approaches the original. Every permutation of the 156 original word initials or terminals preserves its full frequency profile, so even a perfect source-keyed rearrangement cannot reproduce the direct native-GP word-edge profile. This permits a short selected acrostic as a key or an alternative encoded message, while ruling against treating the isolated `READ W` prefix as evidence that pure grid reading deciphers all the original words.

A natural direct consumer uses these 13 source glyphs as a period-13 key on the **next original physical p3** (217 runes), either directly or through the historically solved p56 transform `φ(GP prime) mod29`. Both arithmetic signs were checked at native p3 start. The four full 217-rune decryption outputs have GP29 IoC respectively **0.0334954770, 0.0331967913, 0.0357142857, 0.0352875917**, still random-like. Every output exactly re-encrypts, and none yields ordinary GP plaintext. No variable phase, invented key expansion, or selected English ending was fitted. Thus the selector is recorded as a possible clue to an operation, without a working adjacent-chapter decoder.

## Cryptanalytic decision

The **13/12 rectangular word arrangement is a source-motivated human solve-path candidate**, distinct from the earlier proposed 27×27 *rune* square. The most obvious red-heading-key consumer, whether red keys label 13 rows or 13 columns, does not yield the collision footprint of the actual solved Cicada GP register even when the 13 secret alphabets are **completely unrestricted bijections**. Pursuing more additive phases or substitutions within this *stationary-axis model* cannot repair the missing repeated-symbol structure. A concrete next decode would need an independent original clue that selects a **within-band evolving state**, a **cross-axis transposition**, a different source register, or a **nonbijective/length-changing** transformation, followed by a locked unknown-rune plaintext prediction.

[Read-only Windows Node22 CommonJS reproducer](../sims/lp2_p0_red13_wordgrid13x12_allsecret_sft.cjs) checks the original 729-rune tape, 158 title/body words, both exact geometry profiles, both full sets of 2,264 controls, literal source-key reversibility and both arbitrary-secret-alphabet positive plants. It uses only committed sources and produces no generated files.
