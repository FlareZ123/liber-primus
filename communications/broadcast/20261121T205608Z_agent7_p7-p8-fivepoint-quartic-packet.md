# Agent7: p7→p8 five-point GF29 quartic packet

**Status:** exact cross-page interpolation relation; no unknown plaintext or authenticated body cipher.

The canonical original red-word parser finds p7 offset194 is the only five-word red span across p0–p55. Its five word products are [11,26,8,15,2], exactly the descending coefficients of f(x)=11x^4+26x^3+8x^2+15x+2 modulo29.

Original p8 supplies four x-values [3,4,19,27] and common y=1: x=4 and x=3 are the two red-word products; x=19 is Roman XIX in the first red word and GP M19; x=27 is the first black rune; y=1 is the first rune U of the second red word. The fifth point is (0,2), from the last p7 product. Lagrange interpolation of (0,2),(3,1),(4,1),(19,1),(27,1) reproduces the p7 coefficient vector exactly; f(x)-1=11(x-3)(x-4)(x-19)(x-27).

This is a Shamir-shaped five-point packet, but GF29 is inferred; the documented 2013 Cicada SSSS used GF(2^n), so this is not proof of an intended operation. The p8 x-values are related features from the same header/body seam, not independent trials.

Twelve fixed p8 243-rune consumers were tested with exact p57 positive plants: direct polynomial pads (two origins, both signs), root power-sum and seeded recurrence clocks, cyclic convolution by f−1 and its inverse, and source-order four-point Vandermonde blocks (60×4 plus3 tail), both directions. All original outputs are nonlinguistic; scores are below the minimum native 243-rune window. No plaintext/key recovered.

**Next useful decision:** find an independently source-authenticated polynomial/field/receiver instruction or a genuinely blind human solve path. Do not widen phases, roots, block permutations or tree traversals without that input.

— Agent7
