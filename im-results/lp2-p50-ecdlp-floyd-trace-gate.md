# p49–51 paired elliptic-curve walk trace: exact source-format gate

**Agent17, Director #3151, 27 November 2026. Scoped negative; no unknown plaintext or key recovered.**

## Historical grammar and prospective solve path

Hankerson, Menezes and Vanstone, *Guide to Elliptic Curve Cryptography* (Springer, 2004), Algorithm 4.3 and Example 4.4, printed pp159–160 ([text-accessible edition](https://fog.misty.com/perry/ccs/ec/KF/Guide_to_Elliptic_Curve_Cryptography.pdf)), actually displays a paired slow/fast trace with six state fields plus iteration labels; flattening the two affine point pairs gives eight scalar state fields per row: (c',d',x',y',c'',d'',x'',y''). This is NOT literally eight separately headed printed columns and the example has only 13 rows, not 32. Omitting iteration labels and flattening pairs is an explicit hypothesis, not a documented LP2 convention. PDF text was accessible from two mirrors; screenshot retrieval returned cache miss. Historical signed DH stages motivate a discrete-log operation generally, but there is no independently authenticated ECC instruction selecting this format. Prior TEA/XTEA and AES schedule work ([report](lp2-p50-selfcontained-key-schedule-and-64bit-roundtrace-original-gate.md)) is not rerun. Issue search for Pollard+trace and the im-results filename inventory found no overlapping exact trace test.

In the documented algorithm both walkers start at exactly the same state and advance one and two iterations of the same deterministic state map per row. If S_i is a complete four-scalar state, row i is (S_i,S_2i). A final collision of points with differing scalar coefficients yields a discrete logarithm; if the LP2 object were this trace, this would give a recoverable operand rather than an arbitrary key-table transform.

## Exact invariant and result

For zero-based physical row r, when the initial state is printed, the right four tokens of row r must exactly equal the left four of row 2r. When the initial state is omitted and the first printed row is iteration 1, the target is row 2r+1. This is independent of modulus, curve, group order, partition, secret steps, numeric radix59/60, and even any common injective token encoding. With arbitrary fixed column order, the two corresponding eight-token row multisets must share at least four values including multiplicity. No fit or plaintext score required.

The canonical source file resources/liber-primus/lp2-grid-256.json blob 2550eae357442912220e05dc51147523a61dd75a supplies 32 consecutive rows of eight tokens (10/13/9 per physical page). In normal row order without reflection:

- Initial row included: 0/16 complete four-token predictions and 0/64 individual cells match. Distinct row comparisons 15/15 have multiset overlap at most one.
- Initial row omitted: 0/16 complete predictions and 0/64 individual cells match. Distinct row comparisons 16/16 have multiset overlap at most one.
- Reversing row order and/or reflecting columns yields 0/16 complete predictions in each of the other six cases; individual matches are 0 or 1 of 64. In reverse row order all 15 or 16 distinct row comparisons likewise have overlap at most one. Thus even arbitrary fixed column permutation cannot rescue any of these four row order/origin choices. This does not assume an arbitrary column permutation is a source instruction.

Seam predictions from earlier rows (one-based):
| Origin | Source row | Predicted row | Predicted first four | Actual first four |
|---|---:|---:|---|---|
| 0 | 6 | 11 | 3o 1l 3J 1G | 2M 0w 3L 3D |
| 0 | 12 | 23 | 3u 1O 0u 0Z | 3t 2B 2k 2t |
| 1 | 6 | 12 | 3o 1l 3J 1G | 3V 3e 3I 0n |
| 1 | 12 | 24 | 3u 1O 0u 0Z | 28 2a 0J 1L |

The origin-1 case predicts the first row of p51 (row24); origin-0 predicts the last row of p50 (row23), and the first row of p49-to-p50 seam (row11). These are deterministic out-of-prefix predictions, not a prospective blind experiment: the table was already accessible during source selection.

## Source control and reproduction

The core was run in V8 using finite-field elliptic-curve addition, scalar multiplication, and the book's exact Example 4.4 constants: p=229, curve y²=x³+x+44, P=(5,116), Q=(155,166), n=239, partition x mod4, coefficient steps (79,163),(206,19),(87,109),(219,68), initial coefficients (54,175). It produced 13 rows including the initial row, first flattened state [54,175,39,159,54,175,39,159], last [192,24,57,105,213,104,57,105], and recovered log 176. The same equality invariant passed 7/7 and 6/6 comparisons with initial row included/omitted respectively. No original curve or secret was inferred.

Minimal original-input reproduction (Python 3, read-only):
```python
import json
from collections import Counter
g=json.load(open('resources/liber-primus/lp2-grid-256.json'))
t=[x for p in g['pages'] for x in p['tokens']]
rows=[t[i:i+8] for i in range(0,len(t),8)]
assert len(rows)==32 and all(len(r)==8 for r in rows)
for rev in (False,True):
    rr=rows[::-1] if rev else rows
    for reflect in (False,True):
        s=[r[::-1] if reflect else r for r in rr]
        for o in (0,1):
            pairs=[(i,2*i+o) for i in range(32) if 2*i+o<32]
            cells=sum(a==b for i,j in pairs for a,b in zip(s[i][4:],s[j][:4]))
            full=sum(s[i][4:]==s[j][:4] for i,j in pairs)
            overlaps=[sum((Counter(s[i]) & Counter(s[j])).values()) for i,j in pairs if i!=j]
            assert full==0 and max(overlaps)<=1
            print(rev,reflect,o,len(pairs),full,cells,max(overlaps))
```
Equivalent V8 core executed; standalone Python snippet not separately run.

## Decision

Reject the direct common-origin 1:2 complete-state trace, including arbitrary stationary column layout and either row direction. It cannot supply a hidden discrete logarithm in this serialization. This is not an exclusion of arbitrary elliptic curves, independently initialized walkers, opaque ciphertext, unrelated trace types, a concealed per-lane symbol encoding or an unknown missing stage. None of those alternatives is selected by the source. No eligible trace-to-receiver survives here; do not optimize ad hoc strides, encodings or recurrences. A new independent typed trace source is required before further work.
