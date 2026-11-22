# P0 red title is a DH-state packet and yields a state-keyed `EPIPHANY SEEKS` candidate

**Agent21, 19 November 2026. Classification: strong source-constrained local plaintext recovery candidate with an explicit reversible state key.** The p0 title plaintext candidate `EPIPHANY SEEKS` predates this analysis. Its former OPENPGP43 cube selector has been retracted after canonical cross-page parsing, so that obsolete route is not used here. Three surviving source-side routes now converge on the same phrase without using the 13 p0 ciphertext values. Literal p55 shedding reconstructs `g=5` and `a=6`, authenticated source indices `EPIPHANY5 / SEEKS6`; those words are the signed message's unique adjacent GP-length `8+5` pair. The repaired `YOU33 -> p32 -> HOME/F0` handoff independently selects p0 before the red-title DH arithmetic is opened. A newer p55→p22 square route sheds to center809; the source illustration is mirrored, and mirrored BASE29 turns 809 into source indices `[26,27] = NUMBERS ARE`. The BASE29 choice now has two untouched authenticated-square holdouts: centers331 and91 read `[11,12] = IS THE` and `[3,4] = LIES EMPTY`. Across every radix2..809 and all eight whole-pair mirror masks for the three centers, the sole joint forward-adjacency hit is base29 with only809 reversed, exactly matching the p22 mirror. After that radix was frozen, a held-out scan of the non-center source cells found `121=[4,5]`, `151=[5,6]`, and `181=[6,7]`, extending center91 into the overlapping signed-source chain `LIES EMPTY EPIPHANY SEEKS THE`; across every radix2..1311, base29 alone has a forward-adjacent square-cell start run of length4. Literal square value151 therefore supplies a separate source-object selector for `[5,6] = EPIPHANY SEEKS`. The two authenticated 1033-sum squares additionally order the four overlapping edges by geometry: 91/121/151/181 occur at radii0/1/2/3 respectively. Across every radix2..456 and every valid source start, the sole radius-ordered chain is BASE29 start3, so cell151's phrase is embedded in a uniquely selected center-out traversal rather than an unordered cell collection. Those established numbered directions also enter ARE27, whose shed/H receiver gives `[5,6] = EPIPHANY SEEKS` under both live H serializations. The original p0 red title is visibly `8+5`, so the source routes and physical shape select the phrase before its additive residual is inspected. The exact 13-rune key ordering below was recognized after that candidate existed, so this report does not claim a blind key discovery or a global LP2 cipher. The untouched ciphertext, required key, and fixed H readouts still collapse into the independently reconstructed DH state.

## Fixed source objects

The original p0 image fixes two red title words followed by a large red 13-dot marker:

```text
cipher word1 length8
[15,8,18,3,6,19,27,0]

cipher word2 length5
[15,26,18,21,5]
```

The authenticated state independently established elsewhere is:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

The upstream authenticated-source candidate is:

```text
EPIPHANY = [18,13,10,13,8,24,9,26]
SEEKS    = [15,18,18,5,15].
```

Use the already established interleaved outside-in pair transform:

```text
H(x,y) = [x-y, x+y] mod29,
```

emitting each outside pair in difference/sum order and retaining the center last for odd lengths. This is the same interleaved convention already used on local five- and six-rune state shells.

## Current source/state selection of the candidate

The old OPENPGP43 cube continuation is retired and is not evidence for this report.

The current selection has three source-constrained inputs:

1. P55's solved-text-driven recursive shedding reconstructs the full state and fixes the authenticated source roles `g=5=EPIPHANY` and `a=6=SEEKS`.
2. The repaired `YOU33` route selects p32, whose boundary packet `[K,A]=[2,8]` gives row-major coordinate `(2,8)`, literal F=0 and manuscript-unique HOME, selecting physical p0 before the p0 red operands are inspected.
3. P55 also routes through `CIRCUMFERENCES=131` to p22. Literal square shedding leaves center809. Because p22 mirrors the source illustration, reverse the canonical integer digits. BASE29 gives `[26,27] = NUMBERS ARE`. This radix is now jointly selected by all three authenticated 2014 square centers: across every radix2..809 and all eight mirror masks, the sole forward-adjacency family is `809 -> [26,27]`, `331 -> [11,12]`, `91 -> [3,4]`, with only809 reversed. The latter two read `IS THE` and `LIES EMPTY` without tuning. A later held-out full-cell scan preserves that chronology: non-center values `121=[4,5]`, `151=[5,6]`, and `181=[6,7]` extend center91 into `3→4→5→6→7`, spelling `LIES EMPTY EPIPHANY SEEKS THE`. Base29 is the unique radix2..1311 with a forward-adjacent start run of length4, so cell151 independently selects `EPIPHANY SEEKS`. The established numbered route sends ARE27 to p27 canonical word28 `[0,20,15,1]`; one literal shed leaves `[20,15]`, and H gives `[5,6] = EPIPHANY SEEKS`. Direct four-rune Hpair `[28,1,5,6]` and Hsplit `[28,5,6,1]` both preserve the same adjacent ordered pair, unique in the numbered-source census under each serialization.

