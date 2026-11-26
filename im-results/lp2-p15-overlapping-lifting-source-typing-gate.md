# p15 spiral to overlapping lifting: source-typing decision

**26 November 2026, Agent9, Director [#2914](https://github.com/FlareZ123/liber-primus/issues/2914).** The original p15 4×4 graphic fixes a clockwise 16-cell traversal and prime/Fibonacci-derived values. It does not fix an alternating triangular GP29 lane operation. The exact geometric interpretation of either rows or columns as the four lanes fails to define a nontrivial shear on every step. Do not launch a new arbitrary lifting sweep. No original plaintext recovered.

## Source-to-operator obstruction

The original 32.jpg image was inspected directly. Only 3299 (row2,column2) is red; the infinity motif follows the square. The independently established inverse from [the original numerical construction](p15-fibonacci-prime-spiral-historical-source-gate.md) returns this zero-origin ordinal grid:

```
 6  7  8  9
 5  0  1 10
 4  3  2 11
15 14 13 12
```

Thus consecutive cells give the move sequence R,D,L,L,U,U,R,R,R,D,D,D,L,L,L. The path alternates checkerboard cell parity, but **does not alternate coordinate axes**. A player reading 4 rows or 4 columns as lanes gets only one coordinate per lane. If rows are lane indices, every horizontal move has identical source and destination lane. If columns are lane indices, every vertical move does. A nontrivial triangular shear `x_dst←x_dst+k*x_src` requires distinct lanes; with identical indices the operation becomes scalar multiplication, not a triangular lift, and may even be singular. The first two edges already demonstrate the missing rule: the red cell to the right cell is same row, the right cell to the below cell is same column. The path alone cannot specify a four-lane lifting sequence by either direct projection. Flattening the 16 cells into separate lanes avoids this issue but changes the receiver to 16 lanes and still leaves the coefficient/clock grammar unstated.

The checkerboard parity does define a two-colour partition, but it does not select whether to update alternating GP29 positions, four interleaved streams, moving windows, or a 16-symbol register. Likewise, the same printed values specify several authentic integer representations (literal distances, prime values, prime ranks, distinct Fibonacci ordinals), and no shear opcode identifies which representation is its coefficient. Direction of shear, first affected rune, edge treatment and whether state carries between overlapping windows remain unspecified.

Any fixed sequence of elementary linear updates on a single disjoint four-rune vector is itself a single matrix `L=E_n...E_1` in GL(4,29) when all steps are invertible. Merely factoring a previously tested fixed Hill matrix into triangular updates does not change its inverse or predicted plaintext. A different product of elementary matrices is a different Hill key and needs its own selection evidence. True overlapping-window lifting would escape this equivalence, but the graphic does not determine the window stride or the correspondence between matrix cells and moving GP29 indices.

## Existing results and next fork

The prior [direct p15 Hill report](p15-hill-block-test.md) tested printed, spiral, prime-value and prime-rank matrices, both directions and row/column conventions; the immediate p16–22 receiver is 1,744 runes. [Powered Hill](p15-powered-hill4-source-adjacent-gate.md) and [physical-line Hill](lp2-p15-four-printed-line-matrix-gate.md) are also negative. #2652 in the assignment is a miscitation (it is the complete-word reversal task); the direct Hill result is in the linked report. These negatives do not exclude every overlapping lift, nor do they identify the missing lifting instruction.

Close at the typed-operation gate: no source-fixed adjacent-lane shear receiver is available. An independent clue must select the lane map, coefficients and overlapping stride before testing original p16–22. No permutations, arbitrary fitted matrices or synthetic-only recoveries were run, since the assignment explicitly gates them on source selection. The established p15 numerical solution remains intact.
