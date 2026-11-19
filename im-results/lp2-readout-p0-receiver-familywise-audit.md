# Familywise READOUT / READ OUT receiver audit: both segmentations select p0's two matched windows

**Agent33, Director #1706, 19 November 2026. Classification: familywise-positive receiver selection. This result strengthens the instruction-to-receiver step while leaving the p50 numeric output semantics inferential and recovering no plaintext.**

## Decision

The `READOUT` candidate has a stronger pre-DH consequence than the earlier split-only report recorded.

Using the already promoted **whole-word GP0 → zero-based p50 address** primitive, conventional base60 entry state, and only the source-visible geometry of the p28 object that generated the candidate instruction:

- physical p28 line6 is **23 runes** long with exact center **F**;
- whole `READOUT` has GP0 **75**;
- lexical `READ | OUT` has GP0 **55 | 20**.

The original p50 table gives:

```text
READOUT 75 -> p50[75] = 2v -> base60 177
READ    55 -> p50[55] = 1K -> base60  80
OUT     20 -> p50[20] = 1g -> base60 102
```

On original p0:

- offset **177** is F and is the exact center of whole-word-bounded **166..188**, length23;
- offsets **80..102** are the exact closed boundaries of whole-word-bounded **80..102**, length23, whose center91 is also F.

Those are exactly the **two** p0 intervals having all three source-visible properties: 23 runes, whole-word boundaries and exact center F.

Thus the two natural segmentations select the two p0 matched receivers under one shared numeric convention:

```text
READOUT  -> center177 -> p0 166..188
READ OUT -> 80..102   -> p0 80..102
```

No DH labels, p0 word residues, H-shell state values or English scoring are used to obtain this result.

## Frozen receiver family

The upstream address operation already fixes **zero-based p50 cell addressing**. Reopening one-based p50 addresses would discard established evidence, so the origin ambiguity charged here is the genuine downstream one: whether a decoded numeric value is a zero- or one-based rune offset on a receiver page.

The family was frozen before p0 state scoring:

- segmentation: whole `READOUT` versus lexical `READ | OUT`;
- p50 output type: conventional base60, drop-`f` base59, or literal printed token;
- receiver offset origin: zero or one;
- split endpoint order: source order or reverse;
- split endpoint inclusion: all four closed/open half-endpoint combinations;
- receiver page: every one of the 55 rune-bearing physical p0..p55 pages.

A literal printed token becomes a numeric rune receiver only if the token itself is decimal. The actual tokens `2v / 1K / 1g` are not decimal, so the literal branch makes no numeric receiver here. No extra token codec is introduced.

The whole-word branch supplies one numeric point. Its pre-DH quality test is whether that point is the center of a source-matched 23-rune center-F whole-word interval. This evaluates a point as a landmark; it does not invent a second table output.

The split branch supplies two numeric endpoints and is tested against the same matched interval family.

## Original manuscript census before DH

Across all original p0..p55 rune-bearing pages there are **23** whole-word-bounded, 23-rune, exact-center-F intervals.

Under the actual p50 tokens:

- whole `READOUT` has exactly one matched-center hit, **p0 166..188**, and only under **base60 + zero-based receiver offset**;
- split `READ | OUT` has exactly one unique matched interval, **p0 80..102**, again only under **base60 + zero-based receiver offset + closed endpoints**;
- source/reverse endpoint order are the same physical closed interval and are both charged;
- base59, one-based receiver offsets and literal-token output produce no matched receiver.

The two segmentation branches therefore agree on the same page and same numeric state while selecting distinct matched windows.

This also charges the fact that p0 was already a favored page: every eligible physical page participates in the census.

## Exact token-multiset familywise null

The three source addresses 75, 55 and20 are distinct. Randomize the exact 256-token p50 multiset over those addresses without replacement. The exact sample space has

```text
256 × 255 × 254 = 16,581,120
```

ordered assignments.

For every assignment, re-run every charged output mode, receiver origin, split endpoint order and inclusion convention over all 55 receiver pages.

### Joint result, requiring distinct matched windows on the same page

If both branches must use one shared output mode and receiver origin:

```text
452 / 16,581,120 = 0.0000272599197
```

If the two branches are generously allowed to choose their output mode and receiver origin independently:

```text
1,242 / 16,581,120 = 0.0000749044697
```

### Broader control, allowing both branches to hit the same matched window

If the joint event merely requires both segmentations to hit some matched window on the same page:

```text
shared semantics:      1,030 / 16,581,120 = 0.0000621188436
independent semantics: 3,122 / 16,581,120 = 0.000188286437
```

This is an exact token-multiset family control, not a discovery-wide probability of authorship.

The split branch by itself is much weaker once its family is charged: 594 of65,280 ordered two-token assignments produce some matched interval somewhere under some admitted split semantics. The material advance is the joint whole/split prediction into the same page.

## Post-freeze DH/state reveal

Only after the receiver family above is frozen do the p0 fields get opened.

The previously studied split receiver80..102 has printed-word lengths

```text
[3,7,5,8]
```

and GP0 residues

```text
[19,20,5,23].
```

Its frozen wordwise H-shell stream contains all seven reconstructed DH23 state values, as independently reported by Agent39. That structural packet was not used in the receiver audit and remains subject to Director #1707's separate extraction-family calibration.

The newly selected whole-`READOUT` sibling166..188 is a genuine blind control for the same consumers. Its word lengths and GP0 residues are

```text
lengths  [7,3,1,6,6]
residues [14,21,28,14,22].
```

Its wordwise H-shell stream is missing DH values `p=23`, `g=5` and `a=6`; applying the already selected whole-block H→cube operation gives

```text
UCFIAUDIAEOYCTTTHDWEALILWEOEF
```

rather than coherent plaintext. This is a useful stop condition. The sibling receiver strengthens the **selection grammar**, while the current DH-state interpretation remains specific to the split receiver.

Do not tune a second cipher on166..188 absent a new source-visible instruction.

## Consequence for the current frontier

Director #1706 takes the positive fork: the full charged receiver family leaves the actual joint p0 selection exceptional before any DH scoring.

This resolves the narrow postselection objection that p0 80..102 arose only because the split, radix, offset origin, endpoint convention and page were chosen after inspecting DH structure. It does not by itself authenticate a creator rule saying that a p50 base60 number must be read as an LP2 rune offset. Closed #1686 still found no reusable solved-text numeric output grammar, and the Critic's semantic-boundary warning remains relevant.

The strongest supported formulation is therefore:

**READOUT / READ OUT has a familywise-exceptional, internally coherent p0 receiver geometry under conventional base60 zero-based rune offsets; both segmentations select the two p0 23-rune center-F whole-word windows.**

The next causal problem remains the value-changing operation on original ciphertext, not further receiver mining.

## Reproduction

- SFT: `sims/lp2_readout_p0_receiver_familywise_audit_sft.cjs`
- Director task: #1706
- Windows/Node 22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44429176150
