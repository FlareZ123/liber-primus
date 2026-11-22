# Terminal table perimeter: source-derived quartic per-row decoding is impossible

**Agent 11, 17 November 2026. Original-input exact algebraic exclusion.** The full 256-cell source geometry gives a concrete route that, if valid, would recover **56 withheld p55 perimeter values** directly from 180 already-known LP2 plaintext symbols. The authentic source fails the proposed mechanism before any p55 unknown rune is examined. **No unknown LP2 plaintext, key or original instruction has been recovered.**

## Source premises, selection and independent control

The unchanged physical LP2 pp49–51 numerical table prints **32 rows × 8 cells = 256 values**. Its first/last rows and columns form a literal **76-cell perimeter**, enclosing **30 rows × 6 columns = 180 interior cells**. Separately, physical p55 has **76 unsolved original runes**, p56 has **85 independently solved plaintext runes**, and p57 has **95 originally clear runes**, giving an independently fixed 180-symbol known terminal register. P57 discusses shedding one's *circumferences*. That prose suggests examining an interior/perimeter relationship, but **does not prescribe** mapping table cells to this terminal text.

Earlier source-gated research already excluded ordinary byte lookups, row/column affine maps, and row projective maps for this exact geometric correspondence ([prior 180-symbol compatibility gate](p50-32x8-interior-known-plaintext-compatibility.md), [row Möbius gate](lp2-terminal256-rowmobius-known180-gate.md)). This investigation makes a genuinely different test: **each of 30 rows gets five wholly unrestricted secret coefficients of a quartic function over GF(29)**. The field is suggested by the 29-rune GP alphabet, while degree four is independently present as the total degree of the original table's H×G source-linked polynomial divisor ([complete field factorization](lp2-grid-complete-gf29-factorization.md)). Nothing in the original manuscript authenticates using that divisor degree as a row decoder. The experiment therefore tests a bounded possible solve path, rather than claiming to identify an authorial cipher.

## Precise inverse and original failure

Let `b[r,c]` be the original radix60 table byte, with physical rows `r=0..31` and columns `c=0..7`. Let `T[i]` be the **authenticated clear p56 GP29 values** obtained by the solved consecutive-prime-minus-one key with literal-F exception at p56 local rune56, followed by untouched **clear p57**, for exactly 180 symbols. For each interior row `r=1..30`, require the existence of *any* five independent secret coefficients `a[r,0..4]` satisfying all six simultaneous source equations:

```text
x = b[r,c] mod 29
T[(r-1)*6 + (c-1)] = a[r,0] + a[r,1]x
                     + a[r,2]x² + a[r,3]x³ + a[r,4]x⁴ (mod 29)
for c = 1..6.
```

Compute exact GF29 Gaussian elimination for degrees zero through five, counting each row's minimum possible polynomial degree and checking whether *any deterministic function* of the printed byte residue could fit its six observations.

| Original register interpretation | Rows compatible with degree ≤4 | Rows contradictory for **every** deterministic GF29-residue function | Remaining rows requiring degree5 |
| --- | ---: | ---: | ---: |
| **Canonical radix60 + genuine p56/p57 plaintext** | **2/30** (interior rows2,8) | **8/30** | **20/30** |
| Alternative radix59 + genuine plaintext | **3/30** | **6/30** | **21/30** |
| Canonical radix60 + p56 ciphertext as printed / clear p57 | **2/30** | **8/30** | **20/30** |

**Exact canonical quartic-compatible interior rows are zero-based 2 and 8** (physical printed table rows **4 and 10**). The complete canonical eight impossible interior-row indices are **1,7,9,11,16,19,20,23**. The table's leading source byte stream has SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

A single visible pair demonstrates an even stronger degree-independent contradiction, without any matrix computation:

- The **third printed row**, columns **3 and 5**, contains source tokens `0F` and `1g`. Their canonical decimal byte values are **15** and **102**. Both reduce to **15 modulo 29**.
- In the row-major 180-symbol known plaintext, the corresponding positions are **global interior indices 7 and 9**, with different genuine GP29 runes **TH** and **N**.
- No deterministic mapping from residue 15 to a single rune, polynomial or otherwise, can return TH at one position and N at the other. One of the eight impossible rows suffices to reject the entire 30-row scheme.

These are **necessary-condition obstructions** to recovering the unknown perimeter. They apply even if the row polynomial coefficients are completely unknown and different in every row, and even if one permits polynomial degrees greater than four in the eight contradictory rows. They make no appeal to English word scores or to p55 ciphertext.

## Stronger obstruction: secret affine maps for every column

A row function might plausibly be followed by **another secret operation on each printed column**. The previous simple collision no longer rules that out by itself, because two outputs in different columns may be transformed independently. Test the **strictly larger family**

```text
Y[r,c] = a[c] * f[r]( X[r,c] ) + b[c] (mod 29),
X[r,c] = original_table_byte[r,c] mod 29,
a[c] != 0,
```

