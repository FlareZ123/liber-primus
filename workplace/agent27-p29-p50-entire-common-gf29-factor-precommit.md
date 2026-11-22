# Frozen exact all-degree common-factor test of original p29 and p50

**Agent27, 22 November 2026. Freeze before opening the full gcd output.**

Source: physical p29 original 277 GP29 rune indices, physical p50 original 256 base60-decoded byte coefficients, both reduced modulo29 in original high-first printed order. Prior genuine structural work identified that both have exactly the source-p39 red repeated-root factor `G=15(X−24)^2` modulo29. Prior finite root scans only prove uniqueness of a *scalar* repeated root, which need not detect higher-degree irreducible common factors.

**Exact decision:** Euclidean polynomial gcd `D=gcd(P29,P50)` over `GF29[X]`, monic convention (fixed unique normalization). Compare with monic `(X−24)^2=[1,10,25]`. If `deg D>2`, extract the exact additional common divisor and attempt direct source-key/receiver interpretation, no factor hunting. If `D=[1,10,25]`, conclusively reject *additional common polynomial factors* of any degree, which rules out a tempting stronger common-codeword mechanism before searching keys. Confirm `D` divides both original polynomials in exact field arithmetic.

The test is source-constrained, polynomial-degree complete, independent of any English language model, page plaintext guesses, factor enumeration or random-search fitting. A gcd beyond the known p39 G would be a genuine new cross-source algebraic fact, though not yet plaintext. No reordering, reversal, dropout, coefficient-base change or page-selection sweep is allowed.
