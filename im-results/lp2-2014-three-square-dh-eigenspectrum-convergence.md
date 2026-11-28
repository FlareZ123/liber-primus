# All three first-party 2014 magic squares: GP29 spectral fingerprint of the later LP2 DH state

**28 November 2026, Agent2. New exact source arithmetic / prospective key-generation lead; unselected deciphering operation. No recovered LP2 unknown plaintext.** This report adds a distinct and stronger full-source discovery to the isolated Stage7 7×7↔p8 eigenvalue comparison. The original `resources/cicada2014-openpuff-magic-squares.txt` (recovered at Cicada 2014 Fifth Onion with OpenPuff) supplies **three distinct, fixed-order integer magic squares** of dimensions **5,7,5** and row/column/diagonal sums **3301,1033,1033**. The originally demonstrated author-approved operation was submission of the *numbers* through the contemporary 2014 CGI interface. **It did not instruct eigenanalysis, determinant extraction, GP29 reduction, or transfer to later LP2.** Every algebraic equality below is exact; treating the identities as intended DH keys remains a testable hypothesis.

## The full original three-matrix invariant (not the 7×7 in isolation)

Reduce all original matrix entries in their original printed positions modulo **29**, the Gematria Primus alphabet size. Exact characteristic polynomials yield:

| Original square, source order | Determinant mod29 | Linear eigenroots GF29 | Source-relevant factorization mod29 |
| --- | ---: | --- | --- |
| 5×5 / row sum3301 | **10** | **3,24,26** | `(x−24)(x²−3)(x²−9)` |
| 7×7 / row sum1033 | **2** | **8,18,24** | `(x−18)(x−8)(x−24)Q₄(x)` |
| 5×5 / row sum1033 | **3** | **5,8,18,21,24** | `(x−18)(x²−5²)(x²−8²)` |

The **full polynomial GCD** over GF29 is precisely **`x+5`**, with unique common eigenvalue **24=−5 mod29**; this is stronger than observing a common field root and checks for any unreported common irreducible factor. The two 1033-row-sum squares share the complete cubic factor **`(x−8)(x−18)(x−24)`**. For the 3301 square, 3301 mod29 is already24 by construction, so its root24 is *trivial* (all-one eigenvector). In the 1033 squares the trivial root is18, whereas 8 and24 are extra. The 1033 5×5 square has, unusually, exactly the GP29 roots **±5,±8,18**, i.e. the already independently reconstructed p15 DH generator **g=5**, public value **A=8**, their additive inverses and the row-sum residue. These root/role labels were recognized **after** both sources were studied and do not prove they were authored as a key.

## Source-only coincident candidate values and independent original-LP2 tests

The original Stage7 matrices supply two algebraically distinct *arithmetic* extractions of the same candidate parameter:

```text
source row sums (3301,1033):
 g₁ = −3301 mod29 = 5;  a = (3301 − 1033) mod29 = 6
source determinants in printed 5×5,7×7,5×5 order:
 [d₁,d₂,d₃] = [10,2,3]
 g₂ = d₁ / d₂ mod29 = 10 × 2⁻¹ mod29 = 5
 d₁ = g₂ × d₂ = 10 (mod29)
all-three characteristic-polynomial gcd: x+5 ⇒ λ=−g=24
```

These are exact *source-derived numbers* without reading any unknown LP2 ciphertext. Under the independently established **p15 modulus p=23**, they give `A=g₁^a mod23=5^6 mod23=8`, the established public DH value. Separately the authentic p8 red heading begins the literal Roman `XIX`=19; **if** it is interpreted as the p15 public counterpart `B=19`, then `K=B^a mod23=19^6 mod23=2`, matching the **middle historical square determinant d₂=2**. The terminal determinant `d₃=3` also matches a previously assigned exponent `e=3` in the p28 algebraic DH program, but this is a retrospective state-label match, not a newly source-selected role. Note that p=23 and the identification of XIX as B are **independent external/LP2 premises**, not values recovered from these three matrices.

The distinct physical p8 7×7 black-fragment-length matrix has **only eigenroot24** over GF29. Its [prior original matrix gate](lp2-stage7-p8-seven-matrix-root24-crosssource.md) already ruled out direct 7×7 Hill/matrix word-length transport as plaintext. This all-source convergence makes the historical magic squares a potentially independent route to candidate **g=5/K=2**, rather than a generic arbitrary-key guess; it **does not** specify any reversible operation on the original p8 or p40–55 ciphertext.

## How much exact alignment survives matched source-order controls?

We exhaust every independent permutation of the **whole printed columns** within each historical square, retaining every original number, each original row's sum, and matrix size; this disrupts original diagonals and 180° symmetry and therefore is a **conditional orientation diagnostic, not a null distribution for authored magic squares**. With the independently fixed register labels `A=8, −g=24`:

| Matrix | All original-column permutations | Root24 present | Both root8 and root24 |
| --- | ---: | ---: | ---: |
| 5×5 3301 | 120 | 120 (trivial row sum) | 3 |
| 7×7 1033 | 5,040 | 229 | 9 |
| 5×5 1033 | 120 | 19 | 3 |

The original fixed order belongs to the small double-root subsets in both 1033 squares. This is an *in-sample exact matched test*, not an unadjusted discovery-wide probability: matrices, invariants and DH labels were jointly noticed after a very large historical search. Determinants change only by signs under column reorder, so the same null cannot supply an independent significance estimate for the ordered determinant triple. Its main value is to expose precise, source-selected algebraic identities and identify what a future **ciphertext-blind source-selected operator** would have to use.

## Decision and reproduction

**Preserve the complete triple-square GF29 fingerprint as conditional candidate authentic key material, not an authenticated decryption.** The within-source equality `−g=common root` and `g=det(first)/det(second)`, plus the separate p8 root24 and p15 DH public values, is materially more constrained than choosing 24 from an arbitrary GP rune. Nevertheless GP29 reduction and spectra/determinants are *unprompted operations*: the historical puzzle explicitly required the three square values to be submitted as form text, not factored. The next credible advancement is a first-party clue instructing determinant/characteristic-root consumption **and** a held-out original unknown-page plaintext or cipher output, ideally without adjusting direction, phase or GP alphabet. The immediate simple 7×7 matrix-word-length transports and direct 16×16 p50 terminal page pad have already failed; do not repeat those failures with new fitted exceptions.

Reproduce with `node sims/lp2_2014_three_square_dh_spectral_bridge_sft.cjs`. It reparses the *unchanged* historical source, asserts row, column and diagonal sums, computes GF29 determinants, characteristic polynomials, **full polynomial gcds**, enumerates all 5!/7!/5! column-permutation controls, confirms original p8 `XIX` in the canonical rune corpus, and prints all source-only and explicitly borrowed LP2 checks. It uses no unknown ciphertext, language model, scraped prose or invented reconstructed plaintext.
