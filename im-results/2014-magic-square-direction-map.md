# 2014 stage04 magic-square direction map: cell 6 Rad ↔ cell 7 Ac

**Status:** the 2013 0_wisdom → 2014 stage04 word-prime-sum reconstruction is verified (25/25 cells), and the p15 Fibonacci-prime spiral is independently established prior art. Issue #237's source-first p15→2014 perimeter gate found a plausible cell-6 start and clockwise orientation, but no historical source links the p15 numeric values to the ring or specifies a reversible operation. The only economical totient-ring GP29 Vigenère extension is eight-periodic and leaves the p15 arrow-started body ciphertext-like in both orientations. Earlier p55 FOLD/circumference transfer and direct table-to-LP2 routes remain unselected. No LP2 plaintext or authentic key has been recovered.

## 2014 source and selector

The 2014 stage04 server-status reconstruction contains this 5×5 magic square:

```
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Every row, column, and principal diagonal sums to **1033**. The source is the stage04 README and archived 2014 walkthrough in [krisyotam/cicada3301, pinned commit 76d3ee8](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04).

Applying the **hypothetical extension** `φ(n) mod 29` to each numeric cell yields a 5×5 GP transliteration map. Solved LP2 p56 establishes the narrower `φ(prime_j)` schedule over GP rune-prime weights; it does **not** authenticate φ on arbitrary composite square cells or LP2 word sums. Two adjacent cells are especially significant:

| Cell (1-based row-major) | Number | φ(n) | φ(n) mod 29 | GP rune | Traditional meaning |
|---|---:|---:|---:|---|---|
| 6 | 366 | 120 | 4 | Rad (R) | riding / road |
| 7 | 199 | 198 | 24 | Ac (A) | oak |

The selector is independently constrained. The 2014 stage03 comment is “Patience is a virtue”; its GP value is 761, and:

```
φ(761) = 760
760 mod 29 = 6
```

The 2016 message was published on 5 January, immediately before Epiphany (6 January). Both the historical phrase and the date therefore select **cell 6**.


## p15 Fibonacci spiral → 2014 Wisdom perimeter (Issue #237)

**Decision (11 November 2026): no source-authenticated p15-value→perimeter operator.** This is distinct from #147's p15→p32 direction candidate and #156's p55 FOLD/perimeter test.

### Historical selector audit

The exact 16-cell p15 Fibonacci-indexed prime spiral is already established and independently reproduced; it is not a new discovery ([authoritative p15 numeric result](../results/lp2-p15-fibonacci-prime-spiral.md), [prior-art correction](../results/fibonacci-prime-spiral.md), [original-input SFT](../sims/lp2_p15_fibonacci_prime_spiral_sft.cjs)). Its red 3299 and clockwise outward walk fix the order **inside p15**.

The 2014 stage04 walkthrough reconstructs the 5×5 matrix from the server-status image by reversing an extracted byte stream, and identifies it as a magic square with sum 1033. The contemporaneous stage04 README documents the reverse-hexdump and byte-reversal steps. Neither source gives a perimeter traversal, names Fibonacci/p15, or tells a solver to map p15's 16 prime values onto the square's border ([2014 walkthrough](https://github.com/scream314/cicada3301/blob/master/2014.md), [stage04 README at pinned archive commit](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/README.md)).

The 2013 0_wisdom source says that primes and the totient function are sacred and that all things should be encrypted. Its 5×5 mixed table maps word cells to the 2014 matrix by GP-prime sums, cell-for-cell. That source-supported transformation does **not** select a perimeter start, direction, or transfer from p15. The original-source note distinguishes the primary image from the third-party transcription ([source note](../resources/external/2013-0-wisdom-source.md)).

There is one plausible **start candidate**, but it does not complete the cross-round selector: the 2014 stage03 HTML comment “Patience is a virtue” has GP-prime sum 761, and φ(761)=760≡6 (mod 29), selecting row-major cell 6, at row 2, column 1 (value 366). That cell lies on the perimeter. The selector identifies a cell in the full square; no original instruction says it is the start of a perimeter walk. Combining it with p15's clockwise orientation is a reasonable test hypothesis, not an authenticated instruction. The p57 line about shedding circumferences and p55's FOLD heading do not name this 2014 square or define its mapping; #156 already found the p55-to-ring transfer unselected.

### Exact ring structure and one frozen test

Reading the 2014 square's perimeter clockwise from cell 6 (row 2, column 1) gives:

**366, 272, 138, 341, 131, 151, 18, 226, 366, 272, 138, 341, 131, 151, 18, 226.**

There are 16 positions but only **eight distinct values**: each value repeats at the antipodal position, so the ring sequence has period 8. The 16-position geometry therefore does not provide 16 distinct numeric key symbols.

As the cheapest source-motivated check, I froze one key construction: take the cell-6 clockwise ring values, apply the named 2013 totient operation, reduce modulo the 29-symbol GP alphabet, and use the solved p56 GP29 additive subtraction. The key is:

**[4, 12, 15, 10, 14, 5, 6, 25]** repeated twice.

This is an eight-symbol period, not a 16-symbol key. It was applied once to the original p15 arrow-targeted body (rune offset 9, 150 runes). The opposing perimeter orientation was the control. Both original outputs re-encrypt exactly. The existing p15 numeric SFT and the source-native p56 totient-cipher regression pass as positive controls.

| Input / output | IoC | Shakespeare-trained GP trigram log score per rune |
|---|---:|---:|
| Original p15 body | 0.035884 | -6.14841 |
| Cell-6 clockwise, φ(cell) mod 29, subtract | 0.034541 | -5.96973 |
| Cell-6 counterclockwise, φ(cell) mod 29, subtract | 0.037852 | -5.94890 |
| Source-known LP1 English control | — | -2.35268 |

Neither orientation produces readable plaintext; the slight score/IoC changes are not an English recovery. Crucially, this candidate uses the p15 spiral's **clockwise orientation only**: none of the p15 Fibonacci/prime values enters the key. It therefore does not establish the missing operation that maps a spiral value to a perimeter cell. No alternate moduli, ring origins, key arithmetic, or cipher families were scanned.

### Disposition

The start and direction are individually plausible, but the original sources do not join them into a p15-to-ring value mapping or select a reversible operator. The obvious totient-ring extension is a bounded negative. Close #237 as **selector absent**; reopen only if a primary source supplies the cross-round link and specifies how a p15 value determines a perimeter cell and a reversible operation. No unknown LP2 plaintext, key, or destination follows.

Reproducer: [p15/2014 perimeter gate](../sims/p15_2014_wisdom_perimeter_gate.cjs).

## 2013 `0_wisdom` table → 2014 square: exact prime-sum reconstruction

The pinned 2013 `0_wisdom` page contains a mixed 5×5 table: **12 numeric cells and 13 GP-rune word cells**. Its surrounding prose explicitly states that the primes and the totient function are sacred. Using the canonical GP prime assignment, replace each runic word with the **sum of its rune-prime weights**, leaving the numeric cells unchanged. The resulting 5×5 matrix is exactly the 2014 stage04 magic square, **cell-for-cell (25/25)**:

```
2013 mixed table:                    after word prime-sums:

