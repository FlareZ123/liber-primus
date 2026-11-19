# P33 RISE selects p35 FOUND, which exposes the unique FOUND to ROAD map receiver

**Agent50, 19 November 2026. Classification: source-constrained navigation advance with a held-out manuscript receiver. This route selects physical pages and source states. It does not claim unknown rune plaintext.**

## Executive result

A single chain now connects four previously separate structures:

```text
p33 red title -> THEIR RISE
RISE source numbers 3 -> 5 -> +2
p33 + 2 -> p35
signed word35 = FOUND

p35 adjacent word GP0s = 36,54
p50-low(36) = 54
p50-low(54) = 36
36 = GP0(FOUND)
54 = GP0(ROAD) = GP0(PATHS)

frozen source direction graph:
FOUND35 -> THE28 -> HELLO0 -> MAP18 -> ROAD23

physical route:
p35 -> p28 -> p0 -> p18 -> p23

p28 line6 begins literal DH
p23 signed word = ROAD
p23 red heading -> THE ONE RISE
```

The p35 pair is especially important. Across **2,873** page-local adjacent word windows on every unsolved rune-bearing physical page, it is the **only** pair whose two word GP0 values point to each other through the already selected p50 low-digit operator.

## 1. P33 selects p35 before the p35 word-level receiver is opened

The p33 red titles have printed word lengths:

```text
upper: [2,8]
lower: [3,5]
```

The published solved-p56 cardinal serializer with the frozen H polarities gives:

```text
[2,8] + H^-1 -> THEIR
[3,5] + H    -> RISE
```

The word **RISE** is generated from the ordered source numbers `3,5`. Their literal rise is:

```text
5 - 3 = 2
```

so:

```text
p33 + 2 = p35
```

Authenticated signed word35 is exactly:

```text
FOUND
```

Commit `14a1f6613142a59bb4468b07bf78ef34a8a81493` froze p35 as the preferred receiver before this invocation performed the p35 word-level GP0/p50 adjacency census. The page transcription and broad page statistics had already been inspected; the exact adjacent `36,54` receiver below had not been identified.

## 2. P35 contains the manuscript's unique adjacent mutual p50-low cycle

On p35, canonical complete words 6 and 7 occupy:

```text
offsets 25..26: [19,17], GP0 = 36
offsets 27..29: [19,24,11], GP0 = 54
```

The original p50 table gives:

```text
low60(p50[36]) = 54
low60(p50[54]) = 36
```

so the two adjacent manuscript words form an exact mutual pointer:

```text
36 <-> 54
```

The authenticated source supplies the semantics:

```text
GP0(FOUND) = 36
GP0(ROAD)  = 54
GP0(PATHS) = 54
```

An exhaustive census over all **2,873** within-page adjacent complete-word windows on p0..p49 and p51..p55 finds exactly one mutual low-digit GP0 pair. It is this p35 receiver at offsets25..29.

This is a strong independent validation of the p33 `+2 -> p35` landing. The selector that chose p35 does not consume either p35 word, either GP0 sum, or the p50-low adjacency property.

## 3. The frozen direction graph resolves ROAD versus PATHS

The value54 is deliberately ambiguous in the signed source because both ROAD and PATHS have GP0=54.

The already established source direction graph resolves that collision without fitting a new page-specific rule:

```text
s_i = low60(p50[i]) - i - GP_length(word_i) mod29
```

Starting at authenticated **FOUND** word35 gives:

```text
35 FOUND
 -> 28 THE
 -> 0  HELLO
 -> 18 MAP
 -> 23 ROAD
 -> 0  HELLO ...
```

Starting at **PATHS** word40 enters the other attractor basin and does not reach ROAD.

Thus the p35 mutual pair is naturally read as the positive-source association:

```text
FOUND <-> ROAD
```

while PATHS remains associated with the separately identified p39 FALSE corridor.

The same graph can be read directly as physical page numbers once p35 is selected:

```text
p35 -> p28 -> p0 -> p18 -> p23
```

This is the literal interpretation suggested by the authenticated sentence:

```text
Its words are the map, their meaning is the road,
and their numbers are the direction.
```

The route terminates at signed word/page23 **ROAD**.

## 4. The first step lands on literal DH

The first direction step is:

```text
p35 -> p28
```

Original p28 physical line6 begins with rune values:

```text
[23,8] = D,H
```

so the page reached by the frozen direction operation visibly contains literal **DH** at the head of the source-critical line. This matches the independently reconstructed Diffie-Hellman state already selected from the signed source and OpenPGP material.

This observation does not supply a new DH key. It makes the p35-to-p28 navigation semantically coherent without adding a fitted constant.

## 5. P23 ROAD hides THE ONE RISE

Physical p23 is the ROAD destination of the FOUND direction walk. Its original red four-word heading has lengths:

```text
[2,6,3,5]
```

Group the printed words into adjacent pairs and apply the same forward H extension used by p33's `[3,5] -> RISE`:

```text
[2,6] + H(2,6) = [2,6,25,8]
[3,5] + H(3,5) = [3,5,27,8]
```

The solved-p56 prime-totient cardinal map gives:

```text
[2,6,25,8] -> THEONE
[3,5,27,8] -> RISE
```

therefore:

```text
THE ONE RISE
```

This was discovered only after the source direction graph selected p23 as ROAD.

### Red-span family charge

For every red span whose complete printed words can be paired, the SFT charges every per-pair choice of `H` versus `H^-1` before applying the same cardinal serializer.

Across the comparable family, `THEONERISE` occurs exactly once:

```text
p23 start0
lengths [2,6,3,5]
modes   [H,H]
```

The same family also reproduces the already known p33 `THEIR`, p33 `RISE`, and p40 `RISE` outputs under their respective polarities.

## 6. The selected p35 runes also compress to reconstructed state

The p35 receiver was selected by its GP0/p50 behavior. After that selection, applying the already frozen outside-in H map to its raw runes gives:

```text
[19,17]    -> [2,7]
[19,24,11] -> [8,1,24]
```

Under the independently reconstructed state:

```text
[2,7]    = [K, g+K]
[8,1,24] = [A, a-g, -g]
```

This is corroborative state compression. It should not be treated as an independent probability claim because those expressions were recognized after the receiver was known.

## What changes

The p33 hidden text now has a concrete positive consumer with a held-out internal validation:

```text
RISE -> p35 FOUND -> unique FOUND/ROAD pointer pair
```

The source direction graph then turns the authenticated word numbers into a physical-page walk and connects that receiver to p28's literal DH and p23's newly recovered `THE ONE RISE` instruction.

This route deserves priority over additional unconstrained key searches on p33, p35, or the p39 false corridor.

## Next decisive question

Interpret `THE ONE RISE` using source-visible p23 material before opening another broad cipher family.

The most economical candidates are:

1. `ONE` specifies a literal rise of one physical page from ROAD/p23.
2. `ONE RISE` selects one of the already observed RISE-bearing red headings.
3. The p23/p56 half-turn five-dot stencil supplies the ordering or object that the word ONE refers to.

A useful next experiment must distinguish these readings using original layout or an already authenticated operator. It should predict a concrete page, receiver, or source word before examining that target.

## Reproduction

- `sims/lp2_p33_p35_found_road_map_sft.cjs`
- `.github/workflows/agent50-p33-p35-found-road-map.yml`
- p33 branch synthesis: `im-results/lp2-p33-their-rise-false-corridor.md`
- upstream p33 serializer: `sims/lp2_p33_totient_hidden_text_sft.cjs`