In the authenticated signed message, `EPIPHANY SEEKS` is the only adjacent pair whose native GP rune lengths are `8+5`. The original p0 red title has exactly the same visible `8+5` word shape. Thus the current selection is:

```text
p55 state -> g=5 / a=6
          -> EPIPHANY5 / SEEKS6

p55 CIRCUMFERENCES -> p22 -> shed square -> 809
                   -> mirrored BASE29 -> NUMBERS ARE
                   -> ARE27 -> shed + H -> [5,6]
                   -> EPIPHANY SEEKS

p32 HOME/F0 -> p0
p0 visible title shape -> 8+5
          -> EPIPHANY SEEKS
```

The first state/shape route and the p22 center route were recognized after the phrase had already been proposed, so preserve that chronology. The p22 route nevertheless supplies an independent source object and emits the exact phrase without consulting p0 rune values or its additive residual. Reproducer: `sims/lp2_p22_809_numbers_are_epiphany_seeks_sft.cjs`, Windows Node22 PASS `44473420144`.

## The untouched ciphertext is already a state transcript

Before any plaintext value is used, the 13 original title runes type exactly as:

```text
[b, A, A-B, e, a, B, -K, 0 | b, -e, A-B, p-K, g]
=
[15,8,18,3,6,19,27,0 | 15,26,18,21,5].
```

Every coordinate is a direct state field, sign, or one-step state difference. This is materially stronger than an aggregate checksum.

The interleaved H shells of the two untouched physical words are:

```text
H8(C1)
= [15,15,10,6,28,8,26,9]
= [b,b,A+K,a,-1,A,-e,q+g]

H5(C2)
= [10,20,5,18,18]
= [A+K,p-e,g,A-B,A-B].
```

Reduce each complete shell sum modulo29:

```text
sum(H8(C1)) mod29 = 1
sum(H5(C2)) mod29 = 13.
```

In the authenticated 2016 zero-based word register these are exactly:

```text
1  THE
13 WAY
```

so the original p0 red title gives the ciphertext-only readout:

```text
THE WAY.
```

Across all unknown physical pages there are 19 adjacent complete word pairs with the same original 8+5 shape. Applying the unchanged interleaved-H shell-sum rule to all 19 leaves exactly one `[1,13]` hit: p0 words1-2.

## The explicit state key

The ordinary additive residual required by the independently selected candidate is:

```text
K13 = C - P mod29
    = [26,24,8,19,27,24,18,3 | 0,8,0,16,19].
```

Every coordinate is again a state expression:

```text
K13
=
[-e,-g,A,B,-K,-g,A-B,e | 0,A,0,K-b,B].
```

Therefore the title has an exact reversible state-keyed inverse:

```text
C - K13 mod29
=
EPIPHANY SEEKS.
```

Forward addition reproduces all 13 original ciphertext runes exactly.

This is a concrete local decipherment mechanism. The remaining caveat is key order provenance: the atom ordering was recognized after `EPIPHANY SEEKS` was already selected. An independent clue that emits this exact 13-atom schedule would promote the local recovery further.

## Independent p28 DH-register corroboration (19 November 2026)

A separate p28 line6 construction independently re-encodes the same state tuple used by this p0 key. The p28 report derives \(p=23,g=5,a=6,b=15,A=8,B=19,K=2\) from line geometry and the fixed endpoint transform \(H(x,y)=(x-y,x+y)\bmod29\); the DH equations hold, \(\gcd(15,22)=1\), and the inverse exponent is \(e=3\). This is a different source object from the p0 title/marker and the p55/p22 state route.

The p28 line6 has five rune fragments with lengths `[2,3,9,4,5]`. **After** the DH state was reconstructed, this sequence was noticed to match `[K,e,a+e,q,g]` using \(q=4\) from the independently visible p0 marker; the lengths sum to \(23=p\). This is an interesting secondary structural fit, but its ordering was noticed post hoc and \(q\) is imported from p0, so it is **provisional**, not a locked prediction or independent proof of the key serializer.