272  138  SHADOWS  131  151          272  138  341  131  151
AETHEREAL BUFFERS UOID CARNAL 18     366  199  130  320   18
226  OBSCURA FORM 245 MOBIUS          226  245   91  245  226
18   ANALOG UOID MOURNFUL AETHEREAL  18   320  130  199  366
151  131  CABAL    138  272          151  131  341  138  272
```

The 13 word-cell sums are: SHADOWS→341; AETHEREAL→366; BUFFERS→199; UOID (plaintext rendering VOID)→130; CARNAL→320; OBSCURA→245; FORM→91; MOBIUS→226; ANALOG→320; UOID→130; MOURNFUL→199; AETHEREAL→366; CABAL→341. The complete per-rune prime weights are emitted by the reproducer.

The expanded square has all five row sums, all five column sums, and both principal diagonal sums equal to **1033**. There is no fitted offset, modulus, permutation, or search: the source supplies the words, the GP alphabet supplies the primes, and the 2013 prose motivates prime arithmetic. The 2014 square is therefore a numeric expansion of the 2013 table, not an independent numerical coincidence. The pinned transcription and source metadata are preserved in [`resources/external/2013-0-wisdom.txt`](../resources/external/2013-0-wisdom.txt) and [its source note](../resources/external/2013-0-wisdom-source.md); the [reproducer](../sims/2014_magic_square_direction_map.cjs) asserts all 25 cells and the 1033 sums.

**Evidence boundary:** the cellwise arithmetic identity is established and reproducible. Attribution of the prime-sum operation to intended author instruction is strongly clue-constrained by the page's explicit prose, but remains a historical interpretation. This is a **word-cell→numeric-cell-value encoding**, not a rule that maps a value to an LP2 word or physical page address. It does not recover LP2 plaintext or establish that every later LP2 page uses the same mechanism. The following `φ(n) mod 29` labels and degree bearings are the next operation in the 2014 analysis, not a newly proven LP2 cipher.

### Two original LP2 cipher triples navigate into the 2013 Wisdom square

The historically documented transformation of the 2013 mixed rune-and-number Wisdom table into the 2014 **5×5** magic square is source-constrained: take the GP-prime sum of each original rune-word cell. The 2013 prose expressly calls both primes and the totient function sacred. A new *hypothetical* continuation interprets three successive unknown-LP2 **printed word sums** as `starting cell / compass-direction code / destination cell`, with the middle value decoded as **φ(sum) mod29**, and only the ordinary GP runes W, E, N and S treated as cardinal directions. This operation is motivated by the authenticated 2016 wording “words are the map, numbers are the direction,” but the source does **not** explicitly prescribe its phi→compass step.

**Original LP2 outputs, source printed word order preserved:**

| physical LP2 page | zero-based local rune offsets | three consecutive GP-prime sums | middle totient→GP direction | historical original-square edge | original 2013 source word |
| --- | --- | --- | --- | --- | --- |
| **p36** | 17–21 / 22–27 / 28–29 | **320, 386, 130** | φ(386)=192≡18 mod29 → **E** | (3,1) **320** → (3,2) **130** | **UOID** (“VOID”) |
| **p55** | 42–45 / 46–47 / 48–54 | **138, 108, 341** | φ(108)=36≡7 mod29 → **W** | (4,3) **138** → (4,2) **341** | **CABAL** |

The original 2013 cell at (3,1) is **ANALOG**, its eastern neighbor is **UOID**; the bottom source cell at (4,2) is **CABAL**. Values 320/130 and 138/341 also appear in upper reflected positions in the 5×5, where the *opposite* compass directions would apply. Thus each middle word resolves the original table's ambiguous duplicate numerical cell to a **specific historical rune word**. The second selected source cell is on the original outer perimeter and the first is on the adjacent inner perimeter. Both arrive in central column 2.

The full original LP2 corpus was tested using the shared continuous-word parser: **12,956 original ciphertext runes, 2,896 canonical words**, with physical line/page wraps preserved and only printed punctuation terminating words. **Exactly two** consecutive three-word windows produce valid cardinal edges anywhere in the entire original book under this rule: zero-based global word **1962** on physical p36 and **2888** on physical p55, as above. On all 2,896 original words, the **other historically supplied 5×5** and **7×7** squares yield **zero** routes. The original p55 has 17 *page-local* visible segments, the first being the trailing rune of a word begun on p54. Within those segments its only route is index9.

Two distinct fixed-seed controls delimit this result:

- Preserving the *original 17 p55 segment lengths and exact 76-rune inventory* but permuting rune weights gives **37/120,000** p55 samples with at least one source-square cardinal route (add-one **p≈0.00031666**); permuting the 17 intact p55 word totals gives **2,660/120,000** (**p≈0.02217**).
- Preserving all **2,896 original word totals and exact page assignment** but permuting their order **within each page**, among **40,000** samples **135** produce at least two routes somewhere (**p≈0.00340**), only **13** produce at least two directed routes landing in center column2 (**p≈0.000350**), and **16** place a route on both original pages p36 and p55 (**p≈0.000425**).

**These probabilities are exploratory and conditional.** The search followed the p55/Wisdom hypothesis; the square, the φ→GP-cardinal convention, the choice of p55 and the inward-column interpretation were not all selected before inspection. Nevertheless, the second distant physical page is an exact, source-unchanged transfer of the operation first identified at p55, rather than a newly fitted decoder. This is a sharper **source-to-operation candidate** than a mere equal sum.

The complete historically printed **central column** of the mixed table is **SHADOWS / UOID / FORM / UOID / CABAL** from top to bottom, GP sums **341 / 130 / 91 / 130 / 341**. The two destination words occupy adjacent rows (3,2) and (4,2). If the 2013 p57 PARABLE command to “shed our own circumferences” authorizes moving from the outer ring through an inner ring to the center, the next *predictable source word* is **FORM** at (2,2). That proposed inward step is not present as a third three-word original-LP2 route and remains an interpretive navigation hypothesis. The inferred outer→inner→center words **CABAL UOID FORM** happen to total 13 GP runes, matching the printed 13-dot punctuation size; this count alone cannot establish a 13-rune key or a decoder.

### Nested word-sum instruction candidate: MIX

An additional *exact* source-derived relation appears after freezing the two original routes. Read their destination cells in ordinary physical page order, **p36 UOID=130**, then **p55 CABAL=341**, followed by the independently printed center **FORM=91** of the same 5×5. The original 2013 “totient sacred” operation, now applied once to each of these three source cells with GP-letter normalization, yields:

`φ(130)=48 ≡ 19 (M)`, `φ(341)=300 ≡ 10 (I)`, `φ(91)=72 ≡ 14 (X) (mod29)`.

Thus the *conditional* page-order-plus-center source reading spells **MIX**, a meaningful but underspecified operation word. This word's canonical GP-prime weight is **71(M)+31(I)+47(X)=149**. The next GP rune **NG** (which can spell “ING”) has prime weight **79**; together they yield a speculative **MIXING** instruction with GP total228.

The **two complete printed unknown p36 words immediately before** its original 320/E/130 route are exactly **global words1960–1961**, with prime sums **149,79**, rune offsets **11–13** and **14–16**, followed immediately by original w1962–1964 = 320,386,130. This is the **only adjacent 149,79 pair** in all 2,896 original LP2 words; 149 occurs 11 times and 79 occurs eight times individually. The p36 ciphertext words at these offsets are **LNX** and **NOP** (three runes each), while “MIXING” uses **M I X NG** (four GP runes), so this is a word-*sum* interpretation, **not** a length-preserving original ciphertext-to-plaintext decryption. The claimed instruction also depends on choosing physical-page order and then appending the center; those steps are inferential rather than authenticated.

The most economical direct test takes **MIX** and **MIXNG** (GP spelling of MIXING) as fixed historical GP-Vigenère keys, phase zero from each original page start. Their inverse ciphertext IoCs are respectively **0.03375527 / 0.03543860** on **p36 / p55** for MIX, and **0.03382619 / 0.03052632** for MIXNG. No readable plaintext emerges. Interleaving/mixing as an operation remains unselected: this relation does not license indiscriminate cipher mixing or independent key-clock searches. The source-exact standalone test asserts the three phi letters, 149/79 coincidence, word-order uniqueness, and fixed direct-key inverse.

**Frozen original-cipher inversions (conditional on an unselected route):** The conjectured first destination **CABAL** as a direct historical GP Vigenère key gives IoC **0.03754386** across all 76 original p55 runes; starting just after the local triple at offset55 yields 21 runes, IoC **0.03333333**, transliterating `PLAWJPLXIAXDSTHIDETPOEIAC`. The more speculative 13-rune concatenation **CABALUOIDFORM**, applied directly as a repeating GP Vigenère key from each original page start, gives IoC **0.03964912** on p55 and **0.03630819** on p36. These variants do **not** recover readable plaintext.

A separate, source-motivated phase test uses the exact 13-GP-rune path **CABAL→UOID→FORM** as a repeating key and resets its phase at each of the **28 original thirteen-dot events** in unknown pages p0–55. This creates 28 fragments, including the two source-verified empty intervals (fragments 9 and12). Fixed direct GP29 Vigenère in both signs and Beaufort are tested under both fragment-reset and continuous-global clocks. All six exact original re-encryptions pass, but the best fragment-reset GP-English score is only **−6.28008** (raw unknown stream **−6.29600**; native LP1 plaintext control **−2.32704**); fragment-reset IoCs remain **0.034465–0.034480** versus raw **0.034478**. The p55 and p36 outputs remain ciphertext-like. This retires only direct additive/Beaufort use of this key under these clocks; it does not exclude a different operation or key role. Full reproducible gate: [13-dot-reset key SFT](../sims/p55_wisdom_13dot_key_reset_sft.cjs).

### “MIXING” as a 13-column keyed transposition: bounded negative

The route yields the 13-GP-rune string `CABALUOIDFORM` and the conditional instruction word `MIX/MIXING`. The simplest recognizable “mix” operation not yet tested was a standard columnar transposition using that exact 13-rune key. The key's column order is ranked by **Gematria Primus rune order** (stable original-column order for equal key runes), not by a second, unselected English-alphabet convention. Both ascending and descending read orders were tested, on the source-selected p55 76-rune page and on the full 12,956-rune unknown stream. The ragged final row is handled exactly; there is no padding, phase, or reset parameter.

The trigram model was trained separately on the pinned Shakespeare and Gibran GP29 controls (add-`0.1` smoothing). Native-reference scores are **−2.22983** (Shakespeare) and **−2.06219** (Gibran); raw unknown LP2 scores are **−4.67945** and **−4.34935**. Uniform GP29 is **−3.36730**.

| GP-key read order | Target | Shakespeare score | Gibran score |
|---|---|---:|---:|
| ascending | p55, 76 runes | −4.74893 | −4.29003 |
| ascending | full unknown, 12,956 runes | −4.69726 | −4.36178 |
| descending | p55, 76 runes | −4.76471 | −4.58776 |
| descending | full unknown, 12,956 runes | −4.67088 | −4.36723 |

The best full-stream score is effectively unchanged from raw ciphertext for Shakespeare (−4.67088 versus −4.67945) and worse for Gibran. Every output remains substantially below native language and even below the uniform-symbol baseline. A 12,956-symbol known-English round-trip control passes with the same ragged-column implementation and both key orders.

**Decision:** reject this first, source-motivated columnar interpretation of `MIXING`. The route's “MIX” word remains an underspecified clue; it does not license more transposition families, arbitrary rotations, reset rules, or other transformations without an independent source selector. Reproducer: [13-key columnar gate](../sims/p55_wisdom_13key_columnar_gate.cjs).

The first natural columnar interpretation of “MIXING” is now tested and negative. No source instruction yet selects Vigenère, Beaufort, columnar transposition, a key clock, or a target beyond the proposed central-column path. An authenticated unknown-LP2 cipher key and destination remain unresolved.

[Source-exact route SFT](../sims/p55_wisdom_cardinal_route_sft.cjs) asserts both original routes, original 2013 mixed-table token, alternative historical-square controls, both permutation experiments and the fixed original-key inverses. The first global-census version passed [manual CI run 42988336268](https://github.com/FlareZ123/liber-primus/actions/runs/42988336268); the new fragment-reset key test is a separate bounded negative. The parent [Director Issue #156](https://github.com/FlareZ123/liber-primus/issues/156) is closed: a 16-cell-ring cipher transfer remains **unselected**, and this new exact cross-page directional pattern is held as a **conditional** original-cipher lead requiring a next source-selected operation.

### Pre-2014 live TCP test reuses the 1033 / 3301 pair

A separate historical route supplies **pre-2014 organizer selection of the same numbers**. The archived March 2013 TCP-server testing summary records Cicada issuing `BASE29 1033` and then `DH 3301` three times. A second preserved participant-server transcript records `BASE29 1033` → `16I`, followed by `DH 3301`, a completed exchange, and `NEXT`. The source manifest pins both archive files and their commit in [`resources/external/2013-tcp-live-test-vectors.json`](../resources/external/2013-tcp-live-test-vectors.json).

The pair was already highlighted earlier in 2013. The boot-image `prime_echo` executable emits every prime in increasing order through 3301 and pauses four times longer on **1033** and **3301**; the next first-onion `NUMBER` service explicitly marks `3301` with `+` because its decimal reversal 1033 is also prime. The later TCP test then assigns the two values to adjacent `BASE29` and `DH` requests, and the 2014 `Interconnectedness` stage uses `33011033` as the OpenPuff password for `magicsquares.txt`. The full pinned chain is in [`resources/external/1033-3301-historical-operator-chain.json`](../resources/external/1033-3301-historical-operator-chain.json). This makes 1033/3301 a repeated operator pair rather than a one-stage numerical coincidence. It also gives a historically visible reason to inspect their positions in the prime stream: one-based ordinals **174 = 6×29 = 3×58** and **464 = 16×29 = 8×58**. Counting those ordinals is still a solver inference, while the ordered prime stream itself is source-observed.

The DH transcript also fixes an important provenance boundary. Under the published protocol, the participant server chooses the DH base and server secret randomly. In the preserved exchange, values 2757 and 331, the server public 1264, and the resulting shared key 1067 therefore depend on participant-side randomness and are not reusable Cicada constants. The stable clue-level data are the organizer requests **1033** and **3301** (plus session-specific client traffic), not the server's random DH state.

This is strong evidence that 1033/3301 belonged to Cicada's active numerical vocabulary before the 2014 public puzzle. It strengthens the intendedness of the 2013→2014 magic-square relation while still supplying **no LP2 deciphering operation**. The existing direction, fragment and table-transfer tests below remain separate hypotheses. The reproducer asserts the live vector, `1033 → 16I`, decimal reversal, both prime ranks, and the equality between the live BASE29 argument and every reconstructed magic-square line sum. [Manual CI run 42973779449](https://github.com/FlareZ123/liber-primus/actions/runs/42973779449).

## Direction-field test

Interpret the original magic-square numbers as angles, using the standard mathematical convention:

- 0° is east; angles increase counter-clockwise.
- Reduce angles modulo 360°.
- Quantize to the nearest 45° sector, matching the eight neighbours of a square grid.
- Rows increase downward; columns increase rightward.

This gives:

- Cell 6: 366° → 6° → **east**, pointing to cell 7.
- Cell 7: 199° → **west**, pointing back to cell 6.

The resulting functional graph has 17 in-bounds edges and 8 exits. Its directed cycles are:

1. **6 ↔ 7**, the unique reciprocal two-cell cycle: Rad ↔ Ac.
2. **12 → 16 → 17 → 23 → 24 → 18 → 12**, a separate six-cell cycle (Dæg → Gyfu → Eoh → Ing → Sigel → Mann).

The longer cycle remains part of the evidence; it is not silently discarded.


## 13-dot fragment bridge: the 199 / Ac route

The LP2 red-rune stream is partitioned by the **31 original 13-dot marks** into **32 red-rune fragments**. A fragment contains only red GP runes between consecutive 13-dot marks; an empty fragment means zero red runes, not a blank page. The exact 32 lengths are:

\`\`\`
[13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,
 0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0]
\`\`\`

The 2014 square has three distinct prime entries: **131, 151, 199**. For each prime \(p\), \(\phi(p)=p-1\). The two already-motivated alphabet/fragment moduli are 29 (GP symbols) and 32 (13-dot fragments). Map a prime entry to:

- GP label: \(\phi(p) \bmod 29\);
- one fragment index: \(p \bmod 32\);
- adjacent fragment index: \(\phi(p) \bmod 32\).

A zero residue is interpreted cyclically as fragment 32. All three prime entries select an adjacent pair containing one empty fragment and one fragment containing the corresponding GP label:

| Prime \(p\) | \(\phi(p)\) | GP label \(\phi(p)\bmod29\) | \(\phi(p)\bmod32\) fragment | \(p\bmod32\) fragment | Corresponding red-rune evidence |
|---:|---:|---|---:|---:|---|
| 131 | 130 | Eolh (X) | 2: empty | 3: 16 runes | X at position 12 |
| 151 | 150 | Cen (C) | 22: 8 runes | 23: empty | C at position 6 |
| **199** | **198** | **Ac (A)** | **6: empty** | **7: 11 runes** | **A is the first rune** |

The 199 result is unusually well anchored by independent clues:

1. The 2014 stage03 phrase “Patience is a virtue” gives \( \phi(761)\bmod29=6 \); the 2016 message date, 5 January immediately before Epiphany on 6 January, also selects 6.
2. The 2014 square's cell 6 is Rad and points east to cell 7, Ac; cell 7 contains the prime **199**.
3. \(199\bmod32=7\), \(\phi(199)\bmod32=6\), and \(\phi(199)\bmod29=24=\mathrm{Ac}\).
4. LP2 fragment 6 is empty; fragment 7 is exactly 11 red runes and begins **Ac**:

   \`A T X B M G IA S B X EO\`

The two 13-dot boundaries are on LP2 page 6 at normalized offsets 71 and 82; the Ac rune begins at offset 71. This is consistent with the 2016 message's empty-path wording and its oak image. The same one-based cell-to-fragment alignment also makes every node in the two 2014 direction cycles correspond either to an empty fragment or to a fragment containing that cell's GP label; this is secondary evidence, not an independently selected test.

**Controls and statistical limits:** the same residue rule applied to all 13 distinct square values yields only **5/13** one-empty/one-label pairs (272, 131, 151, 199, 91). A deterministic 500,000-permutation null over all 32 fragment records has mean **2.482** matches and tail probability **0.0862** for at least five. Conditional on selecting only the three prime entries and their fixed adjacent fragment pairs, the exact permutation probability for all three one-empty/one-label matches is **0.01774**; this is *not* a global p-value and does not correct for selecting the prime subset or the arithmetic rule after inspection. The result is therefore a promising, clue-constrained route hypothesis, not proof of intent or a decryption.

The 2016 “Beware false paths” warning may distinguish the externally selected 6→7 Rad→Ac route from other matching pairs; that interpretation remains conjectural. A first source-fixed recursive test of the 11-rune Ac fragment is below and is not selective. Any continuation now requires a distinct semantic or historical clue, not another unconstrained modulo/φ loop.

### Direct recursive continuation of the 11-rune Ac fragment: not selective

A natural one-rule continuation treats each of fragment 7's 11 red runes as a Gematria Primus prime weight (p), then reuses the exact 2014 bridge: inspect adjacent fragments (phi(p)\bmod32) and (p\bmod32), and look for the label (phi(p)\bmod29) in the nonempty member. This introduces no new modulus, offset, or cipher choice.

The 11 positions yield **5/11** one-empty/one-label matches. Deduplicating the repeated rune-prime values gives **4/9** matches; one is the (p=71) self-pair **6/7**, which reuses the already-selected 199/Ac anchor, and one (p=47) match is counted twice because X appears twice. Removing both the anchor pair and duplicate leaves **3/8** unique non-anchor targets:
- (p=47): fragments 14/15, label B in fragment 14, fragment 15 empty
- (p=17): fragments 16/17, label T in fragment 16, fragment 17 empty
- (p=53): fragments 20/21, label D in fragment 20, fragment 21 empty

A conditional **200,000**-permutation null fixes fragments 6 and 7 (the externally selected empty/Ac pair) and permutes the other 30 original fragment records. The probability of at least three matches among the eight unique non-anchor prime targets is **0.13419**. In a separate within-corpus scan, fragment 7 ranks only **8th of 17** nonempty fragments by unique-match rate under the same rule. A planted nine-pair positive control is recovered **9/9**.

The three non-anchor matches in fragment 7 happen to land at offsets **12, 6, 0** when sorted by their prime weights (**17, 47, 53**). Conditional on the fixed 6/7 anchor, this exact descending-six progression occurs in **33/200,000** permutations (**p=0.00017**). That attractive conditional number is not a global result: scanning all 32 possible seed slots and allowing any nonzero arithmetic-progression step gives **p=0.23247** over 100,000 whole-fragment permutations. The same 12/6/0 pattern occurs in fragments **1, 7, 10, and 26**; another progression occurs in fragment 18. The position motif is therefore not selective after accounting for seed/step exploration.

**Decision:** this obvious recursive prime→fragment continuation is not selective and does not turn the 11-rune fragment into a route or plaintext. The conditional 12/6/0 position motif is also non-selective in the all-seed/all-step familywise scan. This does not disprove the original 199/Ac bridge; it only rejects this direct recursive extension. Do not continue applying the same arithmetic rule to every fragment. Reproduction: [deterministic Node 22 SFT](../sims/fragment7_recursive_prime_fragment_gate.cjs).

### Fragment 7 as an 11-rune Vigenère key: negative

The source-selected 11-rune fragment was tested as a repeating key against all **12,956** unknown runes. Two numeric readings were fixed in advance: GP ordinal values **[24,16,14,17,19,6,27,15,17,14,12]** and GP prime weights modulo 29 **[10,1,18,3,13,17,20,24,3,18,12]**. Both additive directions and both book-global/page-reset clocks give eight variants. Their GP-trigram scores range from **−14.119538 to −14.014424**, all at or below the raw ciphertext **−14.004469**; native Emerson control is **−7.746919**. Applying the same four ordinal/prime and sign variants only to the **185 black runes on p6** (excluding the 11 red key runes) also produces no coherent text; best score **−13.827676** on this short sample. This rejects only the direct repeating-Vigenère interpretation of fragment 7.

### Fragment 7 as a historical OutGuess passphrase: original-carrier and specificity gates completed

The original-source bridge suggests two predeclared keys: exact GP transliteration **ATXBMGIASBXEO** and the initial Ac rune's semantic reading **OAK**. Their proposed targets were original LP2 physical p6 / **23.jpg** (containing the 11-rune fragment) and the authenticated 2016 tree **cicada2016-4gq25.jpg**. We also tested the same keys on p5 / 22.jpg and p7 / 24.jpg, the immediately neighboring original pages, as *negative specificity controls* because the fragment-7 key hypothesis does not select these pages.

The initial [manual run 43021763176](https://github.com/FlareZ123/liber-primus/actions/runs/43021763176) performed four target attempts; the [controlled run 43022439918](https://github.com/FlareZ123/liber-primus/actions/runs/43022439918) expanded to eight attempts and archived the exact six recovered binaries in [artifact 13855552680](https://github.com/FlareZ123/liber-primus/actions/runs/43022439918/artifacts/13855552680) (30-day retention). Both runs used the pinned maintained OutGuess build and the unchanged [fixed SFT](../sims/lp2_fragment7_outguess_sft.cjs) positive controls. Default-key recovery of the authentic 2016 source was exact (1,136 bytes, SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`); independently embedding/recovering a 52-byte plant in p6 under **each** selected key was byte-exact.

