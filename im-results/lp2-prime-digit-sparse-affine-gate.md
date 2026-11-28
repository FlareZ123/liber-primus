# Reversible inverse constraints over sparse GP-prime digits

Agent13, 27 November 2026. **Exact original-cipher support obstructions for shared affine and valuation-preserving CRT power inverses, conditional on this representation and shared physical-page key.** No unknown LP2 plaintext or authentic key. The subsequent #3284 theorem additionally excludes any carry-free affine compression of complete BASE29 prime-digit blocks into ordinary GP indices, and shows that same-code affine bijections only permute rune positions; these are distinct from integer carry arithmetic.

## Affine mechanism and source limits

The GP chart assigns the 29 distinct primes 2–109, and the authenticated 2013 BASE29 worked example establishes positional radix arithmetic (in radix29, not the radices here). The earlier [shared radix29 affine receiver](lp2-shared-page-base29-adic-beam-gate.md) used ordinal GP digits and a heuristic language beam. Test the qualitatively different sparse-digit model: each actual GP rune is represented by its chart prime, and both plaintext and ciphertext page integers use the same sparse digit alphabet in radix (b=110) (minimum legal integer radix) or (b=128) (seven-bit width). These radices and the common page-affine law are exploratory modeling choices, not author-specified operations. Let (C_i) be the complete physical page integer, of length (L_i); require

```
P_i = A C_i + K mod b^L_i
gcd(A,b)=1
every digit of P_i belongs to the 29 chart primes
```

The same arbitrary integers A,K serve all 55 rune-bearing pages, with one common orientation. No word or lexical assumptions, finite key-length bound or language-based pruning.

## Exact inverse prefix enumeration

At depth (j), retain every admissible residue pair (A,K\bmod b^j). For every lift (A'=A+a b^j,K'=K+k b^j), (0\le a,k<b), and every page still active ((L_i>j)), the next digit is

```
d_i = floor(((A*C_i+K) mod b^(j+1))/b^j)
new_i = (d_i + a*(C_i mod b) + k) mod b
```

All lifts producing only chart-prime digits survive. At depth zero restrict a to units. In the efficient full runner, the first active page determines the 29 possible k values for each a, so no viable pair is omitted. Pages that end earlier stay valid under every future lift. This establishes a necessary exact condition on every complete key.

Nine toy two-digit problems in composite radices6/8/9 match exhaustive enumeration of all coefficient pairs. An explicitly constructed sparse prime-digit control with P=C+2 in radix110 retains the hidden pair (1,2) among 20 legal pairs. This is a correctness/retention control, not a blind unique-key recovery or proof that arbitrary sparse inputs stay in the alphabet.

## Affine original result: at most 15 of 12,956 runes can change

All 55 rune-bearing unknown pages were checked in each case. The first 20 low digits force the unique identity residue pair (A,K)=(1,0) in all four settings. Continue exact enumeration with decreasing active-page set. At depth273, only six source runes remain outside the completed prefix constraints. The attempted next lift exceeds the predetermined 512-state cap with three pages active; **no candidate is discarded at any completed depth**. Subsequent constraints could only shrink the viable prefix set, so the following bounds are exact regardless of any unexamined high digits.

| Base | Low digit | Completed depth | Prefix keys | Runes forced unchanged by all feasible prefixes | Maximum possible changes in full LP2 |
|---|---|---:|---:|---:|---:|
| 110 | first | 273 | 2 | 12,950 | 6 |
| 110 | last | 273 | 8 | 12,941 | 15 |
| 128 | first | 273 | 4 | 12,947 | 9 |
| 128 | last | 273 | 1 | 12,950 | 6 |

All 12,956 runes are included in the denominator, including all heading ink and physical carries. The identity prefix is always admissible. In radix110 first-low, the two surviving residue pairs give identical output at every covered position; in radix128 last-low only identity survives. Initial nonunique lifts at depths26/97 in radix128 are therefore not evidence of actual decryptability. The early first-departure scan and completed prefix enumeration distinguish coefficient ambiguity from output ambiguity.

