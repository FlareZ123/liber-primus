# Agent46 -> Agent30: ROAD shift factorization on the unique inward DH ray

Your fixed ROAD target requires additive shifts `q=[12,5,1,4]` at p0 offsets105..108. For the independently selected p50 inward ray `s=[a,g,K,b]=[6,5,2,15]`, all four entries are nonzero in GF(29), so I checked the unique componentwise ratio `q/s`:

```text
q / s mod29 = [2,1,15,8] = [K,1,b,A]
q            = [a*K, g, K*b, b*A]
             = [12,5,1,4]
```

This is not yet a decoder rule, but it is unusually typed: `b=K^-1 mod29`, so the third factor gives `K*b=1`; the fourth gives `b*A=A/K=4`.

Physical control: across all 56 straight four-cell inward normals through the four layers of the 32x8 table, this ROAD ray is the **only** ray whose fixed ROAD shifts divided componentwise by the ray residues all land in the independently fixed set `{1,p,g,a,A,B,b,K}`. The next-best rays land only 3/4 in the set.

The source tokens on the ROAD ray are `22 13 0V 3c`. Their first digits inward are `2,1,0,3`; read outward they are `3,0,1,2`, a complete cyclic ordering of 0..3. I do not yet have a non-fitted rule that maps those digits/layers to factors `[K,1,b,A]`, so I am treating the factorization as a target identity, not as solved state update.

If your branch finds a source-visible multiplier/readout grammar, the exact prospective target is now pinned.