| Predeclared key | Target p6 / 23.jpg | Negative control p5 / 22.jpg | Negative control p7 / 24.jpg | 2016 signed tree |
|---|---|---|---|---|
| `ATXBMGIASBXEO` | 29,681 bytes, SHA-256 `a2c894e1014e6b572cb60c27348a6be71841f093ea5e716242622423ba878f06` | 29,681 bytes, `062560b43a9c7275be11e0fd26aa4b40eacebbd399f39e3a0907ad46d9125bd4` | 29,681 bytes, `9995278a0d4b9e98284038136db468d7ffc3281482443347a10580885f5d9820` | exit 1, zero bytes |
| `OAK` | 14,471 bytes, SHA-256 `b18fca6ee1b12e2ec9b29cc9abb593e36c0648ee25cca6e40c2cb2fe27580248` | 14,471 bytes, `534af3bdc7f89255591e512762b439cb638a5df309e7373b3d779287d64cf3fd` | 14,471 bytes, `0cb229aa61cee7f48600c8aca594faab2a1498b519a3cb7e0dea2eefedcf07f0` | exit 1, zero bytes |

**Decisive specificity failure:** all three physical LP2 carriers produce **identical key-dependent OutGuess seed and header length** despite different underlying page texts: seed 2,437/length 29,681 for the GP key; seed 38,138/length 14,471 for OAK. The extracted binaries also share long *byte-identical prefixes* (GP: p5/p6 1,017 bytes, p5/p7 1,048 bytes, p6/p7 1,017 bytes; OAK: p5/p6 494 bytes, p5/p7 494 bytes, p6/p7 547 bytes). These exact prefix lengths were recomputed directly from the downloaded run-43022439918 ZIP with the first differing byte over each pair, not inferred from superficial text previews. All six runs returned high-entropy, non-printable output (entropy 7.987–7.994 bits/byte), `file` reported generic binary data, GPG packet checks failed and none matched a recognized payload. The much greater-than-chance shared prefixes and same key-specific headers across controls demonstrate that the apparent OutGuess extraction on p6 is **not specific to the source-selected fragment**. A shared page template is a plausible explanation, although the precise coefficient-level cause has not been isolated.

