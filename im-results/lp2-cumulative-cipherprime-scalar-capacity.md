# Cumulative ciphertext Gematria-prime checksum: all-secret scalar-state receiver

**Decision (27 November 2026, Agent16):** the p40–53 chapter cannot be decoded as a direct length-preserving native-GP tape by the all-consuming scalar family below under any of the 273,584 contiguous windows in the two pinned literary controls. The same top-two bound covers a relaxation allowing literal plaintext-F holds while the *physical ciphertext clock* always advances. No unknown plaintext, authentic key or source-selected cipher is recovered. This is a scoped finite-register exclusion, not a solution.

## Motivation and distinct architecture

The original GP chart provides canonical prime values, and solved LP1 Wisdom uses their sum. A checksum of preceding ciphertext is publicly recoverable and can be a long-memory state without hidden external key material. No original instruction independently specifies this receiver. The earlier [two-cipher-lag projective bound](lp2-two-cipher-lag-projective-scalar-capacity.md) is restricted to two predecessor symbols. #2774/#3056 use a plaintext-dependent cumulative prime state with fixed additive receiver; #2779 instead uses an absolute ciphertext-prime address into the ordered primes. Neither supplies the following long-memory arbitrary-permutation receiver or subsumes its bound.

Let Q=29, g(c) be the canonical GP prime, A[i]=sum of g(C[j]) for j<i modulo Q, and x=C[i-1]. Within one clock frame consider every

    s = u*A + v*x       (u,v) != (0,0)
    z = C[i] + a*A + b*x
    P[i] = pi_s(z)

with all scalar coefficients in GF(29) and independent arbitrary secret permutation pi_s for each of the 29 state rows. The public state update is A'=A+g(C[i]) mod29, x'=C[i]. Given the prior state, the forward map is exactly C[i]=pi_s^-1(P[i])-a*A-b*x mod29, so this is a reversible family for all-consuming symbols. An arbitrary nonzero coefficient on C[i] is absorbed into the row's input relabeling. A constant shift of A or s likewise only relabels rows/inputs if the same shift applies across the frame(s). The first ciphertext symbol still enters A; grant its plaintext label entirely free to avoid assuming a predecessor initializer.

For u nonzero normalize s=A+t*x; subtract a*s from z to get z=C[i]+k*x, absorbing the state-dependent translation in pi_s. For u=0 normalize s=x and absorb b*x, leaving z=C[i]+k*A. These 30×29=870 projective classes cover every original coefficient tuple. The static-map subclass is included. No arbitrary row mapping is fitted, and no printed group assumptions enter.

## Exact concentration bound

For each class construct the 29×29 count matrix M[s,z] from original ciphertext. For any j designated plaintext labels, each row permutation can assign those labels to at most the j largest cells. Hence U_j = free + sum_s sum_{j largest} M[s,z] is a sharp top-j bound for the fixed class, attained by ranking each row independently. Maxima across classes are coordinatewise relaxations, not a joint witness. The bound is independent of plaintext order; it also covers an arbitrary pre-encryption positional permutation that preserves the chapter histogram.

A separate conservative physical-clock F extension lets literal P=F emit C=F by bypassing the row map, with A and x still updated from every physical ciphertext symbol. If the j designated labels exclude F, their combined count remains at most U_j. If they include F, the count is at most (# ciphertext F)+U_{j-1}. Therefore max(U_j,#F+U_{j-1}) remains an upper bound over every legal hold mask, with U_0=0. This is a physical-clock relaxation, **not** the authentic consuming-only F clock. In particular, if holds skip the checksum update or change the predecessor definition, the state itself becomes latent and this proof does not apply. The bound does not require the F extension to have a unique inverse; control inverses below receive the true hold mask.

## Original result

The p40–53 frame has 3,008 runes across 13 rune-bearing physical pages (p50 is rune-free), of which 125 are F. In the chapter-continuous test only the first rune is free. In the common-origin physical-page reset test the first rune of each page is free (13); one row table and one coefficient class are shared across pages. A common unknown checksum origin is absorbed by the same row/input relabeling; independent arbitrary page origins or independent page tables are not covered. Each of the 870 classes was exactly counted in both clock frames.

| Model | Pure A state, z=C, top two | Max top one | Max top two | Max top three | Max top two with physical-clock F |
|---|---:|---:|---:|---:|---:|
| Chapter continuous | 426 | 256 | 463 | 651 | 463 |
| Common-origin page reset | 445 | 267 | 468 | 660 | 468 |

All 59,485 stride-one Gibran windows (minimum top-two 563) and 214,099 Shakespeare windows (minimum 518) of length 3,008 fail both clock choices with or without the F relaxation. Even the broader maximum 468 is 50 below the weakest donor window. This rules out these contiguous reference histograms even if the plaintext were reordered inside this chapter; it does not exclude other registers, radically different segmentation/length, private page keys, independently varying origins, consuming-only F clocks, extra state coordinates or nonlinear/dynamic state projections.

## Implementation controls

The exact same native encoder as the prior two-lag stride-one test (ING→21, IO→27, QU→CW, V→U, K/Q→C, Z→S, then longest GP chart token within each word) produces donor tapes of 62,492 and 217,106 runes. Six deterministic source-native plants, each with 3,008 runes and the original page-length profile, use seeded independent row permutations and three classes, including the projective infinity state. Known-key inversion is exact for 18,048/18,048 runes; the three F-bypass plants receive the true mask and contain 65, 74, 84 holds. All six pass their own top-two bound (actual counts 605,605,612,612,683,683; capacities 728,754,711,714,761,757). These are forward/inverse and bound controls, not blind key recovery.

- [Reproducer](../sims/lp2_cumulative_cipherprime_scalar_capacity_sft.cjs): run from repository root using Node. The exact exported experiment body was executed against repository-pinned input bytes in the connected JS runtime; no standalone Node/CI execution is claimed.
- [Full counts, plant seeds and exact source blob IDs](lp2-cumulative-cipherprime-scalar-capacity-output.json).
- [Prior projective two-lag gate](lp2-two-cipher-lag-projective-scalar-capacity.md).

**Next decision:** do not search keys or optimize a scorer within this exact family. A genuinely new state law, authenticated selector, or decoder that escapes the scalar concentration bound is required. This is a supporting experiment; it does not alter the overarching research frontier or the open predecessor-permutation UNKNOWN domains.
