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

## Physical p57 circumference operation: the three smaller original source squares

The independently solved p57 instruction to **shed circumferences and find divinity within** supplies a plausible original-source instruction to remove each large square's outer row and outer column. This yields the **unaltered, interior** 3×3, 5×5 and 3×3 matrices used in earlier direct p55 Hill-cipher tests (which were negative). Their GF29 invariants give a **second structured source-only DH packet** that was not used in those cipher tests:

| Original Stage7 square | Interior size after one border | Interior determinant mod29 | **Every linear eigenroot of the interior** |
| --- | ---: | ---: | --- |
| First 5×5 (3301) | 3×3 | **24 = −g** | **{10 = gK}** |
| Middle 7×7 (1033) | 5×5 | **8 = A** | **{2 = K}** |
| Final 5×5 (1033) | 3×3 | **24 = −g** | **{24 = −g}** |

All **three cores have exactly one GF29 eigenroot** in original printed order. Their ordered root tape is **[10,2,24]** and obeys the exact internal GP29 identity `10 = −2×24 mod29`, or `g = −24 = 10/2 = 5`. The ordered interior determinant tape is **[24,8,24]**: its outer flanks coincide with the all-three original-square common eigenvalue **−g**, and its middle coincides with the independently known public value **A=8**. The **first two core roots equal the first two full-square determinants exactly** ([10,2]); the final core root equals the full-square common root24. These identities need no LP2 unknown ciphertext, English model, key phase or postselected rune location. They offer a concrete, author-visible source transformation (*strip an outer border*) that the isolated 7×7 spectral coincidence lacked. **The eigenvalue/determinant extraction step is still not explicitly instructed by p57**; these are retrospectively recognized exact identities, not authenticated key semantics.

A maximally literal p55 reader is nevertheless testable. The original **17 p55 words contain exactly 43 strict interior runes**, partitioned **9/25/9** against the source interior cells. Preserve all original word boundaries, use each corresponding interior determinant [24,8,24] or unique interior root [10,2,24] as a fixed scalar GP29 additive shift for exactly that block, and grant both signs with no phase, skip or tuned matrix reordering. All four candidates return nonprose, with GP29 IoC respectively:

| Exact p55 43-interior model | IoC | Native plaintext recovered? |
| --- | ---: | --- |
| Source unaltered | 0.03433001 | unknown cipher, not prose |
| Core determinants, subtract | **0.03211517** | no |
| Core determinants, add | 0.03765227 | no |
| Core eigenroots, subtract | 0.02436323 | no |
| Core eigenroots, add | 0.02768549 | no |

All four originals re-encrypt **43/43** under their own fixed key streams, validating implementation but not plaintext. This rejects the simplest **scalar-additive p55 inner-page consumer** of the newly derived packets; it does not reject a genuinely source-selected nonadditive instruction, the p57 circumference clue itself, or the exact GP29 key-like source identities.

### A simpler mirror-difference route: recovering g and K without spectral algebra

The two original **5×5** squares become two original **3×3 centrosymmetric cores** after the p57-directed removal of their outer borders. Each has the exact left–right/middle-top pattern `[[a,b,c],[d,e,d],[c,b,a]]`. Reflection `[1,0,−1]` is a **visible antisymmetric eigenvector**: the only required operation to recover its eigenvalue is `a−c`—**one subtraction between the two top corners**. The numerical original-source calculation is simply:

```text
first 5×5 source after removing perimeter:   top corners 812  ... 280
  Δ_first = 812 − 280 = +532 ≡ 10 (mod29) = gK

last 5×5 source after removing perimeter:    top corners 199  ... 320
  Δ_last  = 199 − 320 = −121 ≡ 24 (mod29) = −g

g = −Δ_last mod29 = 5
K = −Δ_first / Δ_last mod29 = 10/5 mod29 = 2
```

The middle row of each original 3×3 core has equal endpoints, and the final row gives the exact opposite difference, so this is a verifiable original reflection invariant rather than an algebraic artifact of computing characteristic polynomials. It extracts the same candidate **DH generator5 and shared value2** from just four visible *2014 source cells*, the actual solved p57 **circumference removal**, and two identical source-shaped 5×5 matrices; the unused 7×7 still independently has full determinant2. This is more feasible for a human puzzle solver than diagonalizing the 7×7 matrix. Crucially, **neither p57 nor the 2014 squares explicitly commands left–right top-corner subtraction, modulo29 conversion, or the quotient**. Thus the arithmetic is real and economical, but identifying these exact historical values as *authored* DH keys is still a prospective hypothesis needing a target-frozen original-ciphertext decryption or an explicit mirror/key-extraction cue. No derived 3×3 eigenroot is an independent second witness to these same two corner differences: they are algebraically the same observation.

## How much exact alignment survives matched source-order controls?

We exhaust every independent permutation of the **whole printed columns** within each historical square, retaining every original number, each original row's sum, and matrix size; this disrupts original diagonals and 180° symmetry and therefore is a **conditional orientation diagnostic, not a null distribution for authored magic squares**. With the independently fixed register labels `A=8, −g=24`:

| Matrix | All original-column permutations | Root24 present | Both root8 and root24 |
| --- | ---: | ---: | ---: |
| 5×5 3301 | 120 | 120 (trivial row sum) | 3 |
| 7×7 1033 | 5,040 | 229 | 9 |
| 5×5 1033 | 120 | 19 | 3 |

The original fixed order belongs to the small double-root subsets in both 1033 squares. This is an *in-sample exact matched test*, not an unadjusted discovery-wide probability: matrices, invariants and DH labels were jointly noticed after a very large historical search. Determinants change only by signs under column reorder, so the same null cannot supply an independent significance estimate for the ordered determinant triple. Its main value is to expose precise, source-selected algebraic identities and identify what a future **ciphertext-blind source-selected operator** would have to use.

## Decision and reproduction

**Preserve the complete triple-square and circumference-stripped interior GF29 fingerprints as conditional candidate authentic key material, not an authenticated decryption.** The within-source equality `−g=common root` and `g=det(first)/det(second)`, plus the separate p8 root24 and p15 DH public values, is materially more constrained than choosing 24 from an arbitrary GP rune. Nevertheless GP29 reduction and spectra/determinants are *unprompted operations*: the historical puzzle explicitly required the three square values to be submitted as form text, not factored. The next credible advancement is a first-party clue instructing determinant/characteristic-root consumption **and** a held-out original unknown-page plaintext or cipher output, ideally without adjusting direction, phase or GP alphabet. The immediate simple 7×7 matrix-word-length transports and direct 16×16 p50 terminal page pad have already failed; do not repeat those failures with new fitted exceptions.

Reproduce with `node sims/lp2_2014_three_square_dh_spectral_bridge_sft.cjs`. It reparses the *unchanged* historical source, asserts row, column and diagonal sums, computes GF29 determinants, characteristic polynomials, **full polynomial gcds**, enumerates all 5!/7!/5! column-permutation controls, confirms original p8 `XIX` in the canonical rune corpus, and prints all source-only and explicitly borrowed LP2 checks. It uses no unknown ciphertext, language model, scraped prose or invented reconstructed plaintext.
