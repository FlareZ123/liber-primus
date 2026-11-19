# Signed-2016 GP0 to p50 printable-hex register

**Agent19, 19 November 2026. Classification: source-derived typed register. Operational semantics of the output remain unresolved.**

## Frozen operation

Use only independently fixed objects:

1. the 43 alphabetic words of the authenticated 2016 message in printed order;
2. canonical GP29 spelling and each whole word's ordinary GP0 sum;
3. the original row-major 256-cell pp49–51 table;
4. the printed two-character token at address GP0(word);
5. interpret a token as one ASCII byte only when both printed characters are hexadecimal digits;
6. preserve printable bytes for the visible text channel and record non-printable hex bytes as controls.

This operation consumes the **printed token text directly**. It does not choose between the unresolved base59 and base60 numeric interpretations of the table.

## Hex-valid source occurrences

Exactly 16 of the 43 source-word occurrences address syntactically hexadecimal tokens:

```text
0  HELLO     GP0 69  1D  0x1d
2  PATH      GP0 39  05  0x05
9  LIBER     GP0 69  1D  0x1d
10 PRIMUS    GP0 62  24  $
18 MAP       GP0 56  4E  N
23 ROAD      GP0 54  2a  *
24 AND       GP0 56  4E  N
26 NUMBERS   GP0 83  3D  =
29 DIRECTION GP0 112 1D  0x1d
30 SEEK      GP0 56  4E  N
31 AND       GP0 56  4E  N
34 BE        GP0 35  0d  0x0d
36 GOOD      GP0 35  0d  0x0d
37 LUCK      GP0 31  2D  -
40 PATHS     GP0 54  2a  *
41 VERIFY    GP0 59  19  0x19
```

Keeping only printable ASCII in the authenticated source order yields:

```text
$N*N=NN-*
```

The contributing source words are:

```text
PRIMUS MAP ROAD AND NUMBERS SEEK AND LUCK PATHS
```

The repeated characters have exact address causes:

```text
MAP = AND = SEEK -> GP0 56 -> p50[56] = 4E -> N
ROAD = PATHS     -> GP0 54 -> p50[54] = 2a -> *
```

The equality character itself is selected by:

```text
NUMBERS -> GP0 83 -> p50[83] = 3D -> =
```

These aliases are part of the result and prevent treating each printable character as an independent coincidence.

## Fixed-table controls

The table contains 88/256 syntactically hexadecimal cells and 57/256 printable-hex cells. Therefore printable extraction alone is common and carries no significance by itself.

The structured source-order string is layout-sensitive.

Across the eight obvious 32×8 traversals formed by row-major/column-major order and independent major/minor reversal, the printable channels are:

```text
row-major forward        $N*N=NN-*
row-major minor reverse  N"$4$
row-major major reverse  <I<>K'K'
row-major both reverse   !(!!K!!!H
column-major forward     ,;+ -+=
column-major minor rev   -IM+>)M)=<
column-major major rev   H$9>HH'JH4HKH<'-4
column-major both rev    &>3*.$)$).$$*3-
```

Only the original printed row-major-forward orientation gives the recovered register.

As a separate source-preserving control, cyclically shift the original 256-cell row-major tape through all 256 origins and repeat the extraction. Twenty origins happen to produce nine printable characters. Origin0 alone matches the exact discovered repeated-symbol form:

```text
$ X * X = X X - *
```

with one uppercase letter X; at origin0, X=N.

This exact shape check was defined after the origin0 string was observed, so its uniqueness is a diagnostic against trivial cyclic-origin freedom rather than a discovery p-value.

## The contributing addresses are a DH-state direction tape

The nine printable source occurrences are addressed by whole-word GP0 values:

```text
[62,56,54,56,83,56,56,31,54]
```

Their eight consecutive differences modulo 29 are:

```text
[23,27,2,27,2,0,4,23]
= [p,-K,K,-K,K,0,q,p].
```

This consequence uses no character interpretation beyond the printable-token selection. The state values come from the independently authenticated signed-word DH reconstruction:

```text
p=23, K=2, q=4.
```

It is therefore a literal realization of the same signed clue's phrase **"their numbers are the direction"**: the selected words supply p50 addresses, and the address differences are a compact authenticated-state direction tape.

A cyclic-origin control leaves this structure unusually localized. Repeating the printable extraction at all 256 cyclic p50 origins, then requiring every consecutive GP0-address difference to lie in the fixed set

```text
{0, K, -K, q, p} = {0,2,27,4,23}
```

gives only five origins at any nonzero path length. Origin0 is the only one with at least eight consecutive edges; the other surviving origins have at most six edges. At origin0 the exact eight-edge tape above is recovered.

The small state subset was recognized after the origin0 tape was seen, so the 256-origin uniqueness is again a layout diagnostic rather than an unbiased significance estimate. The important operational fact is exact: the typed register carries its own DH-state-valued edge sequence.

The canonical outside-in H serialization of the eight edges is also compact:

```text
H([p,-K,K,-K,K,0,q,p])
= [0, B-K, p, K, K, K, p+K, 0]
= [0,17,23,2,2,2,25,0].
```

This H form is a consequence only; no downstream receiver is assigned to it here.

## Independent convergence from the p0 DEVOTED state label

The p0 state packet independently recovers the label DEVOTED. Its canonical GP rune numbers, interpreted through the already fixed zero-based source-word register, give:

```text
ROAD MAP THE LIES ARE MAP ROAD
```

The two outer word pairs feed the same frozen p50-token/hex channel:

```text
ROAD MAP -> 2a 4E -> *N
MAP ROAD -> 4E 2a -> N*
```

Thus the source-wide printable register and the newly recovered DEVOTED number readout independently converge on the same N/star token vocabulary.

There is one important alias control: the original source pair ROAD AND also produces `*N` because AND and MAP share GP0=56. The token values are real; the English label “North Star” is therefore an interpretation, not yet a unique source-word decoding.

## Non-printable control bytes

The remaining valid hex tokens are not discarded from the record:

```text
HELLO/LIBER/DIRECTION -> 1D
PATH                  -> 05
BE/GOOD               -> 0D
VERIFY                -> 19
```

Notably 0x1D is ASCII Group Separator and 0x0D is carriage return, but assigning control-code semantics to these bytes would add another interpretive layer. No such semantics are required for the printable-register claim.

## Decision

Promote the exact typed output:

```text
$N*N=NN-*
```

as a new source-derived p50 register worthy of downstream interpretation. It is deterministic from authenticated words, canonical GP0, the printed table order, and ordinary hex syntax. Its contributing GP0 addresses independently form the exact DH-state direction tape `[p,-K,K,-K,K,0,q,p]`, and it also explains the `*N / N*` outer frame reached independently through DEVOTED.

Do not yet promote “North Star”, an algebraic reading of `N*N=NN-*`, or any control-code interpretation as an authored instruction. The next useful test must identify an independently visible consumer for this nine-character register or derive a held-out numeric/page consequence from one conventional interpretation without changing the extraction.

## Reproduction

`node sims/lp2_signed2016_gp0_p50_printable_hex_sft.cjs`
