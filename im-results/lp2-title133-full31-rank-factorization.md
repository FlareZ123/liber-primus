# Title133 full 31-of-256 rank factorization

**Agent1, 19 November 2026. Classification: held-out source-route checksum and destination fork. This strengthens the fixed-weight route while leaving Tor-v2 interpretation unauthenticated.**

## Why this object is independently selected

The original 2014 LP2 delivery wrapper contains literal `<title>133</title>`. The natural type-consistent thirteen-dot event tape contains exactly:

- 225 red runes;
- 30 red thirteen-dot marks;
- 1 black thirteen-dot mark;
- 256 events total;
- 31 thirteen-dot marks.

Therefore the complete fixed-weight state has `C(256,31)` possibilities and

```text
bit_length(C(256,31)-1) = 133.
```

This full object is fixed by the original title before the later p55/p27 red-only reduction is applied.

The canonical rank convention had already been narrowed elsewhere: zero-based forward lexicographic rank is the only canonical forward/reverse lex/colex, zero/one-based convention that preserves the route-labelled reduced-rank factorization. This report opens the **full** 31-of-256 object under that frozen convention.

## Exact full rank

The 31 mark positions in the source-exact 256-event tape are:

```text
13,14,31,32,36,37,49,50,51,66,79,80,90,102,103,120,121,
141,142,153,154,163,164,168,169,229,239,240,246,247,255
```

Its zero-based forward lexicographic rank is:

```text
6823208894503251143167281798760439560912
```

The rank itself is exactly **133 bits**, matching the title-selected state width.

Its exact integer factorization is:

```text
Rfull
= 2^4
  * 43
  * 5051
  * 3435600587
  * 571505208178548184347727
```

The four non-power-of-two factors pass the fixed strong probable-prime guard in the reproducer. Their source-facing labels are unusually compact:

| factor/property | value | source-selected label |
| --- | ---: | --- |
| exponent of 2 | **4** | `q = GP0(EMPTY)/p = 92/23` from the p32 path |
| exact factor | **43** | number of authenticated words in the signed 2016 message |
| factor bit length | **13** | the literal thirteen-dot event type |
| factor bit length | **32** | independently selected physical p32 receiver |
| factor bit length | **79** | independently selected start of the p27 DIVINITY carrier |

Thus the full state has the concise route signature:

```text
Rfull = 2^q * 43 * q13 * q32 * q79
```

where `bitlen(q13,q32,q79) = (13,32,79)`.

This signature was **not** used to choose the event positions or rank convention. It was opened only after title133 and the fixed-weight convention existed.

## Canonical convention control

Apply all eight canonical rank symmetries to the same full 31-of-256 object:

- forward/reverse lexicographic;
- forward/reverse colexicographic;
- zero/one-based.

Only **zero-based forward lexicographic rank** has the exact factorization above. The other seven fail the complete held-out signature.

This is stronger than merely observing that every convention yields a 133-bit-ish integer.

## Natural type control

A natural same-cardinality rival preserves the 31-of-256 count by replacing the lone black thirteen-dot mark with the lone red 23-dot mark.

That mixed-punctuation tape still has:

```text
31 marks among 256 events
bit length = 133
```

but its frozen rank is:

```text
6823208895688569449655323105851024294370
```

and it is **not even divisible by `2^4 * 43`**. The compact source signature therefore depends on the type-consistent all-thirteen-dot object rather than only on matching the raw title width.

## Destination fork

The 79-bit full-rank factor is:

```text
571505208178548184347727
```

If formatted mechanically as a Tor-v2 80-bit identifier, it gives:

```text
pecvyau2ayqym5cp.onion
```

This is a **representation candidate only**. Tor-v2 base32 formatting supplies no checksum, and no historical occurrence or p56 page-hash match authenticates this host.

The existing red-only route instead yields:

```text
nz77w2upkfkyj4rh.onion
```

from the 79-bit residual of the reduced 30-of-255 rank.

Do not generate more addresses. The two candidates answer different source objects:

1. **full 31-of-256**: directly selected by title133 and now carrying a compact route checksum;
2. **red-only 30-of-255**: selected later by the p55/p27 `DJU/BEI` prime-sum gap30 and carrying the p27-local factor labels.

The presently stronger interpretation is that the full rank is a **route/state checksum** which independently confirms the values `q=4`, signed-source count43, event type13, p32, and p27-start79. The red-only rank remains the more causally selected destination candidate because the source supplies an explicit reduction from 31 marks to the 30 red marks before its factorization is consumed.

A destination upgrade requires a source-selected receiver or historical occurrence that discriminates these two 79-bit factors. The existence of two syntactically valid Tor-v2 labels is itself evidence against treating base32 formatting as proof.

## Relation to the new p32 SURFACE closure

The p32 route now reaches:

```text
INSTAR TUNNELING TO THE [SURFACE]
```

and its literal out-of-square continuation closes through p50 state77 back onto p32. Separately, clear `SURFACE` selects the historical wrapper through the existing candidate bridge `GP0(SURFACE)=67 -> 67th prime=331 -> <div id="331">`, exposing title133.

The combined causal route is therefore:

```text
p32 SURFACE
 -> original wrapper331
 -> title133
 -> full 31-of-256 fixed-weight state
 -> held-out factor signature [4,43,13,32,79]
```

The prime-lift `67 -> 331` remains inferred, so the combined route stays candidate-level.

## Reproduction

```text
node sims/lp2_title133_full31_rank_factor_sft.cjs
```

Windows Node22 workflow **44450793500** passes the full tape, rank, exact integer factorization, factor bit lengths, signed-message word count, canonical rank variants, mixed-type control, and Tor-v2 formatting.
