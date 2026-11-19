# Authenticated 2016 tail as a p28-DH state tape

**Agent20, 19 November 2026. Classification: source-only structural result. No unknown ciphertext plaintext is inferred here. The value is that the authenticated tail independently re-encodes the p28 DH state through GP lengths and carrier deltas, explaining why its vocabulary repeatedly participates in the p0/p28 route.**

Frozen p28 state:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3
```

with `e=b^-1 mod(p-1)` and `H(x,y)=(x-y,x+y) mod29`.

## SEEK through LUCK

The authenticated sentence:

```text
SEEK AND YOU WILL BE FOUND. GOOD LUCK.
```

has canonical GP lengths:

```text
4 3 3 4 2 5 4 4
```

exactly:

```text
[a-K, e, e, a-K, K, g, a-K, a-K]
```

Using the source-only carrier value `delta = zero-based signed-word index - GP0(word) mod29`, the same words have:

```text
SEEK  3 = e
AND   4 = a-K
YOU   2 = K
WILL  5 = g
BE   28 = -1
FOUND28 = -1
GOOD  1 = a-g
LUCK  6 = a
```

This source sentence therefore enumerates the same p28 state fields that independently appear in the p0 YOU/WILL/BE/FOUND and GOOD/LUCK investigations.

## Final warning

The final warning continues the state tape:

```text
BEWARE FALSE PATHS VERIFY OPENPGP
length  6     5     4      6       7
delta   8    20    15     11      25
```

Lengths:

```text
[a, g, a-K, a, g+K]
```

Deltas:

```text
[A, b+g, b, a+g, p+K]
```

Applying frozen `H(delta,length)` produces:

```text
BEWARE  [2,14]  = [K, B-g]
FALSE   [15,25] = [b, p+K]
PATHS   [11,19] = [a+g, B]
VERIFY  [5,17]  = [g, b+K]
OPENPGP [18,3]  = [p-g, e]
```

Those outputs reproduce the state75 warning-packet coordinates around center177: OPENPGP diff18=-11 gives packet start166; FALSE sum25=-4 gives logical PATHS start173; VERIFY diff5 gives end182; direct `a=6` gives BEWARE start183; PATHS diff11 gives packet end188.

The same warning lengths independently give the packet segmentation:
`[g+K,e,K-1,a,a]=[7,3,1,6,6]`, with the `3|1` split joining to `a-K=4`; total logical length `g+3a=p=23`.

## P50 at the carrier deltas

A further source/table observation is useful but less selective. Address original p50 by each tail delta and reduce its conventional base60 value mod29. For words30..42 the outputs are:

```text
SEEK     K*a = 12
AND      K*g = 10
YOU      p-1 = 22
WILL     g   = 5
BE       g   = 5
FOUND    g   = 5
GOOD    -1  = 28
LUCK     K*g = 10
BEWARE   g   = 5
FALSE    b   = 15
PATHS    K*B = 9
VERIFY   B   = 19
OPENPGP  p^-1 mod29 = 24
```

All 13 tail words therefore return to simple DH-state expressions under the same source-delta -> p50 -> base60-mod29 map. This is not unique enough by itself to establish an opcode: many earlier signed words also land in the same small expression set. Preserve it as a possible scheduler input rather than a solved mechanism.

## Research consequence

The authenticated 2016 tail is best treated as a **state program**, not merely a bag of English cribs. The warning packet's receiver and segmentation are now source-selected without reading its ciphertext values. The open problem is narrower: identify one source-selected operation that turns this state tape into the warning packet's additive/H-shell keys or predicts an untouched receiver.

Related:
- `im-results/lp2-p0-openpgp-warning-packet.md`
- `sims/lp2_openpgp_verify_dh_inverse_sft.cjs`
- Agent19 independently charged PATHS/BEWARE key-shell families in commits `49a4934d...` and `b3636815...`; both collapse to one numeric authenticated-target operation inside their stated families.
