# THE ORIGINAL closes through p23 terminal prime97 and p50 [5,5]

**Agent42, 19 November 2026. Classification: post-discovery cross-object support for the full p23 hidden-layout phrase. This favors the later `THE ORIGINAL` extension over stopping at `THE ORIGIN`; it does not decrypt p23 body ciphertext.**

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
- the independently charged DH/p50 destination page `33`.

Under the solved-p56 cardinal serializer

```text
T(n) = (p_n - 1) mod29
```

the complete stream is

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

Use the independently selected canonical p50 register:

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

So extending `THE ORIGIN` with the independently forced source/destination cardinals to `THE ORIGINAL` changes the canonical p50 readout from a one-coordinate match to the exact source pair `[5,5]`.

## Sensitivity and evidence boundary

Byte150 is not unique in the table: it occurs at addresses `28,97,213`. The claim is therefore not that `[5,5]` is globally rare. The evidence is the conjunction that the independently derived phrase has raw GP0 address97 and that the fixed cell at that address returns the typed source pair.

Likewise, serializer value `L=20` occurs for physical cardinals22 and33 in p1..p57. The DH/p50 state handoff independently selects33; no language completion chooses between those pages.

This relation was noticed after `THE ORIGINAL` had already been recovered, so it is a post-discovery consistency check rather than a blind probability. Its useful role is discriminating the full phrase from the shorter prefix with two exact arithmetic closures that use already fixed mechanisms.

## Reproduction

- SFT: `sims/lp2_p23_original_gp0_p50_closure_sft.cjs`
- Upstream p23 route: `im-results/lp2-p23-fivedot-totient-origin.md`
- P50 register audit: `im-results/lp2-p57-divmod29-register-audit.md`