where **every row function `f[r]` is entirely arbitrary**, including unrestricted degree, and all **eight** secret column slopes and offsets are unrestricted except that a slope must be invertible. Such secret per-column affine maps could have masked every one of the eight original raw row collisions. There is no polynomial assumption in this test.

But source rows **3, 9 and 21** (one-based, across the full 32-row printed table) each contain *equal residues* at original columns **3 and 5**. For those three rows, the latent `f[r](X)` is the same within that row, so the two corresponding known plaintext runes must lie on **one globally fixed affine graph** from output column3 to output column5. The three authentic original pairs are:

| Original printed row | Equal-residue source pair (columns3 and5) | Known GP indices, column3 → column5 | Known runes |
| --- | --- | --- | --- |
| **3** | `0F` and `1g`, both 15 mod29 | **2 → 9** | **TH → N** |
| **9** | `0P` and `3J`, both 25 mod29 | **16 → 10** | **T → I** |
| **21** | `3C` and `1j`, both 18 mod29 | **15 → 4** | **S → R** |

The first **two independently selected original rows** uniquely determine the column-to-column affine map, since 2 and16 are distinct field values:

```text
slope  = (10 - 9) / (16 - 2) mod29 = 27
offset = 9 - 27 * 2 mod29          = 13
third predicted = 27 * 15 + 13 mod29 = 12 (EO)
third actual    = 4 (R)
```

Thus **the third authentic row is an exact, withheld algebraic contradiction**. Even entirely unknown secret per-column affine transforms cannot make one arbitrary row function of the GF29 cell value explain the 180 known source outputs. This is stronger than the source quartic exclusion and is independent of p55 unknown ciphertext, GPT word plausibility and high-level plaintext guessing.

A separately planted positive uses **30 independent nonlinear cubic row functions**, with independent nonzero secret slopes and offsets for **each of the eight columns**, over the *same original source cell values*. Its third-row output is predicted exactly by the affine relation recovered from the first two synthetic rows, demonstrating that the discriminator accepts the architecture whenever it is actually generated from such functions. The SFT checks original pairs `[[2,9],[16,10],[15,4]]`, the unique slope/offset, the wrong original prediction **12 ≠ 4**, and the successful secret-key plant.

## Positive recovery plant

Independently construct one arbitrary degree≤4 polynomial for each of the **same 30 original numeric rows**, compute 180 synthetic known target symbols on the unchanged source-cell residues, and fit each row with the same GF29 inverse. **All 30/30 synthetic rows are consistent.** Exactly **28/30** rows have at least five distinct observed residue coordinates, so five coefficients are uniquely identifiable. On those 28 rows, the recovered coefficients produce the exact **56/56 independently planted** edge values in the original source table's leftmost and rightmost columns. Two repeated-residue rows cannot identify all five coefficients from their six input positions, so the control deliberately avoids claiming their border predictions.

This validates both the correct row geometry and the inverse's actual ability to **recover previously withheld perimeter symbols**, rather than merely reconstruct fitted interior points. The single-file original source [Node22 CommonJS SFT](../sims/lp2_terminal_known180_rowquartic_original_gate_sft.cjs) checks all input counts, the authentic p56 decryption, all row minimum degrees and collision positions, the explicit `0F/1g` contradiction, and the 56 held-out planted perimeter cells. The source data and test statements were additionally executed with a standard-library compatibility adapter in the GitHub-connected V8 environment: **1,542 assertions passed**; the already-pinned table SHA itself was not independently recalculated by that adapter. The checked-in Node script invokes Node's actual SHA256 routine.

## Decision and remaining possibilities

Reject the row-local residue model `P[r,c]=f_r(b[r,c] mod29)` in the fixed source interior, for **every** deterministic row function, including secretly keyed quartics. Even its **more permissive secret per-column affine extension** fails the source-selected three-row contradiction above; additional polynomial coefficient searches cannot salvage it. The alternate radix59 table remains impossible under unadjusted row functions in six interior rows. These exclusions do not apply to mappings with arbitrary unknown secret per-column substitutions or source-chosen position-dependent input states.

The result does **not** exclude the source table as a **keystream**, byte-sensitive decoder, nonlocal code, field extension, position-dependent stateful cipher, or a differently ordered alignment selected by an independent original clue. The manuscript has not established that the perimeter contains p55 plaintext at all. Future dependent work should first identify an author-specified map between table cells and terminal runes, and a transform using more information than the row-local GF29 residue alone. Arbitrary row-specific exceptions would destroy this model's decisive plaintext prediction and are unwarranted.

**Research decision:** preserve the exact 256 = 76+180 source geometry as one candidate structural pointer; retire row-wise GF29 polynomial/lookup inference as a route to p55 plaintext in the fixed original layout. The authoritative unsolved-page status in `results/README.md` is unchanged.
