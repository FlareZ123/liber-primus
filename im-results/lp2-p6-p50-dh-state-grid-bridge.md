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
## Serialization-free p6 mirror invariant reproduces the support coordinates

The canonical ordered H serialization is no longer needed to obtain the strongest four p6 state magnitudes. Director #3436 shows that p6 bilateral geometry fixes the **mirror pairs** of the printed width vector but not H's output order/sign/channel schedule. Therefore use only a quantity invariant across all 16 source-compatible H presentations: for each visible mirror pair, take the unordered **ordinary integer absolute difference and sum**, then forget the order of the two pair-blocks.

For p6 widths `[4,1,4,2]`:

```text
outer pair (4,2) -> {|4-2|,4+2} = {2,6}
inner pair (1,4) -> {|1-4|,1+4} = {3,5}

I_p6 = {{2,6},{3,5}}.
```

Now hold out the already source-derived p50 support-line coordinates, ordered only by their starting prime ranks:

```text
[3,5,6,2].
```

The first two and last two support coordinates normalize to the **same two unordered blocks**:

```text
I_p50 = {{3,5},{2,6}} = I_p6.
```

Thus the exact support-coordinate bridge survives removal of canonical H serialization. It uses only p6's visible mirror pairing plus pairwise sum/absolute-difference magnitudes and p50's independently selected support geometry. The labels `e,g,a,K` may be retained as names for the resulting values, but the causal result is the block invariant, not the ordered vector `H4=[K,-e,g,a]`.

A manuscript-wide matched control over all **18** red spans finds exactly **three complete four-word red spans**: p6 `[4,1,4,2]`, p23 `[2,6,3,5]`, and p54 `[1,4,2,2]`. Their normalized mirror invariants are respectively

```text
p6  -> {{2,6},{3,5}}
p23 -> {{3,7},{3,9}}
p54 -> {{1,3},{2,6}}.
```

Only p6 matches the frozen p50 support blocks. This is still a post-discovery cross-artifact relation and does not establish plaintext, but it **salvages the p6→p50 state-coordinate content without the unauthenticated H ordering**. Reproducer: [`sims/lp2_p6_mirror_invariant_p50_support_sft.cjs`](../sims/lp2_p6_mirror_invariant_p50_support_sft.cjs).

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

Under the ordinary hexadecimal reading of those two glyphs, `0x1D=29`, the Gematria Primus modulus. The completed source gate #3419 now classifies that reading as **source-unlicensed coincidence**: 88/256 cells are two-digit-hex readable, exact token `1D` occurs four times, and no p50-local base16 selector exists. Hexadecimal is retired operationally unless a new first-party cue selects it.

A local charge makes the observation sharper without making it unique globally. ROAD row `g=5` crosses the three strict vertical support lines at:

~~~text
(g,K) = cell42 -> 0S   (not hex)
(g,e) = cell43 -> 1D   (hex 29)
(g,a) = cell46 -> 3J   (not hex)
~~~

So the MAP/ROAD crossing is the only strict ROAD/support intersection that even admits a two-digit hex reading. Token `1D` itself occurs four times in the full 256-cell panel, so its global occurrence is not rare. **Hexadecimal is not needed for the newly connected chapter route.**

The provisional chapter SUM→PRODUCT route independently reaches p40 and then stops under its own address grammar. Original artwork now supplies a source-visible **section switch** at that exact landing: a pixel-exact census of all 75 original scans finds the fixed mirrored-foliage border of archive57 reproduced on **exactly archive57..72 = LP2 p40..p55** and nowhere else, while all 16 center-body crops differ. This is the whole mirror-framed section that contains the p49–p51 numeric panel; it cannot be a p40-only STOP marker because live predecessor p54 carries the same exact section frame.

P40's terminal first-black word has `[length,IN,OUT]=[5,27,3]=[g,-K,e]`; the `IN` was consumed to enter p40, leaving `[length,OUT]=[5,3]`. Those values exactly name this report's already-fixed **ROAD row5** and **MAP column3**, selecting cell43 without treating `3` as a page number. Across all nine chapter first-black operands, p40 alone has a `[length,OUT]` pair whose first coordinate is the strict horizontal support and whose second coordinate is a strict vertical support.

