# P6 state packet aligns with the p50 32×8 grid and its independently selected cell186 endpoint

**Agent11 — 28 November 2026. Classification: new post-discovery cross-artifact structural bridge; no unknown plaintext, cipher inverse, or new key.**

## Result

The established p6 title packet and the p49–p51 numerical table share a compact exact state geometry that had not been recorded in the repository.

From the printed p6 title alone:

~~~text
title lengths = [4,1,4,2]
H4(lengths) = [2,26,5,6] = [K,-e,g,a]

K=2, e=3, g=5, a=6
q=4, A=q+q=8, p=-a=23
W3[2]=b=15
W2=B=19
~~~

The printed p50 object is 32 rows × 8 columns = 256 cells. Those dimensions satisfy the exact p6 relations:

~~~text
columns = 8   = 2^e = A
rows    = 32  = 2^g
cells   = 256 = 2^A
~~~

So the table is naturally a `g=5` high-bit / `e=3` low-bit split of an `A=8`-bit address. Under ordinary row-major indexing its width is itself the p6 state value `A`.

That state-sized layout makes the already important p50 endpoint cell186 especially notable:

~~~text
186 = A*p + K = 8*23 + 2
p50[186] = 0J = 19 = B
~~~

The token begins with zero, so `0J=19` under both live base59 and base60 readings. Cell186 was selected independently before this state-grid observation by the p27/p50 movement work; this relation was recognized afterward.

The same `K=2` column contains two further exact packet-state relations:

~~~text
A*K + K       = 18   -> p50[18]  = 0F = 15 = b
A*(-e mod29)+K = 210 -> p50[210] = 06 =  6 = a
~~~

Thus the column indexed by `K` contains:

~~~text
row K  -> b
row -e -> a
row p  -> B
~~~

with all three readouts radix-invariant.

## The four strict p50 support lines are exactly the p6 `[e,g,a,K]` coordinates

The strongest relation is at the line level, before any individual state-valued cell is chosen. Recomputing the strict p50 prime-rank geometry directly from the original table gives four physical supports:

~~~text
base60 prime ranks17→18 : column3   (THE→MAP under the working register)
base59 prime ranks22→23 : row5      (THE→ROAD under the working register)
base60 prime ranks38→39 : column6   (BEWARE→FALSE under the working register)
base60 prime ranks39→40 : column2   (FALSE→PATHS under the working register)
~~~

The signed-word labels retain the register-origin caveats documented in the p50 report, but the **physical line coordinates and prime ranks do not**. Their ordered coordinate tuple is:

~~~text
[MAP column, ROAD row, BEWARE/FALSE column, FALSE/PATHS column]
= [3,5,6,2]
= [e,g,a,K]
~~~

where `[e,g,a,K]=[3,5,6,2]` is independently fixed by the p6 title/state packet. Equivalently, the set of all four strict support-line coordinates is exactly `{K,e,g,a}={2,3,5,6}`.

This removes a major flexibility concern from the later cell-level bridge: the p50 geometry itself independently chooses the same four small state coordinates before p6 is overlaid. In particular, its FALSE/PATHS tunnel chooses physical column2, which p6 names `K`.
## Directed support-line schedule equals a cyclic p6 H(title) schedule

The line-coordinate equality becomes substantially sharper when the physical edge directions are retained.

Order the four strict p50 support edges only by their starting prime rank—`17,22,38,39`—so no p6 value determines their order. For each directed edge, take the fixed support-line coordinate and sign it by forward screen movement: north/west negative, south/east positive. The four original edges are:

~~~text
rank17→18: cell219→211, north on column3  -> -3 = 26
rank22→23: cell40 →41,  east  on row5    -> +5
rank38→39: cell126→182, south on column6  -> +6
rank39→40: cell2  →26,  south on column2  -> +2
~~~

So the source-ordered oriented support vector is:

~~~text
[26,5,6,2] = [-e,g,a,K].
~~~

The original p6 title lengths give:

~~~text
H4([4,1,4,2]) = [2,26,5,6] = [K,-e,g,a].
~~~

Therefore the p50 vector is **exactly one left cyclic rotation** of the p6 H(title) vector:

~~~text
rotL(H4(title lengths),1) = [26,5,6,2].
~~~

A finite convention charge over all four cyclic rotations, reversal/no-reversal, and one global sign (`4×2×2=16` candidates) yields **exactly one** match: no reversal, rotation1, positive global sign.

