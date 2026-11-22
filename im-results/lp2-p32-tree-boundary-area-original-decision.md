# P32 tree-canvas boundary→interior: one area-key inverse and the missing opcode

**Decision, Agent16, 22 November 2026, Director #2262.** The signed January 2016 563×569 JPEG and original physical p32 furnish a reproducible **21-rune boundary / 100-rune interior geometry**, but do not select a cipher equation. I froze one literal area-key operation, tested both necessary arithmetic directions on all 100 unchanged original recipient runes, and found **no native-GP plaintext**. The exact original-source SFT passed Windows Node.js 22 ([run 45026919340](https://github.com/FlareZ123/liber-primus/actions/runs/45026919340)). No key or unknown plaintext was recovered.

## Source-constrained geometry

Original p32 scan [49.jpg](../resources/liber-primus/49.jpg) contains 121 GP29 runes printed on **six** lines, ending with a red thirteen-dot mark. An **11×11 row-major reshaping** is proposed by the rune count; it is **not** printed as a square. Its first eleven GP-prime values are the width strips

`[73,5,101,19,101,3,43,107,13,19,79]` (sum **563**),

and its left column comprises the height strips

`[73,23,5,23,79,59,53,79,59,109,7]` (sum **569**).

Those sums match the dimensions of the authenticated 2016 JPEG exactly. The top row and left column overlap at the first rune, hence **21 distinct keyed boundary positions**, with 100 previously untested interior positions `A[r,c]`, `1≤r,c≤10`. This geometric observation was discovered retrospectively; the independently documented EPIPHANY/DEVOTED words provide a possible p32 selector, while the 2016 JPEG's oak and p32's dead tree derive from **different underlying pictures**. See [original selector/source study](lp2-tree121-signed2016-source-gate.md).

## One literal original-source value-changing rule

A natural quantity attached to each **signed-image rectangle** is its pixel **area**. Using the original top and left GP-prime strip lengths, the area of interior rectangle `(r,c)` is exactly

`K[r,c] = GPprime(A[r,0]) × GPprime(A[0,c]) mod 29`.

For the original p32 value in that cell, test the historical GP29 additive inverse `P[r,c] = C[r,c] − K[r,c] mod 29`, and the opposed direction `P = C + K mod29`. The rule consumes the actual 21 boundary runes without fitting any rune, image threshold, crop, coordinate, phase, stop, or language key. Retain every boundary rune unchanged as a **typed key**; no original page position is discarded.

| Original 100-rune interior | GP29 IoC | Source conclusion |
| --- | ---: | --- |
| Unmodified original | 0.034343434343 | Ciphertext-like |
| Literal area-key subtraction | **0.033333333333** | Ciphertext-like; starts `HXBEOJSXELBEOCMNGUMTOEAPRTTJAELMJIAR` |
| Opposite area-key addition | **0.033737373737** | Ciphertext-like; starts `GLNGERNGGWAYRFGTTHXPWJLTHOELBEYJFTHPGT` |

The full subtracting transliteration is:

`HXBEOJSXELBEOCMNGUMTOEAPRTTJAELMJIAREAHCTMONYOHNGCTBRFWEBAEFYGYIPUSWAEEORMBOEAYOLAEBWPCXTOTHIAMIRGLUEUCHYLMEAEMCFTHFI`

Neither direction produces a legible 100-rune original paragraph or a source-selectable output. All **100/100** subtracting positions exactly forward-reencrypt the unchanged original p32 interior; a separate 100-rune GP29 plant consisting of original clear p57 values repeats/truncates to length100 and recovers **100/100** symbols under the same key. This validates the code and a reversible implementation. It does **not** distinguish the correct key: all bijective wrong-key decoders also reencrypt their own outputs.

[Read-only original-source CommonJS SFT](../sims/lp2_p32_tree_rectangle_area_original_sft.cjs) fully emits its original input, axes, integer areas reduced mod29, interior indices, and complete candidate outputs; [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45026919340).

## Causal stop: what the historical source fails to supply

The signed 2016 prose says **“Its words are the map, their meaning is the road, and their numbers are the direction.”** It does **not** tell a solver to multiply row/column prime widths, convert rectangle area to a GP29 additive key, or treat the 21 boundary letters as a cipher key rather than encrypted message. It does not specify a key direction, state progression, word-clock, page-to-page reset, treatment of an interior word crossing a boundary cell, or what the 100 ordered outputs should be. Earlier source-driven 2D addition, 2D prefix sums, tile brightness, transposition, Hill, and Möbius procedures were already tested independently, so choosing another algebraic layer after the area failure would be unconstrained selection.

**Fork for the Director:** retire this **one 21-boundary/100-interior area decoder** as a direct native-GP inverse. Retain the exact 563/569 axis checksums as a possible navigational clue and the complete original p32 as ciphertext. Reopen a value-changing boundary route only after an independent original Cicada instruction names its **operator and operand serialization**, before inspecting decoded p32 text. A later 2016 clue can conceivably guide a 2014 artifact, but the original 2014 player did not yet possess the 2016 image; any claim about the 2014 intended path must account for that chronology. No further key or transposition sweep is warranted solely by the dimension equality.
