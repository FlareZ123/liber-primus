# Original title133 and route factors select the red13 rank convention

**Agent11, 18 November 2026. Classification: source-motivated convention selector for the existing red13 combinadic candidate. This strengthens the rank operation and orientation; it does not authenticate the Tor-v2 destination.**

## Question

The existing red13 candidate encodes the positions of red 13-dot marks among red runes by a zero-based forward lexicographic fixed-weight rank. Its strongest remaining algorithmic objection was that "combinadic rank" could have been chosen after seeing the data.

Two independent source families now constrain that choice:

1. the original 2014 LP2 delivery wrapper, before any modern analysis; and
2. the later p28/p27 route values 19, 31, 103, 35, and 79.

## Original 2014 delivery wrapper supplies the exact fixed-weight width

The preserved original onion7 index is a minimal page that contains all 58 book images. Its literal HTML title is:

```html
<title>133</title>
```

and its body wrapper is `<div id="331">`. The `331` reversal is preserved as a source fact here without assigning it an operation.

From the original ink inventory, the complete natural 13-dot event tape is exactly:

- **225 red runes** as state 0;
- **31 thirteen-dot marks** as state 1, consisting of 30 red marks and one black mark;
- **256 total events**.

A fixed-weight 31-of-256 state has `C(256,31)` possible arrangements. The integer range needed to enumerate those arrangements has exactly **133 bits**:

```
bit_length(C(256,31)-1) = 133.
```

Thus the otherwise unexplained original title `133` is an independent source-visible match to the exact information width of the complete thirteen-dot positional state. This does not spell the word "rank", but it gives a human solver a concrete reason to treat the 256-event / 31-marker object as a fixed-weight state to be enumerated or compressed rather than as an arbitrary binary keystream.

The type-consistent event class matters. Among the natural large-punctuation classes, "all 13-dot marks" is the clean 31-marker class; substituting the unrelated single red 23-dot mark can also reproduce the same raw count but mixes punctuation types without a source instruction.

## The p55/p27 route fixes the reduced 30-of-255 state

The existing p55 route independently selects the red-only reduction: `GP-prime(BEI)-GP-prime(DJU)=30`, matching the 30 red 13-dot marks, while removing the lone black 13-dot mark leaves 255 red events.

The frozen red-only marker positions are:

```
13,14,31,32,36,37,49,50,65,78,79,89,101,102,119,120,
140,141,152,153,162,163,167,168,228,238,239,245,246,254
```

The existing candidate uses their zero-based forward lexicographic rank:

```
R = 816613232064430740393939040116034006349
  = 19 × 31 × 103 × 25795396177 × 521821166063052627702311.
```

The later p28/p27 route supplies all five labels independently: 19 is DH public `B`; 31 is the center-`I` prime; 103 is the duplicate-`39` gap and p27 DIVINITY-interior GP0; the residual prime bit lengths are 35 and 79, matching the shed p28 interior GP0 and selected p27 DIVINITY-carrier start.

## Canonical rank-convention discriminator

I tested the small canonical symmetry family without adding any language or Tor scoring:

- forward lexicographic rank;
- reversed-event lexicographic rank;
- forward colexicographic/combinadic rank `sum C(position_i,i+1)`;
- reversed-event colexicographic rank;
- zero-based and one-based rank for each.

Only **zero-based forward lexicographic rank** has all three source-selected small factors `19×31×103` and the exact residual product `q35×q79`.

| convention | base | bit length | divisible by 19×31×103 | exact q35×q79 residual |
|---|---:|---:|---:|---:|
| lex forward | 0 | 130 | yes | **yes** |
| lex forward | 1 | 130 | no | no |
| lex reverse | 0/1 | 126 | no | no |
| colex forward | 0/1 | 130 | no | no |
| colex reverse | 0/1 | 128 | no | no |

The forward source order is also the order printed by the original delivery page, which lists the 58 images from `0.jpg` through `57.jpg`.

## What this changes

The red13 rank operation is no longer supported only by an attractive downstream factorization. The original 2014 wrapper independently exposes the exact **133-bit fixed-weight state width** for the complete 31-of-256 object, and the later route labels select one canonical rank convention uniquely after the red-only reduction.

This is still not an authenticated destination. The title does not explicitly name enumerative ranking, and the factor labels were recognized after the frozen candidate rank was known. The correct evidentiary upgrade is **source-motivated and convention-constrained combinadic candidate**, not established solution.

The strongest unresolved step is now the receiver: why the selected 79-bit residual should be interpreted as a Tor-v2 hidden-service identifier, and whether the exact host ever existed. P56's clear "DEEP WEB" language and 2014 Tor-v2 context make that representation historically plausible, while the archival search remains negative.

## Reproduction

Run:

```
node sims/lp2_red13_rank_convention_selector_sft.cjs
```

The reproducer derives the source event tapes, verifies the original `title133`, computes the fixed-weight state width, enumerates the eight canonical rank variants, and confirms the unique convention result above.


## Upstream receiver for title133

The title is no longer an isolated historical number. Clear p57 `SURFACE` has GP0=67, the 67th prime is331, and the original delivery HTML's unique `<div id="331">` wraps all58 book images. Across the clear p57 vocabulary, SURFACE is the only `prime(GP0(word))` hit on the wrapper's structural numbers133/331. The independently selected p55 semantic carrier also exposes SURFACE before the wrapper is inspected.

This supplies a plausible human route into the page where title133 becomes visible. The prime-lift is still an inferred navigation operation, so the rank remains source-motivated rather than authenticated. See `im-results/lp2-surface331-title133-red13-receiver.md`.
