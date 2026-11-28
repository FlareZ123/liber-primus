# P50 base60 prime-rank geometry reproduces THE MAP and BEWARE FALSE PATHS

**Agent10, 28 November 2026. Classification: new source-exact structural warning / map-recognition candidate; no unknown LP2 plaintext, key, cipher inverse or destination.** This audit opens a consequence of the already documented signed-2016 PATH route without changing its coordinates: PATH selects p39, p39 supplies `SW`, p50[39]=`05` supplies five southwest steps to cell74, p50[74] interpreted in base60 supplies 205, and prime rank205 selects the authentic first p57 clause, **LIKE THE INSTAR TUNNELING TO THE SURFACE**. The prior report then projected straight upward from cell74=(row9,col2) to surface cell2=(row0,col2). This invocation inspected that already selected physical column before choosing any new receiver.

## Frozen consequence of the existing SURFACE projection

Read the literal column2 tunnel from the surface toward the established endpoint:

```text
cells  2, 10, 18, 26, 34, 42, 50, 58, 66, 74
tokens 2l,2a,0F,2r,3H,0S,0l,2Q,0P,3P
B60    167,156,15,173,197,28,47,146,25,205
```

The first two prime-valued cells encountered from the surface are:

```text
cell2  = 2l = 167 = the 39th ordinary prime
cell26 = 2r = 173 = the 40th ordinary prime
```

The authenticated 2016 source register already uses zero-based word indices elsewhere in the current p28/p29 route. Under that exact convention:

```text
source[39] = FALSE
source[40] = PATHS
```

so the frozen tunnel begins **FALSE PATHS**. This is not a decryption of p50; it is a typed readout of two source-visible prime-valued table cells under the same base60/ordinary-prime machinery already used by the PATH route.

The older endpoint-only observation `cell2=167 -> 39 -> PATH` therefore omitted a more discriminating consequence of opening the selected tunnel. Treat the closed PATH loop as, at minimum, a possible recognition/warning circuit rather than evidence that PATH itself names the next ciphertext decoder.

## Full physical-line census

To avoid selecting the two attractive tunnel cells after seeing them, enumerate the entire printed 32×8 p50 field. For every physical row and column, scan both directions, keep only base60 values that are ordinary primes with ranks <=42, and record adjacent entries in that prime-valued subsequence whose ranks increase by exactly one.

There are exactly three such base60 edges:

| Physical line | Cells | Values | Prime ranks | Zero-based authenticated words |
| --- | --- | --- | --- | --- |
| column2 downward | 2 -> 26 | 167 -> 173 | **39 -> 40** | **FALSE -> PATHS** |
| column3 upward | 219 -> 211 | 59 -> 61 | **17 -> 18** | **THE -> MAP** |
| column6 downward | 126 -> 182 | 163 -> 167 | **38 -> 39** | **BEWARE -> FALSE** |

The two warning edges join through the duplicated original token/value `2l=167`: cell182 terminates **BEWARE -> FALSE**, while cell2 begins **FALSE -> PATHS**. At the rank graph level, p50 therefore contains the only two-edge consecutive chain:

```text
38 -> 39 -> 40
BEWARE FALSE PATHS
```

The other edge is independently notable because it reads **THE MAP**, exactly the noun phrase used by the signed source: “Its words are the map.” This full-field enumeration was fixed before interpreting any additional token and contains no language-scored row/column choice.

## Radix rival and stopping rule

Repeat the identical physical-line family after deleting lowercase `f` from the printed alphabet (the live base59 rival). Only two edges survive, both rank22->23, at column5 downward and row5 right. There is **no two-edge consecutive rank chain**. Thus the warning structure discriminates base60 from base59 inside this specific prime-rank geometry family.

The source immediately continues:

```text
38 BEWARE
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

Base60 value179 (41st prime) exists once at cell129, but 181 (42nd prime) is absent from the table. Therefore the table does **not** encode an automatic `VERIFY OPENPGP` continuation under this rule. Stop at **BEWARE FALSE PATHS**; do not repair the missing 181 with another radix, wrap, offset, or table transform.

## Evidence boundary

Established computational facts under the frozen representation:

- p50 base60 has exactly the three forward consecutive-prime-rank physical-line edges listed above for signed indices through42;
- those edges map under the existing zero-based authenticated register to **THE MAP**, **BEWARE FALSE**, and **FALSE PATHS**;
- the warning edges share the same prime value/token 167/`2l`, yielding the rank chain **BEWARE FALSE PATHS**;
- the already selected cell74-to-surface column2 begins with prime ranks39 and40, hence **FALSE PATHS**;
- the same census under base59 has no two-edge consecutive chain;
- prime rank42 / OPENPGP cannot continue because value181 is absent.

Interpretive dependencies remain substantial. Ordinary prime rank is one-based while the signed register lookup is zero-based; that convention is already active in the current source-index research but is not independently stated by Cicada. The two warning edges occupy different columns and are joined by a duplicated rank39 token, so **BEWARE FALSE PATHS** is a rank-graph chain, not a single straight printed phrase. The SURFACE-to-top-row reading itself remains provisional. These facts materially strengthen the hypothesis that p50 participates in the signed “map” clue, while simultaneously warning against treating the PATH/SURFACE loop as an authenticated decoder.

## Research decision

Preserve this as a source-constrained map-validation result and redirect effort away from extending the terminal PATH loop by additional fitted receivers. A productive successor must obtain an independently authored operation that converts the map structure into a reversible transform of unknown LP2 ciphertext. In particular, do not resume p55 key sweeps merely because the PATH route closes numerically.

Reproduce with:

```text
node sims/lp2_p50_prime_rank_signed_warning_sft.cjs
```

The SFT reads only the pinned original p50 table and authenticated signed-2016 cleartext, reconstructs ordinary prime ranks, enumerates the complete row/column family under base60 and base59, verifies the frozen SURFACE column consequence, and asserts the failed VERIFY/OPENPGP continuation.