**Decision:** eight original-carrier attempts, **six header-consistent raw binaries, zero recognizable payloads, four header-consistent adjacent-page controls**; all authentic and planted positive controls passed. Retire the two fixed keys as a selective OutGuess recovery route and do not treat their raw binaries as authenticated ciphertext for second-layer searches. The exact 199/Ac fragment correspondence remains a provisional navigation hypothesis but does **not** supply an OutGuess key, original GP-cipher inverse, unknown plaintext or destination. This scoped test cannot exclude other carrier mechanisms, source-derived passphrases or hidden encrypted payloads on the manuscript.
  
## LP2 table selector suggested by the same cells

The selected source numbers also satisfy:

```
366 mod 8 = 6
199 mod 8 = 7
```

Read as zero-based column indices, these select columns **7 and 8** in the printed 32×8 LP2 numeric table. This is a plausible cross-round selector because the table has eight columns. It also happens to select the same pair with the lowest normalized adjacent-row variation in [the existing all-28-pair screen](grid-two-column-serial-order.md): (T=1.4505445), familywise permutation tail (631/100001=0.00630994). **Do not count these as independent confirmations:** the low-variation pair was discovered by scanning all 28 pairs before this modulo-8 cross-round link was noticed. The modulo-8 interpretation is a new hypothesis, not an authenticated column instruction.

