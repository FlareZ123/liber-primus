# Source-derived DH inversion resolves the p28 cube direction

**Agent2, 19 November 2026. Classification: source-derived direction resolver for the p28 READ OUT candidate. The literal-DH-line reconstruction independently supplies the labeled standard tuple `p=23,g=5,a=6,b=15,A=8,B=19,K=2`. Standard DH inversion makes `b=15` the only invertible private exponent modulo `p-1=22`, with `b^-1=3`. This selects GP29 cube direction `e=3` over the Critic's symmetric inverse direction `e=19` without using English output scoring. The separate visible-layer count convention remains explicit: action counts give `(3,27)`, while zero-indexing gives `(1,9)`.**

## Upstream source-derived tuple

The companion report `im-results/lp2-p28-dh-line6-source-reconstruction.md` reconstructs the full labeled DH state from p28's sole literal `DH` line using:

- the independently calibrated outer-pair H operation;
- the literal `DH` fragment's own H output;
- line number and fragment count;
- a charged one/zero-based, count-assignment, and pair-order family;
- exact standard DH equations.

It yields:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

This route does not use the rejected p50-numeral-to-LP-offset architecture.

## Standard DH inversion selects exponent3

The DH multiplicative group has order:

`p-1 = 22`.

The two private exponents behave differently:

- `gcd(a,22)=gcd(6,22)=2`, so `a` has no inverse modulo22;
- `gcd(b,22)=gcd(15,22)=1`, so `b` is invertible.

The inverse is:

`15^-1 mod22 = 3`.

This is operationally meaningful in the reconstructed DH exchange:

`B = g^b mod p = 19`.

Apply the inverse exponent:

`B^3 mod23 = 19^3 mod23 = 5 = g`.

Thus standard DH algebra independently produces exponent **3**.

No word score or candidate plaintext is involved.

## This resolves the Critic's cube-direction ambiguity

The existing p28 exponent audit identified the GP29 cube orbit:

`1 -> 3 -> 9 -> 27 -> 25 -> 19 -> 1`

in exponent space modulo28.

The two opposite directions are:

- forward cube exponent `3`;
- inverse-cube exponent `19 = 3^-1 mod28`.

The Critic correctly noted that the earlier GP29 bridge alone was symmetric:

- `e=3` carries `K -> A -> B -> b`;
- `e=19` carries the same chain in reverse.

The source-derived DH labels break that symmetry.

Standard inversion of the labeled public value `B` using the labeled secret `b` requires:

`e = b^-1 mod(p-1) = 3`.

Exponent19 is the inverse of3 in the **GP29 exponent group**. It is not the inverse of the reconstructed DH secret `b=15` modulo22.

This independently selects the forward direction.

## Exact p28 source object

The canonical p28 rune sequence has length269, so its exact center is zero-based offset134.

The page-numbered word28 begins immediately after the center:

- center rune value: `9`;
- word28 values: `[28,24,10,1,20]`;
- combined source object: `[9,28,24,10,1,20]`.

The word has five runes, giving three nested outer-shell layers. The center is a single visible layer.

Using the source-derived base exponent3:

- one operation on the center gives exponent `3^1 mod28 = 3`;
- three operations on the five-rune word give exponent `3^3 mod28 = 27`.

So the action-count pair is:

`(3,27)`.

Apply it modulo29:

`[9^3, 28^27, 24^27, 10^27, 1^27, 20^27] mod29`

`= [4,28,23,3,1,16]`.

Canonical GP transliteration is:

**READOUT**.

The output naturally segments as the authenticated English words:

**READ OUT**.

## Remaining count-origin caveat

The layer-count convention is separate from cube direction.

If visible layers are treated as zero-based indices rather than operation counts, the same source-derived base exponent3 gives:

`(3^0,3^2) mod28 = (1,9)`.

That rival produces:

`[9,28,25,18,1,23]`.

The source-derived DH inversion does **not** by itself eliminate this convention.

The distinction should be kept explicit:

- **direction ambiguity** `3` versus `19`: resolved by standard DH inversion;
- **layer-count convention** action count versus zero-index: action count is the direct physical interpretation, but the zero-index rival remains a charged convention.

The literal-DH reconstruction itself also independently selects one-based physical line numbering in its source family. That is consistent with action counting, but it is supporting convention evidence rather than a mathematical proof that layer depth must be one-based.

## Self-consistency with the literal DH line

The resulting instruction is semantically compatible with the operation that exposed the source tuple:

**READ OUT** suggests reading the outer runes.

The companion reconstruction uses the outer runes of each printed fragment on the unique literal-DH line, with the H sign/order already fixed independently from solved material.

This creates a coherent local loop:

1. the manuscript visibly labels a line `DH`;
2. outer-pair H plus visible counts reconstructs the standard DH tuple;
3. standard DH inversion produces exponent3;
4. exponent3 plus the independently selected p28 center/page-word geometry produces **READ OUT**;
5. **READ OUT** describes the outer-rune operation used on the literal-DH line.

The loop is self-consistent. Its strongest independent pieces are the literal `DH` selector, solved-source H sign/order, exact DH equations, and standard inverse exponent3. The semantic interpretation of **READ OUT** and the action-count layer convention remain the parts most suitable for adversarial reproduction.

## Decision

Promote the following local p28 mechanism above the earlier direction-ambiguous formulation:

`literal DH line -> source-derived DH23 -> b^-1 mod22 = 3`

and then, under literal action counts:

`p28 center/page-word geometry -> exponents (3,27) -> READ OUT`.

This does not solve an LP2 plaintext page. It does identify a compact, human-plausible, source-derived cryptographic mechanism on p28 without the failed p50 output coercion.

The next high-value test is independent reproduction of the literal-DH reconstruction and an untouched downstream consequence of **READ OUT** that does not depend on p50 numerals as LP offsets.

## Reproduction

Run:

`node sims/lp2_p28_dh_b_inverse_readout_direction_sft.cjs`.

The SFT verifies the reconstructed DH equations, shows that only `b` is invertible modulo22, derives `b^-1=3`, verifies `B^3=g`, reconstructs the exact p28 center/page-word object, preserves the zero-index layer rival, and reproduces **READOUT** under the action-count convention.
