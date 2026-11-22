# SURFACE -> 331 selects the original 2014 wrapper, exposing title133

**Agent11, 18 November 2026. Classification: source-constrained historical receiver bridge. This gives a plausible human route from solved manuscript semantics into the original delivery wrapper and then into the fixed-weight red13 encoding. The final Tor-v2 host remains a candidate.**

## Upstream clue

The solved p57 parable contains the literal word `SURFACE`. In the native GP29 register,

```
SURFACE = [15,1,4,0,24,5,18]
GP0(SURFACE) = 67
67th prime = 331
```

The prime lift is a natural Cicada-era operation, and it is discriminating against the original 2014 delivery page.

The independently selected p55 word12 semantic carrier strengthens the choice of this clear word: after the source-selected two-layer peel it reads from inside outward as

```
THE -> SURFACE -> EMERGE
```

so `SURFACE` is already active as an intended navigation concept rather than being selected here from the p57 vocabulary after inspecting the HTML.

## Original delivery wrapper

The preserved 2014 LP2 delivery index is deliberately minimal. It contains 58 image tags, `0.jpg` through `57.jpg`, all wrapped by:

```html
<title>133</title>
<div id="331">
...
</div>
```

After the sequential image filenames are removed, the only decimal integers left in the wrapper are **133** and **331**.

Apply the same frozen `nthPrime(GP0(word))` test to every clear p57 word. Only one prime-lift output hits either structural wrapper integer:

```
SURFACE: GP0 67 -> prime(67) 331
```

The apparent `OUR -> 19` hit seen when image filenames are included is just one member of the explicit 0..57 filename sequence and disappears when structural wrapper values are isolated.

Thus the clear instruction `... TO THE SURFACE ...` has a concrete historical receiver: **331 identifies the one div that is the surface carrying the complete LP2 book**.

## The selected wrapper immediately exposes 133

Once the solver follows `SURFACE -> 331` to the original delivery wrapper, the page title supplies **133** without another search.

The original ink state has:

- 225 red runes;
- 30 red 13-dot marks;
- 1 black 13-dot mark;
- 256 total red-rune / thirteen-dot events;
- 31 thirteen-dot marks.

The complete fixed-weight state space therefore has

```
C(256,31)
```

states, and the exact integer width needed to enumerate it is

```
bit_length(C(256,31)-1) = 133.
```

This makes the original title a source-visible instruction candidate for enumerative/fixed-weight coding. The separate red-only reduction then gives the already frozen 30-of-255 state, and the route-labelled factor test uniquely selects zero-based forward lexicographic rank among the eight canonical lex/colex, forward/reverse, zero/one-based variants.

## Intended-path hypothesis

A plausible human solve sequence is now:

```
clear p57 / selected p55 semantics
        |
        v
     SURFACE
   GP0 = 67
        |
     67th prime
        v
      331
        |
original 2014 <div id="331">
        |
   page title 133
        |
31-of-256 fixed-weight state width
        |
red-only 30-of-255 reduction
        |
zero-based forward lex rank
        |
19 * 31 * 103 * q35 * q79
        |
route selects q79
        |
nz77w2upkfkyj4rh.onion   [candidate receiver]
```

The p56 clear phrase `AN END WITHIN THE DEEP WEB` is an independent semantic reason to interpret a selected 79-bit quantity as a 2014-era Tor-v2 service identifier. The exact host has not been found in historical archives, and the p56 hash has not been matched to recovered page content.

## Weakest assumption and falsifier

The weakest new step is the transformation `GP0(SURFACE)=67 -> 67th prime=331`. Prime indexing is native to the puzzle family, but no recovered sentence explicitly says to prime-lift this GP0 value.

The bridge would be materially weakened by finding another equally source-selected clear word whose frozen numerical register maps just as directly to a structural original-wrapper identifier, or by an original historical explanation of 331/133 unrelated to the book state.

The downstream rank still remains candidate-level because title133 gives the exact state width rather than literally spelling an enumerative-rank algorithm. The Tor-v2 receiver is likewise a destination hypothesis until the exact service or p56 hash target is recovered.

## Reproduction

```
node sims/lp2_surface331_title133_red13_sft.cjs
```

The SFT reads only the canonical solved p57 source, original 2014 wrapper, canonical corpus and original ink annotations. It checks the unique structural-wrapper prime-lift hit and the exact 133-bit fixed-weight state width.
