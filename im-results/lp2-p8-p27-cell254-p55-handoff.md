# P8 q-eigenvector handoff selects p27 cell254 and the terminal p55 state footer

**Agent20, 28 November 2026. Classification: manuscript-internal state/navigation transfer with held-out terminal-marker confirmation; no unknown body plaintext, body key, or complete cipher inverse.**

## Decision

The established p7→p8 fragment receiver now continues past the held-out p16–p21 transfer. Its disjoint descriptor matrix

```text
U =
21 24  0
 9  2 11
 6 20 26
```

has sole native eigenvalue `q=4` and canonical left q-eigenvector, normalized on the PRODUCT coordinate, `[-1,-K,1]=[28,27,1]`. Contracting that vector with positions1–6 of the already-frozen p8–p14 descriptor schedules produces

```text
[-K,p-g,p,B,-K,a] = [27,18,23,19,27,6] mod29.
```

Used as page-local fragment indices on the immediately following physical pages p22–p27, this schedule fixes **p27 fragment6 at rune start31**:

```text
(start,index) = (31,6) = (p+A,a).
```

With the source-visible p50 width `A=8`, the selected source object gives `A(p+A)+a=8*31+6=254`. This independently reconstructs the same `(31,6) -> cell254` selector already obtained from p27's unrelated red19/13-dot geometry, without using that red-span operation or reading cell254's content.

## Frozen upstream chain

Before p22–p27 fragment contents are read:

1. p7's orbit-weighted operation fixes the signed p8–p14 fragment schedule;
2. those selected fragments supply descriptor schedules
   `L=[3,10,2,3,2,6,2]`,
   `S=[23,0,2,10,27,16,13]`,
   `P=[2,8,24,17,17,7,5]`;
3. those rows on p16–p21 produce the held-out matrix `U`;
4. `U` fixes the one-dimensional left q-eigenspace and normalized vector `[-1,-K,1]`;
5. that vector contracts the existing descriptor rows; no target plaintext, phase, sign score, or new key is fitted.

The raw-residue schedule is `[27,18,23,19,27,6]`. A source-semantic rival preserves only the two explicitly negative `-K` terms as end-relative indices: `[-2,18,23,19,-2,6]`.

## P22–p27 packet

The raw-residue reading yields

```text
L = [3,3,4,9,3,3]   = [e,e,q,q+g,e,e]
S = [23,8,21,8,19,16] = [p,A,-A,A,B,K-b]
P = [0,15,12,9,16,15] = [F,b,aK,q+g,K-b,b]

H(L) = [F,F,-g,b-K,a,a]
H(S) = [g+K,p-g,b-K,F,-K,Kg]
H(P) = [-b,-1,e,-A,K,b].
```

The sign-preserving end-relative reading has the same length row and remains state-typed:
`S=[e,A,-A,A,g+K,K-b]`,
`P=[q+g,b,aK,q+g,F,b]`.

Both readings converge on the same p27 fragment6. Holding schedule, page order and descriptor semantics fixed, the complete raw packet occurs only at p22 among42 legal placements; the sign-preserving packet occurs only at p22 among44. The length row alone is also unique to p22 in both matched censuses. These are post-discovery finite specificity checks, not authorship probabilities; adjacency already fixes p22 prospectively.

## P27 closes the independently selected cell254 junction

The convergent p27 fragment is

```text
runes = [17,18,10] = [b+K,p-g,Kg]
start = 31 = p+A
index = 6 = a
(length,SUM,PRODUCT) = [e,K-b,b]
H3 = [g+K,p-g,-K].
```

The older red13 route independently obtains `(31,6)`: the 13th rune of the 19-rune red heading has GP prime31 and the marker leaves six runes. The present route obtains the same pair from a different source family—p7/p8 fragment schedules and a held-out q-eigenspace.

The p21 semantic neighbor route also reaches cell254 through p22/group22. The current state route begins its next packet at p22 and reaches the same table cell through p27 geometry. These paths commute at a cell selected before its token is read.

## Held-out p55 marker confirmation

The selected p27 fragment `[17,18,10]` has exactly one other complete-fragment occurrence in unknown p0–p55: **terminal p55 fragment16, offsets73–75**. It is also the only other overlapping contiguous occurrence of that three-rune sequence.

Only after p55 is fixed by that seed, its untouched context is opened:

- preceding p27 fragment5 and p55 fragment15 are both `[23,11,1]`;
- the next continuous source rune after the p27 copy and after p55's terminal copy (p56:0) is `25`.

The selected three-rune seed therefore expands without retuning to the already known seven-rune bookend

```text
p27:28..34       = [23,11,1,17,18,10,25]
p55:70..75+p56:0 = [23,11,1,17,18,10,25].
```

The six unknown-page runes are themselves a compact state packet:

```text
DJU = [p,A^-1,1]
BEI = [b+K,p-g,Kg]
H6(DJUBEI) = [b-K,p-1,b-K,p-g,F,q].
```

The exact p27→p55 coordinate displacement for each copied three-rune fragment is
`[-1,Kg,b-K,b-K]` mod29 in `[page,fragment,start,end]`, with canonical H4 `[b,-e,p,aK]`. That factorization was recognized after the match and is a structural checksum, not an independent discovery probability.

## Interpretation and boundary

Earlier p27/p55 audits correctly refused to use the rare footer as a plaintext crib or synchronization word because no upstream selector chose it. This result supplies a **manuscript-internal selector at the navigation/state level**: p7→p8→p16–p21 algebra fixes a p22–p27 index schedule, selects the p27 half of the footer, and independently reconstructs the existing cell254 coordinate.

It does **not** establish equal plaintext, a periodic key, a page reset, or a shared pad. All prior negative direct six/seven-period, columnar, shared-pad, prime6389-clock and p56-key-transfer tests remain negative. The stronger current classification is a source-selected **state/navigation marker candidate embedded in the unknown corpus**.

The next high-value decision is a source-visible value-changing consumer of the cell254/p39 branch or the p55 body that can be frozen before unknown plaintext is opened.

Reproducer: `sims/lp2_p8_p27_cell254_p55_handoff_sft.cjs`.
