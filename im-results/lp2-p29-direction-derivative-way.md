# Signed MAP/DIRECTION selects e=3 and reconstructs WAY from p29/p50 derivative structure

**Agent17, 19 November 2026; Agent40 source-gate review, 19 November 2026. Classification: conditional navigation-token candidate; the p29 derivative assembly is not source-selected and no p29 ciphertext plaintext is recovered.** The authenticated 2016 words `MAP` and `DIRECTION` expose the p28 inverse exponent `e=3`; the p9 PATHS packet supplies `r=24` and `AY=[24,26]`; the p29/p50 third derivative yields `W=7`. The 48-configuration family has one authenticated three-rune lexical hit, `WAY`, but its `W||AY` assembly was recognized retrospectively. The new p28 `READ OUT THE DIRECTION` bridge selects p29 as a page by the signed-source index, but does not specify the derivative/coefficient concatenation order.**

## Source-selected derivative order

The calibrated p28 state is:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
e = b^-1 mod22 = 3.
```

Use the already fixed reversible endpoint map:

```text
H(x,y) = (x-y, x+y) mod29.
```

Canonical GP tokenization of all 43 natural-language words in the authenticated 2016 signed message reveals a sharp source fact:

**Exactly two words have endpoint sum equal to `e=3`:**

```text
MAP        endpoints M=19, P=13
           H(M,P) = [6,3]  = [a,e]
           H(P,M) = [23,3] = [p,e]

DIRECTION  endpoints D=23, N=9
           H(D,N) = [14,3]
           H(N,D) = [15,3] = [b,e]
```

No other authenticated word has endpoint H-sum3.

The oriented pairs are also unique across all 43 words:

- `MAP` alone gives forward `[a,e]=[6,3]`;
- `DIRECTION` alone gives reverse `[b,e]=[15,3]`.

Thus the two semantic instruction words **MAP** and **DIRECTION** independently identify the same derivative/exponent order `e=3` in the fixed GP29 register.

This relationship was found after the p28 state and signed scaffold were known, so it is source-structural evidence rather than a blind discovery statistic.

## The signed-2013 H factor already contains e

The authenticated 2013 TCP challenge gives:

```text
BASE29 3301 -> 3QO.
```

Its base29 digit values are:

```text
3QO = [3,26,24].
```

Under the established high-first polynomial convention used by the p29/p50 G-adic bridge, reversal gives:

```text
H(X) = 24X^2 + 26X + 3.
```

Therefore:

```text
H coefficients = [24,26,3]
H constant      = 3 = e
positive-degree pair = [24,26] = AY.
```

The constant coefficient agreeing with the independently selected `e=3` makes the derivative-order interpretation considerably less arbitrary than choosing an order from the p29 polynomial alone.

## Apply e at the independently selected repeated root

The p39 red triad gives:

```text
G(X) = 15(X-24)^2 mod29.
```

The p28 `THE -> DIRECTION` route now conditionally selects p29 before this factor relation is tested.

For the original p29 rune polynomial `P` and the printed numeric-table polynomial `S`:

```text
P(24)  = 0
P'(24) = 0

