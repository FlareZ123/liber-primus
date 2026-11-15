# Original terminal 32×8 circumference: p57-known five-point Laplacian gate

**Agent 48, 15 November 2026. Decision: one full, direct source-shaped two-dimensional decoder is incompatible with the original printed table and the independently clear p57 text. No unknown Liber Primus rune, authentic key, intended operation, or destination was recovered.** This decision specifically concerns a zero-salt, five-point finite-difference GF(29) code. It does not rule out other 2D transforms, secret keys, table radices, or alignments.

## Original clue and falsifiable interpretation

The known original p57 text says **“WE MUST SHED OUR OWN CIRCUMFERENCES”** and **“FIND THE DIVINITY WITHIN AND EMERGE.”** On physical pp49–51, the table has exactly **32×8=256 printed cells**. Its outer circumference contains **76** cells, matching unsolved p55's **76 rune symbols**. Its **30×6=180** interior cells match the **85 p56 + 95 clear p57** rune positions. This original three-way size equality is established in [the terminal circumference source gate](terminal-grid-circumference-knownplain-gate.md); it motivates, but does not authenticate, a geometric transform. Unlike the previous row+column additive-mask and degree-7 linear recurrence probes on that framing, the present test uses the common **four-neighbor discrete Laplacian** as a literal two-dimensional coupling between adjacent grid values.

Let the original printed 256 conventional base60-decoded bytes, in row-major 32×8 order and reduced modulo29, be `T[r,c]`. The proposed encoded full terminal message `P[r,c]` satisfies the **single fixed equation**

`T[r,c] = 4P[r,c] − P[r−1,c] − P[r+1,c] − P[r,c−1] − P[r,c+1] (mod29)`.

Outside-grid neighbors would contribute zero, but the actual test never uses an outside-grid boundary or unknown symbol. No key, shift, sign variant, radius adjustment, visual row permutation, rune map, plaintext guess, or language scorer is fitted. The table's byte decode is still conditional on the historically unverified radix60 convention. The operator is an exploratory interpretation of *circumference/within*, not a Cicada-authenticated instruction.

Place p56 in the first **85** interior slots and p57 in the following **95**, each in their original GP29 printed order; this is the straightforward row-major reading of the count match. **Use only p57's already clear source rune positions**, leaving p55's 76 perimeter values and all of p56's 85 slots entirely unknown. A p57-centered interior cell whose up/down/left/right neighbors all belong to p57 has its entire Laplacian determined without deciphering anything. There are exactly **56** such cells. Any exact direct decoder under the claimed rule must match *all 56* independently determined table residues before it could plausibly recover unknown p55.

## Executed original and source-native planted results

The original table's complete 256-byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The original p57 clear rune record has exactly **95** GP29 ordinals. Test every fully determined p57-centered site:

| Predeclared measurement | Exact result |
|---|---:|
| Full table slots | 256 |
| Perimeter / interior slots | 76 / 180 |
| Explicitly clear p57 interior slots | 95 |
| Fully known p57-center-plus-four-neighbors equations | **56** |
| Original table congruences that agree | **2 / 56** |
| Original table congruences that fail | **54 / 56** |
| Fully known equations matched by authentic-p57 planted encoder | **56 / 56** |

The first testable center is original table slot **130**, row16/column2 under zero-based indexing. Its p57-only source GP29 stencil predicts residue **1** while the authentic table cell is **28**. Further independent contradictions occur at slots131 (predicted18, observed4), 132 (2 versus24), and 133 (11 versus25). The only original agreements are slots **147** and **210**. They are ordinary chance-level overlap under this wrong direct mapping, not deciphered terminal text.

The positive fills a complete synthetic 256-GP-symbol grid with deterministic native GP values, **overwrites all 95 p57 interior slots with the genuine original clear p57 source**, then applies precisely the asserted five-point Laplacian to obtain a synthetic 256-cell code. Without using any other synthetic plaintext positions, the same extractor agrees at **56/56** p57-only sites. This demonstrates that the original failure cannot be attributed to a p57 offset error or wrong operator evaluation; the plant does not claim to reconstruct the original encrypted table.

The [single-file Node22/CommonJS SFT](../sims/lp2_terminal_grid_laplacian_p57_sft.cjs) independently checks the source table hash and all three original terminal page lengths, specifies the 56 fully determined original equations, asserts the exact 2/56 match count and first mismatch, and verifies 56/56 planted controls. The original congruence counts were also independently evaluated against the same locked 256-byte table and original p57 GP indices in a separate Python implementation.

## Decision for the research frontier

**Retire direct GF(29) four-neighbor Laplacian encipherment of the 32×8 terminal table under this original row-major 76+180 alignment.** The contradiction arises within the *known p57 interior*, so supplying an arbitrary p55 perimeter or a missing original key cannot repair this fixed code. The original 76/180 geometry is still an interesting source-native structural match, but the manuscript does not itself prescribe this Laplacian or even assert that the table encodes the last three pages. A useful successor must independently select a distinct reversible operator (and its data representation) and make full predictions on untouched known p57 or p56, before attempting any unverified p55 plaintext. More tuned geometry kernels without such a selector would not advance the solve.

This supports the established frontier in [the terminal circumference analysis](terminal-grid-circumference-knownplain-gate.md) and does not change `results/README.md`'s current state of **zero authenticated unknown LP2 plaintext**.
