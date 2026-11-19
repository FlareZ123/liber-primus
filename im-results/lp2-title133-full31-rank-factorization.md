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

## Pre-existing title133 event-class control

The earlier source audit had already frozen three natural 31-of-256 predicates before this factorization was opened:

| class | visible predicate | marks |
| --- | --- | ---: |
| A | all physical thirteen-dot marks | 31 |
| B | red large marks with prime dot count | 30×13 + 1×23 |
| C | original chapter/section marks | 28×13 + 3×10 |

All three combine with the same 225 red runes, all have 31 selected marks among 256 events, and all therefore have the same **133-bit fixed-weight capacity**. That prior audit correctly showed that title133 alone does not choose A.

Open the three already-frozen objects under the same zero-based forward lex rank:

```text
A = 6823208894503251143167281798760439560912
B = 6823208895688569449655323105851024294370
C = 6823208894503251143167281798739371324543
```

Now apply only the leading source labels discovered in A's held-out factorization:

```text
2^q × 43 = 2^4 × 43 = 688
```

where `q=4` is independently fixed by the p32 EMPTY relation and `43` is the authenticated signed-2016 word count.

The result is decisive across this pre-existing three-way control:

| class | divisible by 688 | complete held-out factor signature |
| --- | --- | --- |
| **A** | **yes** | **yes** |
| B | no | no |
| C | no | no |

Thus the new factorization supplies a downstream discriminator that the original title lacked. It reselects **A, the all-thirteen-dot tape**, before consulting the later 13/32/79 factor-bit labels.

This is strong structural evidence, while its chronology must remain explicit: the `2^4 × 43` prefix was recognized after class A's full rank was factored. The B/C comparison is a genuine pre-existing matched control, but this is corroboration rather than a blind discovery probability.

## Internal p33 consumer resolves the full-factor fork

The full-rank 79-bit factor is:

```text
571505208178548184347727
```

Mechanical Tor-v2 formatting gives `pecvyau2ayqym5cp.onion`, but a later independent p33 route now supplies a direct manuscript-internal consumer for the same factor.

The three large full-rank factors have low bytes:

```text
q13 mod256 = 187
q32 mod256 = 203
q79 mod256 = 79
```

The independently selected p33 section grammar has visible markers `M` and `NG`, body lengths81 and115, `prime(M)=71`, `prime(NG)=79`, title length `A=8`, and route parameter `q=4`.

The factor packet closes exactly:

```text
q13 mod256 = 187
  -> p50[187] = 81 = p33 body1
  <- p50^q(prime(M)=71)

q79 mod256 = 79 = prime(NG)
  -> p50^A(79) = 115 = p33 body2
  -> p50^q(115) = 203 = q32 mod256
```

Among the four non-power factors, q79 alone has a low byte equal to either p33 marker prime, and q13 alone points in one p50 step to either p33 body length. The p33 layout and its A/q depths were discovered on a separate branch before this factor consumer was tested.

This changes the preferred interpretation of the full q79 factor. **Treat it as an internal state selector, not a Tor destination.** The `pecvyau2ayqym5cp.onion` rendering is retained only as a syntactic curiosity and should not drive further research absent independent historical evidence.

The older red-only `nz77w2upkfkyj4rh.onion` candidate comes from a different reduced object and is not authenticated by this result. It remains candidate-level pending a source-selected receiver or historical occurrence.

See `im-results/lp2-title133-fullrank-p33-factor-consumer.md` and `sims/lp2_title133_fullrank_p33_factor_consumer_sft.cjs`; Windows run **44451743323** passes.

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

Windows Node22 workflow **44451153262** passes the full tape, rank, exact integer factorization, factor bit lengths, signed-message word count, all three pre-existing title133 event-class controls, canonical rank variants, and Tor-v2 formatting.
