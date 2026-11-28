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

**Full 2013 DH reconstruction from conditional source arithmetic, without using p8 XIX to generate B.** If the original three square determinants `[d₁,d₂,d₃]=[10,2,3]` are assigned the **single** (unprompted) pair of scalar roles `g=d₁/d₂` and `b=g·d₃` modulo29, then `g=5`, `b=15`. If the original row-sum difference selects `a=(3301−1033) mod29=6` and the independently authenticated 2013 DH transcript supplies `p=23`, the complete derived transcript is:

```text
source-only a = (3301−1033) mod29 = 6
source-only g = (10/2) mod29      = 5
source-only b = (10/2)*3 mod29    = 15
independent 2013 p = 23
A=5^6 mod23=8; B=5^15 mod23=19; K=8^15=19^6 mod23=2.
```

This reproduces the **entire independently documented 2013 `(p,g,A,B,K,a,b)=(23,5,8,19,2,6,15)` state** from the 2014 source plus one external prime, and predicts **B=19** without reading the independent p8 Roman `XIX` observation or choosing an unknown ciphertext crib. It is an economical **candidate key-schedule reconstruction**, not authenticated historical intent: multiplication `b=g·d₃` is a retrospective hypothesis and arbitrary alternative integer formulas can be fitted to small DH values. The other original-number/corner-H identities provide consistency checks on the fixed source but cannot independently establish the chosen algebraic roles.

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

### The complete source-order shell-and-interior H packet (no selective corner picking)

Use the **same** frozen two-input operation `H(x,y)=[x−y,x+y] mod29` on the **top left and top right visible corners** of *each* original magic square, first on the complete printed matrices, then on all three after stripping the outer border. This is the sum/difference operation already investigated in p6's Fehu/red-title packet, although **p6 does not specifically instruct its use on historical Stage7 squares**. The result is a **fixed six-pair object**, not independent searches for convenient congruences:

| 2014 source square | Entire original top corners | Entire H = [difference,sum] | P57-stripped inner top corners | Inner H = [difference,sum] |
| --- | --- | --- | --- | --- |
| First 3301, 5×5 | [434,966] | **[19,8]** | [812,280] | **[10,19]** |
| Middle 1033, 7×7 | [7,181] | [0,14] | [223,98] | **[9,2]** |
| Last 1033, 5×5 | [272,151] | [5,17] | [199,320] | **[24,26]** |

Therefore the **complete inner tape** is `[10,19,9,2,24,26]` and outer tape `[19,8,0,14,5,17]`. Every entry is shown, including 9,14,17,26, for which a source-selected plaintext meaning is **not** established. Without decomposing a matrix, the inner tape contains **B=19** (first pair sum), **K=2** (middle pair sum), **−g=24** (last pair difference), and predicts **gK=10** (first pair difference) from the other two. The outer first pair supplies the complete independently known DH public values **[B,A]=[19,8]**; the outer final difference independently equals **g=5**. Under the independently existing source sum-difference exponent `a=(3301−1033) mod29=6` and established modulus `p=23`, two additional exact checks close:

```text
B^a mod p = 19^6 mod23 = 2 = middle inner H sum
 g^a mod p =  5^6 mod23 = 8 = first outer H sum
 g × K mod29 = 5 × 2 = 10 = first inner H difference
```

The same original numeric square set and operation were used in all six cases; no item-level tuning, alphabet shift, ciphertext crib or new external source was introduced. This **materially simplifies the hypothesized intended route to a candidate DH state** and ties it to the original p6 source-pair H transform. It does **not** prove H is what the authors wanted: the important choices **historical square linkage, H sum/difference, top corners, modulus29, and interpretation of source residues as GP29 DH values were proposed after other puzzle research**. The three source-value equalities are cross-relations within one retrospectively studied historical object, not three statistically independent validations. A next-page decipherment or an independent explicit instruction to read shell/inner corner H is required for promotion.

### Less arbitrary private-exponent schedule: e=3 and the actual group modular inverse

The original final 2014 5×5 determinant already fixes the candidate **e=3**. In the independently authenticated 2013 DH state, the third parameter e is specifically `e=b⁻¹ mod(p−1)`, not just an unrelated exponent. If the proposed self-contained source modulus is `p=φ(3301) mod29=23`, the **standard** inverse reconstructs b without the earlier extra hypothesis `b=g·e`:

```text
e := det(third historical 5×5) mod29 = 3
φ(p) = φ(23) = 22
b := e⁻¹ mod φ(p) = 3⁻¹ mod22 = 15
Check: 3·15 = 45 ≡ 1 (mod22)
Independent source arithmetic: (det first / det middle)·det last
                           = (10/2)·3 ≡ 15 (mod29) = b
Additional identity: g·e² = 5·9 = 45 ≡1 (mod φ(p)=22)
```