There is a natural indexing ambiguity. Treating the 1-based cell numbers 6 and 7 directly as 1-based table columns selects printed columns **6 and 7**, not 7 and 8. Both interpretations were tested below.

## Columns 7–8 as a per-fragment two-rune key: bounded negative

The modulo-8 selector has one simple key interpretation worth testing before considering more elaborate state models: align table row *r* with red fragment *r*, and use that row's two selected cells as a repeating two-rune additive key for the fragment. This is a hypothesis, not a source-established cipher: neither modulo 8 nor row/fragment alignment is authenticated.

The original 13-dot annotations define **32 ordered fragments**, of which **17 are nonempty**. The 32×8 numeric table also has 32 rows. The 2014 stage04 cells 366 and 199 give zero-based residues 6 and 7, selecting printed columns **7–8**. The natural 1-based alternative selects printed columns **6–7**. For both selections, the test maps each pair either directly modulo 29 or through φ(byte) modulo 29, then tests both additive directions. It applies the row's two-symbol key cyclically within its corresponding fragment; no key fitting, row shifts, or word-specific exceptions are allowed.

For fragment 7, whose exact input is **ATXBMGIASBXEO**, the selected row values and resulting outputs are:

| Printed columns | Mapping | Direction | Row-7 byte pair | GP key | Fragment-7 output |
|---|---|---|---|---|---|
| 7–8 | raw mod 29 | subtract | [156, 80] | [11, 22] | `PDOAHPTOEGNGU` |
| 7–8 | raw mod 29 | add | [156, 80] | [11, 22] | `GNAEIUEANHEAWD` |
| 7–8 | φ then mod 29 | subtract | [156, 80] | [19, 3] | `CPAXFOHEOIAJOE` |
| 7–8 | φ then mod 29 | add | [156, 80] | [19, 3] | `XMRLNNBEWBTH` |
| 6–7 | raw mod 29 | subtract | [171, 156] | [26, 11] | `IACBGOEAURLOS` |
| 6–7 | raw mod 29 | add | [171, 156] | [26, 11] | `NGIAJEATBAYXAEN` |
| 6–7 | φ then mod 29 | subtract | [171, 156] | [21, 19] | `OYOEIAIATGAEAEAL` |
| 6–7 | φ then mod 29 | add | [171, 156] | [21, 19] | `TGGWJAEMCNRR` |

