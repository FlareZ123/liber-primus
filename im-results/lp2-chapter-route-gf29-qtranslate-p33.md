# Chapter SUM/PRODUCT route reaches the source-marked p33:91 rubric through a p3-field q-translation

**Agent8, 28 November 2026. Classification: new source-constrained algebraic/navigation handoff with an in-invocation prospective marked receiver. No unknown LP2 plaintext, authenticated cipher opcode, or body key is recovered.**

## Decision

The provisional chapter-opening `SUM -> PRODUCT` route has gained a concrete continuation that was not part of its discovery. The five route operands are not merely `(SUM,PRODUCT)` pairs: their complete `(length,sum,product)` descriptors are

```text
p0  [4,15,23] = [q,b,p]
p8  [3,23, 2] = [e,p,K]
p27 [7, 2,19] = [g+K,K,B]
p54 [8,19,27] = [A,B,-K]
p40 [5,27, 3] = [g,-K,e]
```

Each of those five complete triples occurs **exactly once** among all 2,941 canonical printed groups in the full LP2 transcription including solved p56/p57. This is a stronger source-operand discriminator than the earlier same-page/same-length pair charge, though it was recognized after the route and state were known.

The route terminal `OUT=3=e` has no chapter-IN recipient. Physical **p3** independently contains the marked red triad `[13,23,2]`, already established in the repository as the primitive `GF(29^2)` polynomial. Normalizing it gives

```text
13 + 23u + 2u^2 = 0
u^2 = 3u + 8  (mod 29).
```

Use that already-existing field and treat each route pair `(S,P)=(SUM,PRODUCT)` as the Vieta coefficients of

```text
Q(x) = x^2 - S*x + P.
```

The final two route quadratics have the **same discriminant 21**. Their roots are

```text
p54 (S,P)=(19,27): {(5,3),(14,26)}
p40 (S,P)=(27, 3): {(9,3),(18,26)}
```

in coordinates `a+b*u`. The p40 root set is exactly the p54 root set translated by the source state value `q=4`:

```text
x -> x + q.
```

At coefficient level the forced translation rule is

```text
S' = S + 2q
P' = P + qS + q^2              (mod 29),
```

so `(19,27) -> (27,3)` exactly. Applying the **same already-forced translation once more**, before inspecting a destination, predicts

```text
(27,3) -> (6,11).
```

That pair occurs in only two page-local words on unsolved p0-p55: an ordinary black p23 word at offset200 and **p33 offset91**. The p33 hit is the first word of its second red, 13-dot-bracketed rubric. Across the complete unsolved manuscript there are **50 complete red words**, and **p33:91 is the only red word with `(SUM,PRODUCT)=(6,11)`**. Its full descriptor is `[3,6,11]=[e,a,A^-1]`.

This is a source-marked receiver, not a language-score hit. Its raw runes are

```text
[21,2,12] = [B+K,K,aK],
```

and canonical `H3` gives

```text
H3([21,2,12]) = [9,2,4] = [q+g,K,q].
```

The adjacent second red word is `[10,0,5,22,12]` with descriptor `[5,20,0]`. The complete p33:91 rubric therefore has source-visible word lengths `[3,5]=[e,g]`. Existing independent work had already established that **p33:91 and p40:0 are the only two complete red spans in LP2 with word lengths `[3,5]`**, and that the solved-2014 suffix `9133` uniquely addresses this same internal p33 red span. Those facts predate the present quadratic continuation.

One more predeclared `+q` translation predicts `(14,22)`. It occurs in four ordinary black words and in **zero red words**. The marked continuation therefore stops cleanly at p33 instead of generating an open-ended chain.

## Receiver-side arithmetic closure inside the marked rubric

The p33 hit carries a second, independent layout checksum that was not used to derive the `(6,11)` prediction. Its first red word has descriptor `[3,6,11]=[e,a,A^-1]`; the two visible red-word lengths are already `[3,5]=[e,g]`; and the whole second rubric is 8 runes, `A=8`. Therefore

```text
first word length        = 3  = e
second word length       = 5  = g
first word SUM           = 6  = a
first word PRODUCT       = 11 = A^-1  (mod29)
whole red-span length    = 8  = A
11 * 8 mod29             = 1
```

The SUM also equals the independently counted six physical lines in p33's lower titled unit, already present in the p33 layout-state report. More importantly for a finite control, among **all 50 complete red words on unsolved p0-p55**, p33:91 is the **only** word whose nonzero PRODUCT has a GP29 multiplicative inverse equal to the length of its containing red span. This makes PRODUCT participate in a source-visible relation at the prospectively reached receiver rather than merely in the route that selected it.

Combined with the pre-existing p33 relation `H([21,2])=[19,23]=[B,p]`, this single marked lower heading now exposes `[B,p]` from its first two runes and `[e,g,a,A]` from word lengths/SUM/PRODUCT inverse. The derived `b=e^-1 mod(p-1)=15` and the raw second rune `K=2` close the familiar DH23 state. This is still structural evidence: it does not turn the eight red runes into an authenticated cipher instruction or decrypt either body.

## Exact route-field calculation

For the five route pairs, brute-force roots in the p3 field are:

```text
p0  (15,23) -> {(4,12),(11,17)}     D=17
p8  (23, 2) -> {(3, 0),(20, 0)}     D=28
p27 ( 2,19) -> {(0,20),( 2, 9)}     D=15
p54 (19,27) -> {(5, 3),(14,26)}     D=21
p40 (27, 3) -> {(9, 3),(18,26)}     D=21
```

Exhausting all base-field affine maps `x -> a*x+c`, `a != 0`, between consecutive unordered root sets gives:

```text
p0  -> p8   : none
p8  -> p27  : none
p27 -> p54  : (a,c)=(10,14) or (19,5)
p54 -> p40  : (a,c)=(1,4) or (28,23)
```

The final transition is special because one of the forced maps is the pure translation `(a,c)=(1,q)`. The alternate `(28,23)` is the root-swapping reflection `x -> -x+p`; unordered quadratic roots necessarily admit that second orientation. The earlier p27->p54 affine existence is supporting state algebra, not by itself rare: irrducible quadratics over the same finite field are broadly affine-related. The material result is the exact **equal-discriminant `q` tail and its marked continuation**.

## Why p33:91 matters independently

The destination was not invented for this calculation:

- p33:91 is an origin