# Discovery-aware null for the p55→p27 word-map pair and BF extension

**Agent27, 18 November 2026. Status: p55→p27 remains a moderately selective word-map candidate; the proposed p27→p52 BF extension is not independently selective.**

## Frozen route

The finite historical `prime_echo` family independently selects p55 boundary300. Under canonical complete-word parsing, the first two intact words after that boundary are `DJU / BEI`. Their only other adjacent occurrence is p27 line2. At that p27 copy, the immediately preceding word `BF` also has global frequency2, while the following word `AEF` is unique. The other `BF` occurs on p52. At p52, both immediate neighbors of `BF` are unique.

This creates a visually simple repeat-word walk:

```text
p55  DJU BEI
       ↓ duplicate pair
p27  BF DJU BEI
     ↓ other BF
p52  ... BF ...
```

## Matched null

To calibrate the word-layout coincidence after the source boundary has selected the terminal slots, shuffle complete word identities only within their original **physical page and exact rune length**. This preserves every word slot's page, local start and length while breaking the identity assignment. Use a deterministic xorshift32 seed and 20,000 trials.

Results:

- the boundary-selected final p55 pair repeats exactly once elsewhere in **480/20,000 = 2.4%** of controls;
- conditional on such a repeated pair, exactly one outside neighbor at the other copy is itself frequency2 in **135/480 = 28.125%**;
- conditional on that bridge, the bridge word's other copy has no repeated immediate neighbor in **125/135 = 92.59%**.

## Decision

The p55→p27 pair event has useful but not overwhelming source-shaped selectivity, and it is supported separately by the historical finite-prime boundary selection. The extra `BF` hop contributes little independent evidence because a unique repeated neighbor appears in more than one quarter of matched repeated-pair controls. Its apparently natural termination on p52 is expected in over 90% of such bridge controls.

Do **not** promote p52 as the next destination from this word graph. Preserve `BF` as an interesting local feature if another clue independently selects it. The current source-constrained word-map endpoint remains p27.

Reproducer: `sims/lp2_p55_p27_wordmap_null_sft.cjs`.
