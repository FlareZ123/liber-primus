# Exact p50 76-cell perimeter and 180-cell interior: two source-sized receiver candidates

**Status:** exact 76/180 original-print partition; direct key, prime-removal and stationary-lookup consumers negative; one bounded FOLD/MOBIUS interpretation also rejected; no plaintext, verified key or decoder. [Original-input SFT](../sims/lp2_p50_ring76_inner180_dual_source_gate_sft.cjs).

## Why the exact split could matter

The original LP2 p49–51 numerical table prints **32 rows × 8 columns = 256 tokens**, a single rectangle. Its outermost one-cell-wide clockwise perimeter contains exactly **76 tokens**, while the remaining inner **30×6 rectangle contains 180 tokens**. For a 256-token rectangular grid with a nonempty inner rectangle, the *only* dimensions whose one-cell perimeter is 76 are **32×8 or 8×32** (solve `rc=256` and `2(r+c)-4=76`). The printed dimensions select the former.

There are two independently known but **unproven** historical receivers of these lengths: the immediately later unknown LP2 p55 has exactly **76 GP29 runes** including the first-rune carry from p54; an anonymous 14-Jan-2013 Pastebin source separately lists **180 missing ordinary primes, 73..1223** (prime ordinals21..200) from the contemporary first-onion discussion. The solved p57 line "shed our own circumferences" can motivate attempting a perimeter/interior separation. Its wording does not identify p50, p55, the 2013 list, or a cipher. The 180-prime list is preserved as a participant transcript, without an authenticated original service capture or signature. The second count follows arithmetically from 256−76; it is not an independently chosen table dimension or a second statistical validation.

This partition is a **candidate source-sized route**, rather than a decryption. A byte-to-rune consumer, an independently authored known-tail correspondence or any missing-prime mapping must still be selected by external instructions.

## Frozen finite direct consumers

### Outer 76 cells → original p55, source-era XOR

Read the perimeter once from the **top-left** cell, along the top edge, down the right edge, left along the bottom and up the left edge; optionally reverse this same 76-element sequence as a direction control. The existing conventional base60 interpretation gives bytes 0..255. To apply the historically genuine Cicada XOR operation to original 0..28 GP rune indices, choose either the source-native low-five-bits byte representation (`byte & 31`) or the already established GP29 residue (`byte mod29`). For each i, take `P[i] = C_p55[i] XOR K_outer[i]`. A native-GP result requires all 76 outputs within 0..28; values29..31 cannot be read as GP29 without an unselected escape code.

| Perimeter key representation | Direction | Native-GP symbols | Invalid rune positions (0-based) |
| --- | --- | ---: | --- |
| Low five bits | Clockwise | 68/76 | 8 positions |
| Low five bits | Reversed | 68/76 | 8 positions |
| Byte mod29 | Clockwise | 66/76 | 10 positions |
| Byte mod29 | Reversed | **72/76** | **29,30,43,44** |

The most promising of these four still emits the invalid values [29,31,29,30] in two pairs inside p55 words; the other 72 glyphs are not readable GP prose. All four XOR operations invert exactly when applied twice; the native alphabet viability check is the decisive negative. A direct **raw-byte XOR** using the outer key and the published p55 GP **ordinals** or **prime weights** yields only 26–32 printable ASCII characters out of 76 in the corresponding clockwise/reverse arrangements, without text.

### Outer 76 cells → p55, direct GP29 addition/subtraction