S(24)  = 0
S'(24) = 0.
```

Use the source-selected order:

```text
e=3.
```

Then:

```text
P'''(24) = 7
S'''(24) = 7
GP29[7] = W.
```

The p29/table equality at derivative order3 is algebraically implied by the already known G² congruence and therefore counts as one structural output, not two independent confirmations.

The important new fact is source selection of **order3** from MAP/DIRECTION rather than choosing derivative order after inspecting the derivative vector.

## WAY reconstruction

The fixed signed-2013 factor contributes:

```text
H positive-degree coefficients = [24,26] = AY.
```

The selected derivative supplies:

```text
P^(e)(24) = 7 = W.
```

Placing the derivative output before the positive-degree pair gives:

```text
[7,24,26] = WAY.
```

This is exactly the authenticated 2016 word `WAY`, one of the six words immediately following the state-selected `THE` occurrences.

## Charged assembly family

Because the placement of W relative to AY was recognized after the values were visible, charge the compact natural assembly family.

Inputs fixed before language comparison:

- source polynomial: p29 or p50 table;
- root:24 from p39 G;
- signed-2013 H positive-degree pair: `[24,26]`;
- derivative orders `k=0,1,2,3`, where source evidence later selects `e=3`.

Charge:

1. both source polynomials;
2. every derivative order0 through3;
3. insertion of the derivative result into any of three positions relative to `[24,26]`;
4. forward and reverse output order.

Total:

```text
2 × 4 × 3 × 2 = 48 configurations.
```

Compare only against the authenticated 2016 words that tokenize to exactly three GP runes. The distinct source vectors are:

```text
PATH = [13,24,2]
WAY  = [7,24,26]
ITS  = [10,16,15]
ARE  = [24,4,18]
MAP  = [19,24,13]
AND  = [24,9,23]
YOU  = [26,3,1].
```

The **only** family hits are:

```text
p29,  k=3, derivative first, forward -> [7,24,26] = WAY
table,k=3, derivative first, forward -> [7,24,26] = WAY.
```

These two hits are the same mathematical output because the G² relation forces the p29/table third-derivative equality.

No alternative derivative order, insertion slot or direction hits another authenticated three-rune word.

## Interpretation

The combined source path is now:

```text
p28 DH state
-> e=3
-> local HERE -> THE
-> signed THE positions
-> DIRECTION selects p29
-> signed MAP/DIRECTION endpoint sums independently expose e=3
-> p39 repeated root r=24
-> e-th derivative at r gives W
-> signed-2013 H positive-degree pair gives AY
-> WAY
```

This is a serious candidate for an intended cross-year instruction path. It connects three authenticated source layers with the original manuscript:

- p28/p29 LP2;
- the signed 2013 BASE29/DH challenge;
- the signed 2016 “WAY / MAP / ROAD / DIRECTION” message.

The remaining weakness is the final assembly convention: although the 48-way charge is small and WAY is the sole lexical hit, the source does not explicitly say “place the derivative result before H's positive-degree coefficients.” Treat WAY as **candidate recovered instruction material**, with stronger source support than a free language fit.

## Independent WAY cube-e LIBER p9 holdout

Agent31 later found a second downstream consumer of this candidate that does not use the p13 historical-label route. In the authenticated 2016 source, WAY is uniquely zero-based index13. The separately source-selected operation `C(x)=x^3 mod29`, composed the independently fixed state count `e=3` times, gives:

    13 -> 22 -> 5 -> 9
    WAY -> THE -> EPIPHANY -> LIBER

Thus `C^e(WAY13)=LIBER9`. Physical p9 had already been independently selected by the p39 VERIFY route before this relationship was noticed. The same operation is involutive on this half-cycle, so `LIBER9 <-> WAY13`. Among all six signed THE-followers, WAY is the sole follower mapped to index9 by the fixed `C^e`; among state counts `K=2,e=3,q=4,g=5,a=6`, only `e` reaches index9 from WAY.

Combined with p9's untouched `K=2` packet split `29|40 = DIRECTION|PATHS`, the productive branch closes `p9 -> DIRECTION29 -> p29 -> WAY13 -> LIBER9 -> p9`. This is a retrospective cross-route holdout, so it strengthens WAY materially while leaving the final W+AY assembly convention as the remaining local weakness. See [WAY cube-e LIBER p9 holdout](lp2-way-cube-e-liber-p9-holdout.md). Windows Node22 PASS: run 44457394414.
## P9 PATHS half now supplies the p29 parameter packet

Agent31 subsequently found that the independently selected p9 PATHS half `[0,3,16,21]` contains the p29 parameters directly under two H views. Shell-preserving adjacent-pair H gives `[24,26,3,8]=[p+1,-e,e,A]`; its first three values exactly equal the polynomial-order coefficients obtained from authenticated 2013 `BASE29 3301 = 3QO`, and the fourth is `A=8`. The existing outside-in H4 gives `[8,16,19,21]=[A,C(p),B,B+K]`.

Under the fixed radial H serialization, `[24,26,3,8]` and its `[24,26,3]` prefix each occur on only p9 offsets137–140 across all 12,791 contiguous four-rune windows. Charging 32 natural pair/orientation variants per window gives 409,312 configurations; every full or prefix hit remains on that same physical p9 window. The outside-in H4 target `[A,C(p),B,B+K]` is likewise unique manuscript-wide.

This packet now supplies `r=24`, derivative order `e=3`, and `AY=[24,26]` before the p29 derivative. Both p29 and the table give third derivative `W=7` at r24. Preserving p9 branch order gives `W||AY = WAY`; among the six compact W-insertion/direction choices, only that assembly is an authenticated signed-source three-rune word. Because the radial serialization and branch-composition rule were recognized after WAY, retain candidate-level wording, while the previous 48-member assembly ambiguity is materially narrowed. See [p9 PATHS H-factor packet](lp2-p9-paths-hfactor-p29-way.md). Windows Node22 PASS: 44457862429.
## p28 READ OUT THE DIRECTION gate (Issue #1931) — negative

The new bridge is not a complete source instruction. The fixed [p28 readout report](lp2-p28-numbers-direction-readout.md) produces the local candidate `READ OUT THE` and the four-word structural result `THEIR NUMBERS ARE THE`; the authenticated 2016 message then continues with `DIRECTION`. These pieces can motivate selecting physical p29 (the signed-source word index is 29), but the whole phrase `READ OUT THE DIRECTION` is not itself a single authenticated or p28-decrypted sentence.

The p28 readout report independently records that `DIRECTION SEEK AND YOU` is **0/2,699** canonical page-local four-word windows and explicitly classifies `DIRECTION` as a signed-source continuation, not p28 body plaintext. It therefore cannot be used as an authored instruction that specifies the p29 polynomial operation.

The remaining assembly gap is unchanged:

- `MAP`/`DIRECTION` source endpoints select `e=3`;
- the p9 PATHS packet supplies `r=24` and `AY=[24,26]`;
- the p29/p50 third derivative gives `W=7`;
- nothing says to place derivative output `W` before the H-derived `AY` pair.

The semantic fact that `WAY` is a synonym for `DIRECTION` is a lexical match, not an ordering rule. The p9 `LIBER` holdout is a retrospective cross-route check, not a p30 consequence.

**Frozen receiver and holdout:** the receiver is the full canonical p29 rune body (original physical image `46.jpg`); the untouched consequence is the full canonical p30 rune body (original physical image `47.jpg`). No ciphertext span was opened. The only nearby `SEEK AND YOU` / `YOU WILL BE FOUND` continuation is already present in the same authenticated 2016 source and belongs to the separate [Agent4 p29+p30→p32 precommit](../workplace/agent4-direction-seek-and-you-p32-precommit.md); it is not an independent p30 holdout for this assembly.

**Decision:** retain `WAY` only as a conditional navigation-word candidate. Retire the derivative-assembly branch as a p29 cipher/plaintext path. No exact p29 or p30 original-cipher inversion/forward reconstruction exists, and no further roots, derivative orders, coefficient subsets, concatenations or language-fitting variants are authorized.

## Parameter expression and reproduction

Preserve the parameter derivation, not the plaintext claim (negative source-order gate recorded in [Issue #1931](https://github.com/FlareZ123/liber-primus/issues/1931)):

```text
P29^(e)(24) + H_{X^2,X}
= W + AY
= WAY   # retrospective candidate only
```

Do not expand derivative orders, coefficient subsets or arbitrary concatenations after seeing output.

## Reproduction

Run:

```text
node sims/lp2_p29_direction_derivative_way_sft.cjs
```

The SFT reconstructs the p28 state, tokenizes all authenticated 2016 words, verifies the unique MAP/DIRECTION `e=3` endpoint property, derives signed-2013 H from `3QO`, evaluates p29 and p50 derivatives at root24, and charges all 48 declared assembly alternatives. Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44443200106.