The unchanged corpus IoC is 0.0344783978645. Even if all 15 potentially changeable positions in the weakest bound could be chosen anywhere and reassigned to arbitrary GP labels, the most concentrated histogram has IoC at most 0.0344977013909: move 15 occurrences from the smallest count (399) to the largest (492). This follows from convexity of the collision numerator; each move is maximized by removing from the smallest remaining nonempty count and adding to the largest, and 399>15. Actual permitted modifications are more restrictive.

**Decision:** this receiver cannot substantially alter the original text, independently of key size, language model, or chosen source key. Retire a common direct prime-digit page-affine transformation in the two frozen radices, with either common orientation. It does not exclude different input/output alphabets, cycle walking, an additional layer, independent page keys, or other radices. No historical clue selects those extensions, so do not launch a wider arbitrary radix survey.

## Affine reproduction

- [Two-digit exhaustive controls and exact first20 inverse](../sims/lp2_prime_digit_sparse_affine_sft.cjs), [raw](lp2-prime-digit-sparse-affine-output.json).
- [First nonunique coefficient lift scan](../sims/lp2_prime_digit_sparse_affine_frontier_sft.cjs), [raw](lp2-prime-digit-sparse-affine-frontier-output.json).
- [Full variable-length exact prefix search](../sims/lp2_prime_digit_sparse_affine_full_sft.cjs), [raw with per-page counts](lp2-prime-digit-sparse-affine-full-output.json).

All three computational cores ran in connected V8 on the canonical repository corpus. The Node filesystem wrappers are preserved but not separately executed. No workflow created. The earlier attempted four-record three-digit constructed control exceeded its cap; it was replaced by the explicit ten-record two-digit retention control and the nine exhaustive toy comparisons above. No original output was scored or selected while tuning that control.

## Exact shared valuation-preserving CRT power inverse

A second source-motivated operation is modular exponentiation, independently demonstrated by the 2013 DH protocol. Unlike the [ordinal radix29 heuristic shared-power search](lp2-shared-page-base29-adic-beam-gate.md), sparse chart-prime support allows **exact** elimination of arbitrary common exponent residues. Use the same radix110 or radix128 and the same common physical-page orientation; neither radix is authenticated as an LP2 instruction.

For each prime-power factor (p^h) of the page modulus (b^L), write the corresponding residue as (p^v u) with unit u (fix zero). Apply (p^v u^e\bmod p^h), then reconstruct the page integer by CRT. Require e to be a unit modulo the Carmichael exponent of (b^L); its reciprocal exponent is the inverse. The componentwise valuation-preserving choice gives a lossless extension to nonunits and is an exploratory modeling choice, not a historical cipher identification.

At depth j, enumerate all e residues coprime to `lambda(b^j)`. Extend each retained exponent by every legal k times that group exponent. For every active page, the next digit is exactly linear in k: if the decoded values for e and e+lambda are y0 and y1, their difference is divisible by b^j, and the next digit is

```
digit_j(y0) + k*((y1-y0) mod b^(j+1))/b^j mod b.
```

Indeed, each unit factor raised to lambda is 1 modulo its depth-j prime power; the binomial square and all higher terms vanish modulo the depth-(j+1) prime power for j>=1. Multiplication by the preserved valuation cannot weaken divisibility. CRT gives the result modulo b^(j+1). Maintain full component powers and advance them by the exact successive group-order ratios. No language ranking or key size bound. All prefixes that pass chart-prime support survive; every accepted lift's predicted digit is independently compared to the full CRT output.

Three mixed-length toy problems in radices6/10/8 compare every surviving exponent against direct complete enumeration, with identical sets (1/2/1 keys). For all prime-digit pairs whose actual cube stays within the sparse digit alphabet, the exact two-digit receiver retains precisely e=1 and e=3 in each radix (183 selected pairs at base110; 54 at base128). The cube is retained but not uniquely recoverable because identity always preserves this support. These deliberately support-conditioned examples are not prose or blind key recovery.

| Base | Low digit | Completed depth | Admissible exponent residues | Runes forced unchanged | Maximum changes in full LP2 |
|---|---|---:|---:|---:|---:|
| 110 | first | 275 | 300 | 12,950 | 6 |
| 110 | last | 275 | 305 | 12,950 | 6 |
| 128 | first | 275 | 290 | 12,950 | 6 |
| 128 | last | 275 | 172 | 12,950 | 6 |

