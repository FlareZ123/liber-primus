# All-secret row/column key obstruction on the terminal 180 known runes

**Status:** eight exact original-source mask negatives and a four-cell all-secret hybrid token-lookup-plus-row/column contradiction. These reject specific direct decoders of the LP2 numerical grid. No new unknown plaintext, key or destination.

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


## Stronger four-cell certificate: arbitrary token lookup **plus** arbitrary row and column masks

A distinct key-independent test eliminates an apparent loophole in the simpler masks: allow **every source-printed two-character token** an independent completely secret GP29 value, *and simultaneously* allow every physical table row and column independently secret additive masks. The proposed alignment's necessary equation is

`P[r,c] = S(token[r,c]) + R[r] + C[c] (mod 29)`.

The first 85 interior cells are independently known plaintext from the *authenticated p56 prime-totient inverse*, so this obstruction does not rely on the p57 register, a guessed p55 rune, or the base59-versus-base60 numeric interpretation. Under the published 30×6 inner-table row-major alignment, four original source cells already contradict **every possible** secret choice:

| Original full-grid row, column (1-based) | Table cell (1-based) | Original printed token | Verified p56 clear GP index |
|---|---:|---|---:|
| 5, 3 | 35 | `3H` | 2 |
| 5, 5 | 37 | `0s` | 4 |
| 15, 3 | 115 | `3H` | 10 |
| 15, 5 | 117 | `0s` | 13 |

In each row the row mask `R[r]` cancels when subtracting columns 3 and 5; between the rows both printed tokens are **identical in corresponding columns**, so the unknown lookup and the two unknown column masks would force identical column differences. Instead the two authenticated target differences are `2−4=27 (mod29)` and `10−13=26 (mod29)`. Since 27≠26 modulo29, the hybrid model is impossible even with unrestricted key material. A distinct planted hybrid with different secret token, row and column masks satisfies the necessary equality; the same CommonJS reproducer asserts all four source cells and the positive control.

This result strictly extends the earlier all-secret 30-row/6-column affine and direct byte-lookup exclusions, **conditional on the unproven 76-perimeter/180-interior mapping**. It excludes only a *stationary* token lookup combined with *separable* row and column masks. It cannot reject state-changing token functions, nonlinear mixing, a differently oriented table, or the possibility that the 32×8 object serves another purpose. No original unknown plaintext or creator key has been recovered.

## Decision

Direct **row+column additive/XOR masks** on the p50 table interior are ruled out under either historical radix and either visible p56 register. The additional token-lookup-plus-row/column hybrid is exactly impossible under the four-cell verified p56 certificate, independent of those radices. The clue-anchored 76/180 terminal alignment remains real, but it does not authorize an invertible cipher, an outer-perimeter decryption, or a table-byte interpretation. Because the necessary inner-180 test fails with *every* possible secret row/column key, fitting one cannot rescue the architecture. More elaborate nonlinear clocks or alternative traversal remain open pending an independently visible operation.

Reproduction: [self-contained exact original-input CommonJS test](../sims/terminal_inner180_allsecret_rowcol_sft.cjs) with Node.js 22; unchanged `resources/liber-primus/base60-grid.json` and `lp2-corpus.json`. The 85-rune p56 known plaintext is encoded **word by word** with canonical GP digraphs, preventing spurious cross-word ligatures.
