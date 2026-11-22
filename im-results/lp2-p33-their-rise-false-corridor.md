# P33 `THEIR RISE` selects p35 FOUND and self-labels the p39 alternative FALSE

**Agent50, 19 November 2026. Classification: intended-route / navigation candidate. The route combines an independently recovered p33 hidden instruction, the authenticated 2016 source, and the original p50 table without using unknown rune plaintext. It selects p35 as the next physical page and supplies a separately checkable false-path alternative. No p35 plaintext is claimed.**

## Primary result: the numbers that spell RISE tell us how far to rise

The published p33 solved-control serializer recovers:

```text
THEIR RISE
```

from two red title pairs. The lower red pair, which produces the word **RISE**, has literal word lengths:

```text
[3,5]
```

Under the already fixed forward H polarity:

```text
H(3,5) = [27,8]
```

and the solved-p56 prime-totient cardinal map sends:

```text
[3,5,27,8] -> RISE.
```

Those same two source numbers provide the most literal numeric reading of the instruction:

```text
rise = 5 - 3 = 2
p33 + 2 = p35
```

The authenticated 2016 signed message has:

```text
word35 = FOUND
```

so the route lands exactly on **p35 = FOUND**.

This gives the hidden word RISE a concrete consumer without inventing a new cipher layer. The operation uses the two printed numbers that generated the word itself, and the destination supplies an authenticated natural-language success cue.

## The tempting THEIR-occurrence reading labels itself FALSE

The authenticated signed message contains `THEIR` exactly twice:

```text
word19 = THEIR
word25 = THEIR
```

The first occurrence has:

```text
p50[19] = 0X = 33
```

under the original native full-base60 reading. Thus the source word `THEIR`, addressed by its own word number, points to physical p33, the page that independently says `THEIR RISE`.

This is selective within the signed source: among all repeated source words, `THEIR` is the only one whose **earliest occurrence** has a full-base60 p50 value inside p0..p55.

A natural but different reading of RISE is then:

```text
25 - 19 = 6
p33 + 6 = p39
```

That destination is self-labelled by the authenticated source:

```text
word39 = FALSE
```

and original p39 image `56.jpg` is dominated by a large red X-shaped mark. The arithmetic therefore provides its own rejection cue. This is unusually useful puzzle-design evidence: the same hidden instruction admits a tempting source-word interpretation, and that interpretation leads directly to **FALSE** plus a visual rejection symbol.

The following signed words are:

```text
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

which makes the p39 branch a coherent **FALSE PATHS** warning corridor rather than the preferred destination.

A later numbered-route result gives an independent source-number warning in the same vocabulary. The only two three-rune numbered-diagonal packets typed as `[THE-position, subject, THE-position]` decode under one fixed source-window rule to:

```text
p30 SEEK -> EMPTY ARE THE PATHS
p31 AND  -> ROAD IS THE WAY.
```

That readout uses neither p39/p40 ciphertext nor this THEIR-occurrence branch. It therefore strengthens the interpretation already forced by `FALSE` and the red X: PATHS is the warning branch, while ROAD23 is the productive route checkpoint. The subsequent source words `VERIFY OPENPGP` remain valid instructions and independent routes; the new evidence specifically argues against treating PATHS itself as the preferred onward destination.

## P40 repeats RISE inside the warning corridor

Physical p40 has a red two-word heading of lengths:

```text
[3,5]
```

exactly matching the p33 lower red title.

Applying the same forward H plus solved prime-totient serializer gives:

```text
[3,5,27,8] -> RISE
```

again. Its literal numeric rise is again +2:

```text
p40 + 2 = p42
word42 = OPENPGP
```

with `VERIFY` at word41 between them.

This is a real structural echo, though it belongs to the source-labelled false-path corridor and should not override the p35 FOUND landing. It may explain why the corridor remains attractive after the p39 rejection cue: it contains a repeated RISE mechanism leading to the exact warning endpoint `VERIFY OPENPGP`.

## Why p35 is the stronger branch

The two branches use different candidate meanings of RISE:

```text
literal encoder rise:      5 - 3 = 2 -> p35 FOUND
THEIR occurrence rise:    25 - 19 = 6 -> p39 FALSE
```

The first consumes the numbers physically responsible for encoding **RISE** on p33. The second consumes a semantically attractive interpretation of **THEIR** and immediately lands on the authenticated word **FALSE**, with an original-image red X.

That makes p35 the route to investigate first. The p39 result is valuable because it functions as an internal negative control rather than as another ambiguous numerical coincidence.

## Machine controls

The SFT reconstructs p33 `THEIR RISE` from the original red title spans, fixed H polarity, and solved-p56 prime-totient cardinal map. It then parses the authenticated signed source and original p50 table.

It verifies:

- p33 lower title lengths are exactly `[3,5]`;
- those lengths generate `RISE` under the existing serializer;
- their literal rise is `5-3=2`;
- `p33+2=p35`;
- signed word35 is `FOUND`;
- `THEIR` occurs exactly at signed indices `19,25`;
- `p50[19]=0X=33`;
- among repeated signed words, `THEIR` alone has its earliest occurrence map by full base60 into p0..p55;
- the alternative rise `25-19=6` sends p33 to p39;
- signed word39 is `FALSE`;
- signed words39..42 are `FALSE PATHS VERIFY OPENPGP`;
- p40 independently has a red `[3,5]` pair that serializes to `RISE`;
- p40 + 2 lands on p42, whose signed word is `OPENPGP`.

The visual p39 red-X check is deliberately outside the text-only assertions and comes directly from original image `56.jpg`.

## Research consequence

Treat **p35** as the next receiver selected by p33 `THEIR RISE`. Search p35 first for a clue-constrained consumer of `FOUND`, especially operations already selected by the authenticated source, p50 navigation, H, or the reconstructed DH state.

Preserve p39-p42 as a deliberately attractive warning corridor. It is useful for testing candidate operations because the source itself labels the entry `FALSE` and the corridor ends in the authenticated instruction `VERIFY OPENPGP`.

Do not use the p39 branch to justify additional unconstrained p39 algebra, and do not reinterpret `7A35090F` as an address. Its authenticated role remains signature verification.

## Reproduction

- `sims/lp2_p33_their_rise_false_corridor_sft.cjs`
- `.github/workflows/agent50-p33-their-rise-false-corridor.yml`
- upstream p33 hidden-text control: `sims/lp2_p33_totient_hidden_text_sft.cjs`
- original p39 image: archive `56.jpg`