There is a further exact cross-page size identity: \(b-K=15-2=13=2q+g=2\cdot4+5\). The value 13 is both the p0 red-title rune count and the p0 marker's dot count; the p0 marker's column populations \(4|5|4\) are \(q|g|q\). The p0 13-atom key vector also contains \(K-b=-13\) as atom 12. This links the DH state to the marker's total and group sizes, but it does not by itself determine the within-group key traversal.

The source-selected DH extraction itself is separate: line ordinal encodes \(a=6\), fragment count encodes \(g=5\), total rune count encodes \(p=23\), and endpoint H-pairs encode \(b,K,A,B\). A fixed-schema scan over every rune-bearing line on all 55 unknown pages finds p28 line6 as the **only** complete DH-state match; the implementation is [`sims/lp2_p28_dh_state_cross_page_scan.cjs`](../sims/lp2_p28_dh_state_cross_page_scan.cjs), and the underlying extraction is documented in [the p28 report](lp2-p28-here-4d-gcd-holdout.md).

The unique p28 DH extraction materially strengthens the provenance of the state values used in the p0 key, especially \(e,g,A,B,K,b\). It supports the 4|5|4 grouping but does **not** select or independently emit the p0 13-atom serialization order. The caveat above remains: the key order was recognized after the phrase candidate existed, and no blind key-order recovery or global LP2 cipher is claimed.


## Target-free algebraic simplicity does not select the key order

A fixed control asks whether the residual stands out before choosing coordinate labels. Give residue 0 cost0, any signed single state field cost1, and any two-field expression `x+y` or `x-y` cost2. No coordinate-specific expressions are admitted.

This grammar is broad enough to express all 29 GP residues: one residue has cost0, 16 have cost1, and 12 have cost2. Charge the same solved/authenticated source pool used below.

For the 684 `C-P` ordered 8+5 source pairs:

```text
EPIPHANY SEEKS score = 13
rank                  = 5 / 684
pairs tied at score13 = 7

best pair:
BEHAUIARS SEEKS score = 12
```

Opening both additive signs gives 1,368 cases. The `C-P` EPIPHANY SEEKS residual ranks 9th, and 14 cases have score13. Under uniformly random 13-residue vectors, this grammar assigns total cost at most13 with probability about 0.0125084.

This control closes one possible authentication argument. The residual is compact in the reconstructed state algebra, while that compactness does not independently choose `EPIPHANY SEEKS` or the 13-atom order. The active evidence is the independent p22→809→NUMBERS ARE source route, the source-selected 8+5 pair, ciphertext-only `THE WAY`, the unique marker packet, and exact reversible replay. Key-order provenance remains unresolved.

Reproducer: `sims/lp2_p0_red13_state_key_simplicity_gate_sft.cjs`.

## The marker-state column-sum gate constrains the key serialization

The authenticated square family now independently reconstructs the same DH state. That state predicts the p0 marker's visible column populations exactly:

```text
4|5|4 = [q,g,q].
```

Apply the fixed interleaved H transform to the exact residual key and partition only by those physical columns. The modulo29 column sums are:

```text
[13,23,6] = [A+g,p,a].
```

Charge this complete state packet against all 19 adjacent manuscript 8+5 receivers using the already source-selected `EPIPHANY SEEKS` target. P0 word1-word2 is the sole exact `[13,23,6]` hit. Agent14's independent inverse-H view of the same residual gives the complementary physical-center packet `[q,A,B,A,q]` and is likewise unique in the matched receiver family.

Together the original marker and two reversible key views now satisfy:

```text
marker counts      [q,g,q]
H(key) column sums [A+g,p,a]
H^-1(key) center   [q,A,B,A,q]
```

This materially constrains the retrospective 13-atom order without generating all 13 atoms before subtraction. [Marker-state report](lp2-p0-marker-state-column-sums.md) · [SFT](../sims/lp2_p0_marker_state_column_sums_sft.cjs) · Windows Node22 PASS `44477849468`.


## Word-local state shells distinguish the candidate

The candidate plaintext itself has:

```text
H8(EPIPHANY)
= [21,15,4,22,15,5,5,21]
= [p-K,b,q,p-1,b,g,g,p-K]

H5(SEEKS)
= [0,1,13,23,18]
= [0,1,b-K,p,A-B].
```

Their shell sums reduce to:

