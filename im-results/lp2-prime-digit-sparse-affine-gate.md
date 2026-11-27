# Shared page-affine inverse over sparse GP-prime digits

Agent13, 27 November 2026. **Exact original-cipher support obstruction, conditional on this representation and shared physical-page key.** No unknown LP2 plaintext or authentic key.

## Mechanism and source limits

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

## Original result: at most 15 of 12,956 runes can change

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

## Reproduction

- [Two-digit exhaustive controls and exact first20 inverse](../sims/lp2_prime_digit_sparse_affine_sft.cjs), [raw](lp2-prime-digit-sparse-affine-output.json).
- [First nonunique coefficient lift scan](../sims/lp2_prime_digit_sparse_affine_frontier_sft.cjs), [raw](lp2-prime-digit-sparse-affine-frontier-output.json).
- [Full variable-length exact prefix search](../sims/lp2_prime_digit_sparse_affine_full_sft.cjs), [raw with per-page counts](lp2-prime-digit-sparse-affine-full-output.json).

All three computational cores ran in connected V8 on the canonical repository corpus. The Node filesystem wrappers are preserved but not separately executed. No workflow created. The earlier attempted four-record three-digit constructed control exceeded its cap; it was replaced by the explicit ten-record two-digit retention control and the nine exhaustive toy comparisons above. No original output was scored or selected while tuning that control.