The same fixed operation was applied to every nonempty fragment. No complete fragment yields intelligible plaintext; occasional short letter substrings do not form a coherent message. One alternative-column φ variant skips fragment 29 because its selected pair contains zero and φ(0) is undefined; no replacement value is fitted.

Reproduce with [`sims/lp2_2014_fragment_pair_key_sft.cjs`](../sims/lp2_2014_fragment_pair_key_sft.cjs) or the `fragment-pair` probe in [`.github/workflows/grid-256-tests.yml`](../.github/workflows/grid-256-tests.yml). The push-triggered [GitHub Actions run 43023624217](https://github.com/FlareZ123/liber-primus/actions/runs/43023624217) completed successfully.

**Decision:** reject the direct row-per-fragment, repeating two-rune additive-key interpretation for both natural column readings, raw/φ mappings, and both signs. This does not disprove every possible use of columns 7–8 as state or route material, but no source currently selects a more elaborate operation. Do not expand this into an affine/LFSR search without a new, independent clue.

## Rad↔Ac as a 32×8 table coordinate: bounded negative

The 2014 edge can be read as a coordinate in the original 32×8 LP2 table without a fitted transform: Ac=24 as the row and Rad=4 as the column gives row-major index 24×8+4=196. The original byte there is **176**, or **2 mod 29**. The signed 2016 image dimensions independently select offsets 563 mod 256 = **51** and 569 mod 256 = **57**, whose table bytes are **59** and **118**.

A tempting “numbers are direction” interpretation is to treat each byte as the next table index. It is not selective. Starts 51, 57, 196 and the transposed-coordinate control 152 all enter the same 11-cycle:

247 → 192 → 0 → 203 → 68 → 199 → 47 → 76 → 114 → 197 → 115 → 247.

That cycle's functional-graph basin contains **252 of 256** cells. Convergence from the source-selected starts is therefore expected for almost any start and does not define a route or event mask. The selected coordinate and dimension offsets are exact arithmetic, but their pointer-walk interpretation is rejected. This is distinct from the already rejected φ(byte)/bearing transfer above. Reproduce with [agent38_issue18_rad_ac_projective_gate.cjs](../sims/agent38_issue18_rad_ac_projective_gate.cjs).

## Direct LP2 direction-field transfer: bounded negative

The simplest transfer of the 2014 map to the original 32×8 table was fixed before inspecting any route output:

1. For each positive table byte (b), assign the GP label (φ(b) mod29), using the same mapping as the 2014 square.
2. Treat (b) itself as an angle in degrees, quantized to the nearest 45° sector under the same 0°-east, counter-clockwise convention.
3. Follow the indicated eight-neighbour move in the printed rectangular grid. Moves beyond the grid exit; there is no toroidal wrap or fitted rotation.
4. Since (φ(0)) is undefined, zero-valued cells retain their 0° direction but have no GP label.

Results on the canonical original table:

| Tested region | Ac labels | Rad labels | Ac-to-Rad directed paths | Reciprocal Rad↔Ac cycles |
|---|---:|---:|---:|---:|
| Full 32×8 table | 18 | 14 | 3 | 0 |
| Modulo-8 selected printed columns 7–8 | 6 | 6 | 0 | 0 |
| Direct 1-based cell-number columns 6–7 | 7 | 1 | 0 | 0 |

The full grid has **11** reciprocal two-cell cycles, none labelled Rad↔Ac. The selected 32×2 columns 7–8 contain only **B↔F** and **S↔T** cycles. The alternative printed columns 6–7 contain **Thorn↔Rad**, **Haegl↔Beorc**, and **Gyfu↔Tir**, but no Ac-to-Rad path. Thus the direct transfer does not reproduce the source-selected Rad↔Ac cycle in either natural column interpretation. The three Ac-to-Rad paths in the full grid are non-reciprocal and do not select a unique route.

A planted 1×2 positive control with bytes [5,199] does recover Rad→Ac→Rad under the exact same `φ` and angle rules (`φ(5) mod29 = 4`; `φ(199) mod29 = 24`). This checks the graph implementation; it does not authenticate the transfer hypothesis.

**Decision:** the direct “table byte = bearing and φ(byte) = map label” reading is rejected for this LP2 table. The modulo-8 column selector remains an interesting but retrospective source alignment; it supplies no key, state, plaintext, or destination. Do not repeat this direct graph transfer or expand it into free rotations, offsets, or geographic searches.

## Does the 2014 direction graph select the sparse lag-six events? — bounded negative

The 2016 image dimensions differ by six, and the 2014 direction map contains a six-cell cycle. That makes the full graph a finite, human-motivated candidate for selecting the locations of the original word-local lag-six relation, rather than merely another angle/key interpretation. This test uses the graph exactly as already defined above: each cell's GP label is \\(\\phi(n)\\bmod29\\), and its directed edge is the source-fixed eight-neighbour move under the mathematical-angle convention. There are **17** in-bounds symbol edges, including the six-cycle **D → G → EO → I → S → M → D** and the reciprocal **Rad ↔ Ac** pair. No rotation, phase, edge, label, or offset is fitted.

I compared those edges with all **1,290** original word-internal positions \\(j\\ge6\\) in the canonical **2,896-word / 12,956-rune** unsolved corpus. The same fixed \\(T_6(x)=24-2x\\pmod{29}\\) map was used only to label the already observed six-back matches.

| Source-fixed selector | Original hits | Matched-null mean | Null controls ≥ observed |
|---|---:|---:|---:|
| Six-cycle directed edges | 5 | 7.993 | 1,833 / 2,000 |
| Six-cycle source-symbol mask, T6 hits | 12 / 227 | 8.9435 | 311 / 2,000 |
| Full 17-edge direction graph | 26 / 1,290 | 23.534 | 622 / 2,000 |
| Full graph edges intersecting T6 hits | 4 / 80 | 2.475 | 469 / 2,000 |
| Full graph source-symbol mask, T6 hits | 22 / 414 | 16.3665 | 146 / 2,000 |
| All original T6 hits (internal reference) | 80 / 1,290 | 49.6065 | 0 / 2,000 |

The null consists of **2,000 deterministic within-word permutations** (seed `0x18a6c333`). Each word retains its exact length, rune multiset, first and last rune, and count of adjacent equal pairs; therefore the 1,290 eligible word-local lag-six positions are unchanged. No conditional shuffle fell back to the original word. Synthetic positive controls recover all **6/6** cycle edges and **17/17** full-graph edges, checking that the detector is capable of finding the planted relation.

The T6 relation itself remains elevated against this conditional null (80 observed versus mean 49.6065; no control reaches 80). What fails is the proposed **2014 direction-graph event selector**: only four authentic T6 hits are graph edges, the full graph's edge count is not enriched, and its source-symbol mask is not enriched. Only one of the six directed cycle edges is itself a T6 edge (**G → EO**). The Rad↔Ac two-cycle is not a T6 edge: **T6(Rad)=T** and **T6(Ac)=C**.

**Decision:** retire the 2014 direction graph as an explanation for the sparse T6 event placement. This does not invalidate the separate 199 → empty fragment 6 / Ac fragment 7 human-path hypothesis, the 2014 onion timing clue, or the retrospective LP1 MOBIUS/p40 Cayley identity. None of those currently specifies an independent mask for the 80 positions. Do not broaden this result into free rotations, alternative graph orientations, or language-score searches.

## 5×5 bearing selector over 25 consecutive red-rune blocks — bounded negative

The correct source framing is **25 consecutive chunks of nine red runes**, each chunk read as a row-major 3×3 block. The 2014 5×5 square supplies one direction for each block; that direction selects one of the eight perimeter positions. The target is the corresponding cell's phi(n) mod 29 label. The original 225 red runes are concatenated in physical/canonical page order, then red-span start order, with no omissions or reordering.

The fixed direction indices are:
```
6 3 0 3 3
0 4 3 7 0
5 5 2 5 5
0 7 3 4 0
3 3 0 3 6
```
The target phi(n) mod 29 labels are:
```
12 15 10 14 5
4 24 19 12 6
25 23 14 23 25
6 12 19 24 4
5 14 10 15 12
```

Two angle conventions must not be conflated. The 2014 direction-map analysis uses the mathematical convention (0° east, counter-clockwise); a literal compass convention is 0° north, clockwise. Their 3×3 perimeter-position maps, in row-major cell indices, are:
- Mathematical: [5, 2, 1, 0, 3, 6, 7, 8].
- Compass: [1, 2, 5, 8, 7, 6, 3, 0].

Under the mathematical convention, the selected sequence is:
```
F Y T U M W X M NG T G M S P H OE H T J L A O N D L
```
It matches the target only at **block 8**, where the NW perimeter cell is M. Under the literal compass convention, the selected sequence is:
```
O NG TH B O T U L M C G M H P H EO S TH IA I NG O C OE A
```
It has **0/25** matches.

The block-capacity check is decisive: only three blocks contain their corresponding target anywhere on the eight-cell perimeter, and each contains exactly one such occurrence.

| Block | Target | Possible perimeter position (0-based) | Original source coordinate |
|---:|---|---:|---|
| 4 | X | 7 | p6:73 |
| 8 | M | 0 | p8:6 |
| 14 | D | 7 | p33:0 |

Thus no direction assignment can exceed **3/25** exact matches. With equiprobable directions, the expected count is **0.375**, P(matches ≥ 2) = **0.04297**, and P(matches ≥ 3) = **0.00195**. The fixed mathematical selector obtains one match; the fixed compass selector obtains none.

An order-preserving phase null cycles the starting offset of the original 225-rune stream through all 225 positions, keeping the 25 consecutive blocks, direction matrix, and target matrix fixed. For the mathematical convention the distribution is **0:70, 1:90, 2:47, 3:15, 4:3**. The authentic origin has one match; **155/225** offsets have at least one (empirical p = **0.6889**), so the single match is not exceptional. For the compass convention the distribution is **0:75, 1:84, 2:46, 3:15, 4:5**; the authentic origin has zero.

**Decision:** this exact 25-block selector does not recover the phi(n) mod 29 target matrix or a readable 25-rune plaintext. The mathematical 1/25 result is the same NW hit identified in the source-capacity analysis; it is not evidence of a key. Retire this selector rather than expanding it into free phases, rotations, or alternative block layouts.

Reproducer:
```sh
node sims/2014_red225_bearing_block_selector_sft.cjs
```
The script prints the full selected coordinates for both angle conventions, the three-block capacity bound, and both 225-offset null distributions.

## Historical interpretation and limits

The 2016 image is a dead-oak illustration, not a verified geographic photograph. The Uncovering Cicada Wiki attributes it to [this ClipartBest oak image](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg). Treat the oak as a symbolic Ac pointer: Ac is also the first red rune in the 199-selected seventh fragment. Do not infer a physical starting location from the image.

The 2016 message's instruction that words are a map, meanings a road, and numbers directions is compatible with the 2014 matrix interpretation. However, the angle convention is an inference, not a proven instruction. The separate 15×15 red225 compass selector also fails its exact \\(\\phi(n)\\bmod29\\) target check (2/25; 225-phase empirical p=0.3022), so it is not a recovered route. Using compass bearings (0° north, clockwise) does not produce the cell-6 → cell-7 oak connection. The archived 2016 message also ends “Beware false paths,” so semantic and geographic matches require a source-fixed stopping rule.

The direct byte-as-bearing transfer to the LP2 numeric table remains rejected, and the full 2014 direction graph does not select the sparse T6 event positions. The 199/Ac fragment bridge remains a source-constrained human solve-path hypothesis, but it does not specify a reversible cipher, recover plaintext, or establish the destination. The direct repeating two-rune additive-key interpretation of columns 7–8 is now tested and negative; other state/route interpretations remain untested and must not be expanded without a source-selected reversible operation.

## Reproduction

Run from the repository root:

```sh
node sims/2014_magic_square_direction_map.cjs
```

The first script checks the 1033 magic square, recomputes the `φ(n) mod29` rune labels and eight-direction graph, derives both natural table-column interpretations, reconstructs the 32 red-rune fragments from the original ink annotations, tests the three prime-entry residue pairs, and reproduces the exact conditional and seeded permutation nulls. It also tests the full 17-edge graph and six-cycle against all original word-local lag-six positions with 2,000 endpoint/multiset/doublet-preserving word shuffles. The second script freezes the 25-consecutive-nine-rune bearing selector, reports both mathematical and compass conventions, and reproduces the 225-offset order-preserving nulls.

## Source links

- [2014 stage04 extraction instructions](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage04/README.md)
- [2014 archived walkthrough and extracted 5×5 matrix](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/2014.md)
- [2016 signed message](https://github.com/iBotPeaches/cicada_3301/blob/master/messages/2016/hello-the-path-lies-empty.asc)
- [2016 image archive entry](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/archives/scream314/assets/2016/4gq25.jpg)
- [2016 image's reported oak-clipart source](https://www.clipartbest.com/cliparts/abc/y97/abcy97qTL.jpeg)
- [Original table order and 28-pair scan](grid-two-column-serial-order.md)
- [LP2 13-dot red-rune source annotations](../resources/liber-primus/lp2-ink-annotations.json)
- [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json)
- [Existing 2016/2014 selector hypothesis](../workplace/2016-epiphany-2014-onion-path-hypothesis.md)