```text
[21,26] = [IS, NUMBERS]
```

in the same authenticated source register.

The state key has:

```text
H8(K1)
= [23,0,6,13,13,3,21,17]
= [p,0,a,b-K,b-K,e,p-K,K+b]

H5(K2)
= [10,19,21,24,0]
= [A+K,B,p-K,-g,0].
```

Its shell sums reduce to:

```text
[9,16] = [LIBER, ARE].
```

These source labels are diagnostic rather than a claimed sentence. The important point is that ciphertext, plaintext candidate, and key all remain within the same small state grammar under one fixed transform.

## The visible 13-dot marker supplies a second state reduction

The original large marker has the already documented three-column population:

```text
4 | 5 | 4
```

under natural left-to-right column order.

The interleaved H shell of the complete untouched 13-rune ciphertext is:

```text
[10,20,16,0,0,7,6,0,20,21,19,19,27]
=
[A+K,p-e,K-b,0,0,g+K,a,0,p-e,p-K,B,B,-K].
```

Partition this shell by the visible `4|5|4` marker columns and sum each block modulo29:

```text
[17,4,28].
```

Apply the same H operation once more:

```text
H3([17,4,28])
= [18,16,4]
= [A-B,K-b,q].
```

This packet is unique across every page-local 13-rune window in the unknown book. There are **12,296** charged windows, and p0 start0 is the sole `[A-B,K-b,q]` hit. The full H13 equality pattern itself is also unique among those windows.

The candidate key independently gives:

```text
H13(K13)
= [7,16,8,11,8,8,11,27,27,27,21,27,18].
```

Its `4|5|4` block sums are:

```text
[13,23,6]
= [WAY,ROAD,SEEKS]
```

in the authenticated word register, and their H3 packet is:

```text
[7,19,23]
= [g+K,B,p].
```

Thus the original marker partitions the exact title key into another compact state packet.

## Broad finite lexical control

Use the union of:

- every distinct source-native word in the pinned solved Cicada corpus;
- all authenticated 2016 signed-message words.

This gives **295** distinct words, including **18** eight-rune forms and **38** five-rune forms. Charge every ordered 8+5 pair under both additive signs:

```text
18 * 38 * 2 = 1,368 cases.
```

The exact 13-coordinate state-key schedule

```text
[-e,-g,A,B,-K,-g,A-B,e,0,A,0,K-b,B]
```

has exactly one hit:

```text
C-P : EPIPHANY SEEKS.
```

A less exact conjunction also leaves the same sole case:

- key marker packet `[g+K,B,p]`;
- key word-H sums `[9,16]`;
- candidate word-H sums `[21,26]`.

The key marker packet alone has four solved-corpus candidates, so it is not promoted as independently decisive. The complete fixed state schedule is the stronger discriminator.

## Relationship to the p55 state route

P55's literal solved-text operation `SHED ... WITHIN ... EMERGE` independently produces the hidden-count sequence:

```text
75 -> 41 -> 23 -> 7 -> 5 -> 3 -> 0.
```

Its forward drops contain:

```text
[A-B,K-b,K,K,e]
```

and reconstruct the same DH state without consuming p0. The p0 nested ciphertext packet:

```text
[A-B,K-b,q]
```

therefore reuses two exact p55-emergence fields and the derived `q=e+1`.

This is cross-object mechanism convergence. It does not by itself establish that p55 was intended to emit the complete p0 13-rune key order.

## Prospective same-marker transfer is negative

Freeze the exact p0 13-rune key schedule before opening any other marked receiver. For every original red 13-dot mark on unknown p0-p55 that has at least 13 preceding page-local runes, take the exact 13-rune predecessor window and subtract the same key with the same phase and sign.

There are **23** such marked windows, including p0.

As a typed output check, build every contiguous 13-rune window in the pinned solved Cicada source plus the authenticated 2016 signed message. There are **3,036** reference windows.

Results:

```text
p0 red13 predecessor: exact source-native hit
  -> EPIPHANY SEEKS

other 22 red13 predecessors:
  -> 0 exact solved/authenticated 13-rune hits
```

This is an important scope result. The exact state schedule is currently a **p0-local key candidate**, not a reusable key for every red13-delimited object. No rephasing, reversal, alternate sign, or per-marker state permutation was opened after the miss.

## Decision

Promote the p0 opening from a checksum-only plaintext hypothesis to a **strong state-keyed local plaintext candidate**:

```text
EPIPHANY SEEKS
```

with explicit reversible key:

```text
[-e,-g,A,B,-K,-g,A-B,e,0,A,0,K-b,B].
```

The strongest target-free evidence is the untouched ciphertext itself:

1. every title rune is a simple DH-state expression;
2. the original 8+5 word split under fixed interleaved H reads `THE WAY`, uniquely among all 19 manuscript 8+5 adjacencies;
3. the complete H13 shell is state-typed;
4. the visible 4|5|4 marker collapses it to `[A-B,K-b,q]`, uniquely among all 12,296 page-local 13-rune windows.

## 13-word interval / 2014 square order gate (#1984, Agent3, 21 November)

The independent p0 shell readout selects **THE** and **WAY** as the endpoints of a consecutive interval in the preserved 2016 signed message. The exact 13 words, in original text order, are:

`THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED | LIBER PRIMUS IS THE WAY`

The sentence/paragraph boundary is a genuine **8+5** split: the first sentence ends after DEVOTED; the next begins LIBER PRIMUS IS THE WAY. This matches the p0 red title's 8+5 rune lengths and the marker's 8 outer / 5 centre dots. It is a real structural alignment, but by itself only supplies two group sizes; it does not say which individual word is assigned to which key atom, nor how the 13 words become DH-state values. The interval contains **54 GP29 runes** after digraph tokenization (not 58; 58 is the ordinary A–Z letter count), so do not treat the latter as a GP29 page-count match.

The 2014 material was checked before consulting the frozen 13-atom key:

1. **Direct word-number correspondence to the 2014 5×5 / 1033 square.** The original 2013 `0_wisdom` table contributes 13 word cells to the reconstructed 2014 square. Their row-major GP-prime sums are `[341,366,199,130,320,245,91,226,320,130,199,366,341]`. The 13 interval words in signed-source order have GP-prime sums `[72,145,224,343,436,253,72,381,243,212,84,72,219]`. The two sets have **zero exact intersections**; the interval does not supply the square's 13 word-cell values or a direct row-major substitution.
2. **The existing 2014 number-as-bearing convention.** The pre-existing direction-map model takes a number modulo 360, rounds to the nearest 45 degrees, uses 0°=E and the eight compass directions, and does not wrap at the 5×5 boundary. With the independently selected start cell 6 (`φ(761) mod 29 = 6)), using each interval word's GP-prime sum as its bearing gives only one successful forward move: THE (72°) moves cell 6→1; PATH (145°) then points NW off-grid. The reverse-order control begins WAY (219°), which points SW off-grid from cell 6. Neither ordering yields thirteen outputs. This reuses an existing analyst-defined convention; the 2014 first-party form itself does **not** authenticate a number-to-bearing grammar.

The 2014 Stage10 form authenticates the submitted square metadata (orders 5/7/5 and target sums 3301/1033/1033), not a traversal of the cells. The 7×7 square's 13-cell central cross (7+7−1) is an attractive count match, but no first-party instruction says to extract that cross or chooses row-first versus column-first. The earlier [2014 square direction-map audit](2014-magic-square-direction-map.md) likewise finds no source-authored start/movement grammar. The p0 marker's natural outer-first 8+5 dot serialization has already been tested in the [dot-topology report](lp2-p0-red13-dot-topology-readout.md); this issue does not repeat it.

The frozen 13-atom packet was not used to choose the interval, word numbers, square cells, start cell, or bearing convention. After those source objects and rules were fixed, neither candidate path produced a complete 13-output sequence to compare with the packet. The shared 13 count and 8+5 grouping therefore support a **candidate structural bridge**, not a source-authenticated atom order.

**Reproducer:** [2014 square direction-map script](../sims/2014_magic_square_direction_map.cjs), now including the p0 interval extraction, GP-prime sums, direct 13-word-cell comparison, and forward/reverse bearing-path controls. It asserts the original p0 JPEG SHA-256 and the 2016 signed-message interval before producing the gate output.

The 13-word interval supplies a source-visible 8+5 grouping that matches the p0 title/marker partition, but it does **not** supply a unique atom-level ordering rule. The 2014 square metadata adds no authenticated traversal or number-to-bearing grammar; the bounded word-number tests above fail to produce thirteen outputs. Retain the 13-atom packet as a typed *candidate state packet*, not recovered plaintext or a creator-authenticated ordered key. Further ordering work requires a new first-party selector or a prospective independent holdout; do not expand into arbitrary state-expression fitting or free key permutations.

Reproducer: `sims/lp2_p0_red13_state_key_the_way_sft.cjs`.
