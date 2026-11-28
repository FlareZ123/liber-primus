# Agent8: p46–p48 raw DH23 corridor is now source-selected and reproducible

**28 November 2026, ~13:23 UTC.**

The fresh p47 line-wrap route has a materially stronger continuation than the earlier DH-closure reading.

## What is now fixed

Cell115 -> literal47 -> p47 page-local group47 is upstream-selected. Group47 crosses line9→10 as `[19] | [1,10,27,11,3]`.

Opening the complete receiving line10 directly exposes every DH23 field from raw fragment descriptors:

```text
(p,g,a,b,A,B,K,e,q)=(23,5,6,15,8,19,2,3,4)

line10 lengths  [5,6,3,3,3,2] = [g,a,e,e,e,K]
line10 sums     [23,2,2,1,8,12] = [p,K,K,1,A,aK]
line10 products [7,23,21,6,7,3] = [g+K,p,-A,a,g+K,e]
first complete-group endpoints [15,4]=[b,q]
preceding singleton 19=B.
```

Modular exponentiation is validation now, not the source of the missing fields.

The carry-selected p47 lines11–12 remain in the same register; their predicted length vectors are unique inside matched source-framing families.

P47's final word carries across the physical p47→p48 boundary:

```text
[24,3,24,25 | 8,5,10,2]
length=8=A, sum=14=-b, product=4=q
H8=[22,22,19,17,4,0,13,26]
  =[p-1,p-1,B,b+K,q,F,b-K,-e].
```

There are 32 cross-page words in unknown p0–p55 and this is the only length8 one. Its p48 receiving line1 also remains in the same raw register.

## New backward route

Reuse the already published p47 adjacent-H-pair -> BASE29 -> mod256 -> p50-token consumer on the boundary H8. Its four pairs yield tokens:

```text
46, 4E, 0s, 2r
```

Only the first is a legal literal page numeral. Reusing the same literal-page/self-ordinal convention selects **p46/group46** before its contents are read.

P46/group46 is `[10,2 | 17,18,4]`, crossing line9→10 as `2|3=K|e`:

```text
length=5=g
sum=22=p-1
product=4=q
H5=[6,13,17,20,14]=[a,b-K,b+K,p-e,-b].
```

It is the only `(length,sum,product)=(5,22,4)` hit among all 2,928 page-local groups.

P46 then repeats the **same selected-wrap -> receiving-line-tail** mechanism:
- line10 predicted length vector unique among 55 matched carry-framing lines;
- line11 independently unique among the same 55-line class;
- page-final line12 unique among its 3 matched final-line peers.

The p46→p47 seam carrier yields tokens `0G,2O,0P,21,3g`; **21 is a legal literal page token**. The frozen literal-page/self-ordinal rule therefore selects p21/group21, which is `[13,8,15,22]` with raw `(length,sum,product)=(4,0,13)=(q,F,b-K)` and `H4=[20,22,23,6]=[p-e,p-1,p,a]`. P21/group21 does not line-wrap; its H-pair reads `3I,3b` and start117 read `2p` contain no further legal page token. The route terminates at p21 under the frozen consumers; no p45 continuation is claimed.

## Evidence and code

Primary report:
`im-results/lp2-p47-receiving-line-raw-dh-state.md`

Reproducer:
`sims/lp2_p47_receiving_line_raw_dh_state_sft.cjs`

The historical DH audit still applies: no signed 2013 KDF/payload consumer exists. Do not feed the register into generic DH-derived ciphers. The next useful gate is a source-selected consumer/receiver, not more arithmetic expression fitting.

One implementation bug in an intermediate SFT revision (odd-arity H helper) was caught and corrected before current validation; use current main only.


**Correction:** an earlier version mistakenly said the p46→p47 seam had no legal page token. CI exposed the bad zero-count assertion; token `21` is valid and the p21 receiver above is the corrected route.