This is the strongest form of the bridge found in this invocation. It uses only original p6 title lengths, original p50 token positions/codecs, prime-rank edge order, and physical directions. It does not use unknown LP2 plaintext or fitted q-block keys. The remaining caveat is discovery history: the p50 edge family and p6 H packet were each recognized before this cross-link, but the cross-link itself is retrospective.
## MAP/ROAD state intersection isolates a hex-29 cell among the support crossings

Once the four physical support lines are relabeled by p6 state, the ROAD row is `g=5` and the MAP column is `e=3`. Their intersection is therefore the source-selected state address `(g,e)`:

~~~text
cell = A*g + e = 8*5 + 3 = 43
p50[43] = 1D
~~~

Under the ordinary hexadecimal reading of those two glyphs, `0x1D=29`, the Gematria Primus modulus. This hexadecimal interpretation is **not yet source-licensed**, so it is not promoted to an instruction.

A local charge makes the observation sharper without making it unique globally. ROAD row `g=5` crosses the three strict vertical support lines at:

~~~text
(g,K) = cell42 -> 0S   (not hex)
(g,e) = cell43 -> 1D   (hex 29)
(g,a) = cell46 -> 3J   (not hex)
~~~

So the MAP/ROAD crossing is the only strict ROAD/support intersection that even admits a two-digit hex reading. Token `1D` itself occurs four times in the full 256-cell panel, so its global occurrence is not rare. A future clue would need to license the hexadecimal codec or a mod29 use before this can become an operation.
## Independent physical selection of column K

The strongest part of this bridge is that column2 was not chosen by the p6 overlay. Agent10's already frozen p50 route had independently projected from cell74 `(row9,col2)` straight to the surface at cell2, explicitly opening the literal physical column2 tunnel:

~~~text
cells 2,10,18,26,34,42,50,58,66,74
~~~

That pre-existing tunnel therefore already passes through cell18=`0F=15`, which the p6 state identifies as `b`. Separately, the origin-robust numeric movement subroute reaches cell186=`0J=19=B`, also in physical column2. Only afterward does the p6 state packet label the shared physical column as `K=2`.

This removes the main post-hoc degree of freedom from the column choice. The state-role interpretation and the additional row `-e` observation remain post-discovery.
## Finite state-address charges

These relations are post-discovery, so the relevant question is how saturated the obvious state-address family already is.

### Primitive state rows × physically legal primitive state columns

Use every established primitive p6 field as a zero-based row and every primitive field whose value fits the eight-column grid as a column. There are:

~~~text
9 row fields × 5 legal column fields = 45 addresses
~~~

Only **2/45** cells contain another primitive p6 state value under either live radix:

~~~text
(K,K) -> b   at cell18
(p,K) -> B   at cell186
~~~

Both hits lie in the same `K` column.

### Printed H(title) rows × legal primitive columns

Restrict the row family to the four coordinates printed by the canonical title transform itself:

~~~text
[K,-e,g,a] = [2,26,5,6]
~~~

and again use the five primitive fields that fit as columns. Among **20** addresses, exactly two contain primitive p6 state values:

~~~text
(K,K)  -> b
(-e,K) -> a
~~~

Again both lie in column `K`.

### Raw state-value inventory

The primitive state values themselves are sparse as literal base60 bytes in the 256-cell table:

~~~text
K=2   absent
e=3   absent
q=4   occurs once
g=5   occurs once
a=6   occurs once
A=8   absent
b=15  occurs once
B=19  occurs once
p=23  absent
~~~

So the `a`, `b`, and `B` hits above are the unique literal occurrences of those values in the table.

## Interpretation

This is a compact typed bridge between two independently important artifacts:

- p6 supplies the state packet and the values `e,g,A,K,p,a,b,B`;
- p50 supplies a physically printed `2^g × 2^e = 2^A` table;
- the independently convergent p50 endpoint cell186 is exactly row `p`, column `K`, and contains `B`;
- the same K column also places `b` at row `K` and `a` at row `-e`.

The relation is stronger than merely relabeling arbitrary fitted residues: it uses the table's fixed dimensions, fixed row-major address arithmetic, and literal radix-invariant cell values. However, the role pattern was noticed after both artifacts had been heavily studied. It is **not** a calibrated discovery probability and does not yet specify a table opcode for unknown ciphertext.

The useful next question is operational: what first-party clue, if any, says to treat p50 as a p6-sized state table and how should a solver traverse or query the K column? A future test should make a fresh prediction from this geometry before opening another table cell or ciphertext receiver.

## Reproduction

`sims/lp2_p6_p50_dh_state_grid_bridge_sft.cjs` reconstructs the p6 state directly from the original p6 title data, checks the p50 dimensions, asserts the three K-column relations, and performs both finite address-family censuses.
