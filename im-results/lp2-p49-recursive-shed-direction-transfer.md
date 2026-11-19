# P49 matched-control transfer of recursive SHED yields DIRECTION

**Agent49, 19 November 2026. Director #1836. Classification: positive same-operation transfer with a bounded chronology caveat. No unknown plaintext is claimed.**


## Radix reconciliation

**Radix reconciliation (Critic, 19 November):** The original p50 images provide no explicit digit legend or byte serialization (#1890). The authenticated 2013 `THE KEY IS ALL AROUND YOU` clue supplies a source-conditioned discriminator: its complete GP0 value fixes cell252, an outer-ring cell; base60 `30→180` matches both the 180-cell interior and the p56+p57 rune total, while base59 gives177 ([report](../im-results/lp2-2013-all-around-p50-p53-receiver.md)). This makes base60 the leading source-selected interpretation, but not a literal byte legend. Base59-only results below remain conditional and, where they imply DIRECTION/CIRCUMFERENCES/EMERGE, conflict with the leading base60 reading until independently reconciled.
## Decision

The frozen p55 recursive-SHED operation transfers cleanly to its only matched page-level five-core control, p49.

Using the unchanged sequence

1. canonical complete page-local printed words,
2. recursively remove the first and last rune of each word until it vanishes or one center remains,
3. preserve surviving centers in printed word order,
4. sum the centers in GP0,
5. use that sum as the zero-based p50 address,
6. read the p50 token under the conditional drop-`f` **base59** interpretation,

p49 gives:

```text
p49 recursive cores      [20,19,19,14,4]
core transliteration     L M M X R
core count               5 = g
middle core              19 = B
core GP0 sum             76
p50[76]                  1s
base59(1s)               112
GP0(DIRECTION)           112
```

The authenticated 2016 signed source contains the sentence:

```text
Its words are the map, their meaning is the road,
and their numbers are the direction.
```

Under the repository's canonical GP spelling, `DIRECTION = D I R E C T IA N` has indices

```text
[23,10,4,18,5,16,27,9]
```

and GP0 sum **112**. This is inside the finite source-word GP0 register explicitly allowed by Director #1836.

The same-operation transfer is positive within the frozen drop-`f` base59 branch, but that branch is not source-authenticated. The independent 2013 ALL AROUND selector favors base60, under which the p49 token gives114 rather than DIRECTION=112.

## Frozen upstream operation

The operation was fixed upstream by solved p57 wording:

```text
WE MUST SHED OUR OWN CIRCUMFERENCES.
FIND THE DIVINITY WITHIN AND EMERGE.
```

Agent20's p55 result applied that wording literally to complete printed words and obtained:

```text
p55 cores                [1,6,2,11,18]
core count               5 = g
middle                    2 = K
core GP0                  38 = WITHIN
H branch sums             36,36 = GOOD
p50[38]                   2D
base59(2D)                131 = GP0(CIRCUMFERENCES)
```

No key, phase, alphabet permutation, subset choice, reversal, or language score is introduced within the frozen base59 branch. The independent choice of base59 over base60 is not selected by this transfer and is challenged by the 2013 ALL AROUND base60 selector.

## P49 raw object

P49 has **17** complete page-local words. Their lengths are:

```text
[2,3,2,4,6,2,4,3,4,6,3,3,4,6,5,2,6]
```

Repeated circumference shedding removes every even-length word and leaves the center of each odd-length word:

```text
[20,19,19,14,4]
```

The already fixed outside-in H map gives:

```text
H(20,4)  = [16,24]
H(19,14) = [5,4]
middle    = 19

H coordinate sums = [21,28]
```

Only the predeclared direct state relations are recorded: the core count is `g=5` and the middle is `B=19`. The values 21 and 28 are left as raw outputs here. No post-reveal arithmetic is used to label them.

## Same-operation p50 transfer

The decisive operation is exactly the p55 consumer:

```text
core GP0 -> zero-based p50 address -> base59 value
```

For p49:

```text
76 -> p50[76] = 1s -> base59 112
```

The source label was already established independently in the authoritative synthesis:

```text
GP0(DIRECTION) = 112
```

For the original p55 object, the unchanged operation remains:

```text
38 -> p50[38] = 2D -> base59 131 = GP0(CIRCUMFERENCES)
```

So the two page-level five-core objects resolve under the same literal mechanism to two first-party instruction words:

```text
p49 -> DIRECTION
p55 -> CIRCUMFERENCES
```

## Whole-page control

Apply recursive word shedding to every unknown physical page p0-p55, excluding runeless p50.

Exactly two pages have five surviving centers:

```text
p49  [20,19,19,14,4]  GP0 76  -> base59(p50[76])  = 112 DIRECTION
p55  [1,6,2,11,18]    GP0 38  -> base59(p50[38])  = 131 CIRCUMFERENCES
```

Across all pages, **p49 alone** has page-level recursive-core GP0 whose frozen post-SHED base59 output is 112.

This is the cleanest control because p49 was selected before the semantic output by the prior whole-page five-core census.

## Full 16-word-window census

The same parser and operation charge all **2,039** page-local contiguous 16-word windows.

```text
charged windows                         2,039
windows with exactly five cores           116
five-core windows mapping to DIRECTION       8
p49 full signature windows                    2
p55 full conjunction windows                  1
```

The eight five-core DIRECTION windows are:

```text
p12 starts 18,19
p13 starts 44,45
p46 starts 22,23
p49 starts 1,2
```

Each pair shares a core vector because shifting across an edge even-length word leaves the set of surviving odd centers unchanged.

P49's full frozen signature

```text
cores=[20,19,19,14,4], GP0=76, H-sums=[21,28], middle=19
```

occurs only in its two overlapping 16-word windows. P55's prior conjunction remains unique at one window.

The window census therefore prevents an overclaim of universal window uniqueness for the word `DIRECTION`. The **page-level matched-control transfer** is the stronger result.

## Chronology caveat

Director #1836 requested a sealed p49 reveal. The upstream p55 report had already printed p49's raw core vector as part of its whole-page control before this invocation. A genuinely blind claim about the raw vector is therefore impossible.

The operation, target-register classes, p50 address convention, and post-SHED base59 consumer were all fixed independently before this transfer. No prior repository result linked the p49 recursive-core object to `DIRECTION`; a repository commit search for `p49 DIRECTION` returned no earlier result. The supported claim is therefore the unchanged-consumer transfer, with the raw-core secrecy caveat stated explicitly.

## Interpretation

This satisfies the positive criterion in Director #1836. The p55 recursive SHED mechanism now has a second page-level consumer under the same operation and output type.

The result upgrades the mechanism from a p55-local semantic compression to a **reusable page-level five-core SHED grammar candidate**:

```text
complete printed words
 -> recursively SHED circumferences
 -> sum emerged centers
 -> zero-based p50 address
 -> fixed base59 read
 -> authenticated instruction GP0
```

Further promotion should require another independently selected page or object. The eight 16-word DIRECTION windows show that unrestricted window mining would overstate specificity.

No unknown LP2 body plaintext, full inverse cipher, or destination is recovered here.

## Reproduction

```text
node sims/lp2_p49_recursive_shed_direction_transfer_sft.cjs
```

Windows GitHub Actions run:

```text
https://github.com/FlareZ123/liber-primus/actions/runs/44469573663
PASS on windows-latest, Node 22
```

Supporting commits:

```text
716f005744651c33153b4c2ed4a8e805d85340d2  SFT
af1c16d47e44135dd375fe2657217b428d2308c5  Windows workflow
```
