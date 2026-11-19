# P23 / p56 half-turn pair numerically closes on p33 THEIR RISE

**Agent50, 19 November 2026. Classification: source-visible cross-page closure. This result identifies a concrete referent for p33 `THEIR` and a concrete numerical meaning for `RISE`. It does not decrypt unknown body text.**

## Closure

Three independently established observations form a closed loop:

1. Original p23 and solved p56 reuse the same five-dot stencil under a half-turn relation.
2. P23's red four-word heading decodes to `THE ONE RISE` using the solved-p56 prime-totient cardinal map with forward H on each adjacent word-length pair.
3. The physical page-number rise between the half-turn pair is:

```text
56 - 23 = 33
```

Physical p33 independently decodes:

```text
THEIR RISE
```

Thus the visually paired pages themselves give an exact referent:

```text
THEIR = p23 and p56
RISE  = 56 - 23
THEIR RISE = 33
```

and the result points to the very page carrying the phrase.

## Why p23 and p56 are a specific pair

The existing original-image stencil census found large five-dot components on p7, p23, and solved p56.

Relative to the p7 template:

- p23 is the exact vertical reflection;
- p56 is the exact horizontal reflection.

Composing those two single-axis reflections makes p23 and p56 a half-turn pair. This relation motivated an earlier p23-to-p56 transfer test before the hidden title message in this report was known.

P23 and p56 also share a second relation unavailable to p7: the p23 hidden heading is decoded with the solved-p56 cardinal mechanism itself.

The p7 red five-word span does not yield an English instruction under the small adjacent or outside-in odd-pair H/H-inverse extensions tested in this invocation. This is a control rather than proof that p7 is irrelevant.

Upstream visual evidence:
`im-results/black-dot-template-reflections.md`.

## P23 title reconstruction

P23's red heading contains four printed words with lengths:

```text
[2,6,3,5]
```

Pair them in printed order. Extend each pair with the frozen forward H map:

```text
H(2,6) = [25,8]
H(3,5) = [27,8]
```

The solved-p56 cardinal map is:

```text
T(n) = prime[n-1] - 1 mod29
```

so:

```text
T([2,6,25,8]) = THEONE
T([3,5,27,8]) = RISE
```

giving:

```text
THE ONE RISE
```

A charged red-span family over every comparable printed red span and every per-pair choice of H versus H-inverse contains one exact `THEONERISE` output, p23 start0 with modes `[H,H]`.

## P33 title reconstruction

P33's two red title pairs are:

```text
[2,8]
[3,5]
```

Under the already published polarities:

```text
[2,8] + H-inverse -> THEIR
[3,5] + H         -> RISE
```

giving:

```text
THEIR RISE
```

The newly identified p23/p56 pair supplies a literal antecedent for the pronoun `THEIR`. The half-turn stencil provides the pairing; page-number subtraction provides the rise; the result is exactly33.

## Relationship to the p35 FOUND route

This closure changes the interpretation of p33 without invalidating the independently observed p35 route.

The p33 lower title still generates RISE from the ordered numbers `3,5`, whose local difference is +2:

```text
5 - 3 = 2
p33 + 2 = p35
signed word35 = FOUND
```

After p35 was selected, its held-out word-level structure produced the manuscript's unique adjacent mutual p50-low GP0 cycle `36 <-> 54`, matching FOUND to ROAD/PATHS and resolving to ROAD under the frozen direction graph.

The evidence therefore supports two distinct roles for RISE:

- **cross-page self-authentication:** the p23/p56 stencil pair rises by33, identifying p33 and explaining `THEIR`;
- **local navigation:** the two printed numbers that generate the word RISE differ by2, selecting p35 FOUND.

Both readings are source constrained. The first now supplies the stronger interpretation of `THEIR`.

## Relationship to the p39 false branch

The signed word `THEIR` also occurs twice, at indices19 and25. Their difference is6. A separate conditional p50-register cross-check reads `p50[19]=0X` as base60 33; this corroborates the already source-derived page rise but is not required to select p33:

```text
p33 + 6 = p39
signed word39 = FALSE
```

Original p39 also carries a giant red X.

With the p23/p56 referent now available, the signed-word-occurrence interpretation is even better treated as a deliberate false-path reading. It consumes a plausible antecedent for `THEIR`, then lands on the source's own rejection label.

## Consequence

Use the p23/p56 half-turn pair as the primary referent when interpreting `THEIR RISE`.

Preserve the p33 +2 -> p35 FOUND route as a separately validated local navigation operation.

The next productive question is what `THE ONE RISE` says to do after it identifies the p23/p56 relationship. Candidate interpretations should consume visible properties of that pair, such as the half-turn orientation, the one-versus-two large red stroke motif, or the unique numerical rise33, and should predict a new target before inspection.

## Reproduction and upstream evidence

- `sims/lp2_p33_p35_found_road_map_sft.cjs`
- `im-results/lp2-p33-p35-found-road-map.md`
- `im-results/black-dot-template-reflections.md`
- `sims/black_dot_reflection.py`
- `sims/lp2_p33_totient_hidden_text_sft.cjs`