All four original settings have **only the identity exponent residue through depth273**. At the completed depth275, 12,954 original runes are covered; at most four of those can change and only two original runes are beyond the completed constraints. The next lift exceeds the 512-state cap with one page active. This cap does not weaken the exact bound: all possible full keys must restrict to one of the completed prefixes, irrespective of how many keys survive later. No need to distinguish the numerous irrelevant high exponents.

**Joint decision:** neither shared affine nor shared valuation-preserving CRT power in the specified sparse prime-digit registers can change more than 15 source runes, and power can change no more than six. Both are exact direct-receiver obstructions without assumptions on plaintext words or key length. They do not establish a general impossibility for modular arithmetic, different plaintext/ciphertext alphabets, private page keys, or added layers. No authentic key or unknown plaintext. Do not broaden the radix list or add arbitrary combined layers without a source-selected operator.

[Power SFT](../sims/lp2_prime_digit_sparse_unit_power_sft.cjs), [raw per-page evidence](lp2-prime-digit-sparse-unit-power-output.json). Executed connected V8 core, not the standalone Node wrapper. No new CI.

## Exact carry-free BASE29 block obstruction (Director #3284, Agent45, 28 November)

**Decision:** an affine change of coordinates on the full two-digit GP-prime code cannot provide a nontrivial same-length substitution/diffusion layer at ANY finite block size. This includes the ordinary alphabet and the 28-letter alphabet with a fixed transparent-F bypass. This is a code-domain theorem, independent of LP2 ciphertext statistics, and is separate from the preceding original-cipher exclusions for integer arithmetic with carries.

Source: [corrected authored GP prime chart](../results/2013-original-gp29-source-map.md) and the documented [historical BASE29 operation](2013-base29-gf29-grid-factor.md). Write each of the 29 prime labels v as the complete ordered pair (q,r)=(floor(v/29),v mod29) in GF(29)^2, including a leading zero for the nine singleton values. Fixed padding and carry-free affine mixing are exploratory modeling choices; neither is a first-party instruction for LP2. Let S be this 29-element set and T=S minus the F pair (0,2). The earlier #2839 variable-width digit stream, #3299 15x2 chart carry, #2693 unknown alphabet-conjugated prime clock, #1336 source-selected permutation search, #3171 secret mixed-dihedral chart, and the preceding base110/128 integer carry/power receivers concern different objects. Prime rank itself is the identity; a prime residue alone is already known noninjective.

### Finite chart certificate

Every nonzero linear functional on a two-digit point is a nonzero scalar multiple of one of 30 directions: (1,k), k=0..28, or (0,1). The exact numbers of distinct outputs on S, in this order, are:

```
4 14 21 21 16 23 13 19 18 24 15 20 22 20 24
20 21 24 23 17 20 21 21 18 21 20 22 24 11 24
```

On T they are:

```
4 13 21 20 15 22 13 19 18 24 15 20 22 20 23
20 20 23 22 16 19 20 20 17 21 20 22 24 10 24
```

Thus none is injective, maximum support 24 in either domain; the only direction attaining 4 is the quotient q. In every direction on T at least one histogram coefficient is odd, and at least one coefficient is zero. Quotient row populations on S are (9,7,7,6), on T (8,7,7,6). In both cases exhaustive enumeration of 28*29 possible affine maps of the q=0 residue row gives only r->r; the remaining rows then admit only r'=r+0q. These finite statements are checked directly by the SFT below.

### Theorem 1: no linear compression of arbitrary blocks

For arbitrary n>=1, consider ANY GF29-affine map from S^n to GF29^n, including dense cross-symbol digit mixing, different coefficients per output position, a fixed translation, and arbitrary fixed bijective ordinal preprocessing or postprocessing. If the map is bijective, each output coordinate must be uniform under independent uniform source symbols. Its distribution is a convolution of the individual scalar projection histograms. Take z a primitive complex 29th root of unity. A histogram H(X)=sum h_j X^j of degree <=28 vanishes at z iff it is a scalar multiple of Phi29=1+X+...+X^28, by irreducibility over Q. For a 29-point source this requires all h_j=1. No nonconstant chart projection achieves this, and a zero coefficient vector contributes a nonzero constant 29. Thus each factor H(z) is nonzero; a translation multiplies by a nonzero power of z. The convolution cannot be uniform, because its nontrivial Fourier coefficient is nonzero. This proves no bijection for any n, not just rank deficiency of an individual rune. Composing arbitrarily many carry-free affine stages before reducing to n ordinary indices leaves this obstruction unchanged.

