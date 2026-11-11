# Fibonacci companion and LP1 magic-square Möbius bridge

**Classification:** an exact cross-release matrix identity and two distinct reversible source-named inversions (projective Möbius rotor and arithmetic Möbius divisor sum). Neither recovers unknown LP2 plaintext, authentic keys or a destination. The identity supplies a possible common algebraic state space but does **not** select a historical cipher, key schedule, or decoded unknown text.

## Independent visible premises

1. The original first-release p05 *SOME WISDOM* square has corner entries `272,151;151,272`. Its rune-word cell `MOBIUS` has GP-prime sum **226**. The original p16 second magic square has corners `434,966;966,434` and magic constant **3301**. Earlier repository work already established their **sixth-power** projective relation and the p05 28-cycle; see [the paired-square study](magic-square-5x5-direct-pad.md) and [its reproducer](../sims/lp1_mobius_corner_power6.cjs).
2. Original LP2 p15 is a 4×4 prime-distance array derived from the consecutive distinct Fibonacci values, with a red **3299** next to **3298** and a central spiral. The index Fibonacci recursion selects the conventional companion matrix `Q=[[1,1],[1,0]]`; see [source proof](../results/lp2-p15-fibonacci-prime-spiral.md).
3. The GP alphabet supplies the natural field `F_29`. None of the matrix identifications below requires fitting unsolved ciphertext.

## New exact algebra

Reduce the original square corners modulo 29:

```text
M05 = [[11,6],[6,11]]
M16 = [[28,9],[9,28]]
Q   = [[ 1,1],[1, 0]]
S   = [[ 0,1],[16,21]]     det(S) = 13 mod29
```

All of these are invertible except the interpretation of Q as a *cipher* is still hypothetical. Direct multiplication over `F_29` gives

```text
M05^2 = [[12,16],[16,12]] = 24 * S Q S^-1
M16   = [[28, 9],[ 9,28]] = 14 * S Q^3 S^-1
M16   = 21 * M05^6
```

The scalar **24** equals `3301 mod29` and `trace(M05²)`. The Fibonacci Q eigenvalues in `F_29` are **6,24**, so their ratio is **22**. The p05 Möbius eigenvalue ratio is **15**, with `15²=22 mod29`. LP2 p15's red **3299 mod29 = 22**, directly forced by the printed 3301−2 construction.

The same `S` simultaneously transports `Q` and `Q³` into the independently printed p05/p16 corner matrices; no choice of two unrelated basis changes is needed. But `S` was algebraically selected after observing the source matrices: the two-dimensional intertwiner space does not uniquely determine this normalized representation. The match to red 3299 is **not** an independent second coincidence, since 3299=3301−2. More broadly, several power relations occur among order-28 projective matrices. This is a structural correspondence rather than demonstrated author intent.

## One direct source-frozen original inverse

A player reading `MOBIUS`, its prime sum 226, and the alphabet's 29-value field could hypothesize encoding plaintext as an advance on the p05 28-cycle. The p05 map `x ↦ (11x+6)/(6x+11)` with source seed `226 mod29=23` produces the exact 28-symbol cycle

```text
[23,14,20,17,13,2,5,22,21,3,1,26,8,7,24,27,
 16,12,9,15,6,4,18,10,0,19,11,25]
```

In the source-locked proposed decoder, each page starts in cycle state zero. For a ciphertext symbol in this cycle, subtract the previous cycle index modulo 28, then subtract one to obtain the plaintext's cycle index. This is a nonzero-step **projective Möbius rotor**; the off-cycle `EA` (GP index28) passes as a literal escape and resets the source seed. These conventions are stated before scoring original text; the zero-step restriction was motivated by the striking scarcity of original doublets. This distinct original-cipher model is fully reversible for **every** GP29 string, unlike the earlier additive GP29 `cᵢ−cᵢ₋₁` differential test. The singular EA escape/reset is a hypothesized design convention, not an authenticated instruction.

The exact CJS SFT tests all **12,956** original unknown runes on 55 rune-bearing pages, preserves 86 source doublets, confirms every rune by inverse reencryption, and builds a planted English control of identical page lengths. A Gibran-trained GP29 trigram model scores these without tuning against ciphertext. An independently held-out Shakespeare control of equal length is included.

