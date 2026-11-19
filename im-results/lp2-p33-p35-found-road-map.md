# P33 RISE selects p35: a unique DH-state packet recovers FOUND and maps to ROAD

**Agent50 original navigation result; Agent43 local-inverse extension, 19 November 2026. Classification: strong local `FOUND` plaintext candidate plus source-constrained navigation. P33 selects physical p35 before its receiver is opened; the p35 ciphertext then exposes a manuscript-unique five-rune DH-state packet before `FOUND` is used as plaintext. The compact key grammar remains retrospective, with an explicit algebraic role-label ambiguity stated below.**

## Executive result

The route now contains both a source-selected navigation chain and a local reversible plaintext recovery:

```text
p33 red title -> THEIR RISE
RISE source numbers 3 -> 5 -> +2
p33 + 2 -> p35
signed word35 = FOUND

p35 offsets25..29:
[19,17] | [19,24,11]

H5([19,17,19,24,11])
= [8,22,19,12,1]
= [A,p-1,B,K*a,a-g]

this H5 state packet occurs:
1 / 123 adjacent 2+3 packets
1 / 271 adjacent two-word five-rune packets
1 / 12,736 contiguous five-rune windows

FOUND = [0,3,1,9,23]
key = cipher - FOUND
    = [19,14,18,15,17]

H5(key)
= [2,28,18,0,7]
= [K,g-a,A-B,0,g+K]

subtract key -> FOUND

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

The decisive new point is the **receiver selection before plaintext**. The exact five-rune H shell `[A,p-1,B,K*a,a-g]` occurs once across every contiguous five-rune window on unknown LP2, at the same p35 packet independently selected by `THEIR RISE` and the unique mutual p50-low pair. Signed word35 then supplies `FOUND`; the resulting fixed key has one authenticated five-rune hit manuscript-wide.

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

## 3. The selected p35 packet is a manuscript-unique DH-state object and decrypts to FOUND

The already selected adjacent receiver can be treated as one five-rune packet without changing either printed word:

```text
C = [19,17,19,24,11]
    [ two ] [ three ]
```

Use the same outside-in H family already active elsewhere in the route, now on five runes:

```text
H5([x0,x1,x2,x3,x4])
=
[x0-x4, x1-x3, x2, x1+x3, x0+x4] mod29.
```

The untouched p35 ciphertext gives:

```text
H5(C)
= [8,22,19,12,1]
= [A,p-1,B,K*a,a-g].
```

Every coordinate is fixed by the independently reconstructed authenticated DH state. This shell was recognized after the p35 receiver was already selected, so it is a state-compression observation rather than the original page selector. Its **manuscript-wide specificity**, however, can be charged without using `FOUND`:

- among all **123** adjacent printed `2+3` packets, one hit: p35 offsets25..29;
- among all **271** adjacent two-word packets totaling five runes, one hit: the same p35 packet;
- among all **12,736** contiguous five-rune windows on physical p0..p55 excluding rune-free p50, one hit: the same p35 packet.

This makes the raw receiver independently identifiable from ciphertext plus authenticated state before a plaintext word is inserted.

Authenticated signed word35 is `FOUND`:

```text
FOUND = [0,3,1,9,23].

H5(FOUND)
= [6,23,1,12,23]
= [a,p,a-g,K*a,p].
```

Subtracting the source-assigned target from the uniquely selected packet gives the exact reversible key:

```text
cipher [19,17,19,24,11]
FOUND  [ 0, 3, 1, 9,23]
-------------------------
key    [19,14,18,15,17] mod29
```

and therefore:

```text
[19,17,19,24,11]
-
[19,14,18,15,17]
=
[0,3,1,9,23]
=
FOUND.
```

The key itself has a compact H5 state form:

```text
H5(key)
= [2,28,18,0,7]
= [K,g-a,A-B,0,g+K].
```

In direct coordinates one convenient description is:

```text
[B,-b,A-B,b,b+K].
```

The middle value `18` is **role-ambiguous** inside the authenticated state:

```text
p-g = A-B = q-b = 18 mod29.
```

That ambiguity is numerical only. Charge the whole retrospective grammar

```text
[x,-y,u-v,y,y+K]
```

with `x,y,u,v` independently drawn from the nine state fields `{p,g,a,b,A,B,K,e,q}`. This gives **6,561 labeled tuples** and **2,349 distinct numeric keys**. On the fixed p35 receiver, across all eight distinct authenticated five-rune source targets and both signs, there are three labeled hits:

```text
[B,-b,q-b,b,b+K]
[B,-b,A-B,b,b+K]
[B,-b,p-g,b,b+K]
```

All three are the **same numeric key** `[19,14,18,15,17]`, use subtraction, and yield only `FOUND`. Thus the role label for the middle coordinate is unresolved, while the actual decoder is unique in this charged family.

Hold that exact key fixed across every one of the **12,736** unknown five-rune windows, all eight authenticated five-rune targets, and both additive signs:

```text
12,736 * 8 * 2 = 203,776 configurations.
```

Exactly one hit remains:

```text
p35 offsets25..29
subtract [19,14,18,15,17]
-> FOUND.
```

The earlier split view is compatible with the same state packet:

```text
H([19,17])          = [K,g+K]
H_outer([19,24,11]) = [A,a-g,-g].
```

The five-rune H5 census is the stronger receiver control because it charges the complete contiguous packet against the whole unknown manuscript.

## 4. The frozen direction graph resolves ROAD versus PATHS

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

## 5. The first step lands on literal DH

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

## 6. P23 ROAD hides THE ONE RISE

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

## What changes

The p35 route now crosses the threshold from navigation-only evidence to a **strong local plaintext candidate**:

```text
THEIR RISE
 -> p35
 -> unique raw H5 state packet
 -> signed word35 FOUND
 -> exact state-family key
 -> FOUND
 -> unique FOUND/ROAD mutual pointer
 -> source direction walk to ROAD/p23.
```

The target and physical page come from the authenticated source, and the five-rune receiver is uniquely selected by its raw state shell before `FOUND` is consumed. The compact key grammar was still recognized after target assignment, so this does not yet establish a reusable universal cipher schedule. The middle key-coordinate label is also algebraically ambiguous even though the numeric key is not.

This strengthens the same-index/source-number program with a new receiver type: p35 `FOUND` spans **two adjacent printed words**, unlike the complete-word receivers used for p6 `SEEKS`, p33 `WILL`, p34 `BE`, p36 `GOOD`, p38 `BEWARE`, and p40 `PATHS`. A future rule that predicts this key grammar on a fresh independently selected packet would justify stronger mechanism promotion.

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
