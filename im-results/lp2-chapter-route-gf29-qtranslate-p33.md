# Conditional p3-field q-translation from the chapter SUM/PRODUCT route reaches the source-marked p33:91 rubric

**Agent8 + Agent13 pointer audit, 28 November 2026. Classification: exact conditional algebraic continuation with a prospective marked receiver, but the terminal OUT=3 → physical p3 bridge is not source-selected. No unknown LP2 plaintext, authenticated cipher opcode, or body key is recovered.**

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

A new source-only pointer audit closes the missing navigation bridge **negatively**. Under the route's own grammar, every nonterminal `OUT` addresses the unique chapter whose `IN` equals it; that rule gives the four hops `23→p8, 2→p27, 19→p54, 27→p40` and then stops because no chapter has `IN=3`. Uniform physical-page semantics matches **0/4** earlier hops. In particular, values **23** and **27** are themselves valid red chapter page numbers, yet the established route deliberately sends them to p8 and p40 through IN matching rather than to physical p23 or p27.

A two-tier fallback such as “use IN matching when possible, otherwise reinterpret the value as a page” is therefore an extra opcode, not a continuation of the established address type. It is also non-identifiable within the natural family named in #3421: terminal `3` can mean stop, physical p3, zero-based chapter ordinal p15, one-based chapter ordinal p8, state value `e`, or current-page word index3. The three page-valued alternatives p3/p15/p8 are all red-marked chapter pages, so merely landing on a visually marked page does not select physical-page semantics. Across the full nine-node graph there are five dead ends, all with valid physical-page-valued OUTs: `p3→11, p15→13, p23→16, p33→3, p40→3`. Thus p40's fallback is not a graph-unique exception; p33 would also fallback to p3 under the same rule.

Accordingly, the route itself terminates at p40. The field calculation below remains mathematically exact **conditional on adding the unlicensed physical-page fallback**. If that extra rule is assumed, physical **p3** independently contains the marked red triad `[13,23,2]`, already established in the repository as the primitive `GF(29^2)` polynomial. Normalizing it gives

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

## Full nine-chapter translation-family charge

The equal-discriminant tail is not one favorable pair chosen from many. Across all nine chapter-opening quadratics the discriminants are:

```text
p0:17  p3:8  p8:28  p15:26  p23:10  p27:15  p33:13  p40:21  p54:21
```

Thus **p40/p54 is the only equal-discriminant pair**. Exhaust every ordered chapter pair and every base-field pure translation `x -> x+c`, `c in GF(29)`, requiring the complete unordered root set to map exactly. There are only two edges, the two orientations of this same pair:

```text
p40 (27,3) -> p54 (19,27) by c=25=-q; repeat -> (11,25); red hits: 0
p54 (19,27) -> p40 (27,3) by c= 4= q; repeat -> ( 6,11); red hits: p33:91 only
```

So `q=4` is not selected after the fact: it is the **unique orientation-preserving translation constant forced by the route's p54->p40 coefficient pair**. The reverse orientation is charged symmetrically and fails to produce any marked receiver. The next `+q` step reaches the sole marked `(6,11)` word, while one further `+q` has no red receiver.

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
## Downstream continuation reaches a pre-existing BE plaintext candidate

The marked receiver is exactly p33's **lower red heading**. Independent work predating this route already serializes the two p33 red headings as `THEIR RISE` from their visible word lengths, with the lower `[3,5]` heading spelling **RISE**. That same work fixed the corresponding black-body counts:

```text
upper: 5 lines, 21 words,  81 runes
lower: 6 lines, 28 words, 115 runes
RISE = lower - upper -> [1,7,34]
signed indices 1,7 -> THE,THE
signed index 34     -> BE
```

The rune-scale rise therefore selects **physical p34 and authenticated target BE before p34 ciphertext is consumed**. A separate, already-published source-derived two-rune rule uses the same authored `THEIR RISE` +6 operation, `34 BE -> 40 PATHS`, to derive `H(key)=[19,0]`, `key=[24,5]`, and exact p34 ciphertext `[12,23]`. P34 offsets4..5 alone match that prediction and subtract exactly to **BE**. The complete two-rune +6 family later produced a genuine held-out p28 **THE** hit, so this p34 rule is not supported only by its discovery target.

```text
p0 -> p8 -> p27 -> p54 -> p40
                         |
                         + terminal e=3 -> physical p3 marked GF(29^2)
                           unique equal-D tail p54 -> p40 is +q
                           repeat +q -> (6,11)
                           sole red receiver -> p33:91 lower heading = RISE
                           body-rune RISE: 115-81 = 34
                           -> signed/physical p34 = BE
                           -> fixed source-derived key
                           -> p34 offsets4..5 decrypt exactly to BE
```

Conditional on the extra p3 fallback, this remains an exact path from original LP2 structure to a **strong local unknown-plaintext candidate** rather than only to another state coincidence. It is **not currently a causal continuation of the chapter route**, because the terminal value `3=e` does not source-select physical p3. The chapter first-black SUM/PRODUCT graph itself also remains unauthenticated. The p33->p34 and p34->BE machinery predates the present route and therefore supplies independent downstream evidence rather than a fitted rescue.

Reproduction composes this report's SFT with the pre-existing `sims/lp2_p33_their_rise_body34_be_handoff_sft.cjs` and `sims/lp2_their_rise_h_rectangle_selector_sft.cjs`.

