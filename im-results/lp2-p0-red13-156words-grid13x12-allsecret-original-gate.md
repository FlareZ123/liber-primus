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

## Complete-word 12×13 columnar inverses keyed by the red title (Agent3, 17 November)

The source also nominates a human-scale *word-order* operation separate from the 13 independent static alphabet maps above. The 156 body words fit exactly into **12 rows × 13 columns**, with each column headed by one of the **13 unmodified red title runes**. Historical Cicada rounds used key-ordered columnar transpositions; here the title's GP ordinals give the stable ascending column order **[7,3,12,4,1,0,8,2,10,5,11,9,6]** (zero-based), or its full reversal. Test each order under the two legitimate transposition inverses: row-major input → column read, and column-major input → row read. These four operations preserve every word's exact runes and the original 716-rune inventory; they do not infer a key from plaintext.

This can directly test **restoration of native-GP English adjacent word-length grammar**, even when the original letters remain cryptographically encrypted. An independent word-length transition log-likelihood ratio (LLR) is trained on the first 8,500 Gibran and 40,000 Shakespeare words using the project's established GP-contraction normalizer; its 200 disjoint 156-word native heldout windows have positive mean LLR +0.01563 / +0.01194. The identical four permutations turn those controls negative on average (−0.01702 to −0.01344), validating that this statistic is sensitive to the proposed operation at this length.

| Source-fixed word permutation | Original 156-word LLR | Adjacent-length MI | Adjacent equal ciphertext endpoints |
| --- | ---: | ---: | ---: |
| Unchanged printed order | **−0.01498225** | 0.31378414 | 2/155 |
| Ascending title, row → columns | −0.01467432 | 0.32292759 | 5/155 |
| Ascending title, columns → rows | −0.01456279 | 0.29754743 | 3/155 |
| Descending title, row → columns | **+0.00664730** | 0.32593870 | 5/155 |
| Descending title, columns → rows | −0.00856474 | 0.31553723 | 6/155 |

The descending column read is the only positive original word-length score. However, **1,670/25,000** fixed-seed, whole-original-marginal word shuffles score at least that high in the same particular cell, and **5,035/25,000** have **some** one of the four source-keyed candidate scores at least this high (best-of-four corrected upper-tail **0.20143**). The original 156-word register is too short and its lengths too broad for this weak improvement to identify an intended order. The exact original cross-word equal-rune deficit also becomes less extreme under every word permutation (two rises to three through six); this separately disfavors treating the permutation as a final, independent shuffle of already-encrypted words. It does not test a hypothetical earlier plaintext-word rearrangement followed by continuous encryption.


**Physically separated 8+5 heading variant (original input, 17 November):** The small red word separator provides a different, slightly more literal key-scheduling rule: sort the first eight heading columns only among their own eight positions, and independently sort the last five among their five positions, retaining the two authored groups. This fixes ascending order **[7,3,4,1,0,2,5,6,12,8,10,11,9]**, plus its reversed order within each group, rather than sorting all thirteen heading runes globally. Under the same two reversible word-grid inverses, the four complete 156-word original GP-English LLR scores are **+0.00160984, −0.00605145, −0.00254290 and −0.02152393**, respectively. Their best-of-four score is equaled/exceeded by **8,465/25,000** source-inventory-matched shuffles using the pinned seed, giving **0.33862645** corrected tail; the best single cell is equaled/exceeded by **3,138/25,000**. Both independently planted source-native word orders pass the same exact inverses. This **eight-plus-five** route is weaker than the already-rejected globally sorted title and supplies no plaintext or independently instructed next step. [Revised single original-input CJS](../sims/lp2_p0_red13_wholeword_12x13_sft.cjs) · [passing Windows Node22 CI 44145084745](https://github.com/FlareZ123/liber-primus/actions/runs/44145084745).

Both directions of both title-key orders invert **all 156 word slots exactly** on independently planted controls; all 200 heldout native English passages preserve their full word-length sequences after an encrypt→decrypt test. No plaintext, key, authenticated word order or value-changing inverse was found. **Decision:** retire these eight literal source-keyed whole-word transpositions as standalone native-GP-English grammar restorations. A distinct transposition requires an independent source selector and meaningful withheld-language signal; do not fit one of 13! column orders from the same 156 lengths.

[Executable original-source Node22 SFT](../sims/lp2_p0_red13_wholeword_12x13_sft.cjs) · [Passing original-source Windows Node22 SFT run 44141499615](https://github.com/FlareZ123/liber-primus/actions/runs/44141499615) (all exact original-language, random-control, endpoint and positive-plant assertions).

## Cryptanalytic decision

The **13/12 rectangular word arrangement is a source-motivated human solve-path candidate**, distinct from the earlier proposed 27×27 *rune* square. The most obvious red-heading-key consumer, whether red keys label 13 rows or 13 columns, does not yield the collision footprint of the actual solved Cicada GP register even when the 13 secret alphabets are **completely unrestricted bijections**. Pursuing more additive phases or substitutions within this *stationary-axis model* cannot repair the missing repeated-symbol structure. A concrete next decode would need an independent original clue that selects a **within-band evolving state**, a **cross-axis transposition**, a different source register, or a **nonbijective/length-changing** transformation, followed by a locked unknown-rune plaintext prediction.

[Read-only Windows Node22 CommonJS reproducer](../sims/lp2_p0_red13_wordgrid13x12_allsecret_sft.cjs) checks the original 729-rune tape, 158 title/body words, both exact geometry profiles, both full sets of 2,264 controls, literal source-key reversibility and both arbitrary-secret-alphabet positive plants. It uses only committed sources and produces no generated files.