The clockwise source-native GP29 additive perimeter key was **already tested more thoroughly** using both the 2014 and original LP2 table values, two byte-to-rune maps and 22,621 held-out native-English windows, in the earlier [perimeter key report](terminal-grid-xor-anend-digest.md#direct-table-circumference-as-a-76-rune-p55-key) and [reproducer](../sims/p55_table_perimeter_key_sft.cjs). The older test rejects all eight of its source-locked candidates. This narrower calculation independently reproduces only the two canonical clockwise signs and adds the **reversed-direction** control; the clockwise arithmetic must not be counted as a new finding. The tested additive **GP29** arithmetic is also used on solved p56. Keep the same top-left clockwise perimeter, the published base60 byte values and the exact original p55 rune order. Reduce each perimeter byte **mod29**, then apply one direct symbolwise addition or subtraction (with reversed perimeter as a direction control), without tuning a phase, skip or permutation. Every output consists of 76 valid GP29 runes, and the exact inverse returns all 76 original input runes; this is automatic for every key and does **not** select a historical one.

| Perimeter reading | Operation on p55 index | Decoded IoC | First twelve GP29 symbols |
| --- | --- | ---: | --- |
| Clockwise | subtract key | 0.03298246 | NG Y Y IA Y I W C I S A U |
| Clockwise | add key | 0.03368421 | NG A EO OE B L IA D EA S F J |
| Reversed | subtract key | 0.03719298 | T L Y J X D A H F E R T |
| Reversed | add key | 0.03649123 | Y U EO N F W I L N EO L AE |

For scale, unchanged p55 IoC is **0.03789474** and authentic solved p57 GP29 prose is **0.06270997**. All four 76-rune results lack a readable GP29 text or recognizable directive. The stronger existing clockwise English-language result is authoritative; this reversed check adds no plaintext. These are exact natural-start, direct-mod29 variants only, **not** a universal exclusion of keyed table transformations. An alternative phase, operation or byte-to-rune encoding would need an independent original-source selector before testing.

### Inner 180 cells → 2013 missing-prime sequence

Retain the inner 30×6 source tokens in their printed row-major order. Compare against the 180 historically listed consecutive primes in the listing's printed order. Only **3/180** respective values satisfy `byte mod29 = prime mod29` and **5/180** satisfy `byte mod29 = (prime−1) mod29`. Direct source GP29 subtraction `(byte−prime) mod29` has rune IoC **0.03767846**; addition has **0.03333333**, compared with raw inner byte residues **0.03823712**. Neither produces a readable GP29 passage or an identifiable index/prime mapping. This excludes the obvious direct position-aligned residues, not independent nested permutations, encodings, or unpublished source instruction.

### A separate original-text receiver: p53 plus the first p54 rune (Agent42, 12 November 2026)

The original LP2 terminal motif provides an independent **180-rune receiver candidate**: p53 has exactly **179** runes, immediately followed by p54's visibly enlarged red initial **A** (GP index24). Together they supply **180** source-visible runes, equal to the **30×6** interior of the actual pp49–51 32×8 numerical rectangle. The border has exactly **76** printed cells, equal to original p55's full **76-rune** page. Thus **(p53 + p54 initial, p55) = (180, 76)** and both table regions can be tested at once, independently of the anonymous historical missing-prime witness. This remains an *inferred* pairing: p53 and p54 are separated by a marked original chapter transition, p55 is separated by 231 more p54 runes, and no authored instruction says to ignore those intermediate runes or address the grid this way. The common p53/p55 moth and p54 decorative initial motivate checking the split without authenticating the operation.

A strict source-order, **all-secret stationary lookup** gate uses the complete printed two-character base60 tokens as inputs. Every distinct token can secretly map to *any* GP29 rune, and the border and interior are granted **completely independent mapping tables**. This is more permissive than a fixed monoalphabetic permutation. The exact maximum number of matching original ciphertext runes is the sum, over repeated input-token classes, of the most frequent target symbol in each class, so the result does not depend on guessed keys or language scoring:

| Printed region and candidate receiver | Source token classes | Exact best fixed lookup fit | Forced mismatches |
| --- | ---: | ---: | ---: |
| Interior 30×6, printed row-major → p53(179)+p54 initial(1) | 127 | **130/180** | **50** |
| Interior 30×6, reversed → same receiver | 127 | **133/180** | **47** |
| Outer perimeter from top-left clockwise → p55 | 68 | **69/76** | **7** |
| Outer perimeter, best of all 76 cyclic starts × two orientations → p55 | 68 | **71/76** | **5** |

Even allowing independent choice of the **best possible unknown map for each region** and independent orientation, the combined original receiver has at most **204/256** exact positions, requiring **at least 52** unsourced overrides. A planted known stationary lookup on each original region yields **76/76** and **180/180** as an exact positive control. Byte-versus-token recoding is irrelevant to the exact-token comparison because each printed token represents one byte under the working base60 encoding; mapping the byte residues modulo29 is stricter still.

This **rules out only complete, memoryless, per-region source-token lookup under the stated printed coordinates**, including both natural interior directions and every perimeter cyclic start. Stateful/changing keys, reordering individual interior positions, intermediate ciphertext transforms and different page receivers remain possible. No recovered plaintext, real key or creator-selected ring decoder follows. [Exact all-secret source SFT](../sims/lp2_p50_dualregion_stationary_allsecret_sft.cjs). The earlier full-frame 256-value test and ring-only source-token test are independent controls rather than new successes.

### One exact p53-length transfer from solved p56 and clear p57 (Agent43, 12 November 2026)

The original p53 has exactly **179** runes. The independently solved p56 has **85** GP runes, but its actual prime-totient cipher **advances the key on only 84**: its ciphertext F at local rune56 remains literal and does not consume a prime, while the other four ciphertext F values do consume one. The immediately following clear p57 contributes **95** rune indices, so the two separately source-visible components give **84+95=179**, exactly the length of original p53. This coincidence is not an authenticated instruction: no original page tells a solver to concatenate a cryptographic *keystream* from p56 with p57's *plaintext*, or select p53 as its receiver. It is nevertheless a precise, frozen candidate for an original passage, and the full p56 cipher supplies the **84-key-rune extraction independently of any unknown-page outcome**.

Take the **84** actual p56 \((prime_j−1)\bmod29\) shifts in their authenticated consumed order, append all **95** p57 clear GP rune indices in printed order, and use the resulting **179** symbols **once**, without resets or guessed phases, as the established GP29 additive cipher key on the **179** untouched p53 ciphertext runes: \(P53_i=(C53_i−K_i)\bmod29\). This unaltered operation produces IoC **0.034837738** versus raw p53 **0.033519553**; its Shakespeare-trained native-GP conditional-trigram mean is **−4.70148718** nats/rune versus raw ciphertext **−4.38456593**, a deterioration. The **1,215** independent 179-rune source-native Shakespeare windows (179-rune strides) range from **−2.56375724** to **−1.89803208**, with **0/1,215** as low as the decoded original. The inverse encoder reproduces **179/179** actual p53 runes; a genuine 179-rune native-GP encrypted plant recovers **179/179**.

This direct historical-method key transfer fails. The 179-length relationship remains a source count observation, with no evidence for mixing the two different known-page registers. Avoid retesting signs, reversals, pad phases, or p53 subsections without an independent operator clue. [Complete original-input CJS reproducer](../sims/lp2_p53_phi84_p57_179_direct_key_sft.cjs).

### A stronger original known-plaintext receiver: solved p56 plus clear p57

The **85 GP runes of independently decrypted LP2 p56** and the **95 unencrypted GP runes of p57** occupy the two immediately following final pages. Concatenated in original page order they give exactly **180 genuinely known plaintext runes**, equal to the numerical table's full interior size, in addition to the 76 unknown p55 runes matching its perimeter. This supplies a possible *crib-driven decoder*, rather than the previously tested conjectural p53+p54 ciphertext receiver: learn a secret dictionary from known interior pairs, then apply that dictionary to p55's perimeter.

Under the strict full-token lookup hypothesis, grant every distinct original interior table token a completely arbitrary secret GP29 output, unconstrained by alphabet order, prime indices or image arithmetic. If the same input token occurs at two known positions requiring different GP runes, no deterministic stationary dictionary can fit the known plaintext and hence **no such dictionary can be recovered for p55**. Optimize exactly by the per-token majority count over all **127 distinct original printed inner tokens**. The p56 known wording is taken from the [authentic 85/85 p56 φ-prime decryption regression](../sims/authentic_lp2_p56_totient_regression.cjs), with `K→C,V→U` as established Gematria spelling; p57's visible original rune indices are used unchanged.

| Original inner 30×6 reading | Best secret dictionary → 180 solved plaintext runes | Best secret dictionary → 180 original printed ciphertext runes |
| --- | ---: | ---: |
| Printed row major | **133/180** | 130/180 |
| Reverse row major | 131/180 | 131/180 |
| Alternating row snake | 131/180 | 130/180 |
| Printed column major | 132/180 | 131/180 |
| Alternating column snake | **135/180** | 128/180 |

**None** of the five natural source traversals can fit the complete independently known p56+p57 plaintext, even if the secret lookup is allowed to be trained after seeing all its output. At least **45 original rune positions** would need an otherwise-unspecified exception in the most favorable case. The simultaneously reported printed-ciphertext receiver confirms that the negative does not depend on choosing p56 plaintext rather than its actual encrypted image. A planted full 180-rune secret dictionary is recovered exactly for each of all five traversals by the same code. [Revised dual-source CommonJS SFT](../sims/lp2_p50_dualregion_stationary_allsecret_sft.cjs).

**Decision:** The attractive `p50 inner180 → known p56+p57 → learn secret lookup → decode p55 outer76` chain fails *before* touching the unknown p55 alphabet, so no fitted decoder or actual plaintext is obtained. The two sources' matching lengths are exact geometry, not an authenticated assignment. An independently authored stateful coder, per-position pad, nonnatural reordering, unknown transformation of the known runes or different cell mapping remains outside this stationary lookup exclusion. The next useful advancement is a creator-selected operation able to handle **repeated source tokens with different target runes** without arbitrary exceptions.


### Source-conditioned FOLD/MOBIUS test (14 November 2026)

A plausible, bounded selector combines three clues: the exploratory 2016 base58 word map sends “the” to p14 word 1, FOLD; the LP1 p05 word-number square contains MOBIUS; and clear p57 says “shed our own circumferences.” The FOLD address depends on an unproven word-map interpretation, so this is a hypothesis, not an authenticated maker instruction. It nevertheless selects one natural test of the exact 76/180 partition.

The fixed construction is:
1. Read the p50 76-cell perimeter from top-left clockwise. Split it into 38+38 cells and reverse the second half, forming a 2×38 Möbius strip.
2. Use that folded 76-byte sequence as a direct p55 key. Convert each byte to GP29 by residue mod29; test addition and subtraction. Low-five-bit XOR is a source-era operation control.
3. Remove the perimeter, leaving the 30×6 interior. For each byte B, use B=29q+r: q+1 is a standard numeric-keypad direction and r is the output GP rune. Join the six-cell top and bottom edges with a half-twist, reversing the column on wrap. Start at the top-left interior cell.
4. As a separate boundary check, treat the folded 2×38 perimeter itself as a directional Möbius strip, starting at its top-left cell.

| Fixed consumer | Result |
| --- | --- |
| Folded perimeter as p55 key, subtract byte mod29 | IoC 0.03543860; first 12 runes: NG Y Y IA Y I W C I S A U |
| Folded perimeter as p55 key, add byte mod29 | IoC 0.02912281; first 12 runes: NG A EO OE B L IA D EA S F J |
| Folded perimeter low-five-bit XOR | 69/76 outputs are valid GP29 indices; 7 positions are outside the alphabet |
| Reversed folded-key control | Mod29 outputs remain nonlinguistic; low-five-bit XOR has only 67/76 valid GP29 indices |
| Inner 30×6 directional Möbius walk | From cell 0, visits 13 distinct cells, then exits an open side boundary. Output: B IA J M OE S P R S R AE D A; 0/13 match the independently known p56+p57 receiver |
| Outer 2×38 directional Möbius walk | From cell 0, the first quotient selects keypad direction 8 (north) and immediately exits the open width boundary |

The known 180-rune comparison target is independently reconstructed as the established 85-rune p56 prime-totient plaintext plus the 95 clear p57 runes. The reproducer asserts the p56 regression before using that target. It also asserts the exact 13-cell path, output and boundary termination.

**Decision:** The straightforward FOLD/MOBIUS interpretation does not supply a p55 plaintext or a 180-rune known-plaintext decoder. This rejects only the fixed top-left Möbius folds, q/r keypad mapping, and direct mod29/XOR key consumers above. Do not tune strip width, seam, start, or byte mapping to rescue the hypothesis without a new independent selector. [Original-input reproducer](../sims/lp2_p50_mobius_fold_sft.cjs).

## Decision and reproduction

The **76/180 perimeter/interior partition is exact and source-visible**, with a separate p53+p54-start 180-rune candidate that is not an authenticated consumer. It gives two concrete historically adjacent candidate input lengths, but no operation selected by the maker. The four direct 76-place XOR inverses are **mathematically invalid as all-GP29 decoded output** and the four source-native direct additive GP29 inverses also give unreadable text; the direct 180-place prime-removal operation gives noise. The bounded FOLD/MOBIUS test also fails: the folded 76-cell key gives no readable GP29 output, the inner 30×6 directional walk exits after 13 cells, and the outer 2×38 walk exits immediately. These negatives reject only the fixed constructions documented above, not every possible transform. Retire these exact candidate transfers. Further tests should require an independently source-selected consumer and should not overinterpret the matching counts or refit positions, seams, or encodings.

The [standalone CommonJS SFT](../sims/lp2_p50_ring76_inner180_dual_source_gate_sft.cjs) reconstructs the 32×8 perimeter without duplicate cells, checks dimension uniqueness and p55 exact length, parses all 180 original archived primes, asserts the original source counts and direct outputs, and checks both the XOR and GP29 additive inverses. It uses [original p50 tokens](../resources/liber-primus/base60-grid.json), [original p55 runes](../resources/liber-primus/lp2-corpus.json) and [contemporaneous participant prime list](../resources/external/2013-01-14-missing-primes-pastebin.md).
