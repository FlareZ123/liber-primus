# Candidate THE ORIGINAL closes through p23 terminal prime97 and conditional p50 [5,5]

**Agent42, 19 November 2026. Classification: post-discovery cross-object support for the candidate full p23 phrase. Page33 is independently suggested by the p23/p56 half-turn rise `56-23=33` and p33 `THEIR RISE`; the p50 `[5,5]` check is conditional on the p57-derived register. This does not decrypt p23 body ciphertext.**

## Fixed upstream packet

The current p23 route supplies the source-constrained cardinal stream

```text
[2,6,3,5,4,5,25,23,33]
```

from, in order:

- selected p23 line1 word lengths `[2,6,3,5,4]`;
- the five-dot count `5`;
- the selected line's terminal GP0 `25`;
- physical source page `23`;
- the p23/p56 half-turn page rise `56-23=33`, with p33 `THEIR RISE` as a source referent.

Under the solved-p56 cardinal serializer

```text
T(n) = (p_n - 1) mod29
```

if physical page labels23 and33 are treated as positive T-cardinals, the complete candidate stream is

```text
THE ORIGINAL.
```

## Prime closure at the selected terminal cardinal

The serialized GP29 values have raw GP0 sum

```text
GP0(THE ORIGINAL) = 97.
```

The source-selected p23 line terminates in GP0 `25`, and

```text
p_25 = 97.
```

Thus the raw value of the full phrase is exactly the prime used by the same serializer at the terminal cardinal that supplied the `N` in `ORIGIN`.

The shorter prefix does not share this closure:

```text
GP0(THE ORIGIN) = 53.
```

## Canonical p50 closure

Use the conditionally preferred p57-derived p50 register:

```text
zero-based GP0 address
-> native base60 byte
-> divmod29 [quotient,remainder].
```

At the full phrase address:

```text
p50[97] = 2U
base60(2U) = 150
150 = 5*29 + 5
=> [5,5].
```

Those two values are exactly the source-visible quantities that begin the local completion:

```text
five-dot stencil count = 5
selected line word count = 5.
```

By contrast:

```text
p50[53] = 2p = 171
171 = 5*29 + 26
=> [5,26].
```

So, if the p23/p56 page-rise/T-cardinal extension is accepted, the candidate `THE ORIGINAL` changes the conditional p50 readout from a one-coordinate match to the exact source pair `[5,5]`.

## Sensitivity and evidence boundary

Byte150 is not unique in the table: it occurs at addresses `28,97,213`. The claim is therefore not that `[5,5]` is globally rare. The evidence is the conjunction that the independently derived phrase has raw GP0 address97 and that the fixed cell at that address returns the typed source pair.

Likewise, serializer value `L=20` occurs for physical cardinals22 and33 in p1..p57. The p23/p56 half-turn page rise independently points to33; the DH/p50 state handoff is a separate conditional convergence, not the page selector.

This relation was noticed after the page-rise/T-cardinal `THE ORIGINAL` candidate had already been recognized, so it is a post-discovery consistency check rather than a blind probability. Its useful role is to distinguish the full-phrase candidate from the shorter prefix under the conditionally preferred p50 register.

## Reproduction

- SFT: `sims/lp2_p23_original_gp0_p50_closure_sft.cjs`
- Upstream p23 route: `im-results/lp2-p23-fivedot-totient-origin.md`
- P50 register audit: `im-results/lp2-p57-divmod29-register-audit.md`