Under the pre-existing missing-`f` base59 pointer codec, cell43's token `1D` has value **72**. This is not just another pointer into the sink basin: 72 is the exact midpoint of the independently established horizontal-reflection return path

```text
186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
```

with four edges on each side. The selected cell43 itself reaches sink189 in **five** base59 pointer edges, exactly its ROAD row / terminal length `g=5`; after the first hop to72 the remaining sink distance is **four=q**. Within physical row5, cell43 is the only cell with sink distance5. The three strict ROAD/support intersections give `cell42: 0S→28`, `cell43: 1D→72`, `cell46: 3J→196`; only the MAP/ROAD crossing enters that mirror path, and it enters exactly at its midpoint. Globally four cells point to72, so the specificity is carried by the independently fixed geometry rather than token rarity. Reading `1D` in base60 gives73; the corresponding fixed pointer walk neither reaches midpoint72 nor sink189 and enters a cycle.

This is a post-discovery cross-artifact handoff, not a recovered plaintext opcode. It supplies a typed cell43 consumer and a local base59 consequence **without invoking `0x1D=29`**. Agent9's independent ROAD×K five-hop holdout fails the primitive-state terminal gate, so do not generalize this into globally authenticated base59 pointer semantics. Reproducers: `sims/lp2_p40_mirrored_section_artwork_sft.cjs` for the exact p40–p55 border census and `sims/lp2_chapter_terminal_p50_midpoint_bridge_sft.cjs` for the terminal pair, controls and pointer-distance checks.
## Independent physical selection of column K

The strongest part of this bridge is that column2 was not chosen by the p6 overlay. Agent10's already frozen p50 route had independently projected from cell74 `(row9,col2)` straight to the surface at cell2, explicitly opening the literal physical column2 tunnel:

~~~text
cells 2,10,18,26,34,42,50,58,66,74
~~~

That pre-existing tunnel therefore already passes through cell18=`0F=15`, which the p6 state identifies as `b`. Separately, the origin-robust numeric movement subroute reaches cell186=`0J=19=B`, also in physical column2. Only afterward does the p6 state packet label the shared physical column as `K=2`.

This removes the main post-hoc degree of freedom from the column choice. The state-role interpretation and the additional row `-e` observation remain post-discovery.
## K-column static-register prediction gate

Director #3444 asks whether the three exact K-column state hits form a predictive static register rather than a retrospective coincidence. All other K-column values were withheld while the frozen pairs

```text
row K=2   -> b=15
row -e=26 -> a=6
row p=23  -> B=19
```

were tested against a small DH-motivated relation family. A single uniform row→value rule is required before opening a fourth cell.

The exact modular inverse `x^-1 mod29` explains only `K=2 -> b=15`; negative inverse explains none. Fixed DH-state exponent maps `x^K,x^e,x^q,x^g,x^a,x^b mod p` and `g^x mod p` explain none of the three simultaneously. A scaled reciprocal `c/x mod29` has **0** fitting constants. Most decisively, even an unrestricted two-parameter affine map `m*x+c mod29` has **0** solutions through all three points.

Therefore the triple does not currently define a source-motivated static state function, and no fourth K-column value is opened. Preserve the three exact state coincidences and the independently selected K column; do not extrapolate a row→state algebra from them without a new source rule. Reproducer: [`sims/lp2_p50_kcolumn_static_state_relation_gate_sft.cjs`](../sims/lp2_p50_kcolumn_static_state_relation_gate_sft.cjs).

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

## Index-origin control: the exact schedule is conditional on zero-based coordinates

The support-line bridge above numbers the 32×8 table internally from zero.
That convention is computationally ordinary, but it is **not printed on the
manuscript**. Closed source gate #1567 found no first-party rule fixing p50
cell0/state0, so the coordinate origin must be charged rather than silently
treated as authored.

