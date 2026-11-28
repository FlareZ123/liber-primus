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

has sole native eigenvalue `q=4`. Its left and right q-eigenspaces are both charged below; PRODUCT-normalizing the left vector gives `[-1,-K,1]=[28,27,1]`, whose contraction with positions1–6 of the already-frozen p8–p14 descriptor schedules produces

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

## Complete eigenspace charge: the p27 projective fan

The left q-eigenvector is not the only natural eigendirection. Charge the equally canonical right eigenvector instead of selecting one by output quality:

```text
left  = [-1,-K,1] = [28,27,1]
right = [-g,aK,1] = [24,12,1].
```

Contract the right vector with the same six frozen descriptor columns. Its schedule is

```text
[16,9,6,12,24,6].
```

On p22–p27 it is independently unique among 44 legal placements by both its complete descriptor packet and its length row alone. Most importantly, it lands on exactly the same terminal p27 fragment6/start31 as the left schedule.

Charge the remaining projective freedom instead of privileging PRODUCT normalization. Normalize each nonzero coordinate of each one-dimensional eigenspace to1 and contract with the final frozen descriptor column

```text
[L6,S6,P6] = [K,b-K,g].
```

The six canonical affine charts select

```text
left charts  -> [p,-e,a]   = [23,26,6]
right charts -> [p-1,b,a] = [22,15,6].
```

Thus the two PRODUCT-normalized charts are the only pair that collapse to one endpoint, and they collapse at `a=6`. Algebraically,

```text
left - right = [q,b,0]
qK + b(b-K) = 0 mod29,
```

so the common endpoint is a state identity, not an output-score choice.

Now open the five distinct p27 fragments selected by those already-fixed ordinals. In chart order `[p,-e,a,p-1,b]`, their independent page-local geometry/descriptors are

```text
ordinal    [p,  -e,  a, p-1,   b]
start mod29[A^-1,-A, K,   A,   A]
end mod29  [-b, -g,  g,A^-1,  Kg]
length     [e,   e,  e,   e,   K]
SUM        [-e, -K,K-b, p-g,   1]
PRODUCT    [B,   g,  b,  -g, p-g].
```

Their literal rune vectors are

```text
p    -> [-1,a,-A]
-e   -> [-A,-g,A^-1]
a    -> [b+K,p-g,Kg]
p-1  -> [p-1,A^-1,-b]
b    -> [b-K,b+K].
```

So the projective fan reconstructs essentially the complete DH register from held-out p27 fragment ordinals, starts, ends, descriptors and contents. Among the **51** physical pages that contain all five required ordinals, p27 is the only page matching the complete five-fragment signature. Stronger still, each feature family by itself—five start residues, five end residues, five lengths, five sums, or five products—isolates p27.

Those state labels were recognized after the fan was formed, so the page census is a post-discovery specificity control rather than a probability of authorship. The decisive structural point is that charging both eigendirections and all coordinate normalizations does not diffuse the route: it produces a compact state-indexed fan on the prospectively adjacent endpoint page and removes the left/right-eigenvector ambiguity.

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

## Cell254 now has an independently selected semantic continuation

Concurrent p21 work supplies a source-disjoint interpretation of the same cell254 junction. Its locally discriminated zero-origin signed-word register reads the literal printed token

```text
cell254 = 39
source word39 = FALSE
physical page39 = FALSE checkpoint.
```

That result was obtained from p21's `MEANING IS THE ROAD / SEEKS` route and its unique p22 neighbor hit on cell254, not from the p8 eigenspace. The present p8 route therefore joins an independently authenticated semantic/navigation branch at the already selected table cell:

```text
p7 -> p8 -> p16..21 -> p22..27
                       -> p27 (31,6)
                       -> cell254
                       -> 39 / FALSE / p39.
```

Preserve the established evidence boundary on p39. Its receiver at offsets132..136 was prospectively selected, but the exact local `FALSE` key grammar was recognized after the target and has failed clean transfers. The new route strengthens **navigation to the FALSE checkpoint**, not the retrospective local decoder. It also makes the cell254 token genuinely bifunctional: radix readings continue the DH register, while the independently selected signed-word reading supplies the human-facing warning branch.

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