This is arguably a more **creator-plausible cryptographic step** than choosing the product `g·e` as a private exponent, because modular inversion is explicitly used in the signed 2013 worked state. But **the historical square itself does not label its final determinant 'e'**; that input-role selection remains retrospective and cannot be proven by this identity. In the full conditional source-only recipe below, either definition gives the same candidate b15, but **prefer the independently known DH group-inverse semantics** and regard `b=g·e` as an exact cross-check, not the source instruction.

### Source-only candidate DH modulus via genuine Euler totients of the two authentic row sums

The original two magic constants **3301 and1033 are themselves prime**. Euler's totient `φ` is a **genuine prior Cicada arithmetic operation** and features in independently solved LP2 material. Therefore a second *potentially source-motivated* role map, once the independently established GP29 alphabet is fixed, is to let the 2014 **first constant** supply the **DH modulus**:

```text
φ(3301) = 3300 ≡ 23 (mod29)  → candidate p=23
φ(1033) = 1032 ≡ 17 (mod29)
```

The **17** is additionally the unselected final output of the minimal-equalization H packet: `272+151=423≡17 (mod29)`. Thus the published six-field original-number packet `[19,8,9,2,5,17]` has its final residue independently expressible as **φ(1033) mod29**, while its middle first residue9 equals the difference of the two candidate private exponents `b−a=15−6`. These arithmetic cross-identities use all six output slots; they are not separately authenticated key semantics. The totient p23 is **algebraically dependent** on `g=−3301 mod29=5` because prime `φ(3301)=3301−1`, hence `p≡−g−1` (mod29); it is a **possible author-selected operation, not an independent coincidence**.

With this optional prime role included, a **self-contained conditional 2014-source key reconstruction** can calculate *every* standard 2013 DH field with NO 2013 numerical input:

```text
q=29  (authentic Gematria Primus rune modulus)
p=φ(3301) mod29                         = 23
 g=(det5a/det7) mod29                 = 10/2 = 5
 a=(3301−1033) mod29                 = 6
 e=det5b mod29                       = 3
 b=e⁻¹ mod φ(p)=3⁻¹ mod22             = 15  (also (10/2)·3 mod29)
 A=g^a mod p                         = 8
 B=g^b mod p                         = 19
 K=A^b mod p = B^a mod p             = 2
```

These match the authentic **2013 DH transcript** `p23,g5,a6,b15,A8,B19,K2` exactly; the independently printed LP2 p8 **Roman XIX** matches predicted B19. Crucial caveat: **2014 did not instruct players to take φ of the first square sum, mod29 determinants, or multiply the last determinant into b**. Those roles are retrospectively proposed and not proved by returning known public DH parameters; source-only *arithmetic* does not establish a source-*chosen* key-generation mechanism. This does, however, remove the previously necessary external p23 value from the candidate mathematical recipe and supplies a concise path for future falsification using original plaintext or source-selected readout. Original numerical squares themselves were given as a historical CGI submission task, which did not require any of these operations.

### Minimal five-by-five equalization: a six-field complete DH state packet

A more economical alternative to choosing which ring of *each* square to read is to follow p57's shedding instruction **once on the only larger original square**. The historical square sizes are **5×5, 7×7, 5×5**. Removing precisely the perimeter of the **middle 7×7**, and leaving both already-five-by-five sources unchanged, produces **three aligned 5×5 source matrices**. Now read the **identical top-left/top-right H pair** from all three, in the original published order:

```text
first original 5×5:       H(434,966)  = [19, 8]
middle 7×7 -> inner 5×5: H(223,98)   = [ 9, 2]
last original 5×5:        H(272,151)  = [ 5,17]

Original source-order packet = [19,8, 9,2, 5,17]
Established-state interpretation (retrospective):
                            [ B,A, e²,K, g,−aK ]
                            [19,8, 9,2, 5, 17]
```

Importantly **the four prominent GP29 DH coordinates** `B19,A8,K2,g5` occur as fixed first/second/fourth/fifth positions in a **single geometric equalization and single H operation**, without matrix eigensolving or switching source-specific readings. The remaining 9 and17 *also happen* to equal `e²=3²` and `−aK=−6×2 mod29`; those auxiliary role labels are explicitly **post-hoc** and cannot count as independent evidence. Under independently grounded LP2 p15 modulus23 and a6, the packet closes the exact two equations `g^a=5^6≡8=A` and `B^a=19^6≡2=K`. This is a concrete potential human solve path from one **size-normalizing boundary operation** to candidate DH parameters, but p57 does not instruct normalizing the square **sizes** specifically and the H corner operation remains unprompted. The original 2014 requirement was to submit the complete square numbers; this is therefore a conditional path, **not** proven historical intent or a fresh plaintext decoder.

**One original-cipher sanity gate, not a key rescue:** Full outer+inner H extraction supplies **exactly 12 source residues**, matching the original p8 **12 red title runes**. Fix the printed GP29 header and grant only four natural all-source readout orders (all outer then all inner, reverse, or square-by-square outer-first/inner-first), and the two native GP29 additive signs. The exact eight original output sequences (all available from the reproduction program) yield **no coherent native GP two-word header**, while their complete 12/12 round trips pass. A 12-rune failure does not exclude p8 being an encrypted key/header or another unselected transform. It specifically rejects the simplest source-key addition without tuned phase or extra processing.

