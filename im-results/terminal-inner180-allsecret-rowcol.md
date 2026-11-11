# All-secret row/column key obstruction on the terminal 180 known runes

**Status:** eight exact original-source architectural negatives, with all unknown mask coefficients eliminated. These reject a direct two-way separable mask interpretation of the LP2 numerical grid. No new unknown plaintext, key or destination.

## Human-solvable clue path

The solved final LP2 page says **“shed our own circumferences”**. The original 32×8 numerical table contains **76 outer cells and a 30×6 interior of 180 cells**. The last three text-bearing pages contain **76 still-unknown p55 runes**, followed by **85 solved p56** and **95 literally readable p57** runes. This natural 76/180 alignment is independently fixed by the physical source and enables an unusual known-plaintext attack that does not need to guess any actual key.

If the table is a ciphertext or a mask table for the 180 known runes, a practical human operation could be to remove a per-row key and a per-column key, then continue decoding to the 76-cell perimeter. With 30 interior rows and six columns, allow **every possible** row key and column key; this is a much wider family than guessing a phrase, five-tap linear recurrence or one stationary byte-to-rune lookup.

## Exact test without secret-key search

Let `G[i,j]` be the 180 printed inner table bytes, reading physical rows1..30 and columns1..6 in row-major order. Let `P[i,j]` be the 85 original solved p56 GP plaintext runes followed by the 95 visible p57 rune indices. As conservative alternatives test p56's **published cipher** glyph indices followed by p57, and the source's **base59** as well as base60 interpretations of the printed two-character table.

There are two frozen elementary byte/rune operations:

1. GF29: `Z[i,j]=(G[i,j]-P[i,j]) mod29`. If a secret row+column additive mask exists, `Z[i,j]=A[i]+B[j] (mod29)`.
2. GF256 XOR register: `Z[i,j]=G[i,j] XOR P[i,j]`. If a secret row+column XOR mask exists, `Z[i,j]=A[i] XOR B[j]`.

In either field, the **first row and first column determine every possible secret key up to one gauge offset**. They supply 30+6−1=35 independent parameters. The remaining **29×5=145** original cells must satisfy the key-free rectangle identities, e.g. `Z[i,j]=Z[i,0]+Z[0,j]-Z[0,0]` mod29. Even choosing all 35 keys optimally cannot change a single predicted residual.

| Original printed radix | p56 register | Operation | Exact withheld predictions |
|---|---|---|---:|
| base60 | native known plaintext | GP29 addition | **2/145** |
| base60 | native known plaintext | byte XOR | **1/145** |
| base60 | published p56 glyphs | GP29 addition | **9/145** |
| base60 | published p56 glyphs | byte XOR | **1/145** |
| base59 | native known plaintext | GP29 addition | **8/145** |
| base59 | native known plaintext | byte XOR | **1/145** |
| base59 | published p56 glyphs | GP29 addition | **1/145** |
| base59 | published p56 glyphs | byte XOR | **2/145** |

Every candidate fails at least **136 of its 145 independent required predictions**. The 29-symbol residue models have random-input match expectation 5/145; the 256-byte models only ~0.57/145. These original results are typical of unrelated registers, while an exact row+column mask would have **145/145** matches. The positive-control implementation constructs nonconstant, genuinely unknown row and column masks over both fields and recovers **145/145** equations with no supplied key coefficients.

## Decision

A direct **row+column additive/XOR mask** on the p50 table interior is ruled out under either historical radix and either visible p56 register. The clue-anchored 76/180 terminal alignment remains real, but it does not authorize an invertible cipher, an outer-perimeter decryption, or a table-byte interpretation. Because the necessary inner-180 test fails with *every* possible secret row/column key, fitting one cannot rescue the architecture. More elaborate nonlinear clocks or alternative traversal remain open pending an independently visible operation.

Reproduction: [self-contained exact original-input CommonJS test](../sims/terminal_inner180_allsecret_rowcol_sft.cjs) with Node.js 22; unchanged `resources/liber-primus/base60-grid.json` and `lp2-corpus.json`. The 85-rune p56 known plaintext is encoded **word by word** with canonical GP digraphs, preventing spurious cross-word ligatures.