| Source / registered test | GP index of coincidence | GP trigram nats/rune | EA symbols |
| --- | ---: | ---: | ---: |
| Original unsolved ciphertext | 0.03447840 | −14.327697 | 460 |
| Direct Möbius rotor decoding | **0.03518721** | **−14.252015** | 460 |
| Held-out Shakespeare GP control | 0.06098953 | −8.316942 | 90 |

The decoder additionally yields **100 AE** plaintext indices, while the held-out native window contains zero. Its beginning is `NGOAUPEONGESUWMJGRCFXNGXNGAHBNEOUPIAOTHH...`, without coherent words. The planted 12,956-symbol English message round-trips exactly. These measurements **reject the explicit source-frozen rotor as a direct native-GP English decoder**; an arbitrary extra layer would be unmotivated by this test.

**Executable source and passed run:** [`sims/lp1_lp2_fibonacci_mobius_bridge_sft.cjs`](../sims/lp1_lp2_fibonacci_mobius_bridge_sft.cjs) and [manual GitHub Actions run 42997114545](https://github.com/FlareZ123/liber-primus/actions/runs/42997114545), Node.js 22. The existing [manual LP1-P40 workflow](../.github/workflows/lp1-p40-cayley-source.yml) now also invokes this SFT. The project's no-per-commit-workflow restriction is preserved.

## p32-derived M28 word-local rotor and seed-preserving conjugacy (source-constrained negative)

The p32 inclusive inner-ring side sums give **M28 = [[14,28],[25,20]]**, of projective order **28** with fixed points **20 and 25**. The p05 **MOBIUS** cell supplies seed **226 mod 29 = 23**. The M28 orbit from 23 contains all 28 nonfixed projective points, including infinity. Both possible assignments of a fixed rune to projective infinity were tested: **20→infinity / 25 fixed** and **25→infinity / 20 fixed**.

There is also a precise cross-round conjugacy, not just a shared order. The unique seed-preserving maps matching the p05 fixed points (1,28) to the p32 fixed points (20,25) are:

- **H20→20 = [[12,8],[0,1]]**, mapping 1→20, 28→25, 23→23; projectively, H M05 H⁻¹ = **M28⁹** (matrix representatives differ by scalar 4).
- **H25→20 = [[0,19],[16,1]]**, mapping 1→25, 28→20, 23→23; projectively, H M05⁻¹ H⁻¹ = **M28⁹** (representatives differ by scalar 21).

Thus exponent **9** is fixed by the cross-round fixed-point/seed correspondence; it is not a fitted phase. Both the direct M28 step and the conjugacy-derived 9-step power were tested. For each fixed-point assignment, both directions were applied at the zero-based rune offset j within each canonical printed word, as motivated by the signed 2016 instruction that words are the map. No phase or key was fitted.

| M28 word-local model | IoC | top-12 mass | GP trigram | within-word GP trigram |
|---|---:|---:|---:|---:|
| M28^j, 20→∞ / 25 fixed | 0.03446503 | 0.42783266 | −14.04650 | −14.05041 |
| M28^−j, 20→∞ / 25 fixed | 0.03447231 | 0.43037975 | −14.05427 | −14.03782 |
| M28^j, 25→∞ / 20 fixed | 0.03447071 | 0.42883606 | −14.03909 | −14.03314 |
| M28^−j, 25→∞ / 20 fixed | 0.03447349 | 0.43107441 | −14.05428 | −14.02947 |
| M28^9j, 20→∞ / 25 fixed | 0.03448554 | 0.43146033 | −14.07662 | −14.05633 |
| M28^−9j, 20→∞ / 25 fixed | 0.03445453 | 0.42814140 | −14.03638 | −14.06186 |
| M28^9j, 25→∞ / 20 fixed | 0.03448664 | 0.43184625 | −14.06118 | −14.04235 |
| M28^−9j, 25→∞ / 20 fixed | 0.03446438 | 0.42953072 | −14.03020 | −14.04817 |
| Raw LP2 ciphertext | 0.03447840 | 0.42976227 | −14.00447 | −13.99008 |
| Native Emerson GP control | 0.06297942 | 0.77987033 | −7.71672 | −7.45708 |

All eight inverses re-encrypt the original **12,956/12,956** runes; all eight independently planted 12,956-rune English controls recover exactly. Every M28 rotor score is worse than raw ciphertext, and the previews are not coherent language. The first rune of each word is necessarily unchanged because the rotor starts at power zero. **Decision:** retire the direct and conjugacy-derived word-local M28 rotors under the source-fixed within-word clock. Do not extend them with fitted phases, arbitrary conjugacies or new fixed-point assignments.

Reproducer: [word-local Möbius rotor SFT](../sims/lp1_mobius_full28_word_rotor_sft.cjs); [manual/push workflow](../.github/workflows/lp1-mobius-full28-word-rotor-manual.yml).

## Independent number-theoretic Möbius inversion (source-native arithmetic branch)

The printed LP1 `MOBIUS` word also names **Möbius inversion of divisor sums**, mathematically distinct from the projective Möbius transformations above. A solver who sees that word alongside Cicada's conspicuous primes could reasonably try the exact **Dirichlet zeta transform over GP29**:

```text
Encryption: C[n] = sum(P[d] for d | n) mod 29, n >= 1
Decryption: P[n] = sum(mu(d) * C[n/d] for d | n) mod 29
```

Here `mu` is the ordinary arithmetic Möbius function. The origin is the natural mathematical index **one**. No key or alphabet phase is fitted. One model uses the entire 12,956-rune book as its domain; three separate reset scopes use only **the original 55 nonempty physical pages, eight printed $ sections, or 2,896 complete printed words** (including words crossing physical page boundaries). This is a concrete alternative interpretation of the **named operation**, not a claim that LP1 explicitly instructs its application to LP2.

| Source-framed inverse | Original decoded GP29 IoC | Adjacent equal glyphs (full joined output) |
| --- | ---: | ---: |
| Raw 12,956 ciphertext runes | 0.034478398 | 86 |
| One book-wide divisor transform | **0.034479208** | 477 |
| Reset at each physical rune page | **0.034489134** | 474 |
| Reset at each original $ section | **0.034510844** | 484 |
| Reset at each canonical printed word | **0.034536463** | **412** |

The known solved p57 plaintext (95 GP runes; IoC **0.062709966**) provides a plant: the exact divisor-sum forward transform creates an apparently random-looking 95-rune cipher (IoC **0.034938410**), and its Möbius inverse recovers the original **95/95** runes exactly. Every original-LP2 variant also re-enciphers all 12,956 published runes. Crucially, the word-reset decoder leaves **each word's first glyph unchanged**, since P[1]=C[1]. Those **2,896 original word initials** have IoC **0.034422084**, so this construction cannot reveal source-native English initial-letter frequencies through a direct word-local inverse.

**Decision:** the direct additive divisor-sum interpretation also fails to recover actual plaintext. The field is GP29 and the clock contracts are explicit; this excludes those **four** precise, source-shaped transforms as direct English decoders. It leaves keyed Dirichlet kernels, transformed alphabets, and non-GP intermediary representations untested, because no original source currently specifies one. [Standalone exact original-cipher reproducer with solved-page control](../sims/lp1_mobius_dirichlet_original_inverse_sft.cjs).

## Causal next decision

The p32-derived M28^j and conjugacy-derived M28^9j 28-cycles have now been tested as zero-based word-local rotors, using seed 23 from the MOBIUS prime sum, both fixed-point/infinity assignments, and both directions; all eight variants score below raw ciphertext, with exact planted controls. Together with the p05 M05 and p16 M16 word-local tests, this closes the direct source-seeded projective word-rotor family tested here. An authentic continuation must add **an independently source-selected input/output representation or state/key operation** that makes the Fibonacci/Möbius conjugacy predict unknown LP2 plaintext. A proposal should identify the original artifact that chooses `S`, the PGL2 points, page reset, and direction before testing ciphertext. Do not escalate into an unrestricted matrix basis/phase search: the source mathematics alone admits infinitely many natural-looking but equally reversible encoders. The exact identity can be reused as a cheap gate if such a selector appears.

**Outcome:** exact new source relation and a decisive negative original-input test; zero unknown plaintext, historic key or solved destination.