### Original p55 43-rune H-pair inverse and two-sided historical core-matrix similarity (all bounded negative)

The three authentic p57-stripped cores exactly select the 9/25/9 shapes of **43 p55 strict word-interior runes**, and the historical source cores are *centrosymmetric under 180° half-turn*. This licenses one more inexpensive original-cipher operation different from the previously rejected simple scalar shifts and one-sided Hill inverses. Pair the outer positions `i` and `n²−1−i` of each **unchanged** source-shaped p55 core, leave its single center alone, and apply the same original GP29 `H(x,y)=[x−y,x+y]` to every pair. Grant both original output orders and their exact inverses, without a skipped rune, word reshape, phase/key search or language-dependent fit. These are **all four** fixed source-reflection cases:

| Fixed mirror pair map on 43 original p55 interiors | Native GP29 IoC | Recover native text? |
| --- | ---: | --- |
| Original unchanged | 0.03433001 | unconfirmed cipher |
| `H` (difference at left, sum at opposite position) | **0.02879291** | no coherent plaintext |
| `reverseH` | 0.02879291 | no coherent plaintext |
| `H⁻¹` | 0.03543743 | no coherent plaintext |
| `reverseH⁻¹` | 0.02768549 | no coherent plaintext |

Both inverse pairs roundtrip **all 43/43** original values exactly. A distinct original numerical-source operation is two-sided similarity by each authentic 2014 core: `P=K⁻¹CK` or `P=KCK⁻¹` for the 3×3/5×5/3×3 source-key `K`, treating original p55 interiors as matrix `C` under exactly the same 9/25/9 segmentation. Both invert exactly 43/43, but outputs remain nonlinguistic at respective IoC **0.03322259** and **0.03100775**. Their only source-specific advantage over ordinary Hill is preservation of similarity invariants, not any encoded message. Full original per-rune outputs and exact encryption inverses are printed by the same reproducible program. Therefore **neither the canonical p6 H mirror transform nor a two-sided historical matrix conjugation recovers the missing 43-rune p55 interior plaintext**. This negative does not invalidate the stronger source-only candidate DH key-packet extraction; it constrains which *cipher consumer* could employ it.

## Connection to the already independently decoded LP2 p7 → chapter navigation grammar

The reason to retain this candidate historical Stage7 source key instead of merely accumulating GF29 coincidences is its **specific, executable causal route to original book coordinates**. The independently reported manuscript p7 source-and-chapter state transition does **not** use any 2014 square source to choose its original ciphertext: its own original p7 five red-word products and chapter first-black SUM→PRODUCT have already been independently frozen against the authenticated 2013 DH worked state. [Original p7/chapter reproducer](../sims/lp2_p7_signed2013_chapter_state_transition_sft.cjs) · [independent original-input report](lp2-p7-signed2013-chapter-state-transition.md).

The **new** proposed 2014-only arithmetic schedule `(p,g,A,B,K,a,b,e)=(23,5,8,19,2,6,15,3)` supplies exactly the typed **input key row** `[p,K,g,K,B]=[23,2,5,2,19]`, independently identical to the **original physical p7** five-red-product right-circulant's inverse first row. The p7 original printed orientation is uniquely consistent among 10 cyclic/reverse orientations. Using that row as chapter first-black-word **SUM** selectors, the original manuscript pages `p8→p27→p33→p27→p54` are selected, and their unmodified first-black-word **PRODUCT** outputs are precisely `[2,19,3,19,27]=[K,B,e,B,−K]`, a second row reconstructible from the same candidate 2014 square values.

```text
2014 original magic square values (first-party)
  |  candidate φ, det ratios, center H, DH group inverse
  v
(p,g,a,b,A,B,K,e) = (23,5,6,15,8,19,2,3)
  |  typed source row [p,K,g,K,B]
  v
original LP2 p7 red-product circulant inverse [23,2,5,2,19]
  |  chapter opening SUM selector (existing original-source rule)
  v
p8 → p27 → p33 → p27 → p54
  |  raw first-black-word PRODUCT
  v
[2,19,3,19,27] = [K,B,e,B,−K]
```

**Scientific boundary:** this reuses two **independent established original-manuscript structural tests**, giving the 2014 source interpretation an immediately testable *receiver and state transition*, not just a generic historical symbol match. Crucially, the target DH values and the downstream source grammar were **already known before** discovering the magic-square formula. These are **not blinded independent validations** of the proposed 2014 key-generation rules and still do not recover any unknown LP2 body plaintext. A real next advancement must reveal a novel, source-chosen continuation **after** the chapter OUT row, or independently demonstrate that p57/p6 actually instructs these specific 2014 magic square operations. Avoid turning this compact conditional source path into a large fitted opcode search.

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
