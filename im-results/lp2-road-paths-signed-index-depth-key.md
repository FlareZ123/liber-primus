# ROAD key from the ROAD/PATHS signed-number collision and direction depth

**Agent27, 19 November 2026. Classification: source-derived post-discovery key compression for the p0 ROAD candidate. This removes the previous target-aware freedom in the four-rune ROAD key, while remaining below established-plaintext status because the construction was recognized after ROAD itself was known.**

## Question

The active p0 route already selects the four-rune receiver at offsets 105..108 immediately after the source-constrained THE receiver, and the published local additive key

```text
[12,5,1,4]
```

replays candidate `ROAD`. The remaining weakness was provenance: the key had been expressed as a compact source descriptor only after the target was visible.

The authenticated 2016 message and the original p50 table now define, independently of p0 ciphertext, the frozen signed-word direction graph

```text
s_i = low60(p50[i]) - i - GP_length(word_i) mod29.
```

Its topology has maximum transient depth `g=5`. This report asks whether the source words themselves derive the ROAD key without consuming the p0 receiver.

## Source-only construction

In the authenticated 43-word message, using the already frozen zero-based word numbers:

```text
ROAD  = word23, GP length4, GP0=54
PATHS = word40, GP length4, GP0=54
```

They are the sole **distinct lexical** pair of four-GP-rune source words sharing one GP0 address. The only other equal-length four-rune collision is the repeated word `THEIR`.

Apply the already frozen H orientation to their source numbers modulo29:

```text
H(23, 40 mod29)
= H(23,11)
= [23-11, 23+11] mod29
= [12,5].
```

PATHS reaches its first direction-graph cycle after exactly four edges. The graph maximum transient depth is five, so the same source topology partitions that depth as remaining then used:

```text
[g-d, d] = [5-4,4] = [1,4].
```

Concatenate the two source-derived pairs:

```text
[12,5] || [1,4] = [12,5,1,4].
```

This exactly reproduces the previously published ROAD key without reading the p0 ciphertext.

### Independent p38 checksum

The same first pair is present in a manuscript object selected independently before this construction. The frozen p38 FOUND continuation selects offsets54..56, whose original values are `[5,12,19]=[g,K*a,B]`. Reversing its center/first coordinates gives

```text
[K*a,g] = [12,5] = H(index(ROAD),index(PATHS)).
```

The direction graph has six total cycle nodes, `a=6`, so its first packet coordinate also gives `a-g=1`. PATHS has graph depth4, and the p38 packet is independently known to be the final word of numbered section4 immediately before the printed `5-` marker. Therefore the complete ROAD key has a second source-side spelling:

```text
[K*a, g, a-g, depth(PATHS)]
= [12,5,1,4],
```

with the terminal `4` also echoed by the original section boundary. This p38 agreement was recognized after the ROAD key result and is corroboration rather than an independent discovery probability.

## Exact original-cipher consequence

The independently selected p0 receiver at offsets105..108 is:

```text
[16,8,25,27].
```

Subtract the source-derived key:

```text
[16,8,25,27] - [12,5,1,4] mod29
= [4,3,24,23]
= ROAD.
```

Thus the ROAD inverse now has a source-side key construction. Its chronology remains retrospective: the relation above was recognized after the ROAD candidate and its local key were already in the repository.

## Complete collision-family audit

The source contains 29 ordered-by-occurrence pairs of signed words sharing GP0. For every such pair, freeze the same construction:

```text
key = H(first signed index, second signed index)
      || [maximum graph depth - depth(second), depth(second)].
```

Apply each four-coordinate key to every complete four-rune unknown word in LP2 and score only exact members of the authenticated four-GP-rune 2016 vocabulary. There are:

```text
29 same-GP0 source pairs
514 unknown four-rune words
9 distinct authenticated four-rune targets.
```

The fixed canonical construction gives exactly **one** target hit in the whole family:

```text
ROAD/PATHS -> [12,5,1,4] -> p0 offset105 -> ROAD.
```

The repeated `THEIR/THEIR` four-rune collision produces no authenticated target anywhere.

A nearby convention charge covers every same-GP0 pair under:

- zero- or one-based source numbers;
- forward or reversed H endpoints;
- graph depth taken from the first or second pair member;
- depth serialized as `[remaining,used]` or `[used,remaining]`.

This is `29 × 2 × 2 × 2 × 2 = 464` keys and `464 × 514 = 238,496` key-word trials. Eight authenticated-word hits occur somewhere in that broad family. The route-selected `p0:105 -> ROAD` event occurs exactly once, under the canonical conventions already fixed by the active source route:

```text
zero-based source numbers
forward H
depth of later source word PATHS
[remaining,used]
=> [12,5,1,4].
```

This is a familywise uniqueness result for the route event, rather than a discovery p-value.

## Rival receiver fails

The shared source address itself gives the obvious competing output-type interpretation:

```text
GP0(ROAD)=GP0(PATHS)=54
p50[54]=2a
base59(2a)=154.
```

P0 offset154 is also the start of a four-rune word, ciphertext `[26,10,23,24]`. The newly source-derived ROAD key decrypts it to

```text
[14,5,22,20],
```

which is absent from the authenticated four-rune source vocabulary. The source-side key therefore favors the independently selected p0:105 route receiver and does not rescue the previously unauthenticated `p50 numeral -> LP rune offset` coercion.

## Decision

Upgrade the **ROAD key provenance**. The exact four-rune key no longer requires a coordinate-by-coordinate target-conditioned expression: it is reconstructed from the authenticated source pair ROAD/PATHS, their shared GP0 address, the frozen H operation, and the independently defined signed-word direction graph.

Keep ROAD itself at candidate level for now. The construction was found after the target was known, and the same key has not yet made a genuinely untouched plaintext prediction or transferred to a solved control. The next decisive use should freeze this construction before opening a new receiver selected independently of ROAD.

## Reproduction

```text
node sims/lp2_road_paths_signed_index_depth_key_sft.cjs
```

The SFT rebuilds the authenticated source words, p50 direction graph, all same-GP0 source collisions, the independently selected p38 state packet checksum, the complete unknown four-rune word census, the exact p0 ROAD replay, the direct-offset rival, and the 464-key nearby convention audit from repository resources. Windows / Node.js 22 reproduction passed first on run 44450234079 before the p38 checksum was added; rerun the current SFT for the final combined checkpoint.
