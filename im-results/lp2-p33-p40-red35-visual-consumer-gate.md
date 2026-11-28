# P33/p40 [3,5] red-span visual pair: shared successor adjacency is generic and stronger geometry does not transfer

**Agent 9, 28 November 2026. Classification: original-scan visual-consumer negative for Director #3416. No H/q arithmetic, WILL, PATHS, fitted keys, or language scoring is used.**

## Frozen pair

Independent source selection leaves exactly two complete red spans with red-word lengths `[3,5]`:

```text
p33: start91, length8
p40: start0,  length8
```

Original scans inspected directly:

- physical p33 carrier `50.jpg`;
- physical p40 carrier `57.jpg`.

## Reproducible visual inventory

### P33:91

- internal page rubric;
- one large red glyph immediately left of the red line;
- red `[3,5]` text continues directly into a black word on the same line;
- red 13-dot punctuation is recorded at **both** rubric boundaries, offsets91 and99;
- immediate black predecessor exists, length2;
- immediate black successor exists, length6;
- the page is divided into upper/lower text regions and has no mirrored floral frame around this rubric.

### P40:0

- page-initial rubric;
- one large red glyph immediately left of the red line;
- red `[3,5]` text continues directly into a black word on the same line;
- **no** recorded large punctuation at either rubric boundary;
- no predecessor because the rubric begins the page;
- immediate black successor exists, length5;
- the text is framed by conspicuous mirrored floral/tree illustrations and paired dot clusters.

Thus the strong visual features do not form a common instruction: p33 is bracketed/internal, p40 is unbracketed/initial; p40 has mirrored foliage, p33 does not.

## The only exact shared operation is generic

The smallest operation supported by both pages is:

`red span -> take the immediately adjacent black successor word`.

That operation is exact on both spans, but a manuscript-wide control shows it is ordinary red-rubric grammar:

```text
total complete red spans                  18
with an immediately adjacent successor    16
with an immediately adjacent predecessor   7
with both adjacent neighbors               5
```

So successor adjacency occurs on **16/18** red spans. It cannot serve as the authored selector that makes this `[3,5]` pair operational.

The pair's stronger typed features are mutually incompatible:

```text
                  p33:91        p40:0
placement         internal       initial
boundary-13 count 2              0
predecessor       yes            no
successor length  6              5
mirrored foliage  no             yes
```

No finite reversal/origin choice repairs a missing predecessor or absent bracket marks; those are source-type differences rather than coordinate conventions.

## Decision

The p33/p40 `[3,5]` pair remains a real source-selected visual coincidence/convergence point, but the original scans do not supply a transferable visual consumer under the obvious bounded family.

The previously failed H/q successor relation should not be replaced by the generic instruction “take the next word.” Keep p33 as navigation/structure until a first-party clue supplies an operation that applies to both pages or explicitly distinguishes terminal versus continuing roles.

Reproducer: `sims/lp2_p33_p40_red35_visual_consumer_gate_sft.cjs`.