For literal-F bypass, fix any skip mask externally and consider the n consuming positions with independent symbols from T. A bijection to any product of 28-element ordinary index sets requires every output coordinate to have histogram 28^(n-1) on its 28 allowed outputs. For a row using k nonzero input coefficient vectors, divide out the inactive variables' factor 28^(n-k). If k=0 or 1, support <=24. If k>=2, the necessary active histogram is even at every entry. But 2 has multiplicative order 28 modulo 29; consequently Phi29 is irreducible over GF2. Reduce the cyclic histogram polynomial modulo Phi29 over GF2 (X^29=1 there). Every nonzero projection histogram on T is nonzero in that field: it has some odd coefficient, some zero coefficient, and degree <=28, so it is neither zero nor Phi29. A product of nonzero elements, including the translation monomial, cannot vanish. The requisite all-even histogram would vanish. Contradiction. This applies to the fixed-mask consuming subproblem, including the all-non-F mask; it does not assert that the unknown LP2 skip pattern can be observed or decoded.

### Theorem 2: full digit affine automorphisms are only position permutations

Even if the affine layer retains all 2n digits and requires its output to lie in the same prime chart domain, every affine bijection S^n -> S^n (also T^n -> T^n) simply permutes complete rune positions.

Proof: the output quotient q' has support exactly 4. For independent nonconstant input projections the Cauchy-Davenport bound on cyclic GF29 is |A+B|>=min(29,|A|+|B|-1). Each nonconstant projection has support >=4; two or more would give >=7. Hence q' depends on exactly one input point, necessarily via its quotient q_j. The unequal quotient-row multiplicities force a permutation of the four values to fix 0 (unique largest population) and 3 (unique smallest); an affine scalar map fixing these two points is the identity. Thus q'=q_j.

Condition on this input quotient. If the corresponding residue r_j has zero coefficient in r', its conditional support size would be independent of q_j (translation only), inconsistent with the distinct required row sizes. If its coefficient is nonzero, conditioning on q_j=0 already contributes a support of 9 (S) or 8 (T); any nonzero contribution from another independent symbol adds >=3 by Cauchy-Davenport, violating that row size. Thus r'=c q_j+d r_j+e, d nonzero. The finite chart certificate forces d=1,e=0 on row 0 and c=0 on the remaining rows. Every output pair equals one input pair. Bijectivity forces distinct source positions. QED.

An intermediate affine stage can leave S^n as long as subsequent carry-free affine stages restore it; their composition is still affine and the theorem applies to the net map. Ordinary index-affine actions and a position permutation can remain viable but the prime coordinate layer then adds no value-dependent substitution. These results do not exclude integer carry arithmetic, nonlinear rank/escape/cycle-walk rules, variable-length output, extra side information, non-product restricted plaintext domains, different digit codebooks, or state-dependent maps. They are not a generic exclusion of primes or transpositions.

### Reproduction, decision and next step

Run [the standalone CommonJS SFT](../sims/lp2_prime_digit_affine_block_sft.cjs). It ran locally under Node 22.16.0. It verifies the 30 normalized directions for each domain, 812 row-0 affine maps each, the remaining 29 candidate slopes, the order of 2, and **25,200 two-input nonzero row convolutions per domain**, testing every relative nonzero coefficient scale up to global scaling/translation. Zero of 50,400 were uniform on the required support. Four ordinal-code positive/rival assertions pass. The finite two-input check corroborates, rather than substitutes for, the all-n proof. An initial local logging typo in the returned property name was corrected before the successful run and committed version. No original-cipher fitting or native re-encipherment control was warranted: the proposed domain-wide inverse mathematically cannot exist; there is no original key or plaintext candidate.

Close #3284 under its exact obstruction/missing source-selector criterion. Do not try arbitrary affine key lists or more digit widths to repair this family. A viable successor requires a source-selected nonlinearity, genuinely different register, or recoverable carry/side-information convention, and should then produce a complete original inverse with independent continuation. The source supports prime labels and positional BASE29 separately; it does not establish this particular composition as the LP2 sender.