Using the same four physical support edges:

```text
zero-based row/column coordinates : [3,5,6,2] = [e,g,a,K]
one-based visible counts          : [4,6,7,3]
```

Retaining the original edge directions changes the directed vectors from

```text
zero-based : [-3,+5,+6,+2] mod29 = [26,5,6,2]
one-based  : [-4,+6,+7,+3] mod29 = [25,6,7,3].
```

The frozen 16-member rotation/reversal/global-sign charge on
`H4([4,1,4,2])=[2,26,5,6]` has exactly **one** match for the zero-based
vector and **zero** matches for the one-based vector. Thus the exact cyclic
p6 schedule does not survive a change to the equally natural human-counted
origin.

Sparsity does not independently select zero-based indexing either. In the
broad primitive-state row×legal-column family, zero-based addressing has
2 state-valued hits while one-based has **3**. In the tighter title-H row
family, zero-based has 2 hits and one-based 1. These counts are descriptive,
not a discovery probability.

A concrete physical check makes the convention visible: a human-visible
row2/column2 location corresponds to zero-based cell(1,1)=index9, token
`49` (base60 249 / base59 245), whereas the reported
`(K,K)->b` relation is zero-based cell(2,2)=index18, token
`0F=15=b`.

There is, however, a real **first-party historical prior** for zero-based
numbering outside p50. The authenticated 2016 signed message independently
encodes the same DH23 register in its zero-based word positions; after a
Critic broadened the sentence-structured role family to 69,120 cases,
zero-based numbering is part of the sole surviving configuration and
one-based numbering fails. See
`im-results/lp2-signed2016-word-position-dh.md`. That is evidence about
Cicada's numbering habit and the same state vocabulary, but it postdates the
2014 LP2 release and does not tell a contemporary player to assign p50's
unlabeled top-left cell coordinate zero.

Therefore the p6↔p50 geometry remains a useful **conditional but historically
supported** zero-origin bridge. The independently selected cell186 / column2
facts remain real source structure; the exact state-label equalities
`[e,g,a,K]` and cyclic H(title) schedule are not locally source-instructed
by p50 itself. Treat the 2016 source as an authored prior on the convention,
not as a retroactive p50 opcode.

Reproducer: `sims/lp2_p6_p50_index_origin_control_sft.cjs`.

## Interpretation

This is a compact typed bridge between two independently important artifacts:

- p6 supplies the state packet and the values `e,g,A,K,p,a,b,B`;
- p50 supplies a physically printed `2^g × 2^e = 2^A` table;
- the independently convergent p50 endpoint cell186 is exactly row `p`, column `K`, and contains `B`;
- the same K column also places `b` at row `K` and `a` at row `-e`.

The relation is stronger than merely relabeling arbitrary fitted residues: it uses the table's fixed dimensions, fixed row-major address arithmetic, and literal radix-invariant cell values. However, the role pattern was noticed after both artifacts had been heavily studied. It is **not** a calibrated discovery probability and does not yet specify a table opcode for unknown ciphertext.

The useful next question is operational: what first-party clue, if any, says to treat p50 as a p6-sized state table and how should a solver traverse or query the K column? The most literal p50 K-column consumer has now been tested on an independently selected unknown receiver: use all 32 column2 bytes as a cyclic subtractive GP29 key, beginning at p40's eight-rune body boundary. [The fixed original-input trial](lp2-p6-p50-kcolumn-p40-direct-receiver.md) produces no native-like language or candidate PATHS in base60/base59 and both column directions; its source-native controls pass. This retires **direct cyclic column-as-additive-key** for p40 but leaves the numeric DH/K-column structure and any source-selected stateful operator open. Future work should identify a typed operation or external KDF that makes a fresh plaintext prediction rather than refitting a column clock.

## Reproduction

`sims/lp2_p6_p50_dh_state_grid_bridge_sft.cjs` reconstructs the p6 state directly from the original p6 title data, checks the p50 dimensions, asserts the three K-column relations, and performs both finite address-family censuses.
