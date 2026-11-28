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
